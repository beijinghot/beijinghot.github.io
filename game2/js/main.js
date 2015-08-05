var gameWidth = 360,gameHeight = 520;//定义游戏主尺寸
var musicSwitch = 1;//音乐开关
var score = 0;
var ftStyle = { font: "40px Arial", fill: "#000000" };//文字样式
var ftStyle1 = { font: "22px Arial", fill: "#000000" };//文字样式
var betadirection=0,gammadirection=0;//重力感应相关参数
var bmNum = "1";//全屏爆炸炸弹数
var onBoom = 0;//全屏爆炸状态
var bulletN = 1;//并行子弹数，初始值为1
var onStopBoom;//停止爆炸状态
//声明按钮
var pauseBtn,restartBtn,containueBtn,boomBtn,overRestartBtn,showRankBtn;
//声明音效
var bullet_on,enemy1_down,enemy2_down,enemy3_down,game_music,game_over,get_bomb,get_double_laser,use_bomb;
//游戏暂停 继续状态参数
var onGamePause = false,onGamePauseF = false,onGameContainue = false,pauseGameOnce = false,containueGameOnce = false,onGameOver = false,onGameOverF = false;
//敌机出现的时间百分比,敌机的初始速度
var intervalSmall = 0.05,
    intervalMiddle = 0.01,
    intervalBoss = 0.008,
    vSmall = 50,
    vMiddle = 30,
    vBoss = 20;
//暂停状态数据存储
var pauseStorage = new Array();
pauseStorage["bullets"] = new Array();
pauseStorage["enemySmalls"] = new Array();
pauseStorage["enemyMiddles"] = new Array();
pauseStorage["enemyBosses"] = new Array();
pauseStorage["doubles"] = new Array();
pauseStorage["booms"] = new Array();
//读取用户信息
var username,bestScore;
if(window.localStorage){
	if(localStorage.getItem("username")){
		username = localStorage.getItem("username");
		bestScore = localStorage.getItem("bestScore");
	}else{
		username = Date.parse(new Date());
		localStorage.setItem("username", username);
		localStorage.setItem("bestScore", 0);
	}
}else{
	alert("您的浏览器不支持localStorage,请升级浏览器");
}
var game = new Phaser.Game(gameWidth,gameHeight,Phaser.AUTO,'canvas');//实例化game
game.States = {};//存放状态
	
game.States.boot = function(){ //移动设备适应
	this.preload = function(){
		if(!game.device.desktop){
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			this.scale.forcePortrait = true;
			this.scale.refresh();
		}else{
			this.game.scale.pageAlignVertically = true;
	  		this.game.scale.pageAlignHorizontally = true;
		}
		game.load.image('loading','assets/preloader.gif');
	};
	this.create = function(){
		game.state.start('preload'); //跳转到资源加载页面
	};
}

game.States.preload = function(){//加载游戏资源
	this.preload = function(){
		var preloadSprite = game.add.sprite(70,game.height/2,'loading'); //创建显示loading进度的sprite
		game.load.setPreloadSprite(preloadSprite);
		//以下为要加载的资源
    	game.load.image('background','assets/bgpic.png'); //游戏背景
    	game.load.image('continue','assets/continue.png'); //继续游戏按钮
    	game.load.image('gameOver','assets/gameOver.png'); //游戏结束框
    	game.load.image('listRank','assets/listRank.png'); //排行榜框
    	game.load.image('listRank1','assets/listRank1.png'); //排行榜按钮（宽）
    	game.load.image('rank','assets/rank.png'); //排行榜按钮（窄）
    	game.load.image('restart','assets/restart.png'); //游戏重新开始按钮
    	game.load.image('startGame','assets/startGame.png'); //开始游戏按钮
    	game.load.image('pause','assets/pause.png'); //游戏暂停按钮
    	game.load.image('background','assets/bgpic.png'); //游戏背景
    	game.load.image('title','assets/title.png'); //游戏背景
    	game.load.image('bullet','assets/zd2.png'); //游戏背景
    	game.load.image('boom','assets/boom.png'); //游戏背景
    	game.load.image('musicon','assets/musicon.png'); //游戏背景
    	game.load.image('musicoff','assets/musicoff.png'); //游戏背景
    	game.load.image('double','assets/double.png'); //游戏背景
    	game.load.image('boomNum','assets/boomNum.png'); //游戏背景
    	game.load.spritesheet('music','assets/music.png',40,47,2); //音乐
    	game.load.spritesheet('player','assets/player.png',70,89,3); //飞机
    	game.load.spritesheet('enemyBoss','assets/enemyBoss.png',101,149,4); //大敌机
    	game.load.spritesheet('enemyMiddle','assets/enemyMiddle.png',47,61,2); //中敌机
    	game.load.spritesheet('enemySmall','assets/enemySmall.png',34,24); //小敌机
    	game.load.audio('bullet_on', 'assets/bullet_on.mp3');  
    	game.load.audio('enemy1_down', 'assets/enemy1_down.mp3');
    	game.load.audio('enemy2_down', 'assets/enemy2_down.mp3');
    	game.load.audio('enemy3_down', 'assets/enemy3_down.mp3');
    	game.load.audio('game_music', 'assets/game_music.mp3');
    	game.load.audio('game_over', 'assets/game_over.mp3');
    	game.load.audio('get_bomb', 'assets/get_bomb.mp3');
    	game.load.audio('get_double_laser', 'assets/get_double_laser.mp3');
    	game.load.audio('use_bomb', 'assets/use_bomb.mp3');
	}
	this.create = function(){
		game.state.start('menu');
	}
}

game.States.menu = function(){//显示开始菜单
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background'); //背景图
		this.title = game.add.sprite(80,game.height*0.4/2,'title'); //标题
		var btn = game.add.button(game.width/2,game.height/2,'startGame',function(){//开始按钮
			game.state.start('play');
		});
		btn.anchor.setTo(0.5,0.5);
		var onceShowRank = 1;
		var btn = game.add.button(game.width/2,game.height*1.2/2,'rank',function(){//排行榜按钮
			if(onceShowRank){
				onceShowRank = 0;
				this.rank = game.add.sprite(52,game.height*0.2/2,'listRank'); //排行榜
				showRank(1);
			}
		});
		btn.anchor.setTo(0.5,0.5);

		var music = game.add.sprite(80,357,'music'); //添加飞机

		music.animations.add('on', [1], 10, false);
		music.animations.add('off',[0],10,false);
		music.animations.play('on');

		var btn = game.add.button(game.width/2,360,'musicon',function(){//排行榜按钮
			music.animations.play('on');
			musicSwitch = 1;
		});
		btn.anchor.setTo(0.5,0.5);

		var btn = game.add.button(game.width/2,410,'musicoff',function(){//排行榜按钮
			music.animations.play('off');
			musicSwitch = 0;
		});
		btn.anchor.setTo(0.5,0.5);
	}
}
game.States.play = function(){   //游戏程序主函数
	this.create = function(){
		this.background = game.add.tileSprite(0,0,game.width,game.height,'background');
		this.background.autoScroll(0,20); //背景图

		bullet_on = game.add.audio('bullet_on');
		enemy1_down = game.add.audio('enemy1_down');
		enemy2_down = game.add.audio('enemy2_down');
		enemy3_down = game.add.audio('enemy3_down');
		game_music = game.add.audio('game_music');
		game_over = game.add.audio('game_over');
		get_bomb = game.add.audio('get_bomb');
		get_double_laser = game.add.audio('get_double_laser');
		use_bomb = game.add.audio('use_bomb');

		if(musicSwitch){
			game_music.play();
		}

		this.player = game.add.sprite(game.width/2-35,game.height-89,'player'); //添加飞机
		game.physics.enable([this.player], Phaser.Physics.ARCADE);//禁止飞机飞出界外
		this.player.body.collideWorldBounds = true;

		this.player.inputEnabled = true;
		this.player.input.enableDrag();//添加触控
		game.physics.arcade.enable(this.player);
		

		this.player.animations.add('fly', [0,1], 10, true);
		this.player.animations.add('pause',[1]);
		this.player.animations.add('planeBoom',[1,2], 10, true);
		this.player.animations.play('fly');//飞机飞行序列帧

		this.player.body.setSize(20, 80, 27, 0);
		
		this.bullets = game.add.group(); //子弹集
	    this.bullets.enableBody = true;
	    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
	    this.bullets.createMultiple(50, 'bullet');
	    this.bullets.setAll('checkWorldBounds', true);
	    this.bullets.setAll('outOfBoundsKill', true);

	    this.booms = game.add.group();  //炸弹集
		this.booms.enableBody = true;
		this.booms.createMultiple(20,'boom');
		this.booms.setAll('checkWorldBounds', true);
	    this.booms.setAll('outOfBoundsKill', true);

	    this.doubles = game.add.group();  //双弹buff集
		this.doubles.enableBody = true;
		this.doubles.createMultiple(20,'double');
		this.doubles.setAll('checkWorldBounds', true);
	    this.doubles.setAll('outOfBoundsKill', true);

	    this.timer = game.time.events.loop(200,this.add_one_bullet,this);//启动子弹发射

	    this.label_score = game.add.text(70 , 5 , score+1, ftStyle);//分数显示
		this.label_boomNum = game.add.text(240 , 5, " X "+bmNum, ftStyle);//炸弹数显示

	    boomBtn = game.add.button(190,8,'boomNum',function(){//爆炸按钮
	    	if(!onGamePause){
	    		if(bmNum !=0){
		    		onBoom = 1;
		    		bmNum--;
		    	}
	    	}
	    	
		});

	    pauseBtn = game.add.button(8,10,'pause',function(){//暂停按钮
	    	if(!onGamePause){
	    		onGamePause = true;
				onGamePauseF = true;
				restartBtn = game.add.button(game.width/2,game.height*0.9/2,'restart',function(){//重新开始按钮
					resetStatus();//重置游戏状态
					game.state.start('play');
				});
				restartBtn.anchor.setTo(0.5,0.5);
				containueBtn = game.add.button(game.width/2,game.height*0.7/2,'continue',function(){//继续游戏按钮
					onGameContainue = true;
					containueBtn.kill();
					restartBtn.kill();
				});
				containueBtn.anchor.setTo(0.5,0.5);
	    	}
		});
		
		//敌机**以下为CTS修改	
		//this.createEnemys(enemyType, number, pic) 敌机类型，数量，图片名称
		//this.add_enemy(enemyType, v, picWidth, picHeigth, life) 
		//敌机类型，初始速度，图片宽，图片高，生命数
		//难度增加通过下降速度一点点增加vSmall++
		//小敌机
		this.enemySmalls = game.add.group();
		this.createEnemys(this.enemySmalls, 30, 'enemySmall');
	    //中等敌机
		this.enemyMiddles = game.add.group();
		this.createEnemys(this.enemyMiddles, 20, 'enemyMiddle');
		//boss敌机
		this.enemyBosses = game.add.group();
		this.createEnemys(this.enemyBosses, 10, 'enemyBoss');
	    //**以上为CTS修改
		window.addEventListener("deviceorientation", this.deviceOrientationListener);//添加重力感应监听
	},
	this.update = function(){

		this.label_boomNum.text = " X "+bmNum;
		this.label_score.text = score;

		if(onBoom == 1){   //全屏爆炸检测
			this.allBoom();
			onBoom = 0;
		}

		if(onGameContainue){ //游戏暂停后继续检测
			this.containueGame();
			onGameContainue = false;
		}

		if(onGamePause){  //游戏暂停检测
			if(onGamePauseF){
				this.pauseGame();
				this.player.body.velocity.x = 0;
				this.player.body.velocity.y = 0;
				onGamePauseF = false;
			}
		}else{
			this.player.body.velocity.x = gammadirection*10;
			this.player.body.velocity.y = betadirection*10;

			if(percentDetermination(0.001)){  //随机生成全屏爆炸物
				this.add_boom();
			}
			if(percentDetermination(0.001) && bulletN == 1){ //随机生成双弹buff
				this.add_double();
				bulletN = 2;
			}
			//随机生成敌机并控制屏幕敌机数量
			if(percentDetermination(intervalSmall) && this.enemySmalls.total < 10){
				this.add_enemy(this.enemySmalls, vSmall++, 35, 24, 2);
			}
			if(percentDetermination(intervalMiddle) && this.enemyMiddles.total < 4){
				this.add_enemy(this.enemyMiddles, vMiddle++, 47, 61, 10);
			}
			if(percentDetermination(intervalBoss) && this.enemyBosses.total < 1){
				this.add_enemy(this.enemyBosses, vBoss++, 101, 149, 20);
			}
		}
		
		if(onStopBoom){  //全屏爆炸停止检测
			this.stopBoom(this.enemySmalls);
			this.stopBoom(this.enemyMiddles);
			this.stopBoom(this.enemyBosses);
			if(onGameOver){
				this.player.kill();
			}
			onStopBoom = 0;
		}
		//键盘操作
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	    {
	        this.player.body.velocity.x = -200;
	    }
	    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	    {
	        this.player.body.velocity.x = 200;
	    }
	    else if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
	    {
	        this.player.body.velocity.y = -200;
	    }
	    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	    {
	        this.player.body.velocity.y = 200;
	    }
	    else
	    {
	    	this.player.body.velocity.x = 0;
			this.player.body.velocity.y = 0;
	    }


		//碰撞检测部分
		//player与buff
		this.game.physics.arcade.overlap(this.player,this.booms,this.boomplus, null, this);
		this.game.physics.arcade.overlap(this.player,this.doubles,this.doubleplus, null, this);
		//bullet与enemy
		this.game.physics.arcade.overlap(this.bullets, this.enemySmalls,this.bulletHitMiddle, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemyMiddles,this.bulletHitMiddle, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemyBosses,this.bulletHitMiddle, null, this);
		//player与enemy
		this.game.physics.arcade.overlap(this.player, this.enemySmalls,this.gameOver, null, this);
		this.game.physics.arcade.overlap(this.player, this.enemyMiddles,this.gameOver, null, this);
		this.game.physics.arcade.overlap(this.player, this.enemyBosses,this.gameOver, null, this);

		game.world.bringToTop(boomBtn);
		game.world.bringToTop(pauseBtn);
		game.world.bringToTop(this.label_boomNum);
		game.world.bringToTop(this.label_score);
	},
	this.add_one_bullet = function(){   //发射单炮
		if(!onGamePause){
			if(musicSwitch){
				bullet_on.play();
			}
			this.bullet = this.bullets.getFirstDead();
	  	 	this.bullet.reset(this.player.x + 33, this.player.y );
	    	this.bullet.body.velocity.y = -500;
		}
	},
	this.add_two_bullet = function(){   //发射双炮
		if(!onGamePause){
			this.bullet = this.bullets.getFirstDead();
	  	 	this.bullet.reset(this.player.x + 33 - 10, this.player.y );
	    	this.bullet.body.velocity.y = -500;

	    	this.bullet = this.bullets.getFirstDead();
	  	 	this.bullet.reset(this.player.x + 33 + 10, this.player.y );
	    	this.bullet.body.velocity.y = -500;
		}
		
	},
	this.add_double = function(){  //添加双弹buff
		if(!onGamePause){
			var posX = Math.floor(Math.random()*300);
			this.double = this.doubles.getFirstDead();
			this.double.reset(posX,0);
			this.double.body.velocity.y = 200;
		}
	},
	this.add_boom = function(){  //添加爆炸物
		if(!onGamePause){
			var posX = Math.floor(Math.random()*300);
			this.boom = this.booms.getFirstDead();
			this.boom.reset(posX,0);
			this.boom.body.velocity.y = 200;
		}
	},
	this.boomplus = function(player,boom){   //爆炸物增加
		if(musicSwitch){
			get_bomb.play();
		}
		boom.kill();
	    bmNum++;
		this.label_boomNum.text = " X "+bmNum;
	},
	this.doubleplus = function(player,double){  //增加双弹
		if(musicSwitch){
			get_double_laser.play();
		}
		double.kill();
		this.timer.callback = this.add_two_bullet;
	},
	this.deviceOrientationListener = function(event) {  //重力检测
	  	betadirection = Math.round(event.beta);
		gammadirection = Math.round(event.gamma);
	},
	this.allBoom = function(){  //全屏爆炸
		if(musicSwitch){
			use_bomb.play();
		}
		this.everyBoom(this.enemySmalls);
		this.everyBoom(this.enemyMiddles);
		this.everyBoom(this.enemyBosses);
		setTimeout(function(){
			onStopBoom = 1;
		},200);
	},
	this.everyBoom = function(a){  //引爆每架敌机
		for (var i = 0; i < a.children.length; i++) {
			a.children[i].animations.add('stopBoom', [0], 10, true);
			if(a.children[i].key == 'enemySmall'){
				a.children[i].animations.add('sBoom', [0,1], 10, true);
    			a.children[i].animations.play('sBoom');
    		}else if(a.children[i].key == 'enemyMiddle'){
    			a.children[i].animations.add('mBoom', [0,1], 10, true);
    			a.children[i].animations.play('mBoom');
    		}else if(a.children[i].key == 'enemyBoss'){
    			a.children[i].animations.add('bBoom', [0,1,2,3], 10, true);
				a.children[i].animations.play('bBoom');
    		}
		};
		score = score + 10;
	},
	this.stopBoom = function(a){  //爆炸结束
		for (var i = 0; i < a.children.length; i++) {
				a.children[i].animations.play('stopBoom');
				a.children[i].kill();
		};
	},
	this.add_enemy = function(enemyType, v, picWidth, picHeigth, life){  //添加敌机
		this.enemy = enemyType.getFirstDead();
  	 	this.enemy.reset(rnd(0, game.width - picWidth), -1 * picHeigth);
  	 	this.enemy.body.velocity.y = v;
  	 	this.enemy.lives = life;
	},
	this.createEnemys = function(enemyType, number, pic){   //增加敌机集
		enemyType.enableBody = true;
		enemyType.physicsBodyType = Phaser.Physics.ARCADE;
		enemyType.createMultiple(number, pic);
		enemyType.setAll('checkWorldBounds', true);
	    enemyType.setAll('outOfBoundsKill', true);	
	},
	this.gameOver = function(){  //游戏结束
		onGameOver = true;
		onGamePause = true;
		onGamePauseF = true;
		
		this.gameOverAllBoom();
		if(score > bestScore){
			bestScore = score;
			localStorage.setItem("bestScore", bestScore);
		}
		if(musicSwitch){
			game_over.play();
		}
		this.gameOverShow = game.add.sprite(52,game.height*0.5/2,'gameOver'); //分数面板
		this.label_overScore = game.add.text(190 , 144 , score , ftStyle1);//分数显示
		bestScore *= 1; 
		this.label_overScore = game.add.text(190 , 170 , bestScore , ftStyle1);//分数显示
		overRestartBtn = game.add.button(game.width/2,game.height*0.85/2,'restart',function(){//重新开始按钮
			resetStatus();//重置游戏状态
			game.state.start('play');
		});
		overRestartBtn.anchor.setTo(0.5,0.5);
		var onceShowRank = 1;
		showRankBtn = game.add.button(game.width/2,game.height*1/2,'listRank1',function(){//显示排行榜按钮
			if(onceShowRank){
				onceShowRank = 0;
				this.gameOverShow = game.add.sprite(52,game.height*1.2/2,'listRank'); //分数面板
				showRank(2);
			}
		});
		showRankBtn.anchor.setTo(0.5,0.5);
	},
	this.gameOverAllBoom = function(){
		if(!onGameOverF){
			this.gameOverEveryBoom(this.enemySmalls);
			this.gameOverEveryBoom(this.enemyMiddles);
			this.gameOverEveryBoom(this.enemyBosses);
			this.player.animations.play("planeBoom");

			onGameOverF = true;
		}
		setTimeout(function(){
			onStopBoom = 1;
		},200);
	},
	this.gameOverEveryBoom = function(a){
			for (var i = 0; i < a.children.length; i++) {
			a.children[i].animations.add('stopBoom', [0], 10, true);
			if(a.children[i].key == 'enemySmall'){
				a.children[i].animations.add('sBoom', [0,1], 10, true);
    			a.children[i].animations.play('sBoom');
    		}else if(a.children[i].key == 'enemyMiddle'){
    			a.children[i].animations.add('mBoom', [0,1], 10, true);
    			a.children[i].animations.play('mBoom');
    		}else if(a.children[i].key == 'enemyBoss'){
    			a.children[i].animations.add('bBoom', [0,1,2,3], 10, true);
				a.children[i].animations.play('bBoom');
    		}
		  }
	},
	this.pauseGame = function(){  //游戏暂停
		if(!pauseGameOnce){
			pauseGameOnce = 1;
			this.player.input.disableDrag();
			if(!onGameOver){
				this.player.animations.play('pause');
			}else{
				this.player.animations.play('planeBoom');
			}
			this.background.autoScroll(0,0);
			this.pausePushStorage(this.bullets,"bullets");
			this.pausePushStorage(this.enemySmalls,"enemySmalls");
			this.pausePushStorage(this.enemyMiddles,"enemyMiddles");
			this.pausePushStorage(this.enemyBosses,"enemyBosses");
			this.pausePushStorage(this.doubles,"doubles");
			this.pausePushStorage(this.booms,"booms");
			pauseGameOnce = 0;
		}
	},
	this.pausePushStorage = function(a,v){  //游戏暂停过程中将数据置于数组中
		pauseStorage[v][1] = a.children[0].body.velocity.y;
		for (var i = 0; i < a.children.length; i++) {
			a.children[i].body.velocity.y = 0;
		};
	},
	this.containueGame = function(){  //游戏继续
		if(!containueGameOnce){
			containueGameOnce = 1;
			this.player.input.enableDrag();
			this.player.animations.play('fly');
			this.background.autoScroll(0,20);

			this.containueGetStorage(this.bullets,"bullets");
			this.containueGetStorage(this.enemySmalls,"enemySmalls");
			this.containueGetStorage(this.enemyMiddles,"enemyMiddles");
			this.containueGetStorage(this.enemyBosses,"enemyBosses");
			this.containueGetStorage(this.doubles,"doubles");
			this.containueGetStorage(this.booms,"booms");
			onGamePause = false;
			containueGameOnce = 0;
		}
		
	},
	this.containueGetStorage = function(a,v){  //游戏继续过程中将数据取出
		for (var i = 0; i < a.children.length; i++) {
			a.children[i].body.velocity.y = pauseStorage[v][1];
		};
	}
    this.bulletHitMiddle = function(bullet,enemy){  //子弹打中敌机
    	bullet.kill();
    	if(enemy.lives > 1){
    		enemy.lives--;
    	} else {
    		enemy.animations.add('stopBoom', [0], 10, true);
    		if(enemy.key == 'enemySmall'){
    			enemy.animations.add('smallBoom', [0,1], 10, true);
    			enemy.animations.play('smallBoom');
    			if(musicSwitch){
					enemy1_down.play();
				}
    			score = score*1+1;
    		}else if(enemy.key == 'enemyMiddle'){
    			enemy.animations.add('middleBoom', [0,1], 10, true);
    			enemy.animations.play('middleBoom');
    			if(musicSwitch){
					enemy2_down.play();
				}
    			score = score*1+2;
    		}else if(enemy.key == 'enemyBoss'){
    			enemy.animations.add('bossBoom', [0,1,2,3], 10, true);
				enemy.animations.play('bossBoom');
				if(musicSwitch){
					enemy3_down.play();
				}
    			score = score*1+3;
    		}

			setTimeout(function(){
				enemy.animations.play('stopBoom');
				enemy.kill();
			},200); 
    	}
    }
}
function rnd(a,b){
		return a + Math.floor(Math.random() * (b - a));
}
//根据百分比获取 true  false
function percentDetermination(v){
	return Math.floor(Math.random()*10000) < v*10000?true:false;
}
//排行榜
function showRank(a){
	var rst = new Object();
	$.ajax({
		     url:"http://xingguang123.sinaapp.com/plane.php?name="+username+"&score="+bestScore,
		     dataType: 'jsonp', 
		     success:function(json){
		     	rst = {
		     		top : json[0],
		     		rank : json[1]
		     	}
		     	if(a == 1){
		     		label_rank_top = game.add.text(200 , 100 , rst.top, ftStyle1);//分数显示
		     		label_rank_top = game.add.text(200 , 136 , bestScore, ftStyle1);//分数显示
		     		label_rank_m = game.add.text(200 , 170 , rst.rank, ftStyle1);//分数显示
		     	}else if(a == 2){
		     		label_rank_top = game.add.text(200 , 360 , rst.top, ftStyle1);//分数显示
		     		label_rank_top = game.add.text(200 , 396 , bestScore, ftStyle1);//分数显示
		     		label_rank_m = game.add.text(200 , 430 , rst.rank, ftStyle1);//分数显示
		     	}
		     	
		     },
		     error:function(){
		         alert("Error");
		         console.log(this.url);
		     },
		});
}
//重置游戏状态
function resetStatus(){
	onGamePause = false;
	onGamePauseF = false;
	onGameContainue = false;
	onGameOverF = false;
	onGameOver = false;
	pauseGameOnce = false;
	containueGameOnce = false;
	score = "0";
	bmNum = "1";
	onBoom = 0;
	bulletN = 1;
	vSmall = 50;
	vMiddle = 30;
	vBoss = 20;
}
//添加游戏状态字面量
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
//启动游戏
game.state.start('boot'); 