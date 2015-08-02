var gameWidth = 360,gameHeight = 505;//定义游戏主尺寸
var musicSwitch = 1;//音乐开关
var score = "0000000000";
var ftStyle = { font: "40px Arial", fill: "#000000" };
var betadirection=0,gammadirection=0;
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
    	game.load.spritesheet('player','assets/player.png',70,89,2); //飞机
    	// game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效
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
	}
}

game.States.play = function(){
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(0,20); //背景图
		this.player = game.add.sprite(0,game.height-89,'player'); //添加飞机
		game.physics.enable(this.player, Phaser.Physics.ARCADE);
		// game.physics.enable([this.player], Phaser.Physics.ARCADE);//禁止飞机飞出界外
		// this.player.body.collideWorldBounds = true;
		this.player.inputEnabled = true;
		this.player.input.enableDrag();
		this.player.enableBody = true;
		game.physics.arcade.enable(this.player);
		this.player.animations.add('fly', [1,2], 10, true);
		this.bullets = game.add.group();
	    this.bullets.enableBody = true;
	    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

	    this.bullets.createMultiple(50, 'bullet');
	    this.bullets.setAll('checkWorldBounds', true);
	    this.bullets.setAll('outOfBoundsKill', true);
	    this.timer = game.time.events.loop(300,this.add_two_bullet,this);

	    this.label_score = game.add.text(100 , 5 , score, ftStyle);

	    var pauseBtn = game.add.button(0,0,'pause',function(){//暂停按钮
			game.paused = true;
		});

		window.addEventListener("deviceorientation", this.deviceOrientationListener);
	}
	this.update = function(){
		this.player.animations.play('fly');
	}
	this.fly = function(){

	}
	this.add_one_bullet = function(){   //发射单炮
		this.bullet = this.bullets.getFirstDead();
  	 	this.bullet.reset(this.player.x + 33, this.player.y );
    	this.bullet.body.velocity.y = -500;
	}
	this.add_two_bullet = function(){   //发射双炮
		this.bullet = this.bullets.getFirstDead();
  	 	this.bullet.reset(this.player.x + 33 - 10, this.player.y );
    	this.bullet.body.velocity.y = -500;

    	this.bullet = this.bullets.getFirstDead();
  	 	this.bullet.reset(this.player.x + 33 + 10, this.player.y );
    	this.bullet.body.velocity.y = -500;
	}
	this.deviceOrientationListener = function(event) {
	  	betadirection = Math.round(event.beta);//负前正后
		gammadirection = Math.round(event.gamma);//负左正右
		// this.player.body.velocity.x = gammadirection*10;
		// this.player.body.velocity.y = betadirection*10;
	}
}

game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
game.state.start('boot'); //启动游戏