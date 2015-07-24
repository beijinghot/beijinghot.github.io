var grade = new Array();//分数数组
var m = 0;//模式设置
var musicsel = "on";//音乐开关
var usename;//玩家id
var gameResult = 1;//游戏结果
var pause = 1;//暂停状态
var gameWidth = 300,//默认游戏大小
	gameHeight = 400;
var ifnew = 1; 
var game = new Phaser.Game(gameWidth,gameHeight,Phaser.AUTO,'canvas');
var timeC=0,timeP=0;
var onGameOver = 0;
var k = gameWidth/$(window).width();//缩放系数
var heightC;
if($(window).width() > $(window).height()){
	$(".close").click();
	$("#rotate").modal();
	game.paused = true;
	heightC = 0;
}else if($(window).width()/$(window).height() > 3/4){
	heightC = gameHeight/k - $(window).height();
}else{
	heightC = 0;
}
$(window).resize(function(){
	if($(window).width() > $(window).height()){
		$(".close").click();
		$("#rotate").modal();
		game.paused = true;
	}else{
		winWidth = $(window).width();
		winHeight = $(window).height();
		k = gameWidth/winWidth;
		$(".close").click();
		game.paused = false;
		if($(window).width()/$(window).height() > 3/4){
			heightC = gameHeight/k - $(window).height();
		}else{
			heightC = 0;
		}
	}
});
//游戏主程序
var gameArr = [{
	name : '限时20s',
	ruleTime : 20,
	preload : preloadSource,
	init : initMobile,
	dropTime : 600,
	create : function(){
		this.player = this.game.add.sprite(0,gameHeight - 80 - heightC*k,"player");
		this.game.physics.arcade.enable(this.player);

		this.golds = game.add.group(); 
		this.golds.enableBody = true;
		this.golds.createMultiple(20,'gold');

		this.pick_sound = this.game.add.audio('pick');
		this.over_sound = this.game.add.audio('over');

		this.timer = this.game.time.events.loop(this.dropTime,this.add_one_gold,this);

		this.score = 0;
		this.label_score = this.game.add.text(0, 70, "得分：0", { font: "20px Arial", fill: "#ffffff" });
		this.label_time = this.game.add.text(150, 70, "剩余时间:"+this.ruleTime, { font: "20px Arial", fill: "#ffffff" });

		this.game.input.touch.onTouchStart = this.touchStart;
		this.game.input.touch.onTouchMove = this.touchMove;
	},
	update : function(){
		if(onGameOver){
			return;
		}
		if(this.timer.delay >= 300){
			this.timer.delay -= 1;
		}
		this.game.physics.arcade.overlap(this.player,this.golds,this.scoreplus, null, this);

		timeC = Math.floor((this.time.prevTime - timeP)/1000);
		var timeR = this.ruleTime - timeC;
		this.label_time.text = "剩余时间:"+ timeR;

		if(ifnew == 1){
			onGamePause();
			ifnew = 0;
		}

		if(timeC >= this.ruleTime){
			gameResult = this.score;
			this.game_over();
			onGameOver = 1;
		}
	},
	game_over : function(){
		if(musicsel=='on'){
			this.over_sound.play();
		}
		this.game.time.events.remove(this.timer);
		$("#moderes").html("模式："+gameArr[m].name);
		$("#graderes").html("结果：" + gameResult);
		if(gameResult > localStorage.getItem("pickGoldGrade_0")){
			localStorage.setItem("pickGoldGrade_0", gameResult);
		}
		$("#resultmodal").modal();
	},
	add_one_gold : function(){
		this.gold = this.golds.getFirstDead();
		var rdm = Math.random();
		if(rdm >= 0 && rdm<0.2){
			var posX =  0;
		}else if(rdm >= 0.2 && rdm<0.4){
			var posX =  60;
		}else if(rdm >= 0.4 && rdm<0.6){
			var posX =  120;
		}else if(rdm >= 0.6 && rdm<0.8){
			var posX =  180;
		}else if(rdm >= 0.8 && rdm <= 1){
			var posX =  240;
		}
		this.gold.reset(posX,0);
		this.gold.body.velocity.y = 200;
		this.golds.setAll('checkWorldBounds',true); //边界检测
   		this.golds.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	scoreplus : function(player,gold){
		gold.kill();
	    this.score +=1;
		this.label_score.text = "得分："+this.score;
		if(musicsel=='on'){
			this.pick_sound.play();
		}
	},
	touchStart : function(event){
        gameArr[0].player.x = getNewLeft(event);
	},
	touchMove : function(event){
        gameArr[0].player.x = getNewLeft(event);
	}
},{
	name : '元宝不要丢',
	ruleGold : 3,
	preload : preloadSource,
	init : initMobile,
	dropTime : 600,
	create : function(){
		this.player = this.game.add.sprite(0,gameHeight - 80 - heightC*k,"player");
		this.game.physics.arcade.enable(this.player);

		this.golds = game.add.group(); 
		this.golds.enableBody = true;
		this.golds.createMultiple(20,'gold');
		this.leaft = this.ruleGold;

		this.deadline = this.game.add.sprite(0,396,"deadline");
		this.game.physics.arcade.enable(this.deadline);

		this.pick_sound = this.game.add.audio('pick');
		this.over_sound = this.game.add.audio('over');
		this.boom_sound = this.game.add.audio('boom');

		this.timer = this.game.time.events.loop(this.dropTime,this.add_one_gold,this);

		this.score = 0;
		this.label_score = this.game.add.text(0, 70, "得分：0", { font: "20px Arial", fill: "#ffffff" });
		this.label_leaft = this.game.add.text(150, 70, "剩余机会："+this.ruleGold, { font: "20px Arial", fill: "#ffffff" });

		this.game.input.touch.onTouchStart = this.touchStart;
		this.game.input.touch.onTouchMove = this.touchMove;
	},
	update : function(){
		if(onGameOver){
			return;
		}
		if(this.timer.delay >= 100){
			this.timer.delay -= 1;
		}
		this.game.physics.arcade.overlap(this.player,this.golds,this.scoreplus, null, this);
		this.game.physics.arcade.overlap(this.deadline,this.golds,this.dropone, null, this);

		if(ifnew == 1){
			onGamePause();
			ifnew = 0;
		}

		if(this.leaft == 0){
			gameResult = this.score;
			this.game_over();
			onGameOver = 1;
		}
	},
	dropone : function(deadline,gold){
		gold.kill();
	    this.leaft -=1;
		this.label_leaft.text = "剩余机会："+this.leaft;
		if(musicsel=='on'){
			this.boom_sound.play();
		}
	},
	game_over : function(){
		if(musicsel=='on'){
			this.over_sound.play();
		}
		this.game.time.events.remove(this.timer);
		$("#moderes").html("模式："+gameArr[m].name);
		$("#graderes").html("结果：" + gameResult);
		if(gameResult > localStorage.getItem("pickGoldGrade_1")){
			localStorage.setItem("pickGoldGrade_1", gameResult);
		}
		$("#resultmodal").modal();
	},
	add_one_gold : function(){
		this.gold = this.golds.getFirstDead();
		var rdm = Math.random();
		if(rdm >= 0 && rdm<0.2){
			var posX =  0;
		}else if(rdm >= 0.2 && rdm<0.4){
			var posX =  60;
		}else if(rdm >= 0.4 && rdm<0.6){
			var posX =  120;
		}else if(rdm >= 0.6 && rdm<0.8){
			var posX =  180;
		}else if(rdm >= 0.8 && rdm <= 1){
			var posX =  240;
		}
		this.gold.reset(posX,0);
		this.gold.body.velocity.y = 200;
		this.golds.setAll('checkWorldBounds',true); //边界检测
   		this.golds.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	scoreplus : function(player,gold){
		gold.kill();
	    this.score +=1;
		this.label_score.text = "得分："+this.score;
		if(musicsel=='on'){
			this.pick_sound.play();
		}
	},
	touchStart : function(event){
        gameArr[1].player.x = getNewLeft(event);
	},
	touchMove : function(event){
        gameArr[1].player.x = getNewLeft(event);
	}
}];
//读取用户信息
if(localStorage.getItem("username")){
	username = localStorage.getItem("username");
}else{
	username = Date.parse(new Date());
	localStorage.setItem("username", username);
}
// 生成模式选择菜单
for (var i=0;i<gameArr.length;i++)
{
	$("#mode").append("<option>"+gameArr[i].name+"</option>");
}
$("#mymodal").modal();
//暂停开始游戏按钮
$("#parstr").click(function(){
	if(pause == 0){
		onGamePause();
	}else{
		onGameStart();
	}
});
// 点击设置按钮
$("#setup").click(function(){
	$("#mymodal").modal();
	onGamePause();
});
//点击返回游戏
$(".returnGame").click(function(){
	onGameStart();
});
// 查看分数
$("#gradesel").click(function(){
	$(".close").click();
	// 生成个人分数
	$("#mygrade").html(" ");
	for (var i=0;i<gameArr.length;i++)
	{
		grade[i] = localStorage.getItem("pickGoldGrade_"+i)?localStorage.getItem("pickGoldGrade_"+i):0;
		$("#mygrade").append("<p>"+gameArr[i].name+" : "+grade[i]+"</p>");
	}
	$("#grademodal").modal();
	onGamePause();
});
// 查看分数返回上一页
$("#propage").click(function(){
	$(".close").click();
	$("#mymodal").modal();
	onGamePause();
});
//点击开始游戏
$("#startGame").click(function(){
	for(var i=0;i<gameArr.length;i++){
		if($('#mode').val() == gameArr[i].name){
			m = i;
			break;
		}
	}
	$(".close").click();
	musicsel = $("input[name='music']:checked").val();
	timeP=game.time.prevTime;
	onGameOver = 0;
	pause = 0;
	game.state.start('mode'+m);
});
// 游戏结果-重新开始原游戏
$("#reStartGame").click(function(){
	$(".close").click();
	timeP=game.time.prevTime;
	onGameOver = 0;
	game.state.start('mode'+m);
});
//游戏结果-返回选项菜单
$("#returnSelect").click(function(){
	$(".close").click();
	$("#mymodal").modal();
	onGamePause();
});
//开始暂停游戏
function onGameStart(){
	game.paused = false;
	game.time.events.start();
	$("#parstr").html("暂停游戏");
	pause = 0;
	timeP += game.time.pauseDuration;
}
function onGamePause(){
	game.paused = true;
	game.time.events.stop(false);
	$("#parstr").html("开始游戏");
	pause = 1;
}
//计算左边距
function getNewLeft(event){
	event.preventDefault();
	var touch = event.touches[0];
    var x = Number(touch.pageX); 
    var y = Number(touch.pageY); 
    if(x*k<30){
    	return 0;
    }else if(x*k>(gameWidth - 30)){
    	return gameWidth - 60;
    }else{
    	return (x-30/k)*k;
    }
}
//移动端适配
function initMobile(){
	if(!this.game.device.desktop){   
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	    this.game.scale.pageAlignVertically = true;
	    this.game.scale.pageAlignHorizontally = true;
 	 }else{
	    this.game.scale.pageAlignVertically = true;
	    this.game.scale.pageAlignHorizontally = true;
 	 }
}
//载入资源
function preloadSource() {
	this.game.stage.backgroundColor = '#ccc';
	this.game.load.image('gold', 'assets/gold.png');  
    this.game.load.image('player', 'assets/player.png'); 
    this.game.load.image('deadline', 'assets/deadline.jpg'); 
    this.game.load.audio('pick', 'assets/pick.mp3');
    this.game.load.audio('over', 'assets/success.wav');
    this.game.load.audio('boom', 'assets/boom.mp3');
}
//设置game组
for(var i=0;i<gameArr.length;i++){
	game.state.add('mode'+i,gameArr[i]);
}
//初始化游戏
game.state.start('mode0');