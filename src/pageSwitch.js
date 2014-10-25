/*
 * pageSwitch
 * @author qiqiboy
 * @github https://github.com/qiqiboy/pageSwitch
 */
;
(function(ROOT, struct, undefined){
    "use strict";
	
    var nextFrame=ROOT.requestAnimationFrame            ||
                ROOT.webkitRequestAnimationFrame        ||
                ROOT.mozRequestAnimationFrame           ||
                ROOT.msRequestAnimationFrame            ||
                function(callback){
                    return setTimeout(callback,30);
                },
        cancelFrame=ROOT.cancelAnimationFrame           ||
                ROOT.webkitCancelAnimationFrame         ||
                ROOT.webkitCancelRequestAnimationFrame  ||
                ROOT.mozCancelRequestAnimationFrame     ||
                ROOT.msCancelRequestAnimationFrame      ||
                clearTimeout,
        isTouch=("createTouch" in document) || ('ontouchstart' in window),
        EVENT='PointerEvent' in ROOT ?
            "pointerdown pointermove pointerup pointercancel" :
            isTouch ? "touchstart touchmove touchend touchcancel" :
            "mousedown mousemove mouseup",
        transform=function(){
            var divstyle=document.documentElement.style,
                tests="transform webkitTransform mozTransform msTransform oTransform".split(" "),
                prop;
            while(prop=tests.shift()){
                if(prop in divstyle){
                    return prop;
                }
            }
            return '';
        }();
        console.log(transform)
    function type(obj){
        if(obj==null){
            return String(obj);
        }
        
        return typeof obj=='object'? Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase():
            typeof obj;
    }
	
    function isArrayLike(elem){
        var tp=type(elem);
        return !!elem && tp!='function' && tp!='string' && (elem.length===0 || elem.length && (elem.length-1) in elem);
    }
    
    function each(arr, iterate){
        if(isArrayLike(arr)){
            if(type(arr.forEach)=='function'){
                return arr.forEach(iterate);
            }
            var i=0,len=arr.length,item;
            for(;i<len;i++){
                item=arr[i];
                if(type(item)!='undefined'){
                    iterate(item,i,arr);
                }
            }
        }else{
            var key;
            for(key in arr){
                iterate(key,arr[key],arr);
            }
        }
    }

    function children(elem){
        return elem.children||function(){
            var ret=[];
            each(elem.childNodes,function(elem){
                if(elem.nodeType==1){
                    ret.push(elem);
                }
            });
            return ret;
        }();
    }

    function addListener(elem,evstr,handler){
        if(type(evstr)=='object'){
            return each(evstr,function(evstr,handler){
                addListener(elem,evstr,handler);
            });
        }
        each(evstr.split(" "),function(ev){
            if(elem.addEventListener){
				elem.addEventListener(ev, handler, false);
			}else if(elem.attachEvent){
				elem.attachEvent('on'+ev,handler);
			}else elem['on'+ev]=handler;
        });
    }

    function position(elem){
        var rect=elem.getBoundingClientRect(),
            parentRect=(elem.offsetParent||document.documentElement).getBoundingClientRect();
        return {x:rect.left-parentRect.left,y:rect.top-parentRect.top};
    }

    function filterEvent(oldEvent){
        var ev={};

        each("clientX clientY type".split(" "),function(prop){
            ev[prop]=oldEvent[prop];
        });

        ev.oldEvent=oldEvent;

        ev.target=oldEvent.target||oldEvent.srcElement||document;
        if(ev.target.nodeType===3){
			ev.target=ev.target.parentNode;
		}

        ev.preventDefault=function(){
            oldEvent.preventDefault && oldEvent.preventDefault();
			ev.returnValue=oldEvent.returnValue=false;
        }

        ev.stopPropagation=function(){
            oldEvent.stopPropagation && oldEvent.stopPropagation();
			ev.cancelBubble=oldEvent.cancelBubble=true;
        }

        if(oldEvent.changedTouches && oldEvent.changedTouches.length==1){
            ev.clientX=oldEvent.changedTouches.item(0).clientX;
            ev.clientY=oldEvent.changedTouches.item(0).clientY;
        }

        return ev;
    }
    
    struct.prototype={
        init:function(){
            var self=this;
            this.pages=children(this.container);
            this.duration=600;
            this.direction=1;
            this.current=0;
            this.length=this.pages.length;
            addListener(this.container,EVENT+" resize mousewheel DOMMouseScroll",function(ev){
                self.handleEvent(ev);
            });
            each(this.pages,function(page){
                 page.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;display:none;';
                 page.percent=0;
            });
            this.resize();
        },
        setPos:function(elem,value){
            if(transform){
                elem.style[transform]='translate'+['X','Y'][this.direction]+'('+value+'%)'+(transform.replace('Transform','Perspective') in elem.style?' translateZ(0)':'');
            }else{
                elem.style[['left','top'][this.direction]]=value+'%';
            }
        },
        onin:function(elem,percent){
            this.setPos(elem,elem.percent=percent);
        },
        onout:function(elem,percent){
            this.setPos(elem,elem.percent=percent>0?percent-100:100+percent);
        },
        resize:function(){
            this.pages[this.current].style.display='block'; 
            this.height=this.container.offsetHeight;
            this.width=this.container.offsetWidth;
        },
        slide:function(index,tpage){
            var self=this,
                dir=this.direction,
                total=this[['width','height'][dir]],
                duration=this.duration,
                cpage,percent,stime=+new Date;
            index=Math.min(this.length-1,Math.max(0,index));
            cpage=this.pages[index];
            if(index!=this.current){
                tpage=this.pages[this.current];
            }

            if(cpage.style.display=='none'){
                cpage.style.display='block';
                percent=index>this.current?100:-100;
            }else{
                percent=cpage.percent;
            }

            this.current=index;

            ani();

            function ani(){
                var s=Math.min(1,(+new Date-stime)/(duration*Math.abs(percent)/100)),
                    cp=percent*(1-s);
                self.onin(cpage,cp);
                if(tpage){
                    self.onout(tpage,cp);
                }
                if(s==1){
                    if(tpage)tpage.style.display='none';
                    self.timer=null;
                }else{
                    self.timer=nextFrame(ani);
                }
            }
        },
        handleEvent:function(oldEvent){
            var ev=filterEvent(oldEvent);

            switch(ev.type.toLowerCase()){
                case 'mousedown':
                case 'touchstart':
                case 'pointerdown':
                    var nn=ev.target.nodeName.toLowerCase();
                    if(nn!='a' && nn!='img'){
                        this.rect=[ev.clientX,ev.clientY];
                        this.percent=this.pages[this.current].percent;
                        this.time=+new Date;
                    }
                    break;

                case 'mousemove':
                case 'touchmove':
                case 'pointermove':
                    if(this.rect){
                        var rect=[ev.clientX,ev.clientY],
                            dir=this.direction,
                            offset=rect[dir]-this.rect[dir],
                            cpage=this.pages[this.current],
                            pos=this.percent*total,
                            total=this[['width','height'][dir]],
                            tpage,_tpage,cpos,percent;
                        if(this.drag==null && this.rect.toString()!=rect.toString()){
                            this.drag=Math.abs(offset)>Math.abs(rect[1-dir]-this.rect[1-dir]);
                            cancelFrame(this.timer);
                        }
                        if(this.drag){
                            percent=this.percent+offset/total*100;
                            tpage=this.pages[this.current+(percent>0?-1:1)];
                            _tpage=this.pages[this.current+(percent>0?1:-1)];
                            this.onin(cpage,percent/(tpage?1:3));
                            //this.setPos(cpage,(cpage.percent=percent/(tpage?1:3))+'%');
                            if(tpage){
                                tpage.style.display='block';
                                //this.setPos(tpage,(tpage.percnet=(cpos>0?percent-100:100+percent))+'%');
                                this.onout(tpage,percent);
                            }
                            if(_tpage){
                                _tpage.style.display='none';
                            }
                            this._offset=offset;
                            this._cpage=cpage;
                            this._tpage=tpage;
                            ev.preventDefault();
                        }
                    }
                    break;

                case 'mouseup':
                case 'touchend':
                case 'touchcancel':
                case 'pointerup':
                case 'pointercancel':
                    if(this.drag!=null){
                        if(this.drag){
                            var index=this.current;
                            if(+new Date-this.time<250 && Math.abs(this._offset)>30){
                                index+=this._offset>0?-1:1;
                            }else if(Math.abs(this._cpage.percent)>50){
                                index+=this._cpage.percent>0?-1:1;
                            }
                            this.slide(index,this._tpage);
                            ev.preventDefault();
                        }
                        this.rect=this.drag=this.time=this._offset=this.percent=this._cpage=this._tpage=null;
                    }
                    break;

                case 'resize':

                    break;

                case 'mousewheel':
                case 'dommousescroll':
                    
                    break;
            }
        }
    }

    ROOT.pageSwitch=struct;
	
})(window, function(wrap){
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(wrap);
    }
    
    this.container=typeof wrap=='string'?document.getElementById(wrap):wrap;
    this.init();
});

a=new pageSwitch('pages');
//a.setPos=function(elem,value){
  //  elem.style.webkitTransform='translateY('+value+'%) scale('+(value>0?100-value:100+value)/100+')'
//}
