pageSwitch
=========

Just a page Switch Javascript Library

## 如何使用
```javascript
// 首先在页面中引入pageSwitch.js
// 调用 pageSwitch 方法

var pw=new pageSwitch('container id',{
	duration:600,			//int 页面过渡时间
	direction:1,			//int 页面切换方向，0横向，1纵向
    start:0,				//int 默认显示页面
    loop:false,				//bool 是否循环切换
    ease:'ease',			//string|function 过渡曲线动画，详见下方说明
    transition:'slide',		//string|function转场方式，详见下方说明
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

内置支持 `linear` `ease` `eas-in` `ease-out` `ease-in-out`等

```javascript
//注：此处传值也可直接在new pageSwitch对象时经ease参数传入
//设置匀速linear过渡示例：
pw.setEase('linear'); //由于内置了linear支持，所以可以直接使用

//假如没有内置linear，则使用自定义过渡曲线函数如下
pw.setEase(function(t,b,c,d){
	return c*t/d + b;
});
````

## setTransition 示例

支持以下转场效果：
* `fade`			渐隐渐显
*
* `scroll`			页面滚动
*
* `slide`			滑动切换，后者页面有缩放效果
* `slideCover`		页面滑入滑出
* `slideCoverIn`  	总是下一张页面滑入
* `slideCoverOut` 	总是当前页面滑出
*
* `zoom`			缩放切换
* `zoomCover`		页面缩进缩出
* `zoomCoverIn`  	总是下一张页面缩入
* `zoomCoverOut` 	总是当前页面缩出
*
* `skew`			扭曲切换
* `skewCover`		页面扭进扭出
* `skewCoverIn`  	总是下一张页面扭入
* `skewCoverOut` 	总是当前页面扭出
*
* `flip`			翻转切换
* `flipCover`		页面翻入翻出
* `flipCoverIn`  	总是下一张页面翻入
* `flipCoverOut` 	总是当前页面翻出
*
* `bomb`			放大切换
* `bombCover`		页面大入大出
* `bombCoverIn`  	总是下一张页面大入
* `bombCoverOut` 	总是当前页面大出

注意：除了`fade`，所有效果都支持指定X或Y轴方向效果，只要在名字后面加上`X`或`Y`即可。
例如：`scrollY` `flipX` `flipCoverX` `flipCoverInX` 等类似。
 
```javascript
//注：此处传值也可直接在new pageSwitch对象时经transition参数传入
//设置fade效果示例：
pw.setTransition('fade'); //由于内置了fade效果，所以可以直接调用。

//假定没有内置fade，自定义转场函数如下
pw.setTransition(function(cpage,cp,tpage,tp){
	/* 过渡效果处理函数
	 *
	 * @param Element cpage 当前页面
	 * @param Float cp      当前页面过度百分比。cp<0说明向上切换，反之向下
	 * @param Element tpage 前序页面
	 * @param Float tp      前序页面过度百分比 。tp<0说明向下切换，反之向上
	 * 注意：后两个参数 tpage和tp可能为空（页面切换边缘时，第一张、最后一张的情况）
	 */
	 
	if('opacity' in cpage.style){
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
});
````

## 兼容性
兼容全平台，包括IE6+

## DEMO
http://u.boy.im/pageswitch
