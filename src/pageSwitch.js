/*
 * pageSwitch
 * @author qiqiboy
 * @github https://github.com/qiqiboy/pageSwitch
 */
;
(function(ROOT, struct, undefined){
    "use strict";
	
    var lastTime=0,
        nextFrame=ROOT.requestAnimationFrame            ||
                ROOT.webkitRequestAnimationFrame        ||
                ROOT.mozRequestAnimationFrame           ||
                ROOT.msRequestAnimationFrame            ||
                function(callback){
                    var currTime=+new Date,
                        delay=Math.max(1000/60,1000/60-(currTime-lastTime));
                    lastTime=currTime+delay;
                    return setTimeout(callback,delay);
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
        isFunction=function(func){
            return type(func)=='function';
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
            fade:function(percent,tpageIndex){
                var cpage=this.pages[this.current],
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
            }
        }
    
    each("X Y ".split(" "),function(name){
        var XY={X:'left',Y:'top'};

        TRANSITION['scroll'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                dir=this.direction,
                fire3D=perspective?' translateZ(0)':'',
                prop=name||['X','Y'][dir];
            if(transform){
                cpage.style[transform]='translate'+prop+'('+percent*100+'%)'+fire3D;
                if(tpage){
                    tpage.style[transform]='translate'+prop+'('+tpage.percent*100+'%)'+fire3D;
                }
            }else{
                prop=XY[prop];
                cpage.style[prop]=percent*100+'%';
                if(tpage){
                    tpage.style[prop]=tpage.percent*100+'%';
                }
            }
        }

        TRANSITION['slide'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                dir=this.direction,
                fire3D=perspective?' translateZ(0)':'',
                prop=name||['X','Y'][dir];
            if(transform){
                if(percent<0){
                    cpage.style[transform]='translate'+prop+'('+percent*100+'%)'+fire3D;
                    cpage.style.zIndex=1;
                    if(tpage){
                        tpage.style[transform]='scale('+((1-tpage.percent)*.2+.8)+')'+fire3D;
                        tpage.style.zIndex=0;
                    }
                }else{
                    if(tpage){
                        tpage.style[transform]='translate'+prop+'('+tpage.percent*100+'%)'+fire3D;
                        tpage.style.zIndex=1;
                    }
                    cpage.style[transform]='scale('+((1-percent)*.2+.8)+')'+fire3D;
                    cpage.style.zIndex=0;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['rotate'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                dir=this.direction,
                fire3D=perspective?' translateZ(0)':'',
                fix=percent>0?-1:1,
                prop=name||['X','Y'][1-dir];
            if(perspective){
                cpage.style[backfaceVisibility]='hidden';
                cpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(percent)*180*fix+'deg)'+fire3D;
                if(tpage){
                    tpage.style[backfaceVisibility]='hidden';
                    tpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(tpage.percent)*180*-fix+'deg)'+fire3D;
                }
            }else TRANSITION['slide'+name].apply(this,arguments);
        }

        TRANSITION['scale'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                fire3D=perspective?' translateZ(0)':'',
                prop=name;
            if(transform){
                cpage.style[transform]='scale'+prop+'('+(1-Math.abs(percent))+')';+fire3D
                cpage.style.zIndex=percent<0?1:0;
                if(tpage){
                    tpage.style[transform]='scale'+prop+'('+Math.abs(percent)+')'+fire3D;
                    tpage.style.zIndex=percent<0?0:1;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['skew'+name]=function(percent,tpageIndex){
            var cpage=this.pages[this.current],
                tpage=this.pages[tpageIndex],
                fire3D=perspective?' translateZ(0)':'',
                prop=name;
            if(transform){
                cpage.style[transform]='skew'+prop+'('+percent*180+'deg)'+fire3D;
                if(tpage){
                    tpage.style[transform]='skew'+prop+'('+tpage.percent*180+'deg)'+fire3D;
                }
                TRANSITION.fade.apply(this,arguments);
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }
    });

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
        var ret=[];
        each(elem.children||elem.childNodes,function(elem){
            if(elem.nodeType==1){
                ret.push(elem);
            }
        });
        return ret;
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

        each("clientX clientY type wheelDelta detail which keyCode".split(" "),function(prop){
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
        latestTime:0,
        init:function(config){
            var self=this,
                handler=function(ev){
                    !self.frozen && self.handleEvent(ev);
                }
            this.events={};
            this.duration=isNaN(parseInt(config.duration))?600:parseInt(config.duration);
            this.direction=parseInt(config.direction)==0?0:1;
            this.current=parseInt(config.start)||0;
            this.loop=!!config.loop;
            this.mousewheel=!!config.mousewheel;
            this.arrawkey=!!config.arrowkey;
            this.pages=children(this.container);
            this.length=this.pages.length;

            addListener(this.container,STARTEVENT+" click"+(this.mousewheel?" mousewheel DOMMouseScroll":""),handler);
            addListener(document,MOVEEVENT+(this.arrawkey?" keydown":""),handler);

            this.setEase(config.ease);
            this.setTransition(config.transition);

            each(this.pages,function(page){
                var style=page.style;
                each("position:absolute;top:0;left:0;width:100%;height:100%;display:none".split(";"),function(css){
                    var ret=css.split(":");
                    style[ret[0]]=ret[1];
                });
                page.percent=0;
            });
            this.pages[this.current].style.display='block';
        },
        setEase:function(ease){
            this.ease=isFunction(ease)?ease:EASE[ease]||EASE.ease;
            return this;
        },
        addEase:function(name,func){
            isFunction(func) && (EASE[name]=func);
            return this;
        },
        setTransition:function(transition){
            this.transite=isFunction(transition)?transition:TRANSITION[transition]||TRANSITION.slide; 
            return this;
        },
        addTransition:function(name,func){
            isFunction(func) && (TRANSITION[name]=func);
            return this;
        },
        on:function(ev,callback){
            var self=this;
            if(type(ev)=='object'){
                each(ev,function(ev,callback){
                    self.on(ev,callback);
                });
            }else{
                if(!this.events[ev]){
                    this.events[ev]=[];
                }
                this.events[ev].push(callback);
            }
            return this;
        },
        fire:function(ev,percent,tpageIndex){
            var self=this,
                args=[].slice.call(arguments,1);
            if(ev=='update'){
                this.pages[this.current].percent=percent;
                if(this.pages[tpageIndex]){
                    this.pages[tpageIndex].percent=percent>0?percent-1:1+percent;
                }
                this.transite.apply(this,args);
            }
            each(this.events[ev]||[],function(func){
                if(isFunction(func)){
                    func.apply(self,args);
                }
            });
            return this;
        },
        freeze:function(able){
            this.frozen=type(able)=='undefined'?true:!!able;
            return this;
        },
        slide:function(index){
            var self=this,
                dir=this.direction,
                duration=this.duration,
                stime=+new Date,
                ease=this.ease,
                current=this.current,
                fixIndex=Math.min(this.length-1,Math.max(0,this.fixIndex(index))),
                cpage,tpage,tpageIndex,percent;

            cpage=this.pages[fixIndex];
            tpage=this.pages[tpageIndex=this.fixIndex(fixIndex==current?fixIndex+(cpage.percent>0?-1:1):current)];
            
            each(this.pages,function(page,index){
                if(index!=fixIndex&&index!=tpageIndex){
                    page.style.display='none';
                }
            });

            if(cpage.style.display=='none'){
                cpage.style.display='block';
                percent=index>current?1:-1;
            }else{
                percent=cpage.percent;
            }

            duration*=Math.abs(percent);

            this.fire('before',current,fixIndex);

            this.current=fixIndex;
            
            cancelFrame(this.timer);

            this.latestTime=stime;

            ani();

            function ani(){
                var offset=Math.min(duration,+new Date-stime),
                    s=duration?ease(offset,0,1,duration):1,
                    cp=percent*(1-s);
                self.fire('update',cp,tpageIndex);
                if(offset==duration){
                    if(tpage){
                        tpage.style.display='none';
                    }
                    self.fire('after',fixIndex,current);
                    delete self.timer;
                }else{
                    self.timer=nextFrame(ani);
                }
            }

            return this;
        },
        prev:function(){
            return this.slide(this.current-1);
        },
        next:function(){
            return this.slide(this.current+1);
        },
        fixIndex:function(index){
            return this.length>1&&this.loop?(this.length+index)%this.length:index;
        },
        handleEvent:function(oldEvent){
            var ev=filterEvent(oldEvent);

            switch(ev.type.toLowerCase()){
                case 'mousedown':
                case 'touchstart':
                case 'pointerdown':
                    var nn=ev.target.nodeName.toLowerCase();
                    cancelFrame(this.timer);
                    this.rect=[ev.clientX,ev.clientY];
                    this.percent=this.pages[this.current].percent;
                    this.time=+new Date;
                    if(!isTouch && (nn=='a' || nn=='img')){
                        ev.preventDefault();
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
                            total=cpage['offset'+['Width','Height'][dir]],
                            tpage,tpageIndex,_tpage,percent;
                        if(this.drag==null && this.rect.toString()!=rect.toString()){
                            this.drag=Math.abs(offset)>=Math.abs(rect[1-dir]-this.rect[1-dir]);
                        }
                        if(this.drag){
                            percent=this.percent+(total&&offset/total);
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
                        index=this.current,
                        recover=this._offset||this.timer;
                    if(this.drag==true){
                        if(+new Date-this.time<500 && Math.abs(this._offset)>30){
                            index+=this._offset>0?-1:1;
                        }else if(Math.abs(cpage.percent)>.5){
                            index+=cpage.percent>0?-1:1;
                        }
                        ev.preventDefault();
                    }
                    if(this.time){
                        each("rect drag time timer percnet _offset".split(" "),function(prop){
                            delete self[prop];
                        });
                        if(recover){
                            this.slide(index);
                        }
                    }
                    break;

                case 'click':
                    if(this.timer){
                        ev.preventDefault();
                    }
                    break;

                case 'mousewheel':
                case 'dommousescroll':
                    ev.preventDefault();
                    if(!this.timer && !this.drag && +new Date-this.latestTime>this.duration+500){
                        var wd=ev.wheelDelta||-ev.detail;
                        this[wd>0?'prev':'next']();
                    }

                    break;

                case 'keydown':
                    var nn=ev.target.nodeName.toLowerCase();
                    if(!this.timer && !this.drag && nn!='input' && nn!='textarea'){
                        switch(ev.keyCode||ev.which){
                            case 33:
                            case 37:
                            case 38:
                                this.prev();
                                break;
                            case 32:
                            case 34:
                            case 39:
                            case 40:
                                this.next();
                                break;
                            case 35:
                                this.slide(this.length-1);
                                break;
                            case 36:
                                this.slide(0);
                                break;
                        }
                    }
                    break;
            }
        }
    }
    
    each("Ease Transition".split(" "),function(name){
        struct['add'+name]=struct.prototype['add'+name];
    });

    ROOT.pageSwitch=struct;
	
})(window, function(wrap,config){
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(wrap,config);
    }
    
    this.container=typeof wrap=='string'?document.getElementById(wrap):wrap;
    this.init(config||{});
});
