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
        STARTEVENT=EVENT.split(" ")[0],
        MOVEEVENT=EVENT.split(" ").slice(1).join(" "),
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

        each("clientX clientY type wheelDelta detail".split(" "),function(prop){
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

        if(oldEvent.changedTouches && oldEvent.changedTouches.length==1){
            ev.clientX=oldEvent.changedTouches.item(0).clientX;
            ev.clientY=oldEvent.changedTouches.item(0).clientY;
        }

        return ev;
    }
    
    struct.prototype={
        constructor:struct,
        init:function(){
            var self=this,
                handler=function(ev){
                    self.handleEvent(ev);
                }
            this.pages=children(this.container);
            this.duration=600;
            this.direction=1;
            this.current=0;
            this.loop=false;
            this.ease=function(t,b,c,d){ return -c * ((t=t/d-1)*t*t*t - 1) + b; }
            this.length=this.pages.length;
            addListener(this.container,STARTEVENT.replace(),handler);
            addListener(document,MOVEEVENT,handler);
            addListener(window,"resize mousewheel DOMMouseScroll",handler);
            each(this.pages,function(page){
                 page.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;display:none;';
                 page.percent=0;
            });
            this.resize();
        },
        /* 更改切换效果，重写该方法即可
         * @param Float percent 过度百分比
         * @param int tpageIndex 上一个页面次序。注意，该值可能非法，所以需要测试是否存在该页面
         */
        onupdate:function(percent,tpageIndex){
            var current=this.current,
                cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                dir=this.direction,
                prop;
            if(transform){
                prop=['X','Y'][dir];
                if(percent<0){
                    cpage.style[transform]='translate'+prop+'('+percent*100+'%)';
                    cpage.style.zIndex=1;
                    if(tpage){
                        tpage.style[transform]='scale('+((1-tpage.percent)*.2+.8)+')';
                        tpage.style.zIndex=0;
                    }
                }else{
                    if(tpage){
                        tpage.style[transform]='translate'+prop+'('+tpage.percent*100+'%)';
                        tpage.style.zIndex=1;
                    }
                    cpage.style[transform]='scale('+((1-percent)*.2+.8)+')';
                    cpage.style.zIndex=0;
                }
            }else{
                prop=['left','top'][dir];
                cpage.style[prop]=percent*100+'%';
                if(tpage){
                    tpage.style[prop]=tpage.percent*100+'%';
                }
            }

        },
        fire:function(ev,percent,tpageIndex){
            var func=this['on'+ev],
                args=[].slice.call(arguments,1);
            if(ev=='update'){
                this.pages[this.current].percent=percent;
                if(this.pages[tpageIndex]){
                    this.pages[tpageIndex].percent=percent>0?percent-1:1+percent;
                }
            }
            if(type(func)=='function'){
                func.apply(this,args);
            }
        },
        resize:function(){
            this.pages[this.current].style.display='block'; 
            this.height=this.container.offsetHeight;
            this.width=this.container.offsetWidth;
        },
        slide:function(index){
            var self=this,
                dir=this.direction,
                total=this[['width','height'][dir]],
                duration=this.duration,
                stime=+new Date,
                ease=this.ease,
                current=Math.min(this.length-1,Math.max(0,this.fixIndex(index))),
                cpage,tpage,tpageIndex,_tpage,percent;

            cpage=this.pages[current];
            tpage=this.pages[tpageIndex=this.fixIndex(current==this.current?current+(cpage.percent>0?-1:1):this.current)];
            
            each(this.pages,function(page,index){
                if(index!=current&&index!=tpageIndex){
                    page.style.display='none';
                }
            });

            if(cpage.style.display=='none'){
                cpage.style.display='block';
                percent=index>this.current?1:-1;
            }else{
                percent=cpage.percent;
            }

            duration*=Math.abs(percent);

            this.fire('before',current);

            this.current=current;

            ani();

            return this;

            function ani(){
                var offset=Math.min(duration,+new Date-stime),
                    s=ease(offset,0,1,duration)||0,
                    cp=percent*(1-s);
                self.fire('update',cp,tpageIndex);
                if(offset==duration){
                    if(tpage){
                        tpage.style.display='none';
                    }
                    self.fire('after',current);
                    delete self.timer;
                }else{
                    self.timer=nextFrame(ani);
                }
            }
        },
        prev:function(){
            return this.slide(this.current-1);
        },
        next:function(){
            return this.slide(this.current+1);
        },
        fixIndex:function(index){
            return this.loop?(this.length+index)%this.length:index;
        },
        handleEvent:function(oldEvent){
            var ev=filterEvent(oldEvent);

            switch(ev.type.toLowerCase()){
                case 'mousedown':
                case 'touchstart':
                case 'pointerdown':
                    var nn=ev.target.nodeName.toLowerCase();
                    if(isTouch || nn!='a' && nn!='img'){
                        this.rect=[ev.clientX,ev.clientY];
                        this.percent=this.pages[this.current].percent;
                        this.time=+new Date;
                        cancelFrame(this.timer);
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
                            tpage,tpageIndex,_tpage,cpos,percent;
                        if(this.drag==null && this.rect.toString()!=rect.toString()){
                            this.drag=Math.abs(offset)>Math.abs(rect[1-dir]-this.rect[1-dir]);
                        }
                        if(this.drag){
                            percent=this.percent+offset/total;
                            tpage=this.pages[tpageIndex=this.fixIndex(this.current+(percent>0?-1:1))];
                            _tpage=this.pages[this.fixIndex(this.current+(percent>0?1:-1))];
                            percent/=tpage?1:3;
                            if(tpage){
                                tpage.style.display='block';
                            }
                            if(_tpage){
                                _tpage.style.display='none';
                            }
                            this.fire('update',percent,tpageIndex);
                            this._offset=offset;
                            ev.preventDefault();
                        }
                    }
                    break;

                case 'mouseup':
                case 'touchend':
                case 'touchcancel':
                case 'pointerup':
                case 'pointercancel':
                    var self=this,
                        cpage=this.pages[this.current],
                        index=this.current;
                    if(this.drag==true){
                        if(+new Date-this.time<250 && Math.abs(this._offset)>30){
                            index+=this._offset>0?-1:1;
                        }else if(Math.abs(cpage.percent)>.5){
                            index+=cpage.percent>0?-1:1;
                        }
                        ev.preventDefault();
                    }
                    if(this.time){
                        this.slide(index);
                        each("rect drag time percnet _offset".split(" "),function(prop){
                            delete self[prop];
                        });
                    }
                    break;

                case 'resize':
                    this.resize();
                    break;

                case 'mousewheel':
                case 'dommousescroll':
                    if(!this.timer){
                        var wd=ev.wheelDelta||-ev.detail;
                        this[wd>0?'prev':'next']();
                    }
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
