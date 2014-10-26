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
        divstyle=document.documentElement.style,
        camelCase=function(str){
            return (str+'').replace(/^-ms-/, 'ms-').replace(/-([a-z]|[0-9])/ig, function(all, letter){
                return (letter+'').toUpperCase();
            });
        },
        cssVendor=function(){
            var tests="-webkit- -moz -o- -ms-".split(" "),
                prop;
            while(prop=tests.shift()){
                if(camelCase(prop+'transform') in divstyle){
                    return prop;
                }
            }
            return '';
        }(),
        cssTest=function(name){
            var prop=camelCase(name),
                _prop=camelCase(cssVendor+prop);
            return (prop in divstyle) && prop || (_prop in divstyle) && _prop || '';
        },
        opacity=cssTest('opacity'),
        transform=cssTest('transform'),
        perspective=cssTest('perspective'),
        backfaceVisibility=cssTest('backface-visibility'),
        EASE={
            linear:function(t,b,c,d){ return c*t/d + b; },
            ease:function(t,b,c,d){ return -c * ((t=t/d-1)*t*t*t - 1) + b; }
        },
        TRANSITION={
            /* 更改切换效果
             * @param Float percent 过度百分比
             * @param int tpageIndex 上一个页面次序。注意，该值可能非法，所以需要测试是否存在该页面
             */
            slide:function(percent,tpageIndex){
                var current=this.current,
                    cpage=this.pages[this.current],
                    tpage=this.pages[tpageIndex],
                    dir=this.direction,
                    prop;
                if(transform){
                    prop=['X','Y'][dir];
                    cpage.style[transform]='translate'+prop+'('+percent*100+'%)';
                    if(tpage){
                        tpage.style[transform]='translate'+prop+'('+tpage.percent*100+'%)';
                    }
                }else{
                    prop=['left','top'][dir];
                    cpage.style[prop]=percent*100+'%';
                    if(tpage){
                        tpage.style[prop]=tpage.percent*100+'%';
                    }
                }
            },
            fade:function(percent,tpageIndex){
                var current=this.current,
                    cpage=this.pages[this.current],
                    tpage=this.pages[tpageIndex];
                if(opacity){
                    cpage.style.opacity=1-Math.abs(percent);
                    if(tpage){
                        tpage.style.opacity=Math.abs(percent);
                    }
                }else{
                    cpage.style.filter='alpha(opacity='+(1-Math.abs(percent))*100+')';
                    if(tpage){
                        tpage.style.filter='alpha(opacity='+Math.abs(percent)*100+')';
                    }
                }
            },
            slideScale:function(percent,tpageIndex){
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
                }else TRANSITION.slide.apply(this,arguments);
            },
            scale:function(percent,tpageIndex){
                var current=this.current,
                    cpage=this.pages[this.current],
                    tpage=this.pages[tpageIndex];
                if(transform){
                    cpage.style[transform]='scale('+(1-Math.abs(percent))+')';
                    cpage.style.zIndex=this.drag?1:0;
                    if(tpage){
                        tpage.style[transform]='scale('+Math.abs(percent)+')';
                        tpage.style.zIndex=this.drag?0:1;
                    }
                }else TRANSITION.slide.apply(this,arguments);
            },
            skew:function(percent,tpageIndex){
                var current=this.current,
                    cpage=this.pages[this.current],
                    tpage=this.pages[tpageIndex];
                if(transform){
                    cpage.style[transform]='skew('+percent*90+'deg)';
                    cpage.style.zIndex=this.drag?1:0;
                    if(tpage){
                        tpage.style[transform]='skew('+tpage.percent*90+'deg)';
                        tpage.style.zIndex=this.drag?0:1;
                    }
                    TRANSITION.fade.apply(this,arguments);
                }else TRANSITION.slide.apply(this,arguments);
            },
            rotate:function(percent,tpageIndex){
                var current=this.current,
                    cpage=this.pages[this.current],
                    tpage=this.pages[tpageIndex],
                    dir=this.direction,
                    prop;
                if(perspective){
                    prop=['X','Y'][1-dir];
                    cpage.style[backfaceVisibility]='hidden';
                    cpage.style[perspective]='1000px';
                    cpage.style[transform]='rotate'+prop+'('+Math.abs(percent)*180+'deg)';
                    cpage.style.zIndex=1;
                    if(tpage){
                        tpage.style[backfaceVisibility]='hidden';
                        tpage.style[perspective]='1000px';
                        tpage.style[transform]='rotate'+prop+'('+Math.abs(tpage.percent)*180+'deg)';
                        tpage.style.zIndex=0;
                    }
                }else TRANSITION.slideScale.apply(this,arguments);
            }
        }

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

    function filterEvent(oldEvent){
        var ev={};

        each("clientX clientY type wheelDelta detail".split(" "),function(prop){
            ev[prop]=oldEvent[prop];
        });

        ev.oldEvent=oldEvent;

        ev.target=oldEvent.target||oldEvent.srcElement||document.documentElement;
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
        init:function(config){
            var self=this,
                handler=function(ev){
                    self.handleEvent(ev);
                }
            this.duration=config.duration||600;
            this.direction=config.direction||1;
            this.current=config.start||0;
            this.loop=config.loop||false;
            this.ease=typeof(config.ease)=='function'?config.ease:EASE[config.ease]||EASE.ease;
            this.transite=typeof(config.transition)=='function'?config.transition:TRANSITION[config.transition]||TRANSITION.slideScale;
            this.onbefore=config.onbefore;
            this.onafter=config.onafter;
            this.pages=children(this.container);
            this.length=this.pages.length;
            addListener(this.container,STARTEVENT+" mousewheel DOMMouseScroll",handler);
            addListener(document,MOVEEVENT,handler);
            addListener(window,"resize",handler);
            each(this.pages,function(page){
                 page.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;display:none;';
                 page.percent=0;
            });
            this.resize();
        },
        fire:function(ev,percent,tpageIndex){
            var func=this['on'+ev],
                args=[].slice.call(arguments,1);
            if(ev=='update'){
                this.pages[this.current].percent=percent;
                if(this.pages[tpageIndex]){
                    this.pages[tpageIndex].percent=percent>0?percent-1:1+percent;
                }
                this.transite.apply(this,args);
            }
            if(type(func)=='function'){
                func.apply(this,args);
            }
        },
        resize:function(){
            this.pages[this.current].style.display='block'; 
            this.height=this.container.clientHeight;
            this.width=this.container.clientWidth;
        },
        slide:function(index){
            var self=this,
                dir=this.direction,
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
            
            cancelFrame(this.timer);

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
                            total=this[['width','height'][dir]],
                            tpage,tpageIndex,_tpage,percent;
                        if(this.drag==null && this.rect.toString()!=rect.toString()){
                            this.drag=Math.abs(offset)>=Math.abs(rect[1-dir]-this.rect[1-dir]);
                        }
                        if(this.drag){
                            percent=this.percent+offset/total;
                            tpage=this.pages[tpageIndex=this.fixIndex(this.current+(percent>0?-1:1))];
                            _tpage=this.pages[this.fixIndex(this.current+(percent>0?1:-1))];
                            if(tpage){
                                tpage.style.display='block';
                            }else{
                                percent/=3;
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
                        each("rect drag time timer percnet _offset".split(" "),function(prop){
                            delete self[prop];
                        });
                    }
                    break;

                case 'resize':
                    this.resize();
                    break;

                case 'mousewheel':
                case 'dommousescroll':
                    if(!this.timer && !this.drag){
                        var wd=ev.wheelDelta||-ev.detail;
                        this[wd>0?'prev':'next']();
                    }
                    break;
            }
        }
    }

    ROOT.pageSwitch=struct;
	
})(window, function(wrap,config){
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(wrap,config);
    }
    
    this.container=typeof wrap=='string'?document.getElementById(wrap):wrap;
    this.init(config||{});
});
