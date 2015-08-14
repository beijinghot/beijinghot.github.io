打飞机游戏
=====================================
	游戏主要包括两个模式：普通模式，闯关模式；<br />
	各模式难度可在相应参数中修改；<br />
	普通模式涉及的state:play;<br />
	闯关模式涉及的state:gateWelcome,gate,bossWelcome,boss;<br />
	游戏使用phaser框架搭建，排行榜使用ajax，localStorage实现，使用jsonp处理跨域；<br />
	飞机控制方式  移动端：重力感应，触控  pc端：按键上下左右，鼠标拖动；<br />
	普通模式在不触碰敌机的情况下可一直游戏，随时间增加飞机速度增加，难度增强；<br />
	闯关模式共5关，每关分为歼灭战和boss战，歼灭战获得100分进入boss战，boss战击毁敌机进入下一关的歼灭战<br />
	游戏测试地址：https://beijinghot.github.io/game2 
