/*
 * pageSwitch
 * @author qiqiboy
 * @github https://github.com/qiqiboy/pageSwitch
 */
;
(function(ROOT, struct, undefined){
    "use strict";
    
    var VERSION='2.0.0';
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
            var tests="-webkit- -moz- -o- -ms-".split(" "),
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
        toString=Object.prototype.toString,
        class2type={},
        EASE={
            linear:function(t,b,c,d){ return c*t/d + b; },
            ease:function(t,b,c,d){ return -c * ((t=t/d-1)*t*t*t - 1) + b; }
        },
        TRANSITION={
            /* 更改切换效果
             * @param Element cpage 当前页面
             * @param Float cp      当前页面过度百分比
             * @param Element tpage 前序页面
             * @param Float tp      前序页面过度百分比
             */
            fade:function(cpage,cp,tpage,tp){
                if(opacity){
                    cpage.style.opacity=Math.abs(tp);
                    if(tpage){
                        tpage.style.opacity=Math.abs(cp);
                    }
                }else{
                    cpage.style.filter='alpha(opacity='+(Math.abs(tp))*100+')';
                    if(tpage){
                        tpage.style.filter='alpha(opacity='+Math.abs(cp)*100+')';
                    }
                }
            }
        }

    each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(name){
        class2type["[object "+name+"]"]=name.toLowerCase();
    });
    
    each("X Y ".split(" "),function(name){
        var XY={X:'left',Y:'top'},
            fire3D=perspective?' translateZ(0)':'';
            
        TRANSITION['scroll'+name]=function(cpage,cp,tpage,tp){
            var dir=this.direction,
                prop=name||['X','Y'][dir];
            if(transform){
                cpage.style[transform]='translate'+prop+'('+cp*100+'%)'+fire3D;
                if(tpage){
                    tpage.style[transform]='translate'+prop+'('+tp*100+'%)'+fire3D;
                }
            }else{
                prop=XY[prop];
                cpage.style[prop]=cp*100+'%';
                if(tpage){
                    tpage.style[prop]=tp*100+'%';
                }
            }
        }

        TRANSITION['slide'+name]=function(cpage,cp,tpage,tp){
            var dir=this.direction,
                prop=name||['X','Y'][dir];
            if(transform){
                if(cp<0){
                    cpage.style[transform]='translate'+prop+'('+cp*100+'%)'+fire3D;
                    cpage.style.zIndex=1;
                    if(tpage){
                        tpage.style[transform]='scale('+(-cp*.2+.8)+')'+fire3D;
                        tpage.style.zIndex=0;
                    }
                }else{
                    if(tpage){
                        tpage.style[transform]='translate'+prop+'('+tp*100+'%)'+fire3D;
                        tpage.style.zIndex=1;
                    }
                    cpage.style[transform]='scale('+((1-cp)*.2+.8)+')'+fire3D;
                    cpage.style.zIndex=0;
                }
            }else TRANSITION['slideCover'+name].apply(this,arguments);
        }

        TRANSITION['slideCover'+name]=function(cpage,cp,tpage,tp){
            var dir=this.direction,
                prop=name||['X','Y'][dir];
            cpage.style.zIndex=0;
            if(transform){
                cpage.style[transform]='translate'+prop+'(0)'+fire3D;
                if(tpage){
                    tpage.style[transform]='translate'+prop+'('+tp*100+'%)'+fire3D;
                    tpage.style.zIndex=1;
                }
            }else{
                prop=XY[prop];
                cpage.style[prop]='0';
                if(tpage){
                    tpage.style[prop]=tp*100+'%';
                    tpage.style.zIndex=1;
                }
            }
        }

        TRANSITION['rotate'+name]=function(cpage,cp,tpage,tp){
            var dir=this.direction,
                fix=cp>0?dir?-1:1:dir?1:-1,
                prop=name||['X','Y'][1-dir];
            if(perspective){
                cpage.style[backfaceVisibility]='hidden';
                cpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(cp)*180*fix+'deg)'+fire3D;
                if(tpage){
                    tpage.style[backfaceVisibility]='hidden';
                    tpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(tp)*180*-fix+'deg)'+fire3D;
                }
            }else TRANSITION['slide'+name].apply(this,arguments);
        }

        TRANSITION['scale'+name]=function(cpage,cp,tpage,tp){
            var prop=name;
            if(transform){
                cpage.style[transform]='scale'+prop+'('+(1-Math.abs(cp))+')';+fire3D
                cpage.style.zIndex=1;
                if(tpage){
                    tpage.style[transform]='scale'+prop+'('+Math.abs(cp)+')'+fire3D;
                    tpage.style.zIndex=0;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['skew'+name]=function(cpage,cp,tpage,tp){
            var prop=name;
            if(transform){
                cpage.style[transform]='skew'+prop+'('+cp*180+'deg)'+fire3D;
                if(tpage){
                    tpage.style[transform]='skew'+prop+'('+tp*180+'deg)'+fire3D;
                }
                TRANSITION.fade.apply(this,arguments);
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }
    });

    function type(obj){
        if(obj==null){
            return obj+"";
        }
        
        return typeof obj=='object'||typeof obj=='function' ? class2type[toString.call(obj)]||"object" :
            typeof obj;
    }
	
    function isArrayLike(elem){
        var tp=type(elem);
        return !!elem && tp!='function' && tp!='string' && (elem.length===0 || elem.length && (elem.nodeType==1 || (elem.length-1) in elem));
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
                elem.addEventListener(ev,handler,false);
            }else if(elem.attachEvent){
                elem.attachEvent('on'+ev,handler);
            }else elem['on'+ev]=handler;
        });
    }

    function offListener(elem,evstr,handler){
        if(type(evstr)=='object'){
            return each(evstr,function(evstr,handler){
                offListener(elem,evstr,handler);
            });
        }
        each(evstr.split(" "),function(ev){
            if(elem.removeEventListener){
                elem.removeEventListener(ev,handler,false);
            }else if(elem.detachEvent){
                elem.detachEvent('on'+ev,handler);
            }else elem['on'+ev]=null;
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

        if(oldEvent.touches && oldEvent.touches.length){
            ev.clientX=oldEvent.touches.item(0).clientX;
            ev.clientY=oldEvent.touches.item(0).clientY;
        }

        ev.touchNum=oldEvent.touches&&oldEvent.touches.length||0;

        return ev;
    }
    
    struct.prototype={
        version:VERSION,
        constructor:struct,
        latestTime:0,
        init:function(config){
            var self=this,
                handler=this.handler=function(ev){
                    !self.frozen && self.handleEvent(ev);
                }

            this.events={};
            this.duration=isNaN(parseInt(config.duration))?600:parseInt(config.duration);
            this.direction=parseInt(config.direction)==0?0:1;
            this.current=parseInt(config.start)||0;
            this.loop=!!config.loop;
            this.mousewheel=!!config.mousewheel;
            this.interval=parseInt(config.interval)||5000;
            this.playing=!!config.autoplay;
            this.arrowkey=!!config.arrowkey;
            this.pages=children(this.container);
            this.length=this.pages.length;

            this.pageData=[];

            addListener(this.container,STARTEVENT+" click"+(this.mousewheel?" mousewheel DOMMouseScroll":""),handler);
            addListener(document,MOVEEVENT+(this.arrowkey?" keydown":""),handler);

            each(this.pages,function(page){
                self.pageData.push({
                    percent:0,
                    cssText:page.style.cssText||''
                });
                self.initStyle(page);
            });
            this.pages[this.current].style.display='block';

            this.on({
                before:function(){clearTimeout(self.playTimer)},
                dragStart:function(){clearTimeout(self.playTimer)},
                after:function(){
                    if(self.playing){
                        self.playTimer=setTimeout(function(){
                            self.next();
                        },self.interval);
                    }
                },
                update:null
            }).fire('after');

            this.setEase(config.ease);
            this.setTransition(config.transition);
        },
        initStyle:function(elem){
            var style=elem.style,
                ret;
            each("position:absolute;top:0;left:0;width:100%;height:100%;display:none".split(";"),function(css){
                ret=css.split(":");
                style[ret[0]]=ret[1];
            });
            return elem;
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
            this.events.update.splice(0,1,isFunction(transition)?transition:TRANSITION[transition]||TRANSITION.slide);
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
                cpage=this.pages[current],
                percent=this.pageData[current].percent,
                tIndex=this.fixIndex(fixIndex==current?current+(percent>0?-1:1):fixIndex),
                tpage=this.pages[tIndex],
                target=index>current?-1:1;
            
            if(fixIndex==current){
                target=0;
            }else if(tpage.style.display=='none'){
                percent=0;
            }

            this.fixBlock(current,tIndex);
            this.fire('before',current,fixIndex);
            this.current=fixIndex;
            this.latestTime=stime;
            cancelFrame(this.timer);
            duration*=1-Math.abs(percent);

            ani();

            function ani(){
                var offset=Math.min(duration,+new Date-stime),
                    s=duration?ease(offset,0,1,duration):1,
                    cp=(target-percent)*s+percent;
                self.fixUpdate(cp,current,tIndex);
                if(offset==duration){
                    if(fixIndex!=current){
                        cpage.style.display='none';
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
        play:function(){
            this.playing=true;
            return this.slide(this.current);
        },
        pause:function(){
            this.playing=false;
            clearTimeout(this.playTimer);
            return this;
        },
        fixIndex:function(index){
            return this.length>1&&this.loop?(this.length+index)%this.length:index;
        },
        fixBlock:function(cIndex,tIndex){
            each(this.pages,function(page,index){
                if(cIndex!=index && tIndex!=index){
                    page.style.display='none';
                }else{
                    page.style.display='block';
                }
            });
            return this;
        },
        fixUpdate:function(cPer,cIndex,tIndex){
            var pageData=this.pageData,
                cpage=this.pages[cIndex],
                tpage=this.pages[tIndex],
                tPer;
            pageData[cIndex].percent=cPer;
            if(tpage){
                tPer=pageData[tIndex].percent=cPer>0?cPer-1:1+cPer;
            }
            return this.fire('update',cpage,cPer,tpage,tPer);
        },
        handleEvent:function(oldEvent){
            var ev=filterEvent(oldEvent);

            switch(ev.type.toLowerCase()){
                case 'mousemove':
                case 'touchmove':
                case 'pointermove':
                    if(this.rect&&ev.touchNum<2){
                        var cIndex=this.current,
                            dir=this.direction,
                            rect=[ev.clientX,ev.clientY],
                            _rect=this.rect,
                            offset=rect[dir]-_rect[dir],
                            cpage=this.pages[cIndex],
                            total=cpage['offset'+['Width','Height'][dir]],
                            tIndex,percent;
                        if(this.drag==null && _rect.toString()!=rect.toString()){
                            this.drag=Math.abs(offset)>=Math.abs(rect[1-dir]-_rect[1-dir]);
                            this.drag && this.fire('dragStart');
                        }
                        if(this.drag){
                            percent=this.percent+(total&&offset/total);
                            if(!this.pages[tIndex=this.fixIndex(cIndex+(percent>0?-1:1))]){
                                percent/=Math.abs(offset)/total+1;
                            }
                            this.fixBlock(cIndex,tIndex);
                            this.fixUpdate(percent,cIndex,tIndex);
                            this._offset=offset;
                            ev.preventDefault();
                        }
                    }
                    break;

                case 'mousedown':
                case 'touchstart':
                case 'pointerdown':
                    var startEv=true;
                case 'mouseup':
                case 'touchend':
                case 'touchcancel':
                case 'pointerup':
                case 'pointercancel':
                    var self=this,
                        index=this.current,
                        percent=this.pageData[index].percent,
                        recover=this._offset||this.timer,
                        nn;
                    if(!this.time&&startEv||ev.touchNum){
                        nn=ev.target.nodeName.toLowerCase();
                        cancelFrame(this.timer);
                        this.rect=[ev.clientX,ev.clientY];
                        this.percent=percent;
                        this.time=+new Date;
                        if(!isTouch && (nn=='a' || nn=='img')){
                            ev.preventDefault();
                        }
                    }else{
                        if(this.drag==true){
                            if(+new Date-this.time<500 && Math.abs(this._offset)>20){
                                index+=this._offset>0?-1:1;
                            }else if(Math.abs(percent)>.5){
                                index+=percent>0?-1:1;
                            }
                            this.fire('dragEnd');
                            ev.preventDefault();
                        }
                        if(this.time){
                            each("rect drag time timer percent _offset".split(" "),function(prop){
                                delete self[prop];
                            });
                            if(recover){
                                this.slide(index);
                            }
                        }
                        break;
                    }
                    

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
        },
        destroy:function(){
            var pageData=this.pageData;

            offListener(this.container,STARTEVENT+" click"+(this.mousewheel?" mousewheel DOMMouseScroll":""),this.handler);
            offListener(document,MOVEEVENT+(this.arrowkey?" keydown":""),this.handler);

            each(this.pages,function(page,index){
                page.style.cssText=pageData[index].cssText;
            });
            
            return this.pause();
        },
        append:function(elem,index){
            if(null==index){
                index=this.pages.length;
            }
            this.pageData.splice(index,0,{
                percent:0,
                cssText:elem.style.cssText
            });
            this.pages.splice(index,0,elem);
            this.container.appendChild(this.initStyle(elem));
            
            this.length=this.pages.length;

            if(index<=this.current){
                this.slide(this.current+1);
            }

            return this;
        },
        prepend:function(elem){
            return this.append(elem,0);
        },
        insertBefore:function(elem,index){
            return this.append(elem,index-1);
        },
        insertAfter:function(elem,index){
            return this.append(elem,index+1);
        },
        remove:function(index){
            this.container.removeChild(this.pages[index]);
            this.pages.splice(index,1);
            this.pageData.splice(index,1);

            this.length=this.pages.length;

            if(index<=this.current){
                this.slide(this.current-1);
            }

            return this;
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
