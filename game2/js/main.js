var gameWidth = 360,gameHeight = 640;//定义游戏主尺寸
var musicSwitch = 1;//音乐开关
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
    	game.load.spritesheet('player','assets/player.png',97,123,2); //飞机
    	// game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效
	}
	this.create = function(){
		game.state.start('menu');
	}
}

game.States.menu = function(){//显示开始菜单
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background'); //背景图
		this.title = game.add.sprite(80,150,'title'); //标题
		var btn = game.add.button(game.width/2,game.height/2,'startGame',function(){//开始按钮
			game.state.start('play');
		});
		btn.anchor.setTo(0.5,0.5);
		var btn = game.add.button(game.width/2,game.height*1.2/2,'rank',function(){//开始按钮
			this.rank = game.add.sprite(52,100,'listRank'); //排行榜
		});
		btn.anchor.setTo(0.5,0.5);
	}
}

game.States.play = function(){
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(0,20); //背景图
		this.player = game.add.sprite(0,517,'player'); //添加飞机
		// game.physics.enable([this.player], Phaser.Physics.ARCADE);//禁止飞机飞出界外
		// this.player.body.collideWorldBounds = true;
		this.player.inputEnabled = true;
		this.player.input.enableDrag();
	}
}

game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
game.state.start('boot'); //启动游戏