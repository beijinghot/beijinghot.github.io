var grade = new Array();//分数数组
var m = 0;//模式设置
var musicsel = "on";//音乐开关
var usename;//玩家id
var gameResult = 1;//游戏结果
var pause = 1;//暂停状态
var gameWidth = 300,//默认游戏大小
	gameHeight = 400;
var ifnew = 1; 
var getGrade = new Array();
var ftStyle = { font: "20px Arial", fill: "#ffffff" };
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
	dropTime : 300,
	create : function(){
		this.dropTime = 300;
		this.player = this.game.add.sprite(0,gameHeight - 80 - heightC*k,"player");
		this.game.physics.arcade.enable(this.player);

		this.golds = game.add.group(); 
		this.golds.enableBody = true;
		this.golds.createMultiple(20,'gold');

		this.pick_sound = this.game.add.audio('pick');
		this.over_sound = this.game.add.audio('over');

		this.timer = this.game.time.events.loop(500,this.add_one_gold,this);

		this.score = 0;
		this.label_score = this.game.add.text(0, 70, "得分：0", ftStyle);
		this.label_time = this.game.add.text(150, 70, "剩余时间:"+this.ruleTime, ftStyle);

		this.game.input.touch.onTouchStart = this.touchStart;
		this.game.input.touch.onTouchMove = this.touchMove;
	},
	update : function(){
		if(onGameOver){
			return;
		}
		this.dropTime +=0.25;
		this.game.physics.arcade.overlap(this.player,this.golds,this.scoreplus, null, this);

		timeC = Math.floor((this.time.prevTime - timeP)/1000);
		var timeR = this.ruleTime - timeC;
		this.label_time.text = "剩余时间:"+ timeR;
		if(timeC >= this.ruleTime && ifnew!=1){
			gameResult = this.score;
			onGameOver = 1;
			this.game_over();
		}
		if(ifnew == 1){
			onGamePause();
			ifnew = 0;
		}
	},
	game_over : function(){
		if(onGameOver == 1){
			if(musicsel=='on'){
				this.over_sound.play();
			}
			this.game.time.events.remove(this.timer);
			$("#moderes").html("模式："+gameArr[m].name);
			$("#graderes").html("结果：" + gameResult);
			if(gameResult > localStorage.getItem("GoldGrade_"+m)){
				localStorage.setItem("GoldGrade_"+m, gameResult);
			}
			$("#resultmodal").modal();
		}
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
		this.gold.body.velocity.y = this.dropTime;
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
        gameArr[m].player.x = getNewLeft(event);
	},
	touchMove : function(event){
        gameArr[m].player.x = getNewLeft(event);
	}
},{
	name : '元宝不要丢',
	ruleGold : 3,
	preload : preloadSource,
	init : initMobile,
	dropTime : 300,
	create : function(){
		this.dropTime =300;
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

		this.timer = this.game.time.events.loop(500,this.add_one_gold,this);

		this.score = 0;
		this.label_score = this.game.add.text(0, 70, "得分：0", ftStyle);
		this.label_leaft = this.game.add.text(150, 70, "剩余机会："+this.ruleGold, ftStyle);

		this.game.input.touch.onTouchStart = this.touchStart;
		this.game.input.touch.onTouchMove = this.touchMove;
	},
	update : function(){
		if(onGameOver){
			return;
		}
		this.dropTime +=0.25;
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
		if(gameResult > localStorage.getItem("GoldGrade_"+m)){
			localStorage.setItem("GoldGrade_"+m, gameResult);
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
		this.gold.body.velocity.y = this.dropTime;
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
        gameArr[m].player.x = getNewLeft(event);
	},
	touchMove : function(event){
        gameArr[m].player.x = getNewLeft(event);
	}
},{
	name : '坚持百分百',
	preload : preloadSource,
	init : initMobile,
	dropTime : 300,
	create : function(){
		this.dropTime =300;
		this.player = this.game.add.sprite(0,gameHeight - 80 - heightC*k,"player");
		this.game.physics.arcade.enable(this.player);

		this.golds = game.add.group(); 
		this.golds.enableBody = true;
		this.golds.createMultiple(20,'gold');

		this.bombs = game.add.group(); 
		this.bombs.enableBody = true;
		this.bombs.createMultiple(20,'bomb');

		this.pick_sound = this.game.add.audio('pick');
		this.over_sound = this.game.add.audio('over');
		this.boom_sound = this.game.add.audio('boom');

		this.timer1 = this.game.time.events.loop(800,this.add_gold,this);
		this.timer2 = this.game.time.events.loop(800,this.add_bomb,this);

		this.score = 0;
		this.life = 50;
		this.label_score = this.game.add.text(0, 70, "用时：0", ftStyle);
		this.label_life = this.game.add.text(150, 70, "生命值：50%", ftStyle);

		this.game.input.touch.onTouchStart = this.touchStart;
		this.game.input.touch.onTouchMove = this.touchMove;
	},
	update : function(){
		if(onGameOver){
			return;
		}
		this.game.physics.arcade.overlap(this.player,this.golds,this.scoreplus, null, this);
		this.game.physics.arcade.overlap(this.player,this.bombs,this.dropone, null, this);

		timeC = Math.floor((this.time.prevTime - timeP)/1000);
		this.label_score.text = "用时："+ timeC;

		if(ifnew == 1){
			onGamePause();
			ifnew = 0;
		}
	},
	add_one_gold : function(x){
		this.gold = this.golds.getFirstDead();
		this.gold.reset(x,0);
		this.gold.body.velocity.y = this.dropTime;
		this.golds.setAll('checkWorldBounds',true); //边界检测
   		this.golds.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	add_gold : function(){
		this.hole1 = Math.floor(Math.random()*5);
		this.add_one_gold(this.hole1*60);
		for(var i=0;i<100;i++){
			this.hole2 = Math.floor(Math.random()*5);
			if(this.hole2 != this.hole1){
				this.add_one_gold(this.hole2*60);
				break;
			}
		}	
	},
	add_one_bomb : function(x){
		this.bomb = this.bombs.getFirstDead();
		this.bomb.reset(x,0);
		this.bomb.body.velocity.y = this.dropTime;
		this.bombs.setAll('checkWorldBounds',true); //边界检测
   		this.bombs.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	add_bomb : function(){
		for(var i=0;i<100;i++){
			this.hole3 = Math.floor(Math.random()*5);
			if(this.hole3 != this.hole2 &&this.hole3 != this.hole1){
				this.add_one_bomb(this.hole3*60);
				break;
			}
		}
		for(var i=0;i<100;i++){
			this.hole4 = Math.floor(Math.random()*5);
			if(this.hole4 != this.hole3 && this.hole4 != this.hole2 && this.hole4 != this.hole1){
				this.add_one_bomb(this.hole4*60);
				break;
			}
		}	
	},
	scoreplus : function(player,gold){
		gold.kill();
	    this.life += 1;
		this.label_life.text = "生命值："+this.life+"%";
		if(this.life == 100){
			gameResult = timeC;
			this.game_over(1);
			onGameOver = 1;
		}
		if(musicsel=='on'){
			this.pick_sound.play();
		}
	},
	dropone : function(player,bomb){
		bomb.kill();
	    this.life -=1;
		this.label_life.text = "生命值："+this.life+"%";
		if(this.life ==  0){
			gameResult = "未完成";
			this.game_over(0);
			onGameOver = 1;
		}
		if(musicsel=='on'){
			this.boom_sound.play();
		}
	},
	game_over : function(s){
		if(musicsel=='on'){
			this.over_sound.play();
		}
		this.game.time.events.remove(this.timer1);
		this.game.time.events.remove(this.timer2);
		$("#moderes").html("模式："+gameArr[m].name);
		$("#graderes").html("结果：" + gameResult);
		if(s == 1){
			if(gameResult < localStorage.getItem("GoldGrade_"+m) && gameResult !=0){
			localStorage.setItem("GoldGrade_"+m, gameResult);
		}
		}
		
		$("#resultmodal").modal();
	},
	touchStart : function(event){
        gameArr[m].player.x = getNewLeft(event);
	},
	touchMove : function(event){
        gameArr[m].player.x = getNewLeft(event);
	}
},{
	name : '不要碰炸弹',
	preload : preloadSource,
	init : initMobile,
	dropTime : 300,
	create : function(){
		this.dropTime = 300;
		this.player = this.game.add.sprite(0,gameHeight - 80 - heightC*k,"player");
		this.game.physics.arcade.enable(this.player);

		this.bombs = game.add.group(); 
		this.bombs.enableBody = true;
		this.bombs.createMultiple(20,'bomb');

		this.over_sound = this.game.add.audio('over');
		this.boom_sound = this.game.add.audio('boom');

		this.timer = this.game.time.events.loop(800,this.add_bomb,this);

		this.score = 0;
		this.life = 3;
		this.label_score = this.game.add.text(0, 70, "分数：0", ftStyle);
		this.label_life = this.game.add.text(150, 70, "生命值：3", ftStyle);

		this.game.input.touch.onTouchStart = this.touchStart;
		this.game.input.touch.onTouchMove = this.touchMove;
	},
	update : function(){
		if(onGameOver){
			return;
		}
		this.game.physics.arcade.overlap(this.player,this.bombs,this.dropone, null, this);

		timeC = Math.floor((this.time.prevTime - timeP)/1000);
		this.label_score.text = "分数："+ timeC;

		if(ifnew == 1){
			onGamePause();
			ifnew = 0;
		}
	},
	add_one_bomb : function(x){
		this.bomb = this.bombs.getFirstDead();
		this.bomb.reset(x,0);
		this.bomb.body.velocity.y = this.dropTime;
		this.bombs.setAll('checkWorldBounds',true); //边界检测
   		this.bombs.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	add_bomb : function(){
		this.hole1 = Math.floor(Math.random()*5);
		this.add_one_bomb(this.hole*60);
		for(var i=0;i<100;i++){
			this.hole2 = Math.floor(Math.random()*5);
			if(this.hole2 != this.hole1){
				this.add_one_bomb(this.hole2*60);
				break;
			}
		}
		for(var i=0;i<100;i++){
			this.hole3 = Math.floor(Math.random()*5);
			if(this.hole3 != this.hole2 && this.hole3 != this.hole1){
				this.add_one_bomb(this.hole3*60);
				break;
			}
		}	
	},
	dropone : function(player,bomb){
		bomb.kill();
	    this.life -=1;
		this.label_life.text = "生命值："+this.life;
		if(this.life ==  0){
			gameResult = timeC;
			this.game_over(1);
			onGameOver = 1;
		}
		if(musicsel=='on'){
			this.boom_sound.play();
		}
	},
	game_over : function(s){
		if(musicsel=='on'){
			this.over_sound.play();
		}
		this.game.time.events.remove(this.timer);

		$("#moderes").html("模式："+gameArr[m].name);
		$("#graderes").html("结果：" + gameResult);
		if(s == 1){
			if(gameResult > localStorage.getItem("GoldGrade_"+m)){
			localStorage.setItem("GoldGrade_"+m, gameResult);
		}
		}
		
		$("#resultmodal").modal();
	},
	touchStart : function(event){
        gameArr[m].player.x = getNewLeft(event);
	},
	touchMove : function(event){
        gameArr[m].player.x = getNewLeft(event);
	}
},{
	name : '1min大杂烩',
	ruleTime : 60,
	preload : preloadSource,
	init : initMobile,
	dropTime : 300,
	create : function(){
		this.dropTime = 300;
		this.player = this.game.add.sprite(0,gameHeight - 80 - heightC*k,"player");
		this.game.physics.arcade.enable(this.player);

		this.golds = game.add.group(); 
		this.golds.enableBody = true;
		this.golds.createMultiple(20,'gold');

		this.bombs = game.add.group(); 
		this.bombs.enableBody = true;
		this.bombs.createMultiple(20,'bomb');

		this.diamonds = game.add.group(); 
		this.diamonds.enableBody = true;
		this.diamonds.createMultiple(20,'diamond');

		this.pick_sound = this.game.add.audio('pick');
		this.bomb_sound = this.game.add.audio('bomb');
		this.over_sound = this.game.add.audio('over');

		this.timer1 = this.game.time.events.loop(800,this.add_one_gold,this);
		this.timer2 = this.game.time.events.loop(800,this.add_one_diamond,this);
		this.timer3 = this.game.time.events.loop(800,this.add_one_bomb,this);

		this.score = 0;
		this.label_score = this.game.add.text(0, 70, "得分：0", ftStyle);
		this.label_time = this.game.add.text(150, 70, "剩余时间:"+this.ruleTime, ftStyle);

		this.game.input.touch.onTouchStart = this.touchStart;
		this.game.input.touch.onTouchMove = this.touchMove;
	},
	update : function(){
		if(onGameOver){
			return;
		}
		this.dropTime +=0.1;
		this.game.physics.arcade.overlap(this.player,this.golds,this.scoreplus, null, this);
		this.game.physics.arcade.overlap(this.player,this.diamonds,this.scoreplus2, null, this);
		this.game.physics.arcade.overlap(this.player,this.bombs,this.dropone, null, this);

		timeC = Math.floor((this.time.prevTime - timeP)/1000);
		var timeR = this.ruleTime - timeC;
		this.label_time.text = "剩余时间:"+ timeR;
		if(timeC >= this.ruleTime && ifnew!=1){
			gameResult = this.score;
			onGameOver = 1;
			this.game_over();
		}
		if(ifnew == 1){
			onGamePause();
			ifnew = 0;
		}
	},
	game_over : function(){
		if(onGameOver == 1){
			if(musicsel=='on'){
				this.over_sound.play();
			}
			this.game.time.events.remove(this.timer1);
			this.game.time.events.remove(this.timer2);
			this.game.time.events.remove(this.timer3);
			$("#moderes").html("模式："+gameArr[m].name);
			$("#graderes").html("结果：" + gameResult);
			if(gameResult > localStorage.getItem("GoldGrade_"+m)){
				localStorage.setItem("GoldGrade_"+m, gameResult);
			}
			$("#resultmodal").modal();
		}
	},
	add_one_gold : function(){
		this.rdm1 = Math.floor(Math.random()*5);
		if(this.rdm1 >= 0 && this.rdm1<1){
			var posX =  0;
		}else if(this.rdm1 >= 1 && this.rdm1<2){
			var posX =  60;
		}else if(this.rdm1 >= 2 && this.rdm1<3){
			var posX =  120;
		}else if(this.rdm1 >= 3 && this.rdm1<4){
			var posX =  180;
		}else if(this.rdm1 >= 4 && this.rdm1 <5){
			var posX =  240;
		}
		this.gold = this.golds.getFirstDead();
		this.gold.reset(posX,0);
		this.gold.body.velocity.y = this.dropTime;
		this.golds.setAll('checkWorldBounds',true); //边界检测
   		this.golds.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	add_one_diamond : function(){
		for(var j=0;j<100;j++){
			this.rdm2 = Math.floor(Math.random()*5);
			if(this.rdm2 != this.rdm1){
				break;
			}
		}
		if(this.rdm2 >= 0 && this.rdm2<1){
			var posX =  0;
		}else if(this.rdm2 >= 1 && this.rdm2<2){
			var posX =  60;
		}else if(this.rdm2 >= 2 && this.rdm2<3){
			var posX =  120;
		}else if(this.rdm2 >= 3 && this.rdm2<4){
			var posX =  180;
		}else if(this.rdm2 >= 4 && this.rdm2 <5){
			var posX =  240;
		}
		this.diamond = this.diamonds.getFirstDead();
		this.diamond.reset(posX,0);
		this.diamond.body.velocity.y = this.dropTime;
		this.diamonds.setAll('checkWorldBounds',true); //边界检测
   		this.diamonds.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	add_one_bomb : function(){
		for(var k=0;k<100;k++){
			this.rdm3 = Math.floor(Math.random()*5);
			if(this.rdm3 != this.rdm1 && this.rdm3 != this.rdm2){
				break;
			}
		}
		if(this.rdm3 >= 0 && this.rdm3<1){
			var posX =  0;
		}else if(this.rdm3 >= 1 && this.rdm3<2){
			var posX =  60;
		}else if(this.rdm3 >= 2 && this.rdm3<3){
			var posX =  120;
		}else if(this.rdm3 >= 3 && this.rdm3<4){
			var posX =  180;
		}else if(this.rdm3 >= 4 && this.rdm3 <5){
			var posX =  240;
		}
		this.bomb = this.bombs.getFirstDead();
		this.bomb.reset(posX,0);
		this.bomb.body.velocity.y = this.dropTime;
		this.bombs.setAll('checkWorldBounds',true); //边界检测
   		this.bombs.setAll('outOfBoundsKill',true); //出边界后自动kill
	},
	scoreplus : function(player,gold){
		gold.kill();
	    this.score +=1;
		this.label_score.text = "得分："+this.score;
		if(musicsel=='on'){
			this.pick_sound.play();
		}
	},
	scoreplus2 : function(player,diamond){
		diamond.kill();
	    this.score +=2;
		this.label_score.text = "得分："+this.score;
		if(musicsel=='on'){
			this.pick_sound.play();
		}
	},
	dropone : function(player,bomb){
		bomb.kill();
	    if(this.score != 0){
	    	this.score -=1;
	    }
		this.label_score.text = "得分："+this.score;
		if(musicsel=='on'){
			this.pick_sound.play();
		}
	},
	touchStart : function(event){
        gameArr[m].player.x = getNewLeft(event);
	},
	touchMove : function(event){
        gameArr[m].player.x = getNewLeft(event);
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
		grade[i] = localStorage.getItem("GoldGrade_"+i)?localStorage.getItem("GoldGrade_"+i):0;
		$("#mygrade").append("<p>"+gameArr[i].name+" : "+grade[i]+"</p>");
	}
	$("#grademodal").modal();
	onGamePause();
});
// 查看排行榜
$("#ranksel").click(function(){

	$(".close").click();
	$("#ranklist").html(" ");
	for (var i=0;i<gameArr.length;i++)
	{
		grade[i] = localStorage.getItem("GoldGrade_"+i)?localStorage.getItem("GoldGrade_"+i):0;
		rankList(i,grade[i]);
	}
	$("#rankmodal").modal();
	onGamePause();
});
// 查看分数返回上一页
$(".propage").click(function(){
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
//获取排行榜
function rankList(i,thisGrade){
	var rst = new Object();
	$.ajax({
		     url:"http://xingguang123.sinaapp.com/ajax.php?username="+username+"&id="+i+"&grade="+thisGrade,
		     dataType: 'jsonp', 
		     success:function(json){
		     	getGrade[i] = {
		     		top : json[0],
		     		rank : json[1]
		     	}
				$("#ranklist").append("<p>"+gameArr[i].name+" | topScore："+getGrade[i].top+" ; yourRank:"+getGrade[i].rank+"</p>");
		     },
		     error:function(){
		         alert("Error");
		         console.log(this.url);
		     },
		});
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
    this.game.load.image('bomb', 'assets/boom.png'); 
    this.game.load.image('diamond', 'assets/zs.png'); 
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