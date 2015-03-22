pageSwitch
=========

Just a page Switch Javascript Library

## 如何使用
```javascript
// 首先在页面中引入pageSwitch.js
// 调用 pageSwitch 方法

var pw=new pageSwitch('container id',{
	duration:600,		//int 页面过渡时间
	direction:1,		//int 页面切换方向，0横向，1纵向
    start:0,			//int 默认显示页面
    loop:false,			//bool 是否循环切换
    ease:'ease',		//string|function 过渡曲线动画，支持linear, ease 或tween函数
    transition:'slide',	//string|function转场方式，支持slide fade scale skew rotate等，也可以自定义转场函数
    mousewheel:false,	//bool 是否启用鼠标滚轮切换
	arrowkey:false,		//bool 是否启用键盘方向切换
    autoplay:false,	    //bool 是否自动播放幻灯 新增
	interval:int		//bool 幻灯播放时间间隔 新增
});

//调用方法
pw.prev(); 				//上一张
pw.next();				//下一张
pw.slide(n);			//第n张
pw.setEase();			//重新设定过渡曲线
pw.setTransition();		//重新设定转场方式
pw.freeze(true|false);	//冻结页面转换，冻结后不可响应用户操作（调用slide prev next方法还可以进行）

pw.play();			    //播放幻灯
pw.pause();		        //暂停幻灯

/* 2015.03.22 新增方法 */
pw.prepend(DOM_NODE);	//前增页面
pw.append(DOM_NODE);	//后增页面
pw.insertBefore(DOM_NODE,index);	//在index前添加
pw.insertAfter(DOM_NODE,index);	//在index后添加
pw.remove(index);		//删除第index页面

pw.destroy();			//销毁pageSwitch效果对象

//事件绑定

/* event可选值:
 * 
 * before 页面切换前
 * after 页面切换后
 * update 页面切换中
 * dragStart 开始拖拽
 * dragEnd 结束拖拽
 */
pw.on(event,callback);
````

## setEase 示例

```javascript
//注：该转场函数也可直接在new pageSwitch对象时经ease参数传入
pw.setEase(function(t,b,c,d){
	return c*t/d + b;
});
````

## setTransition 示例

```javascript
pw.setTransition(function(cpage,cp,tpage,tp){
	/* 过渡效果处理函数
	 * 注：该转场函数也可直接在new pageSwitch对象时经transition参数传入
	 *
	 * @param Element cpage 当前页面
	 * @param Float cp      当前页面过度百分比。cp<0说明向上切换，反之向下
	 * @param Element tpage 前序页面
	 * @param Float tp      前序页面过度百分比 。tp<0说明向下切换，反之向上
	 * 注意：后两个参数 tpage和tp可能为空（页面切换边缘时，第一张、最后一张的情况）
	 */
	 
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
});
````

## 兼容性
兼容全平台，包括IE6+

## DEMO
http://u.boy.im/pageswitch
