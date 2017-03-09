pageSwitch
=========
> **与 [TouchSlider.js](https://github.com/qiqiboy/touchslider) 的区别**  
pageSwitch.js适用场景为全屏切换，即一切一屏，并且在此基础上实现了超过一百种切换效果。而TouchSlider.js则侧重于在滑动效果下，不仅支持全屏切换，还支持不固定尺寸的幻灯切换。  
具体使用请参看各组件所提供的示例。


Just a page Switch Javascript Library, and it has supported 121 switching animations.

页面切换器，支持多达121种切页效果，更可支持自定义切页动画， 尽情发挥想象力！  

## 无法滑动？

最新版本的chrome的实现了pointer事件，pageSwitch会优先使用pointer事件，但是会和系统触摸滚动冲突。
解决该问题，可以通过对滚动容器设置 [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) 样式来fix。
```scss
.my-slider-container {
    touch-action: pan-y; //横向滚动时 or
    touch-action: pan-x; //纵向滑动时
}
```
## 查看效果

http://u.boy.im/pageswitch/pic.html  

手机扫描下面二维码查看例子：  

![demo qrcode](https://raw.githubusercontent.com/qiqiboy/qiqiboy.github.com/master/images/qrcode/pageswitch.png)  

## 预览效果
[![slide](https://raw.githubusercontent.com/qiqiboy/qiqiboy.github.com/master/images/gif/slide.gif)](http://u.boy.im/pageswitch/pic.html?ts=slide) 
[![flipClock](https://raw.githubusercontent.com/qiqiboy/qiqiboy.github.com/master/images/gif/flipClock.gif)](http://u.boy.im/pageswitch/pic.html?ts=flipClock) 
[![flip](https://raw.githubusercontent.com/qiqiboy/qiqiboy.github.com/master/images/gif/flip.gif)](http://u.boy.im/pageswitch/pic.html?ts=flip) 
[![flip3d](https://raw.githubusercontent.com/qiqiboy/qiqiboy.github.com/master/images/gif/flip3d.gif)](http://u.boy.im/pageswitch/pic.html?ts=flip3d)

## 安装
    npm install pageswitch

## 如何使用
```javascript
// 如果使用webpack或者requirejs或者browserify等构建工具，可以这样：
var pageSwitch = require('pageswitch');

// 也可以直接在下载本文件，直接在页面中引入
// 首先在页面中引入pageSwitch.js
// 调用 pageSwitch 方法

var pw=new pageSwitch('container id',{
	duration:600,			//int 页面过渡时间
	direction:1,			//int 页面切换方向，0横向，1纵向
    start:0,				//int 默认显示页面
    loop:false,				//bool 是否循环切换
    ease:'ease',			//string|function 过渡曲线动画，详见下方说明
    transition:'slide',		//string|function转场方式，详见下方说明
	freeze:false,			//bool 是否冻结页面（冻结后不可响应用户操作，可以通过 `.freeze(false)` 方法来解冻）
	mouse:true,				//bool 是否启用鼠标拖拽
    mousewheel:false,		//bool 是否启用鼠标滚轮切换
	arrowkey:false,			//bool 是否启用键盘方向切换
    autoplay:false,	    	//bool 是否自动播放幻灯 新增
	interval:int			//bool 幻灯播放时间间隔 新增
});

//调用方法
pw.prev(); 					//上一张
pw.next();					//下一张
pw.slide(n);				//第n张
pw.setEase();				//重新设定过渡曲线
pw.setTransition();			//重新设定转场方式
pw.freeze(true|false);		//冻结页面转换，冻结后不可响应用户操作（调用slide prev next方法还可以进行）

pw.play();			    	//播放幻灯
pw.pause();		        	//暂停幻灯

/* 2015.03.22 新增方法 */
pw.prepend(DOM_NODE);		//前增页面
pw.append(DOM_NODE);		//后增页面
pw.insertBefore(DOM_NODE,index);	//在index前添加
pw.insertAfter(DOM_NODE,index);		//在index后添加
pw.remove(index);			//删除第index页面
pw.isStatic();				//是否静止状态

pw.destroy();				//销毁pageSwitch效果对象

/* 事件绑定
 * event可选值:
 * 
 * before 页面切换前
 * after 页面切换后
 * update 页面切换中
 * dragStart 开始拖拽
 * dragMove 拖拽中
 * dragEnd 结束拖拽
 */
pw.on(event,callback);
````

## setEase 示例

内置支持 `linear` `ease` `ease-in` `ease-out` `ease-in-out` `bounce`等  
`bounce` 弹跳过渡，很有意思，可以试试

```javascript
//注：此处传值也可直接在new pageSwitch对象时经ease参数传入
//设置匀速linear过渡示例：
pw.setEase('linear'); //由于内置了linear支持，所以可以直接使用

//假如没有内置linear，则使用自定义过渡曲线函数如下
pw.setEase(function(t,b,c,d){
	return c*t/d + b;
});
````

更多曲线函数参见：https://github.com/zhangxinxu/Tween/blob/master/tween.js

## setTransition 示例

支持以下转场效果：  
  
`fade`				渐隐渐显 | [demo](http://u.boy.im/pageswitch/pic.html?ts=fade)  

`slice`				裁切效果 | [demo](http://u.boy.im/pageswitch/pic.html?ts=slice)   
  
`scroll`			页面滚动 | [demo](http://u.boy.im/pageswitch/pic.html?ts=scroll)  
`scroll3d`			3d页面滚动 | [demo](http://u.boy.im/pageswitch/pic.html?ts=scroll3d)  
`scrollCover`		页面视差滚入滚出（前后页面速度不一致） | [demo](http://u.boy.im/pageswitch/pic.html?ts=scrollCover)  
`scrollCoverReverse`同上反向 | [demo](http://u.boy.im/pageswitch/pic.html?ts=scrollCoverReverse)    
`scrollCoverIn`  	总是下一张页面视差滚入 | [demo](http://u.boy.im/pageswitch/pic.html?ts=scrollCoverIn)   
`scrollCoverOut` 	总是当前页面视差滚出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=scrollCoverOut)     
  
`slide`				滑动切换，后者页面有缩放效果 | [demo](http://u.boy.im/pageswitch/pic.html?ts=slide)   
`slideCover`		页面滑入滑出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=slideCover)   
`slideCoverReverse`	同上反向 | [demo](http://u.boy.im/pageswitch/pic.html?ts=slideCoverReverse)   
`slideCoverIn`  	总是下一张页面滑入 | [demo](http://u.boy.im/pageswitch/pic.html?ts=slideCoverIn)   
`slideCoverOut` 	总是当前页面滑出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=slideCoverOut)     

`flow`				封面滑动切换 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flow)   
`flowCover`		页面滑入滑出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flowCover)   
`flowCoverReverse`	同上反向 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flowCoverReverse)   
`flowCoverIn`  	总是下一张页面滑入 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flowCoverIn)   
`flowCoverOut` 	总是当前页面滑出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flowCoverOut)  
  
`zoom`				缩放切换 | [demo](http://u.boy.im/pageswitch/pic.html?ts=zoom)   
`zoomCover`			页面缩进缩出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=zoomCover)   
`zoomCoverReverse`	同上反向 | [demo](http://u.boy.im/pageswitch/pic.html?ts=zoomCoverReverse)    
`zoomCoverIn`  		总是下一张页面缩入 | [demo](http://u.boy.im/pageswitch/pic.html?ts=zoomCoverIn)   
`zoomCoverOut` 		总是当前页面缩出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=zoomCoverOut)     
  
`skew`				扭曲切换 | [demo](http://u.boy.im/pageswitch/pic.html?ts=skew)   
`skewCover`			页面扭进扭出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=skewCover)   
`skewCoverReverse`	同上反向 | [demo](http://u.boy.im/pageswitch/pic.html?ts=skewCoverReverse)   
`skewCoverIn`  		总是下一张页面扭入 | [demo](http://u.boy.im/pageswitch/pic.html?ts=skewCoverIn)   
`skewCoverOut` 		总是当前页面扭出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=skewCoverOut)    
  
`flip`				翻转切换 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flip)   
`flip3d`			3d翻转切换 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flip3d)   
`flipClock`			翻页钟效果 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flipClock)   
`flipPaper`			翻书本效果 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flipPaper)   
`flipCover`			页面翻入翻出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flipCover)   
`flipCoverReverse`	同上反向 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flipCoverReverse)    
`flipCoverIn`  		总是下一张页面翻入 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flipCoverIn)   
`flipCoverOut` 		总是当前页面翻出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=flipCoverOut)    
  
`bomb`				放大切换 | [demo](http://u.boy.im/pageswitch/pic.html?ts=bomb)   
`bombCover`			页面大入大出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=bombCover)   
`bombCoverReverse`	同上反向 | [demo](http://u.boy.im/pageswitch/pic.html?ts=bombCoverReverse)   
`bombCoverIn`  		总是下一张页面大入 | [demo](http://u.boy.im/pageswitch/pic.html?ts=bombCoverIn)   
`bombCoverOut` 		总是当前页面大出 | [demo](http://u.boy.im/pageswitch/pic.html?ts=bombCoverOut)   

注意：除了`fade`，所有效果都支持指定X或Y轴方向效果，只要在名字后面加上`X`或`Y`即可。
例如：`scrollY` `flipX` `flipCoverX` `flipCoverInX` 等类似。
 
```javascript
//注：此处传值也可直接在new pageSwitch对象时经transition参数传入
//设置fade效果示例：
pw.setTransition('fade'); //由于内置了fade效果，所以可以直接调用。

//假定没有内置fade，自定义转场函数如下
pw.setTransition(function(cpage,cp,tpage,tp){
	/* 过渡效果处理函数
     * @param HTMLElement cpage 参与动画的前序页面
     * @param Float cp 目标页面过渡比率，取值范围-1到1
     * @param HTMLElement tpage 参与动画的后序页面；如果非循环loop模式，则在切换到边缘页面时可能不存在该参数
     * @param Float tp 目标页面过渡比率，取值范围-1到1；如果非循环loop模式，则在切换到边缘页面时可能不存在该参数
     */
	 
	if('opacity' in cpage.style){
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
});

//如果你有jQuery类似组件，可以更简单
pw.setTransition(function(cpage,cp,tpage,tp){
	$(cpage).css('opacity',1-Math.abs(cp));
	$(tpage).css('opacity',Math.abs(cp));
});
````

## jQuery/Zepto适配器
```javascript

$.fn.extend({
	pageSwitch:function(cfg){
		this[0].ps=new pageSwitch(this[0],cfg);
		return this;
	},
	ps:function(){
		return this[0].ps;
	}
});

//使用
$(container_id).pageSwitch({
	duration:1000,
	transition:'slide'
});

$(container_id).ps().next(); //由于链式调用返回依然是jq对象自身，所以如果需要使用pageSwitch对象方法，需要通过 `.ps()` 方法获取对pageSwitch对象的引用。

````

## 兼容性
兼容全平台，包括IE6+

## DEMO
http://u.boy.im/pageswitch  

http://u.boy.im/pageswitch/pic.html  
