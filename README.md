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
pw.freeze(able);		//冻结页面转换，冻结后不可响应用户操作（调用slide prev next方法还可以进行）

//事件绑定
pw.on(event,callback);	//event可选值 before（页面切换前） after（页面切换后） update（页面切换中）
````

## setEase 示例

```javascript
pw.setEase(function(t,b,c,d){
	return c*t/d + b;
});
````

## setTransition 示例

```javascript
pw.setTransition(function(percent,tpageIndex){
	/*
	 * @param Float percent 目标页面过渡比率 0-1
	 * @param Int tpageIndex 前一页面次序，该数值可能非法（所以需要测试是否存在该次序页面）
	 */
	 
	var current=this.current,						//目标次序
		cpage=this.pages[this.current],				//目标页面
		tpage=this.pages[tpageIndex];				//前一张页面
	if('opacity' in cpage.style){					//检测透明度css支持
		cpage.style.opacity=1-Math.abs(percent);	//目标页面根据切换比率设置其渐显
		if(tpage){									//这里检测下是否存在前一张页面
			tpage.style.opacity=Math.abs(percent);	//设置前一张页面渐隐
		}
	}else{
		cpage.style.filter='alpha(opacity='+(1-Math.abs(percent))*100+')';
		if(tpage){
			tpage.style.filter='alpha(opacity='+Math.abs(percent)*100+')';
		}
	}
});
````

## 兼容性
兼容全平台，包括IE6+
