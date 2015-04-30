/*
 * pageSwitch
 * @author qiqiboy
 * @github https://github.com/qiqiboy/pageSwitch
 */
;
(function(ROOT, struct, undefined){
    "use strict";
    
    var VERSION='2.2.1';
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
        divstyle=document.createElement('div').style,
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
        transformStyle=cssTest('transform-style'),
        perspective=cssTest('perspective'),
        backfaceVisibility=cssTest('backface-visibility'),
        preserve3d=transformStyle&&function(){
            divstyle[transformStyle]='preserve-3d';
            return divstyle[transformStyle]=='preserve-3d';
        }(),
        toString=Object.prototype.toString,
        class2type={},
        EASE={
            linear:function(t,b,c,d){ return c*t/d + b; },
            ease:function(t,b,c,d){ return -c * ((t=t/d-1)*t*t*t - 1) + b; },
            'ease-in':function(t,b,c,d){ return c*(t/=d)*t*t + b; },
            'ease-out':function(t,b,c,d){ return c*((t=t/d-1)*t*t + 1) + b; },
            'ease-in-out':function(t,b,c,d){ if ((t/=d/2) < 1) return c/2*t*t*t + b; return c/2*((t-=2)*t*t + 2) + b; },
            bounce:function(t,b,c,d){ if ((t/=d) < (1/2.75)) { return c*(7.5625*t*t) + b; } else if (t < (2/2.75)) { return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b; } else if (t < (2.5/2.75)) { return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b; } else { return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b; } }
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
            var prop=name||['X','Y'][this.direction];
            transform?cpage.style[transform]='translate'+prop+'('+cp*100+'%)'+fire3D:cpage.style[XY[prop]]=cp*100+'%';
            if(tpage){
                transform?tpage.style[transform]='translate'+prop+'('+tp*100+'%)'+fire3D:tpage.style[XY[prop]]=tp*100+'%';
            }
        }

        TRANSITION['scroll3d'+name]=function(cpage,cp,tpage,tp){
            var prop=name||['X','Y'][this.direction],
                fix=cp<0?-1:1,
                abscp=Math.abs(cp),
                deg;
            if(perspective){
                if(abscp<.05){
                    deg=abscp*1200;
                    cp=0;tp=fix*-1;
                }else if(abscp<.95){
                    deg=60;
                    cp=(cp-.05*fix)/.9;
                    tp=(tp+.05*fix)/.9;
                }else{
                    deg=(1-abscp)*1200;
                    cp=fix;tp=0;
                }
                cpage.parentNode.style[transform]='perspective(1000px) rotateX('+deg+'deg)';
                cpage.style[transform]='translate'+prop+'('+cp*100+'%)';
                if(tpage){
                    tpage.style[transform]='translate'+prop+'('+tp*100+'%)';
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['slide'+name]=function(cpage,cp,tpage,tp){
            var prop=name||['X','Y'][this.direction];
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

        TRANSITION['flip'+name]=function(cpage,cp,tpage,tp){
            var prop=name||['X','Y'][1-this.direction],
                fix=prop=='X'?cp>0?-1:1:cp>0?1:-1;
            if(perspective){
                cpage.style[backfaceVisibility]='hidden';
                cpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(cp)*180*fix+'deg)'+fire3D;
                if(tpage){
                    tpage.style[backfaceVisibility]='hidden';
                    tpage.style[transform]='perspective(1000px) rotate'+prop+'('+Math.abs(tp)*180*-fix+'deg)'+fire3D;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['flip3d'+name]=function(){
            var inited;
            return function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][1-this.direction],
                    fe=prop=='X'?-1:1,
                    fix=fe<0?cp<0?-1:1:cp<0?1:-1,
                    zh=cpage['offset'+(prop=='X'?'Height':'Width')]/2;
                if(preserve3d){
                    if(!inited){
                        inited=true;
                        cpage.parentNode.parentNode.style[perspective]='1000px';
                        cpage.parentNode.style[transformStyle]='preserve-3d';
                    }
                    cpage.parentNode.style[transform]='translateZ(-'+zh+'px) rotate'+prop+'('+cp*90*fe+'deg)';
                    cpage.style[transform]='rotate'+prop+'(0) translateZ('+zh+'px)';
                    if(tpage){
                        tpage.style[transform]='rotate'+prop+'('+(fix*90)+'deg) translateZ('+zh+'px)';
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }
        }();

        TRANSITION['zoom'+name]=function(cpage,cp,tpage,tp){
            var prop=name;
            if(transform){
                if(Math.abs(cp)<.5){
                    cpage.style[transform]='scale'+prop+'('+(1-Math.abs(cp)*2)+')'+fire3D;
                    cpage.style.zIndex=1;
                    if(tpage){
                        tpage.style[transform]='scale'+prop+'(0)'+fire3D;
                        tpage.style.zIndex=0;
                    }
                }else{
                    cpage.style.zIndex=0;
                    if(tpage){
                        tpage.style[transform]='scale'+prop+'('+(Math.abs(cp)-.5)*2+')'+fire3D;
                        tpage.style.zIndex=1;
                    }
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['bomb'+name]=function(cpage,cp,tpage,tp){
            var zIndex=Number(cp<0);
            if(transform){
                cpage.style[transform]='scale'+name+'('+(2-Math.abs(tp))+')'+fire3D;
                cpage.style.zIndex=zIndex;
                if(tpage){
                    tpage.style[transform]='scale'+name+'('+(2-Math.abs(cp))+')'+fire3D;
                    tpage.style.zIndex=1-zIndex;
                }
                TRANSITION.fade.apply(this,arguments);
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['skew'+name]=function(cpage,cp,tpage,tp){
            var prop=name,
                zIndex=Number(Math.abs(cp)<.5);
            if(transform){
                cpage.style[transform]='skew'+prop+'('+cp*180+'deg)'+fire3D;
                cpage.style.zIndex=zIndex;
                if(tpage){
                    tpage.style[transform]='skew'+prop+'('+tp*180+'deg)'+fire3D;
                    tpage.style.zIndex=1-zIndex;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        each(" Reverse In Out".split(" "),function(type){
            TRANSITION['scrollCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][this.direction],
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0),
                    cr=100,tr=100;
                zIndex?cr=20:tr=20;
                transform?cpage.style[transform]='translate'+prop+'('+cp*cr+'%)'+fire3D:cpage.style[XY[prop]]=cp*100+'%';
                cpage.style.zIndex=1-zIndex;
                if(tpage){
                    transform?tpage.style[transform]='translate'+prop+'('+tp*tr+'%)'+fire3D:tpage.style[XY[prop]]=tp*100+'%';
                    tpage.style.zIndex=zIndex;
                }
            }
            
            TRANSITION['slideCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][this.direction],
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                zIndex?cp=0:tp=0;
                transform?cpage.style[transform]='translate'+prop+'('+cp*100+'%)'+fire3D:cpage.style[XY[prop]]=cp*100+'%';
                cpage.style.zIndex=1-zIndex;
                if(tpage){
                    transform?tpage.style[transform]='translate'+prop+'('+tp*100+'%)'+fire3D:tpage.style[XY[prop]]=tp*100+'%';
                    tpage.style.zIndex=zIndex;
                }
            }

            TRANSITION['flipCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][1-this.direction],
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(perspective){
                    zIndex?cp=0:tp=0;
                    cpage.style[transform]='perspective(1000px) rotate'+prop+'('+cp*-90+'deg)'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='perspective(1000px) rotate'+prop+'('+tp*-90+'deg)'+fire3D
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }

            TRANSITION['skewCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name,
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    zIndex?cp=0:tp=0;
                    cpage.style[transform]='skew'+prop+'('+cp*90+'deg)'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='skew'+prop+'('+tp*90+'deg)'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }

            TRANSITION['zoomCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name,
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    zIndex?cp=0:tp=0;
                    cpage.style[transform]='scale'+prop+'('+(1-Math.abs(cp))+')'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='scale'+prop+'('+(1-Math.abs(tp))+')'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }

            TRANSITION['bombCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name,
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    zIndex?tp=1:cp=1;
                    cpage.style[transform]='scale'+prop+'('+(2-Math.abs(tp))+')'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='scale'+prop+'('+(2-Math.abs(cp))+')'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                    TRANSITION.fade.apply(this,arguments);
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }
        });
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

    function removeRange(){
        var range;
        if(ROOT.getSelection){
            range=getSelection();
            if('empty' in range)range.empty();
            else if('removeAllRanges' in range)range.removeAllRanges();
        }else{
            range=document.selection.createRange();
            range.moveEnd("character",-range.text.length);
            range.select();
        }
    }

    function filterEvent(oldEvent){
        var ev={},
            which=oldEvent.which,
            button=oldEvent.button;

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
        
        ev.button=which<4?which-1:button&4&&1||button&2; // left:0 middle:1 right:2
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
                dragMove:function(){removeRange();},
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
                percent=this.getPercent(),
                tIndex=this.fixIndex(fixIndex==current?current+(percent>0?-1:1):fixIndex),
                tpage=this.pages[tIndex],
                target=index>current?-1:1,
                _tpage=cpage;
            
            cancelFrame(this.timer);

            if(fixIndex==current){
                target=0;
                _tpage=tpage;
            }else if(tpage.style.display=='none'){
                percent=0;
            }

            this.fixBlock(current,tIndex);
            this.fire('before',current,fixIndex);
            this.current=fixIndex;

            duration*=Math.abs(target-percent);

            this.latestTime=stime+duration;

            ani();

            function ani(){
                var offset=Math.min(duration,+new Date-stime),
                    s=duration?ease(offset,0,1,duration):1,
                    cp=(target-percent)*s+percent;
                self.fixUpdate(cp,current,tIndex);
                if(offset==duration){
                    if(_tpage){
                        _tpage.style.display='none';
                    }
                    delete self.timer;
                    self.fire('after',fixIndex,current);
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
            return this.length>1&&(this.loop||this.playing)?(this.length+index%this.length)%this.length:index;
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
        getPercent:function(index){
            var pdata=this.pageData[index==null?this.current:index];
            return pdata.percent||0;
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
                            this.drag && this.fire('dragStart',ev);
                        }
                        if(this.drag){
                            percent=this.percent+(total&&offset/total);
                            if(!this.pages[tIndex=this.fixIndex(cIndex+(percent>0?-1:1))]){
                                percent/=Math.abs(offset)/total+2;
                            }
                            this.fixBlock(cIndex,tIndex);
                            this.fire('dragMove',ev);
                            this.fixUpdate(percent,cIndex,tIndex);
                            this._offset=offset;
                            ev.preventDefault();
                        }
                    }
                    break;

                case 'mousedown':
                case 'touchstart':
                case 'pointerdown':
                    var startEv=!ev.button;
                case 'mouseup':
                case 'touchend':
                case 'touchcancel':
                case 'pointerup':
                case 'pointercancel':
                    var self=this,
                        index=this.current,
                        percent=this.getPercent(),
                        isDrag,offset,tm,nn;
                    if(!this.time&&startEv||ev.touchNum){
                        nn=ev.target.nodeName.toLowerCase();
                        if(this.timer){
                            cancelFrame(this.timer);
                            delete this.timer;
                        }
                        this.rect=[ev.clientX,ev.clientY];
                        this.percent=percent;
                        this.time=+new Date;
                        if(!isTouch && (nn=='a' || nn=='img')){
                            ev.preventDefault();
                        }
                    }else{
                        offset=this._offset;
                        isDrag=this.drag;

                        if(tm=this.time){
                            each("rect drag time percent _offset".split(" "),function(prop){
                                delete self[prop];
                            });
                        }

                        if(isDrag){
                            if(+new Date-tm<500 && Math.abs(offset)>20){
                                index+=offset>0?-1:1;
                            }else if(Math.abs(percent)>.5){
                                index+=percent>0?-1:1;
                            }
                            this.fire('dragEnd',ev);
                            ev.preventDefault();
                        }

                        if(percent){
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
                    if(!this.timer && !this.drag && +new Date-this.latestTime>Math.max(1000-this.duration,0)){
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
                this.current++;
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
                this.slide(this.current=Math.max(0,this.current-1));
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
