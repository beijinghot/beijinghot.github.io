var gameWidth = 360,gameHeight = 520;//定义游戏主尺寸
var musicSwitch = 1;//音乐开关
var score = "0000000000";
var ftStyle = { font: "40px Arial", fill: "#000000" };
var betadirection=0,gammadirection=0;
var bmNum = "1";
var onBoom = 0;
var bulletN = 1;
//敌机出现的间隔时间,和敌机的初始速度CTS修改**
var intervalSmall = 2000;
var intervalMiddle = 6000;
var intervalBoss = 40000;
var vSmall = 50;
var vMiddle = 30;
var vBoss = 20;
//以上为CTS修改****

//读取用户信息
var username,bestScore;
if(localStorage.getItem("username")){
	username = localStorage.getItem("username");
	bestScore = localStorage.getItem("bestScore");
}else{
	username = Date.parse(new Date());
	localStorage.setItem("username", username);
	localStorage.setItem("bestScore", 0);
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
		var preloadSprite = game.add.sprite(35,game.height/2,'loading'); //创建显示loading进度的sprite
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
    	game.load.image('double','assets/double.png'); //游戏背景
    	game.load.image('boomNum','assets/boomNum.png'); //游戏背景
    	game.load.spritesheet('player','assets/player.png',70,89,2); //飞机
    	// game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效
    	// **CTS增加**
    	game.load.image('enemyBoss','assets/enemyBoss.png'); 
    	game.load.image('enemySmall','assets/enemySmall.png');
    	game.load.image('enemyMiddle','assets/enemyMiddle.png');
    	//**
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
		var btn = game.add.button(game.width/2,game.height*1.2/2,'rank',function(){//开始按钮
			this.rank = game.add.sprite(52,game.height*0.2/2,'listRank'); //排行榜
		});
		btn.anchor.setTo(0.5,0.5);
	},
	this.showRank = function(){
		var rst = new Object();
		$.ajax({
			     url:"http://xingguang123.sinaapp.com/plane.php?name="+username+"&score="+bestScore,
			     dataType: 'jsonp', 
			     success:function(json){
			     	rst = {
			     		top : json[0],
			     		rank : json[1]
			     	}
					console.log(rst.top+"|"+rst.rank);
			     },
			     error:function(){
			         alert("Error");
			         console.log(this.url);
			     },
			});
		}
}

game.States.play = function(){
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(0,20); //背景图
		this.player = game.add.sprite(game.width/2-35,game.height-89,'player'); //添加飞机
		game.physics.enable(this.player, Phaser.Physics.ARCADE);
		game.physics.enable([this.player], Phaser.Physics.ARCADE);//禁止飞机飞出界外
		this.player.body.collideWorldBounds = true;
		this.player.inputEnabled = true;
		this.player.input.enableDrag();
		game.physics.arcade.enable(this.player);
		this.player.animations.add('fly', [1,2], 10, true);

		this.bullets = game.add.group();
	    this.bullets.enableBody = true;
	    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

	    this.bullets.createMultiple(50, 'bullet');
	    this.bullets.setAll('checkWorldBounds', true);
	    this.bullets.setAll('outOfBoundsKill', true);

	    this.booms = game.add.group(); 
		this.booms.enableBody = true;
		this.booms.createMultiple(20,'boom');
		this.booms.setAll('checkWorldBounds', true);
	    this.booms.setAll('outOfBoundsKill', true);

	    this.doubles = game.add.group(); 
		this.doubles.enableBody = true;
		this.doubles.createMultiple(20,'double');
		this.doubles.setAll('checkWorldBounds', true);
	    this.doubles.setAll('outOfBoundsKill', true);


	    this.timer = game.time.events.loop(300,this.add_one_bullet,this);

	    this.label_score = game.add.text(70 , 5 , score+1, ftStyle);
		this.label_boomNum = game.add.text(60 , 70, " X "+bmNum, ftStyle);
	    var pauseBtn = game.add.button(5,70,'boomNum',function(){//暂停按钮
	    	if(bmNum !=0){
	    		onBoom = 1;
	    		bmNum--;
	    	}
		});
	    var pauseBtn = game.add.button(5,5,'pause',function(){//暂停按钮
			game.paused = true;	
		});
		//敌机**以下为CTS修改	
		//this.createEnemys(enemyType, number, pic) 敌机类型，数量，图片名称
		//this.add_enemy(enemyType, v, picWidth, picHeigth, life) 敌机类型，初始速度，图片宽，图片高，生命数
		//小敌机
		this.enemySmalls = game.add.group();
		this.createEnemys(this.enemySmalls, 10, 'enemySmall');
	    this.timerEnemySmall = game.time.events.loop(intervalSmall, function(){
	    	this.add_enemy(this.enemySmalls, vSmall++, 75, 0, 10);
	    }, this);
	    //中等敌机
		this.enemyMiddles = game.add.group();
		this.createEnemys(this.enemyMiddles, 5, 'enemyMiddle');
	    this.timerEnemy = game.time.events.loop(intervalMiddle, function(){
	    	this.add_enemy(this.enemyMiddles, vMiddle++, 100, 90, 20);
	    },this);	    
		//boss敌机
		this.enemyBosses = game.add.group();
		this.createEnemys(this.enemyBosses, 3, 'enemyBoss');
	    this.timerEnemy = game.time.events.loop(intervalBoss, function(){
	    	this.add_enemy(this.enemyBosses, vBoss++, 230, 300, 40);
	    },this); 
	    //**以上为CTS修改
		window.addEventListener("deviceorientation", this.deviceOrientationListener);
	},
	this.update = function(){
		this.player.animations.play('fly');
		this.label_boomNum.text = " X "+bmNum;
		if(onBoom == 1){
			this.allBoom();
			onBoom = 0;
		}

		this.player.body.velocity.x = gammadirection*10;
		this.player.body.velocity.y = betadirection*10;

		var randm = Math.floor(Math.random()*1000);
		if(randm > 998){
			this.add_boom();
		}else if(randm < 1){
			if(bulletN == 1 ){
				this.add_double();
				bulletN = 2;
			}
		}

		this.game.physics.arcade.overlap(this.player,this.booms,this.boomplus, null, this);
		this.game.physics.arcade.overlap(this.player,this.doubles,this.doubleplus, null, this);
		//敌机与子弹碰撞检测
		this.game.physics.arcade.overlap(this.bullets, this.enemySmalls,this.bulletHitMiddle, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemyMiddles,this.bulletHitMiddle, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemyBosses,this.bulletHitMiddle, null, this);
	},
	this.fly = function(){  //飞机飞行ing

	},
	this.add_one_bullet = function(){   //发射单炮
		this.bullet = this.bullets.getFirstDead();
  	 	this.bullet.reset(this.player.x + 33, this.player.y );
    	this.bullet.body.velocity.y = -500;
	},
	this.add_two_bullet = function(){   //发射双炮
		this.bullet = this.bullets.getFirstDead();
  	 	this.bullet.reset(this.player.x + 33 - 10, this.player.y );
    	this.bullet.body.velocity.y = -500;

    	this.bullet = this.bullets.getFirstDead();
  	 	this.bullet.reset(this.player.x + 33 + 10, this.player.y );
    	this.bullet.body.velocity.y = -500;
	},
	this.add_double = function(){
		var posX = Math.floor(Math.random()*300);
		this.double = this.doubles.getFirstDead();
		this.double.reset(posX,0);
		this.double.body.velocity.y = 200;
	},
	this.add_boom = function(){
		var posX = Math.floor(Math.random()*300);
		this.boom = this.booms.getFirstDead();
		this.boom.reset(posX,0);
		this.boom.body.velocity.y = 200;
	},
	this.boomplus = function(player,boom){
		boom.kill();
	    bmNum++;
		this.label_boomNum.text = " X "+bmNum;
	},
	this.doubleplus = function(player,double){
		double.kill();
		this.timer.callback = this.add_two_bullet;
	},
	this.deviceOrientationListener = function(event) {
	  	betadirection = Math.round(event.beta);//负前正后
		gammadirection = Math.round(event.gamma);//负左正右
	},
	this.allBoom = function(){
		console.log("boom!!!");
	}
	//** 以下为CTS修改
	this.add_enemy = function(enemyType, v, picWidth, picHeigth, life){
		this.enemy = enemyType.getFirstDead();
  	 	this.enemy.reset(rnd(0, game.width - picWidth), -1 * picHeigth);
  	 	this.enemy.body.velocity.y = v;
  	 	this.enemy.lives = life;
	},
	this.createEnemys = function(enemyType, number, pic){
		enemyType.enableBody = true;
		enemyType.physicsBodyType = Phaser.Physics.ARCADE;
		enemyType.createMultiple(number, pic);
		enemyType.setAll('checkWorldBounds', true);
	    enemyType.setAll('outOfBoundsKill', true);	
	},
	//子弹打中敌机的函数
    this.bulletHitMiddle = function(bullet,enemy){
    	bullet.kill();
    	if(enemy.lives > 1){
    		enemy.lives--;
    	} else {
    		enemy.kill();
    	}
    }
}
function rnd(a,b){
		return a + Math.floor(Math.random() * (b - a));
}
//以上为CTS修改
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
game.state.start('boot'); //启动游戏