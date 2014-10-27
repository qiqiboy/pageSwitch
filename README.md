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
    mousewheel:false	//bool 是否启用鼠标滚轮切换
});

//调用方法
pw.prev(); 				//上一张
pw.next();				//下一张
pw.slide(n);			//第n张
pw.setEase();			//重新设定过渡曲线
pw.setTransition();		//重新设定转场方式

//事件绑定
pw.on(event,callback);	//event可选值 before（页面切换前） after（页面切换后） update（页面切换中）
````

## 兼容性
兼容全平台，包括IE6+
