Animation
=========

javascript简易动画组件

## 如何使用
```javascript
// 首先在页面中引入animation.js
// @param duration 动画时长
// @param easingFunction tween缓动公式
						 参见：https://github.com/zhangxinxu/Tween/blob/master/tween.js
var ani=new Animation(duration, easingFunction);
ani.start(callback); // 绑定动画开始事件
ani.stop(callback); // 绑定动画停止事件
ani.next(callback); // 绑定动画帧更新事件，在该触发中可以通过调用 this.percent 来获取动画执行进度以基于此来更新渲染
ani.finish(callback); // 绑定动画结束事件

// 以上四个方法如果不带参数，则为分别触发相应的事件
ani.start(); //开始执行动画
ani.stop(); //停止执行动画
ani.finish(); //结束动画

// 以上是补间动画的调用，如果要实现帧动画，可以通过下面方法
// @param int(ms) frameTime 帧间隔时间
// @param Function next 渲染方法 
ani.frame(frameTime, next);

````

## 兼容性
兼容全平台，包括IE6+
