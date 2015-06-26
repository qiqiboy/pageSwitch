/*
 * pageSwitch
 * @author qiqiboy
 * @github https://github.com/qiqiboy/pageSwitch
 */
;
(function(ROOT, struct, undefined){
    "use strict";
    
    var VERSION='2.3.1';
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
        DOC=ROOT.document,
        divstyle=DOC.createElement('div').style,
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
        opacity=cssTest('opacity'),
        transform=cssTest('transform'),
        perspective=cssTest('perspective'),
        transformStyle=cssTest('transform-style'),
        transformOrigin=cssTest('transform-origin'),
        backfaceVisibility=cssTest('backface-visibility'),
        preserve3d=transformStyle&&function(){
            divstyle[transformStyle]='preserve-3d';
            return divstyle[transformStyle]=='preserve-3d';
        }(),
        toString=Object.prototype.toString,
        class2type={},
        event2type={},
        event2code={
            click:4,
            mousewheel:5,
            dommousescroll:5,
            keydown:6
        },
        POINTERTYPES={
            2:'touch',
            3:'pen',
            4:'mouse',
            pen:'pen'
        },
        STARTEVENT=[],
        MOVEEVENT=[],
        EVENT=function(){
            var ret={},
                states={
                    start:1,
                    down:1,
                    move:2,
                    end:3,
                    up:3,
                    cancel:3
                };
            each("mouse touch pointer MSPointer-".split(" "),function(prefix){
                var _prefix=/pointer/i.test(prefix)?'pointer':prefix;
                ret[_prefix]=ret[_prefix]||{};
                POINTERTYPES[_prefix]=_prefix;
                each(states,function(endfix,code){
                    var ev=camelCase(prefix+endfix);
                    ret[_prefix][ev]=code;
                    event2type[ev.toLowerCase()]=_prefix;
                    event2code[ev.toLowerCase()]=code;
                    if(code==1){
                        STARTEVENT.push(ev);
                    }else{
                        MOVEEVENT.push(ev);
                    }
                });
            });
            return ret;
        }(),
        POINTERS={
            touch:{},
            pointer:{},
            mouse:{}
        },
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
                    cpage.style.opacity=1-Math.abs(cp);
                    if(tpage){
                        tpage.style.opacity=Math.abs(cp);
                    }
                }else{
                    cpage.style.filter='alpha(opacity='+(1-Math.abs(cp))*100+')';
                    if(tpage){
                        tpage.style.filter='alpha(opacity='+Math.abs(cp)*100+')';
                    }
                }
            }
        };

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
            TRANSITION['slideCoverReverse'+name].apply(this,arguments);
        }

        TRANSITION['flow'+name]=function(cpage,cp,tpage,tp){
            TRANSITION['flowCoverIn'+name].apply(this,arguments);
        }

        TRANSITION['slice'+name]=function(){
            var createWrap=function(node,container){
                    var wrap=DOC.createElement('div');
                    wrap.style.cssText='position:absolute;top:0;left:0;height:100%;width:100%;overflow:hidden;';
                    wrap.appendChild(node);
                    container.appendChild(wrap);
                },
                fixBlock=function(cpage,tpage,pages,container){
                    each(pages,function(page){
                        if(page.parentNode==container)return;
                        if(cpage!=page && tpage!=page){
                            page.parentNode.style.display='none';
                        }else{
                            page.parentNode.style.display='block';
                        }
                    });
                };
                    
            return function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][this.direction],
                    len=prop=='X'?'width':'height',
                    total=this.container[camelCase('client-'+len)],
                    m=Math.abs(cp)*100,
                    n=Math.abs(tp)*100,
                    end=cp==0||tp==0;

                cpage.style[len]=end?'100%':total+'px';
                if(cpage.parentNode==this.container){
                    createWrap(cpage,this.container);
                }
                cpage.parentNode.style.zIndex=cp>0?0:1;
                cpage.parentNode.style[len]=(Math.min(cp,0)+1)*100+'%';

                if(tpage){
                    tpage.style[len]=end?'100%':total+'px';
                    if(tpage.parentNode==this.container){
                        createWrap(tpage,this.container);
                    }
                    tpage.parentNode.style.zIndex=cp>0?1:0;
                    tpage.parentNode.style[len]=(Math.min(tp,0)+1)*100+'%';
                }

                fixBlock(cpage,tpage,this.pages,this.container);
            }
        }();

        TRANSITION['flip'+name]=function(cpage,cp,tpage,tp){
            var prop=name||['X','Y'][1-this.direction],
                fix=prop=='X'?-1:1;
            if(perspective){
                cpage.style[backfaceVisibility]='hidden';
                cpage.style[transform]='perspective(1000px) rotate'+prop+'('+cp*180*fix+'deg)'+fire3D;
                if(tpage){
                    tpage.style[backfaceVisibility]='hidden';
                    tpage.style[transform]='perspective(1000px) rotate'+prop+'('+tp*180*fix+'deg)'+fire3D;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['flip3d'+name]=function(){
            var inited;
            return function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][1-this.direction],
                    fe=prop=='X'?-1:1,
                    fix=fe*(cp<0?1:-1),
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

        TRANSITION['flipClock'+name]=function(){
            var createWrap=function(node,container,prop,off){
                    var wrap=node.parentNode,
                        len=prop=='X'?'height':'width',
                        pos=prop=='X'?'top':'left',
                        origin=['50%',(off?0:100)+'%'][prop=='X'?'slice':'reverse']().join(' ');

                    if(!wrap||wrap==container){
                        wrap=DOC.createElement('div');
                        wrap.style.cssText='position:absolute;top:0;left:0;height:100%;width:100%;overflow:hidden;display:none;';
                        wrap.style[transformOrigin]=origin;
                        wrap.style[backfaceVisibility]='hidden';
                        wrap.appendChild(node);
                        container.appendChild(wrap);
                    }

                    wrap.style[len]='50%';
                    wrap.style[pos]=off*100+'%';
                    node.style[len]='200%';
                    node.style[pos]=-off*200+'%';

                    return wrap;
                },
                fixBlock=function(cpage,tpage,pages,container){
                    each(pages,function(page){
                        if(page.parentNode==container)return;
                        if(cpage!=page && tpage!=page){
                            page.parentNode.style.display=page._clone.parentNode.style.display='none';
                        }else{
                            page.parentNode.style.display=page._clone.parentNode.style.display='block';
                        }
                    });
                };

            return function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][1-this.direction],
                    isSelf=this.pages[this.current]==cpage,
                    zIndex=Number(Math.abs(cp)<.5),
                    fix=prop=='X'?1:-1,
                    m,n;
                if(perspective){
                    createWrap(cpage,this.container,prop,0);
                    createWrap(cpage._clone||(cpage._clone=cpage.cloneNode(true)),this.container,prop,.5);

                    m=n=-cp*180*fix;
                    cp>0?n=0:m=0;
                    cpage.parentNode.style.zIndex=cpage._clone.parentNode.style.zIndex=zIndex;
                    cpage.parentNode.style[transform]='perspective(1000px) rotate'+prop+'('+m+'deg)';
                    cpage._clone.parentNode.style[transform]='perspective(1000px) rotate'+prop+'('+n+'deg)';

                    if(tpage){
                        createWrap(tpage,this.container,prop,0);
                        createWrap(tpage._clone||(tpage._clone=tpage.cloneNode(true)),this.container,prop,.5);

                        m=n=-tp*180*fix;
                        cp>0?m=0:n=0;
                        tpage.parentNode.style.zIndex=tpage._clone.parentNode.style.zIndex=1-zIndex;
                        tpage.parentNode.style[transform]='perspective(1000px) rotate'+prop+'('+m+'deg)';
                        tpage._clone.parentNode.style[transform]='perspective(1000px) rotate'+prop+'('+n+'deg)';
                    }

                    fixBlock(cpage,tpage,this.pages,this.container);

                    if(0==cp||tp==0){
                        cpage=this.pages[this.current];
                        cpage.style.height=cpage.style.width=cpage.parentNode.style.height=cpage.parentNode.style.width='100%';
                        cpage.style.top=cpage.style.left=cpage.parentNode.style.top=cpage.parentNode.style.left=0;
                        cpage.parentNode.style.zIndex=2;
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }
        }();

        TRANSITION['flipPaper'+name]=function(){
            var backDiv;

            return function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][this.direction],
                    len=prop=='X'?'width':'height',
                    m=Math.abs(cp)*100;
                if(!backDiv){
                    backDiv=DOC.createElement('div');
                    backDiv.style.cssText='position:absolute;z-index:2;top:0;left:0;height:0;width:0;background:no-repeat #fff;';
                    try{
                        backDiv.style.backgroundImage=cssVendor+'linear-gradient('+(prop=='X'?'right':'bottom')+', #aaa 0,#fff 20px)';
                    }catch(e){}
                    this.container.appendChild(backDiv);
                }

                TRANSITION['slice'+name].apply(this,arguments);
                
                backDiv.style.display=cp==0||tp==0?'none':'block';
                backDiv.style.width=backDiv.style.height='100%';
                backDiv.style[len]=(cp<0?m:100-m)+'%';
                backDiv.style[XY[prop]]=(cp<0?100-2*m:2*m-100)+'%';
            }
        }();

        TRANSITION['zoom'+name]=function(cpage,cp,tpage,tp){
            var zIndex=Number(Math.abs(cp)<.5);
            if(transform){
                cpage.style[transform]='scale'+name+'('+Math.abs(1-Math.abs(cp)*2)+')'+fire3D;
                cpage.style.zIndex=zIndex;
                if(tpage){
                    tpage.style[transform]='scale'+name+'('+Math.abs(1-Math.abs(cp)*2)+')'+fire3D;
                    tpage.style.zIndex=1-zIndex;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['bomb'+name]=function(cpage,cp,tpage,tp){
            var zIndex=Number(Math.abs(cp)<.5),
                val=Math.abs(1-Math.abs(cp)*2);
            if(transform){
                cpage.style[transform]='scale'+name+'('+(2-val)+')'+fire3D;
                cpage.style.opacity=zIndex?val:0;
                cpage.style.zIndex=zIndex;
                if(tpage){
                    tpage.style[transform]='scale'+name+'('+(2-val)+')'+fire3D;
                    tpage.style.opacity=zIndex?0:val;
                    tpage.style.zIndex=1-zIndex;
                }
            }else TRANSITION['scroll'+name].apply(this,arguments);
        }

        TRANSITION['skew'+name]=function(cpage,cp,tpage,tp){
            var zIndex=Number(Math.abs(cp)<.5);
            if(transform){
                cpage.style[transform]='skew'+name+'('+cp*180+'deg)'+fire3D;
                cpage.style.zIndex=zIndex;
                if(tpage){
                    tpage.style[transform]='skew'+name+'('+tp*180+'deg)'+fire3D;
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
                transform?cpage.style[transform]='translate'+prop+'('+cp*cr+'%)'+fire3D:cpage.style[XY[prop]]=cp*cr+'%';
                cpage.style.zIndex=1-zIndex;
                if(tpage){
                    transform?tpage.style[transform]='translate'+prop+'('+tp*tr+'%)'+fire3D:tpage.style[XY[prop]]=tp*tr+'%';
                    tpage.style.zIndex=zIndex;
                }
            }
            
            TRANSITION['slideCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][this.direction],
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    cpage.style[transform]='translate'+prop+'('+cp*(100-zIndex*100)+'%) scale('+((1-Math.abs(zIndex&&cp))*.2+.8)+')'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='translate'+prop+'('+tp*zIndex*100+'%) scale('+((1-Math.abs(zIndex?0:tp))*.2+.8)+')'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scrollCover'+type+name].apply(this,arguments);
            }

            TRANSITION['flowCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][this.direction],
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    cpage.style[transform]='translate'+prop+'('+cp*(100-zIndex*50)+'%) scale('+((1-Math.abs(cp))*.5+.5)+')'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='translate'+prop+'('+tp*(50+zIndex*50)+'%) scale('+((1-Math.abs(tp))*.5+.5)+')'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scrollCover'+type+name].apply(this,arguments);
            }

            TRANSITION['flipCover'+type+name]=function(cpage,cp,tpage,tp){
                var prop=name||['X','Y'][1-this.direction],
                    zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(perspective){
                    zIndex?cp=0:tp=0;
                    cpage.style[transform]='perspective(1000px) rotate'+prop+'('+cp*-90+'deg)'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='perspective(1000px) rotate'+prop+'('+tp*-90+'deg)'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }

            TRANSITION['skewCover'+type+name]=function(cpage,cp,tpage,tp){
                var zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    zIndex?cp=0:tp=0;
                    cpage.style[transform]='skew'+name+'('+cp*90+'deg)'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='skew'+name+'('+tp*90+'deg)'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }

            TRANSITION['zoomCover'+type+name]=function(cpage,cp,tpage,tp){
                var zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    zIndex?cp=0:tp=0;
                    cpage.style[transform]='scale'+name+'('+(1-Math.abs(cp))+')'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='scale'+name+'('+(1-Math.abs(tp))+')'+fire3D;
                        tpage.style.zIndex=zIndex;
                    }
                }else TRANSITION['scroll'+name].apply(this,arguments);
            }

            TRANSITION['bombCover'+type+name]=function(cpage,cp,tpage,tp){
                var zIndex=Number(type=='In'||!type&&cp<0||type=='Reverse'&&cp>0);
                if(transform){
                    zIndex?cp=0:tp=0;
                    cpage.style[transform]='scale'+name+'('+(1+Math.abs(cp))+')'+fire3D;
                    cpage.style.zIndex=1-zIndex;
                    if(tpage){
                        tpage.style[transform]='scale'+name+'('+(1+Math.abs(tp))+')'+fire3D;
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

    function camelCase(str){
        return (str+'').replace(/^-ms-/, 'ms-').replace(/-([a-z]|[0-9])/ig, function(all, letter){
            return (letter+'').toUpperCase();
        });
    }

    function cssTest(name){
        var prop=camelCase(name),
            _prop=camelCase(cssVendor+prop);
        return (prop in divstyle) && prop || (_prop in divstyle) && _prop || '';
    }

    function isFunction(func){
        return type(func)=='function';
    }

    function pointerLength(obj){
        var len=0,key;
        if(type(obj.length)=='number'){
            len=obj.length;
        }else if('keys' in Object){
            len=Object.keys(obj).length;
        }else{
            for(key in obj){
                if(obj.hasOwnProperty(key)){
                    len++;
                }
            }
        }
        return len;
    }

    function pointerItem(obj,n){
        return 'item' in obj?obj.item(n):function(){
            var i=0,key;
            for(key in this){
                if(i++==n){
                    return this[key];
                }
            }
        }.call(obj,n);
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

    function getStyle(elem,prop){
        var style=ROOT.getComputedStyle&&ROOT.getComputedStyle(elem,null)||elem.currentStyle||elem.style;
        return style[prop];
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
            DOC.selection.empty();
        }
    }

    function filterEvent(oldEvent){
        var ev={},
            which=oldEvent.which,
            button=oldEvent.button,
            pointers,pointer;

        each("wheelDelta detail which keyCode".split(" "),function(prop){
            ev[prop]=oldEvent[prop];
        });

        ev.oldEvent=oldEvent;
        
        ev.type=oldEvent.type.toLowerCase();
        ev.eventType=event2type[ev.type]||ev.type;
        ev.eventCode=event2code[ev.type]||0;
        ev.pointerType=POINTERTYPES[oldEvent.pointerType]||oldEvent.pointerType||ev.eventtype;

        ev.target=oldEvent.target||oldEvent.srcElement||DOC.documentElement;
        if(ev.target.nodeType===3){
            ev.target=ev.target.parentNode;
        }

        ev.preventDefault=function(){
            oldEvent.preventDefault && oldEvent.preventDefault();
            ev.returnValue=oldEvent.returnValue=false;
        }

        if(pointers=POINTERS[ev.eventType]){
            switch(ev.eventType){
                case 'mouse':
                case 'pointer':
                    var id=oldEvent.pointerId||0;
                    ev.eventCode==3?delete pointers[id]:pointers[id]=oldEvent;
                    break;
                case 'touch':
                    POINTERS[ev.eventType]=pointers=oldEvent.touches;
                    break;
            }

            if(pointer=pointerItem(pointers,0)){
                ev.clientX=pointer.clientX;
                ev.clientY=pointer.clientY;
            }
            
            ev.button=which<4?Math.max(0,which-1):button&4&&1||button&2; // left:0 middle:1 right:2
            ev.length=pointerLength(pointers);
        }

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
            this.mouse=config.mouse==null?true:!!config.mouse;
            this.mousewheel=!!config.mousewheel;
            this.interval=parseInt(config.interval)||5000;
            this.playing=!!config.autoplay;
            this.arrowkey=!!config.arrowkey;
            this.frozen=!!config.freeze;
            this.pages=children(this.container);
            this.length=this.pages.length;

            this.pageData=[];

            addListener(this.container,STARTEVENT.join(" ")+" click"+(this.mousewheel?" mousewheel DOMMouseScroll":""),handler);
            addListener(DOC,MOVEEVENT.join(" ")+(this.arrowkey?" keydown":""),handler);

            each(this.pages,function(page){
                self.pageData.push({
                    percent:0,
                    cssText:page.style.cssText||''
                });
                self.initStyle(page);
            });
            this.pages[this.current].style.display='block';

            this.on({
                before:function(){clearTimeout(self.playTimer);},
                dragStart:function(){clearTimeout(self.playTimer);removeRange();},
                after:function(){
                    if(self.playing){
                        self.playTimer=setTimeout(function(){
                            self.next();
                        },self.interval);
                    }
                },
                update:null
            }).fire('after');

            this.comment=document.createComment(' Powered by pageSwitch v'+this.version+'  https://github.com/qiqiboy/pageSwitch ');
            this.container.appendChild(this.comment);

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
        isStatic:function(){
            return !this.timer && !this.drag;
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
        fire:function(ev){
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
            this.frozen=able==null?true:!!able;
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
            return pdata&&(pdata.percent||0);
        },
        getOffsetParent:function(){
            var position=getStyle(this.container,'position');
            if(position&&position!='static'){
                return this.container;
            }
            return this.container.offsetParent||DOC.body;
        },
        handleEvent:function(oldEvent){
            var ev=filterEvent(oldEvent),
                canDrag=ev.length<2&&ev.button<1&&(!this.pointerType||this.pointerType==ev.eventType)&&(this.mouse||ev.pointerType!='mouse');

            switch(ev.eventCode){
                case 2:
                    if(canDrag&&this.rect){
                        var cIndex=this.current,
                            dir=this.direction,
                            rect=[ev.clientX,ev.clientY],
                            _rect=this.rect,
                            offset=rect[dir]-_rect[dir],
                            cpage=this.pages[cIndex],
                            total=this.offsetParent[dir?'clientHeight':'clientWidth'],
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

                case 1:
                    if(canDrag&&!this.pointerType){
                        this.pointerType=ev.eventType;
                    }
                case 3:
                    if(canDrag){
                        var self=this,
                            index=this.current,
                            percent=this.getPercent(),
                            isDrag,offset,tm,nn;
                        if(ev.length){
                            nn=ev.target.nodeName.toLowerCase();
                            if(this.timer){
                                cancelFrame(this.timer);
                                delete this.timer;
                            }
                            this.rect=[ev.clientX,ev.clientY];
                            this.percent=percent;
                            this.time=+new Date;
                            this.offsetParent=this.getOffsetParent();
                            if(ev.eventType!='touch' && (nn=='a' || nn=='img')){
                                ev.preventDefault();
                            }
                        }else if(tm=this.time){
                            offset=this._offset;
                            isDrag=this.drag;

                            each("rect drag time percent _offset offsetParent pointerType".split(" "),function(prop){
                                delete self[prop];
                            });

                            if(isDrag){
                                if(+new Date-tm<500&&Math.abs(offset)>20 || Math.abs(percent)>.5){
                                    index+=offset>0?-1:1;
                                }
                                this.fire('dragEnd',ev);
                                ev.preventDefault();
                            }

                            if(percent){
                                this.slide(index);
                            }
                        }
                    }
                    break;

                case 4:
                    if(this.timer){
                        ev.preventDefault();
                    }
                    break;

                case 5:
                    ev.preventDefault();
                    if(this.isStatic() && +new Date-this.latestTime>Math.max(1000-this.duration,0)){
                        var wd=ev.wheelDelta||-ev.detail;
                        Math.abs(wd)>=3 && this[wd>0?'prev':'next']();
                    }
                    break;

                case 6:
                    var nn=ev.target.nodeName.toLowerCase();
                    if(this.isStatic() && nn!='input' && nn!='textarea' && nn!='select'){
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

            offListener(this.container,STARTEVENT.join(" ")+" click"+(this.mousewheel?" mousewheel DOMMouseScroll":""),this.handler);
            offListener(DOC,MOVEEVENT.join(" ")+(this.arrowkey?" keydown":""),this.handler);

            each(this.pages,function(page,index){
                page.style.cssText=pageData[index].cssText;
            });

            this.container.removeChild(this.comment);

            this.length=0;
            
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
