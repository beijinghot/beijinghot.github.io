/**
 *description
 *打飞机游戏，游戏主要包括两个模式：普通模式，闯关模式；
 *各模式难度可在相应参数中修改；
 *普通模式涉及的state:play;
 *闯关模式涉及的state:gateWelcome,gate,bossWelcome,boss;
 *游戏使用phaser框架搭建，排行榜使用ajax，localStorage实现，使用jsonp处理跨域；
 *飞机控制方式  移动端：重力感应，触控  pc端：按键上下左右，鼠标拖动；
 *普通模式在不触碰敌机的情况下可一直游戏，随时间增加飞机速度增加，难度增强；
 *闯关模式共5关，每关分为歼灭战和boss战，歼灭战获得100分进入boss战，boss战击毁敌机进入下一关的歼灭战
 *e-mail    1148586347@qq.com
 *@date     2015-8-12
 *@author   光光  布衣小酱
**/
//定义游戏主尺寸
var gameWidth = 360,
    gameHeight = 520; 
//音乐开关
var musicSwitch = 1; 
//初始分数 
var score = 0;
//定义文字样式
var ftStyle = {       
    font: "40px Arial",
    fill: "#000000"
}; 
var ftStyle1 = {
    font: "22px Arial",
    fill: "#000000"
}; 
var ftStyle2 = {
    font: "25px Arial",
    fill: "#000000"
}; 
var ftStyle3 = {
    font: "25px Arial",
    fill: "#ffffff"
}; 
//boss血量初始值
var bossHpOld;   
//闯关模式胜利状态字
var onGateSuccess = 0;
//重力感应相关参数
var betadirection = 0,
    gammadirection = 0; 
//全屏爆炸炸弹数
var bmNum = "1"; 
//全屏爆炸状态
var onBoom = 0;
//并行子弹数，初始值为1 
var bulletN = 1; 
//停止爆炸状态
var onStopBoom; 
//声明按钮
var pauseBtn,
    restartBtn, 
    containueBtn, 
    boomBtn, 
    overRestartBtn,
    showRankBtn,
    returnM;
//声明音效
var bullet_on,
    enemy1_down,
    enemy2_down,
    enemy3_down,
    game_music,
    game_over,
    get_bomb,
    get_double_laser,
    use_bomb;
//游戏暂停 继续状态参数
var onGamePause = false,
    onGamePauseF = false,
    onGameContainue = false,
    pauseGameOnce = false,
    containueGameOnce = false,
    onGameOver = false,
    onGameOverF = false,
    onGameStart = false;
    onGateOver = false;
//普通模式--敌机出现率,敌机的初始速度
var intervalSmall = 0.05,
    intervalMiddle = 0.01,
    intervalBoss = 0.008,
    vSmall = 50,
    vMiddle = 30,
    vBoss = 20;
//闯关模式关卡记录
var gateN = 1;
//闯关模式数值记录，通过修改相应数值可以修改游戏难度
//******基础值***********************增长速度**************************
var playerBulletSpeed = 500,    playerBulletSpeedGrowth = 0;     //player子弹移速
var playerBulletMake = 200 ,    playerBulletMakeGrowth = 10;     //player子弹生成速度
var enemyBossHealthPoint = 17,  enemyBossHealthPointGrowth = 3;  //enemyBoss生命值
var enemyBossSpeed = 20,        enemyBossSpeedGrowth = 1;        //enemyBoss移速
var enemyBossMake = 0.008,      enemyBossMakeGrowth = 0;         //enemyBoss生成率
var enemyMiddleHealthPoint = 8, enemyMiddleHealthPointGrowth = 2;//enemyMiddle生命值
var enemyMiddleSpeed = 30,      enemyMiddleSpeedGrowth = 1;      //enemyMiddle移速
var enemyMiddleMake = 0.01,     enemyMiddleMakeGrowth = 0;       //enemyMiddle生成率
var enemySmallHealthPoint = 1,  enemySmallHealthPointGrowth = 1; //enemySmall生命值
var enemySmallSpeed = 50,       enemySmallSpeedGrowth = 1;       //enemySmall移速
var enemySmallMake = 0.05,      enemySmallMakeGrowth = 0;        //enemySmall生成率
var bossH = 50,                 bossHGrowth = 50;                //boss生命值
var bossV = 50,                 bossVGrowth = 0;                 //boss移速
var bossBulletMake = 1500,      bossBulletMakeGrowth = 10;       //boss子弹生成速度
var bossBulletSpeed = 100,      bossBulletSpeedGrowth = 5;       //boss子弹速度
var onBossGateSmallSpeed = 50,  onBossGateSmallSpeedGrowth = 1;  //boss中small子弹速度
var onBossGateSmallHealth = 1,  onBossGateSmallHealthGrowth = 1; //boss中small子弹生命值
var onBossGateSmallMake = 0.025,onBossGateSmallMakeGrowth = 0;   //boss中small子弹生成速度
var bgcSpeed = 30,              bgcGrowth = 10;                  //背景滚动速度
//==============================
//读取用户信息，检测浏览器是否支持localStorage
//@param username 用户名，获取根据unix时间戳
//@param bestScore 最高分，与localStorage中的值相关联
//==============================
var username,
bestScore;
if (window.localStorage) {
    if (localStorage.getItem("username")) {
        username = localStorage.getItem("username");
        bestScore = localStorage.getItem("bestScore");

    } else {
        username = Date.parse(new Date());
        bestScore = 0;
        localStorage.setItem("username", username);
        localStorage.setItem("bestScore", 0);

    }

} else {
    alert("您的浏览器不支持localStorage,请升级浏览器");

}
//实例化game
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'canvas');
game.States = {};
//存放状态
//=========================
//boot状态，内含移动端检测和加载界面元素载入
//=========================
game.States.boot = function() {
    //=========================
    //检测游戏使用平台，移动端全屏显示，pc端居中显示
    //=========================
    this.preload = function() {
        if (!game.device.desktop) {
            //使用拉伸适应全屏模式
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.scale.forcePortrait = true;
            this.scale.refresh();

        } else {
            //桌面浏览器居中显示
            this.game.scale.pageAlignVertically = true;
            this.game.scale.pageAlignHorizontally = true;

        }
        //初始背景色
        this.game.stage.backgroundColor = '#ccc';
        game.load.image('loading', 'assets/preloader.gif');

    };
    //==========================
    //指向preload状态
    //==========================
    this.create = function() {
        game.state.start('preload');
        //跳转到资源加载页面

    };

};
//==========================
//preload状态，加载游戏资源
//==========================
game.States.preload = function() {
    //加载游戏资源
    this.preload = function() {
        //创建显示loading进度的sprite
        var preloadSprite = game.add.sprite(70, game.height / 2, 'loading');
        game.load.setPreloadSprite(preloadSprite);
        //游戏背景
        game.load.image('background', 'assets/bgpic.png');
        game.load.image('title', 'assets/title.png');
        //按钮部分
        game.load.image('continue', 'assets/continue.png');
        game.load.image('listRank1', 'assets/listRank1.png');
        game.load.image('rank', 'assets/rank.png');
        game.load.image('returnMenu', 'assets/returnMenu.png');
        game.load.image('restart', 'assets/restart.png');
        game.load.image('startGame', 'assets/startGame.png');
        game.load.image('gate', 'assets/gate.png');
        game.load.image('pause', 'assets/pause.png');
        //面板部分
        game.load.image('gateFail', 'assets/gateFail.png');
        game.load.image('gateOver', 'assets/gateOver.png');
        game.load.image('gameOver', 'assets/gameOver.png');
        game.load.image('listRank', 'assets/listRank.png');
        //子弹部分
        game.load.image('bullet', 'assets/zd1.png');
        game.load.image('boss_bullet', 'assets/zd2.png');
        game.load.image('double', 'assets/double.png');
        //炸弹部分
        game.load.image('boom', 'assets/boom.png');
        game.load.image('boomNum', 'assets/boomNum.png');
        //boss血量部分
        game.load.image('hpbg', 'assets/hpbg.jpg');
        game.load.image('hp', 'assets/hp.jpg');
        //音乐部分
        game.load.image('musicon', 'assets/musicon.png');
        game.load.image('musicoff', 'assets/musicoff.png');
        game.load.spritesheet('music', 'assets/music.png', 40, 47, 2);
        //飞机
        game.load.spritesheet('player', 'assets/player.png', 70, 89, 3);
        //敌机部分
        game.load.spritesheet('enemyBoss', 'assets/enemyBoss.png', 101, 149, 4);
        game.load.spritesheet('enemyMiddle', 'assets/enemyMiddle.png', 47, 61, 2);
        game.load.spritesheet('enemySmall', 'assets/enemySmall.png', 34, 24);
        game.load.spritesheet('boss2', 'assets/boss1.png', 123, 109, 4);
        game.load.spritesheet('boss4', 'assets/boss2.png', 109, 102, 4);
        game.load.spritesheet('boss5', 'assets/boss3.png', 105, 80, 4);
        game.load.spritesheet('boss3', 'assets/boss4.png', 117, 93, 4);
        game.load.spritesheet('boss1', 'assets/boss5.png', 126, 110, 4);
        //音效部分
        game.load.audio('bullet_on', 'assets/bullet_on.mp3');
        game.load.audio('enemy1_down', 'assets/enemy1_down.mp3');
        game.load.audio('enemy2_down', 'assets/enemy2_down.mp3');
        game.load.audio('enemy3_down', 'assets/enemy3_down.mp3');
        game.load.audio('game_music', 'assets/game_music.mp3');
        game.load.audio('game_over', 'assets/game_over.mp3');
        game.load.audio('get_bomb', 'assets/get_bomb.mp3');
        game.load.audio('get_double_laser', 'assets/get_double_laser.mp3');
        game.load.audio('use_bomb', 'assets/use_bomb.mp3');

    };
    this.create = function() {
        //=====================
        //指向menu状态
        //=====================
        game.state.start('menu');

    };

};
//========================
//menu状态，显示菜单，可选择游戏模式，开关游戏音效
//========================
game.States.menu = function() {
    this.create = function() {
        //背景图
        game.add.tileSprite(0, 0, game.width, game.height, 'background');
        //标题
        this.title = game.add.sprite(80, game.height * 0.4 / 2, 'title');
        //开始按钮
        var btn = game.add.button(game.width / 2, game.height / 2, 'startGame', 
        function() {
            game.state.start('play');

        });
        btn.anchor.setTo(0.5, 0.5);
        var onceShowRank = 1;
        //排行榜按钮
        var btn = game.add.button(game.width / 2, game.height * 1.2 / 2, 'rank', 
        function() {
            if (onceShowRank) {
                onceShowRank = 0;
                this.rank = game.add.sprite(52, game.height * 0.2 / 2, 'listRank');
                showRank(1);

            }

        });
        btn.anchor.setTo(0.5, 0.5);
        //闯关模式开始按钮
        var btn = game.add.button(game.width / 2, 360, 'gate', 
        function() {
            game.state.start('gateWelcome');

        });
        btn.anchor.setTo(0.5, 0.5);
        //添加音乐图标
        var music = game.add.sprite(80, 410, 'music');

        music.animations.add('on', [1], 10, false);
        music.animations.add('off', [0], 10, false);

        if (musicSwitch) {
            music.animations.play('on');

        } else {
            music.animations.play('off');

        }
        //音乐开启按钮
        var btn = game.add.button(game.width / 2, 410, 'musicon', 
        function() {
            music.animations.play('on');
            musicSwitch = 1;

        });
        btn.anchor.setTo(0.5, 0.5);
        //音乐关闭按钮
        var btn = game.add.button(game.width / 2, 460, 'musicoff', 
        function() {
            music.animations.play('off');
            musicSwitch = 0;
            game.sound.stopAll();

        });
        btn.anchor.setTo(0.5, 0.5);
        //赋值游戏音效
        bullet_on = game.add.audio('bullet_on');
        enemy1_down = game.add.audio('enemy1_down');
        enemy2_down = game.add.audio('enemy2_down');
        enemy3_down = game.add.audio('enemy3_down');
        game_music = game.add.audio('game_music');
        game_over = game.add.audio('game_over');
        get_bomb = game.add.audio('get_bomb');
        get_double_laser = game.add.audio('get_double_laser');
        use_bomb = game.add.audio('use_bomb');

    }

};
//=====================================
//play状态，普通模式程序
//=====================================
game.States.play = function() {
    //=============================
    //创建游戏元素模型，设置计时器
    //=============================
    this.create = function() {
        onGameStart = true;
        //设置背景图并滚动
        this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        this.background.autoScroll(0, 20);
        //播放游戏背景音乐
        game.sound.stopAll();
        this.playMusic(game_music);
        //添加飞机
        this.player = game.add.sprite(game.width / 2 - 35, game.height - 89, 'player');
        game.physics.enable([this.player], Phaser.Physics.ARCADE);
        //禁止飞机飞出界外
        this.player.body.collideWorldBounds = true;
        this.player.inputEnabled = true;
        //添加触控
        this.player.input.enableDrag();
        game.physics.arcade.enable(this.player);
        //飞机飞行动画
        this.player.animations.add('fly', [0, 1], 10, true);
        this.player.animations.add('pause', [1]);
        this.player.animations.add('planeBoom', [1, 2], 10, false);
        this.player.animations.play('fly');
        //飞机飞行序列帧
        //初始化飞机位置
        this.player.body.setSize(20, 80, 27, 0);
        //子弹集
        this.bullets = game.add.group();
        this.createArr(this.bullets, 50, 'bullet');
        //炸弹集
        this.booms = game.add.group();
        this.createArr(this.booms, 20, 'boom');
        //双弹buff集
        this.doubles = game.add.group();
        this.createArr(this.doubles, 20, 'double');
        //启动子弹发射
        this.timer = game.time.events.loop(200, this.add_one_bullet, this);
        //分数显示文本
        this.label_score = game.add.text(70, 5, score + 1, ftStyle);
        //炸弹数显示文本
        this.label_boomNum = game.add.text(240, 5, " X " + bmNum, ftStyle);
        //爆炸按钮
        boomBtn = game.add.button(190, 8, 'boomNum', 
        function() {
            if (!onGamePause) {
                if (bmNum != 0) {
                    onBoom = 1;
                    bmNum--;

                }

            }

        });
        //暂停按钮
        pauseBtn = game.add.button(8, 10, 'pause', 
        function() {
            if (!onGamePause) {
                onGamePause = true;
                onGamePauseF = true;
                game.input.onDown.add(function(e) {
                    var x1 = containueBtn.left;
                    var x2 = containueBtn.left + containueBtn.width;
                    var y1 = containueBtn.top;
                    var y2 = containueBtn.top + containueBtn.height;
                    var x3 = restartBtn.left;
                    var x4 = x3 + restartBtn.width;
                    var y3 = restartBtn.top;
                    var y4 = y3 + restartBtn.height;
                    if (e.x > x1 && e.x < x2 && e.y > y1 && e.y < y2) {
                        this.game.paused = false;
                        onGamePause = false;
                        containueBtn.kill();
                        restartBtn.kill();

                    } else if (e.x > x3 && e.x < x4 && e.y > y3 && e.y < y4) {
                        this.game.paused = false;
                        resetStatus();
                        game.state.start('play');

                    }

                },
                this);
                this.game.paused = true;
                restartBtn = game.add.button(game.width / 2, game.height * 0.9 / 2, 'restart', 
                function() {
                    //重新开始按钮                       
                    });
                containueBtn = game.add.button(game.width / 2, game.height * 0.7 / 2, 'continue', 
                function() {
                    //继续游戏按钮                                         
                    });
                restartBtn.anchor.setTo(0.5, 0.5);
                containueBtn.anchor.setTo(0.5, 0.5);

            }

        });
        //添加小敌机
        this.enemySmalls = game.add.group();
        this.createEnemys(this.enemySmalls, 30, 'enemySmall');
        //添加中等敌机
        this.enemyMiddles = game.add.group();
        this.createEnemys(this.enemyMiddles, 20, 'enemyMiddle');
        //添加boss敌机
        this.enemyBosses = game.add.group();
        this.createEnemys(this.enemyBosses, 10, 'enemyBoss');
        //添加重力感应监听
        window.addEventListener("deviceorientation", this.deviceOrientationListener);

    };
    //=============================
    //刷新函数，检测状态标志字，响应响应状态
    //修改游戏画面文本
    //碰撞检测
    //智能添加敌机
    //按键检测
    //=============================
    this.update = function() {

        this.label_boomNum.text = " X " + bmNum;
        this.label_score.text = score;
        //全屏爆炸检测
        if (onBoom == 1) {
            this.allBoom();
            onBoom = 0;

        }
        //游戏暂停后继续检测
        if (onGameContainue) {
            this.containueGame();
            onGameContainue = false;

        }
        //游戏暂停检测
        if (onGamePause) {
            if (onGamePauseF) {
                this.pauseGame();
                onGamePauseF = false;

            }

        } else {
            if (!game.device.desktop) {
                //响应重力感应
                this.player.body.velocity.x = gammadirection * 10;
                this.player.body.velocity.y = betadirection * 10;

            } else {
                //键盘操作
                if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                    this.player.body.velocity.x = -200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    this.player.body.velocity.x = 200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                    this.player.body.velocity.y = -200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                    this.player.body.velocity.y = 200;

                } else {
                    this.player.body.velocity.x = 0;
                    this.player.body.velocity.y = 0;

                }

            }
            //随机生成全屏爆炸物
            if (percentDetermination(0.001)) {
                this.add_boom();

            }
            //随机生成双弹buff
            if (percentDetermination(0.001) && bulletN == 1) {
                this.add_double();

            }
            //随机生成敌机并控制屏幕敌机数量
            if (percentDetermination(intervalSmall) && this.enemySmalls.total < 10) {
                this.add_enemy(this.enemySmalls, vSmall++, 35, 24, 2);

            }
            if (percentDetermination(intervalMiddle) && this.enemyMiddles.total < 4) {
                this.add_enemy(this.enemyMiddles, vMiddle++, 47, 61, 10);

            }
            if (percentDetermination(intervalBoss) && this.enemyBosses.total < 1) {
                this.add_enemy(this.enemyBosses, vBoss++, 101, 149, 20);

            }

        }
        //全屏爆炸停止检测
        if (onStopBoom) {
            this.stopBoom(this.enemySmalls);
            this.stopBoom(this.enemyMiddles);
            this.stopBoom(this.enemyBosses);
            if (onGameOver) {
                this.player.kill();

            }
            onStopBoom = 0;

        }
        //碰撞检测部分  player与buff
        this.game.physics.arcade.overlap(this.player, this.booms, this.boomplus, null, this);
        this.game.physics.arcade.overlap(this.player, this.doubles, this.doubleplus, null, this);
        //bullet与enemy
        this.game.physics.arcade.overlap(this.bullets, this.enemySmalls, this.bulletHitMiddle, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyMiddles, this.bulletHitMiddle, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyBosses, this.bulletHitMiddle, null, this);
        //player与enemy
        this.game.physics.arcade.overlap(this.player, this.enemySmalls, this.gameOver, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyMiddles, this.gameOver, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyBosses, this.gameOver, null, this);
        //标识提前
        game.world.bringToTop(boomBtn);
        game.world.bringToTop(pauseBtn);
        game.world.bringToTop(this.label_boomNum);
        game.world.bringToTop(this.label_score);

    };
    //发射单炮
    this.add_one_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33, this.player.y);
            this.bullet.body.velocity.y = -500;

        }

    };
    //发射双炮
    this.add_two_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 10, this.player.y);
            this.bullet.body.velocity.y = -500;

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 10, this.player.y);
            this.bullet.body.velocity.y = -500;

        }


    };
    //添加双弹buff
    this.add_double = function() {
        if (!onGamePause) {
            var posX = Math.floor(Math.random() * 300);
            this.double = this.doubles.getFirstDead();
            this.double.reset(posX, 0);
            this.double.body.velocity.y = 200;

        }

    };
    //添加爆炸物
    this.add_boom = function() {
        if (!onGamePause) {
            var posX = Math.floor(Math.random() * 300);
            this.boom = this.booms.getFirstDead();
            this.boom.reset(posX, 0);
            this.boom.body.velocity.y = 200;

        }

    };
    //=============================
    //可用炸弹数增加
    //player我方飞机，boom炸弹
    //=============================
    this.boomplus = function(player, boom) {
        this.playMusic(get_bomb);
        boom.kill();
        bmNum++;
        this.label_boomNum.text = " X " + bmNum;

    };
    //=============================
    //并行子弹增加
    //player我方飞机，double双弹元素
    //=============================
    this.doubleplus = function(player, double) {
        this.playMusic(get_double_laser);
        double.kill();
        this.timer.callback = this.add_two_bullet;
        bulletN = 2;

    };
    //重力检测函数
    this.deviceOrientationListener = function(event) {
        betadirection = Math.round(event.beta);
        gammadirection = Math.round(event.gamma);

    };
    //全屏爆炸函数
    this.allBoom = function() {
        this.playMusic(use_bomb);
        this.everyBoom(this.enemySmalls);
        this.everyBoom(this.enemyMiddles);
        this.everyBoom(this.enemyBosses);
        setTimeout(function() {
            onStopBoom = 1;

        },
        200);

    };
    //=============================
    //引爆每架敌机，根据敌机增加分数
    //a敌机类型
    //=============================
    this.everyBoom = function(a) {
        if (a.children[0].key == 'enemySmall') {
            for (var i = 0; i < a.children.length; i++) {
                a.children[i].animations.add('stopBoom', [0], 10, false);
                if (a.children[i].alive) {
                    a.children[i].animations.add('sBoom', [0, 1], 10, false);
                    a.children[i].animations.play('sBoom');

                }

            }
            score += a.countLiving();

        } else if (a.children[0].key == 'enemyMiddle') {
            for (i = 0; i < a.children.length; i++) {
                a.children[i].animations.add('stopBoom', [0], 10, false);
                if (a.children[i].alive) {
                    a.children[i].animations.add('mBoom', [0, 1], 10, false);
                    a.children[i].animations.play('mBoom');

                }

            }
            score += a.countLiving() * 2;

        } else if (a.children[0].key == 'enemyBoss') {
            for (i = 0; i < a.children.length; i++) {
                a.children[i].animations.add('stopBoom', [0], 10, false);
                if (a.children[i].alive) {
                    a.children[i].animations.add('bBoom', [0, 1, 2, 3], 10, false);
                    a.children[i].animations.play('bBoom');

                }

            }
            score += a.countLiving() * 3;

        }

    };
    //=============================
    //爆炸结束，清除敌机
    //a敌机类型
    //=============================
    this.stopBoom = function(a) {
        for (var i = 0; i < a.children.length; i++) {
            a.children[i].animations.play('stopBoom');
            a.children[i].kill();

        };

    };
    //=============================
    //添加敌机
    //enemyType敌机类型，v速度，picWidth, picHeigth 敌机宽高，life敌机生命值
    //=============================
    this.add_enemy = function(enemyType, v, picWidth, picHeigth, life) {
        this.enemy = enemyType.getFirstDead();
        this.enemy.reset(rnd(0, game.width - picWidth), -1 * picHeigth);
        this.enemy.body.velocity.y = v;
        this.enemy.lives = life;

    };
    //=============================
    //增加敌机集
    //enemyType敌机类型，number数组长度，pic敌机原型
    //=============================
    this.createEnemys = function(enemyType, number, pic) {
        enemyType.enableBody = true;
        enemyType.physicsBodyType = Phaser.Physics.ARCADE;
        enemyType.createMultiple(number, pic);
        enemyType.setAll('checkWorldBounds', true);
        enemyType.setAll('outOfBoundsKill', true);

    };
    //=============================
    //增加数组元素
    //name数组名称，number数组长度，pic元素原型
    //=============================
    this.createArr = function(name, number, pic) {
        name.enableBody = true;
        name.physicsBodyType = Phaser.Physics.ARCADE;
        name.createMultiple(number, pic);
        name.setAll('checkWorldBounds', true);
        name.setAll('outOfBoundsKill', true);

    };
    //游戏结束
    this.gameOver = function() {
        onGameStart = false;
        onGameOver = true;
        onGamePause = true;
        onGamePauseF = true;

        this.gameOverAllBoom();
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);

        }
        this.playMusic(game_over);
        //分数面板
        this.gameOverShow = game.add.sprite(52, game.height * 0.5 / 2, 'gameOver');
        //本次分数显示 
        this.label_overScore = game.add.text(190, 144, score, ftStyle1);
        bestScore = parseInt(bestScore);
        //历史最高分数显示
        this.label_overScore = game.add.text(190, 170, bestScore, ftStyle1);
        //重新开始按钮
        overRestartBtn = game.add.button(game.width / 2, game.height * 0.85 / 2, 'restart', 
        function() {
            resetStatus();
            //重置游戏状态
            game.state.start('play');

        });
        overRestartBtn.anchor.setTo(0.5, 0.5);
        var onceShowRank = 1;
        //显示排行榜按钮
        showRankBtn = game.add.button(game.width / 2, game.height * 1.03 / 2, 'listRank1', 
        function() {
            if (onceShowRank) {
                onceShowRank = 0;
                this.gameOverShow = game.add.sprite(52, game.height * 1.3 / 2, 'listRank');
                showRank(2);

            }

        });
        showRankBtn.anchor.setTo(0.5, 0.5);
        //返回主菜单按钮
        returnM = game.add.button(game.width / 2, game.height * 1.2 / 2, 'returnMenu', 
        function() {
            resetStatus();
            onGameStart = false;
            game.state.start('menu');

        });
        returnM.anchor.setTo(0.5, 0.5);

    };
    //游戏结束时的全屏爆炸
    this.gameOverAllBoom = function() {
        if (!onGameOverF) {
            this.gameOverEveryBoom(this.enemySmalls);
            this.gameOverEveryBoom(this.enemyMiddles);
            this.gameOverEveryBoom(this.enemyBosses);
            this.player.animations.play("planeBoom");

            onGameOverF = true;

        }
        setTimeout(function() {
            onStopBoom = 1;

        },
        200);

    };
    //=============================
    //游戏结束时每一个元素爆炸
    //a敌机类型
    //=============================
    this.gameOverEveryBoom = function(a) {
        for (var i = 0; i < a.children.length; i++) {
            a.children[i].animations.add('stopBoom', [0], 10, false);
            if (a.children[i].key == 'enemySmall') {
                a.children[i].animations.add('sBoom', [0, 1], 10, false);
                a.children[i].animations.play('sBoom');

            } else if (a.children[i].key == 'enemyMiddle') {
                a.children[i].animations.add('mBoom', [0, 1], 10, false);
                a.children[i].animations.play('mBoom');

            } else if (a.children[i].key == 'enemyBoss') {
                a.children[i].animations.add('bBoom', [0, 1, 2, 3], 10, false);
                a.children[i].animations.play('bBoom');

            }

        }

    };
    //游戏暂停
    this.pauseGame = function() {
        if (!pauseGameOnce) {
            pauseGameOnce = 1;
            if (!onGameOver) {
                this.player.animations.play('pause');

            } else {
                this.player.animations.play('planeBoom');

            }
            pauseGameOnce = 0;

        }

    };
    //游戏继续
    this.containueGame = function() {
        if (!containueGameOnce) {
            containueGameOnce = 1;
            this.player.input.enableDrag();
            this.player.animations.play('fly');
            this.background.autoScroll(0, 20);
            onGamePause = false;
            containueGameOnce = 0;

        }


    };
    //=============================
    //播放音乐
    //m音乐名称，如为bgm则循环播放
    //=============================
    this.playMusic = function(m) {
        if (musicSwitch) {
            if (m == game_music) {
                m.loop = true;

            }
            m.play();

        } else {
            game.sound.stopAll();

        }

    };
    //=============================
    //子弹打中敌机
    //bullet子弹，enemy敌机
    //=============================
    this.bulletHitMiddle = function(bullet, enemy) {
        bullet.kill();
        if (enemy.lives > 1) {
            enemy.lives--;

        } else {
            enemy.animations.add('stopBoom', [0], 10, false);
            if (enemy.key == 'enemySmall') {
                enemy.animations.add('smallBoom', [0, 1], 10, false);
                enemy.animations.play('smallBoom');
                this.playMusic(enemy1_down);
                score = score * 1 + 1;

            } else if (enemy.key == 'enemyMiddle') {
                enemy.animations.add('middleBoom', [0, 1], 10, false);
                enemy.animations.play('middleBoom');
                this.playMusic(enemy2_down);
                score = score * 1 + 2;

            } else if (enemy.key == 'enemyBoss') {
                enemy.animations.add('bossBoom', [0, 1, 2, 3], 10, false);
                enemy.animations.play('bossBoom');
                this.playMusic(enemy3_down);
                score = score * 1 + 3;

            }

            setTimeout(function() {
                enemy.animations.play('stopBoom');
                enemy.kill();

            },
            200);

        }

    }

};
//=============================
//gateWelcome状态，显示关卡数和关卡名称
//=============================
game.States.gateWelcome = function() {
    this.create = function() {
        //背景图
        game.add.tileSprite(0, 0, game.width, game.height, 'background');
        //关卡指示
        game.add.text(80, 200, "歼灭战-" + gateN + "/5", ftStyle);
        setTimeout(function() {
            //指向gate状态
            game.state.start('gate');

        },
        800);

    };

};
//=============================
//gate状态，闯关模式歼灭战程序
//=============================
game.States.gate = function() {
    this.create = function() {
        onGameStart = true;
        //背景
        this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        this.background.autoScroll(0, bgcSpeed + bgcGrowth * gateN);

        game.sound.stopAll();
        this.playMusic(game_music);
        //添加飞机
        this.player = game.add.sprite(game.width / 2 - 35, game.height - 89, 'player');
        //禁止飞机飞出界外
        game.physics.enable([this.player], Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.inputEnabled = true;
        //添加触控
        this.player.input.enableDrag();
        game.physics.arcade.enable(this.player);
        //飞机飞行动画
        this.player.animations.add('fly', [0, 1], 10, true);
        this.player.animations.add('pause', [1]);
        this.player.animations.add('planeBoom', [1, 2], 10, false);
        this.player.animations.play('fly');
        this.player.body.setSize(20, 80, 27, 0);
        //炸弹集
        this.booms = game.add.group();
        this.createArr(this.booms, 20, 'boom');
        //双弹buff集
        this.doubles = game.add.group();
        this.createArr(this.doubles, 20, 'double');
        //子弹集
        this.bullets = game.add.group();
        this.createArr(this.bullets, 100, 'bullet');
        //启动子弹发射
        bulletN = 1;
        this.timer = game.time.events.loop(playerBulletMake - playerBulletMakeGrowth * gateN, this.add_one_bullet, this);
        //分数显示
        this.label_score = game.add.text(70, 5, score.toString(), ftStyle);
        //关卡显示
        this.label_gateN = game.add.text(12, 50, "第 " + gateN + " 关", ftStyle2);
        //炸弹数显示
        this.label_boomNum = game.add.text(240, 5, " X " + bmNum, ftStyle);
        //爆炸按钮
        boomBtn = game.add.button(190, 8, 'boomNum', 
        function() {
            if (!onGamePause) {
                if (bmNum != 0) {
                    onBoom = 1;
                    bmNum--;

                }

            }

        });
        //暂停按钮
        pauseBtn = game.add.button(8, 10, 'pause', 
        function() {
            if (!onGamePause) {
                onGamePause = true;
                onGamePauseF = true;
                game.input.onDown.add(function(e) {
                    var x1 = containueBtn.left;
                    var x2 = containueBtn.left + containueBtn.width;
                    var y1 = containueBtn.top;
                    var y2 = containueBtn.top + containueBtn.height;
                    var x3 = restartBtn.left;
                    var x4 = x3 + restartBtn.width;
                    var y3 = restartBtn.top;
                    var y4 = y3 + restartBtn.height;
                    if (e.x > x1 && e.x < x2 && e.y > y1 && e.y < y2) {
                        this.game.paused = false;
                        onGamePause = false;
                        containueBtn.kill();
                        restartBtn.kill();

                    } else if (e.x > x3 && e.x < x4 && e.y > y3 && e.y < y4) {
                        this.game.paused = false;
                        resetStatus();
                        gateN = 1;
                        game.state.start('gateWelcome');

                    }

                },
                this);
                this.game.paused = true;
                restartBtn = game.add.button(game.width / 2, game.height * 0.9 / 2, 'restart', 
                function() {
                    //重新开始按钮                       
                    });
                containueBtn = game.add.button(game.width / 2, game.height * 0.7 / 2, 'continue', 
                function() {
                    //继续游戏按钮                                         
                    });
                restartBtn.anchor.setTo(0.5, 0.5);
                containueBtn.anchor.setTo(0.5, 0.5);

            }

        });
        //小敌机
        this.enemySmalls = game.add.group();
        this.createEnemys(this.enemySmalls, 30, 'enemySmall');
        //中等敌机
        this.enemyMiddles = game.add.group();
        this.createEnemys(this.enemyMiddles, 20, 'enemyMiddle');
        //boss敌机
        this.enemyBosses = game.add.group();
        this.createEnemys(this.enemyBosses, 10, 'enemyBoss');
        //添加重力感应监听
        window.addEventListener("deviceorientation", this.deviceOrientationListener);

    };
    //=============================
    //刷新函数，检测状态标志字，响应响应状态
    //修改游戏画面文本
    //碰撞检测
    //智能添加敌机
    //按键检测
    //分值监测，满100进入下一关
    //=============================
    this.update = function() {
        //分值监测
        if (score >= 100 * gateN && !onGateOver) {
            onBoom = 1;
            onGateOver = true;
            onGamePause = true;
            setTimeout(function() {
                onGateOver = false;
                onGamePause = false;
                game.state.start('bossWelcome');

            },
            1000);

        }
        if (score > 100 * gateN) {
            score = 100 * gateN;

        }
        this.label_boomNum.text = " X " + bmNum;
        this.label_score.text = score;
        //全屏爆炸检测
        if (onBoom == 1) {
            this.allBoom();
            onBoom = 0;

        }
        //游戏暂停后继续检测
        if (onGameContainue) {
            this.containueGame();
            onGameContainue = false;

        }
        //游戏暂停检测
        if (onGamePause) {
            if (onGamePauseF) {
                this.pauseGame();
                onGamePauseF = false;

            }

        } else {
            if (!game.device.desktop) {
                //响应重力感应
                this.player.body.velocity.x = gammadirection * 10;
                this.player.body.velocity.y = betadirection * 10;

            } else {
                //键盘操作
                if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                    this.player.body.velocity.x = -200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    this.player.body.velocity.x = 200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                    this.player.body.velocity.y = -200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                    this.player.body.velocity.y = 200;

                } else {
                    this.player.body.velocity.x = 0;
                    this.player.body.velocity.y = 0;

                }

            }
            //随机生成全屏爆炸物
            if (percentDetermination(0.001)) {
                this.add_boom();

            }
            //随机生成双弹buff
            if (percentDetermination(0.001) && bulletN < 5) {
                this.add_double();

            }
            //随机生成敌机并控制屏幕敌机数量
            if (percentDetermination(enemySmallMake + enemySmallMakeGrowth * gateN) && this.enemySmalls.total < 10) {
                this.add_enemy(this.enemySmalls, enemySmallSpeed + enemySmallSpeedGrowth * gateN, 35, 24, enemySmallHealthPoint + enemySmallHealthPointGrowth * gateN);

            }
            if (percentDetermination(enemyMiddleMake + enemyMiddleMakeGrowth * gateN) && this.enemyMiddles.total < 4) {
                this.add_enemy(this.enemyMiddles, enemyMiddleSpeed + enemyMiddleSpeedGrowth * gateN, 47, 61, enemyMiddleHealthPoint + enemyMiddleHealthPointGrowth * gateN);

            }
            if (percentDetermination(enemyBossMake + enemyBossMakeGrowth * gateN) && this.enemyBosses.total < 1) {
                this.add_enemy(this.enemyBosses, enemyBossSpeed + enemyBossSpeedGrowth * gateN, 101, 149, enemyBossHealthPoint + enemyBossHealthPointGrowth * gateN);

            }

        }
        //全屏爆炸停止检测
        if (onStopBoom) {
            this.stopBoom(this.enemySmalls);
            this.stopBoom(this.enemyMiddles);
            this.stopBoom(this.enemyBosses);
            if (onGameOver) {
                this.player.kill();

            }
            onStopBoom = 0;

        }

        //碰撞检测部分player与buff
        this.game.physics.arcade.overlap(this.player, this.booms, this.boomplus, null, this);
        this.game.physics.arcade.overlap(this.player, this.doubles, this.doubleplus, null, this);
        //bullet与enemy
        this.game.physics.arcade.overlap(this.bullets, this.enemySmalls, this.bulletHitMiddle, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyMiddles, this.bulletHitMiddle, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyBosses, this.bulletHitMiddle, null, this);
        //player与enemy
        this.game.physics.arcade.overlap(this.player, this.enemySmalls, this.gameOver, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyMiddles, this.gameOver, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyBosses, this.gameOver, null, this);
        //标识提前
        game.world.bringToTop(boomBtn);
        game.world.bringToTop(pauseBtn);
        game.world.bringToTop(this.label_boomNum);
        game.world.bringToTop(this.label_score);
        game.world.bringToTop(this.label_gateN);

    };
    //发射单炮
    this.add_one_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射双炮
    this.add_two_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射三炮
    this.add_three_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射四炮
    this.add_four_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 8, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 8, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 24, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 24, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射五炮
    this.add_five_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 13, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 13, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 26, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 26, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //添加双弹buff
    this.add_double = function() {
        if (!onGamePause) {
            var posX = Math.floor(Math.random() * 300);
            this.double = this.doubles.getFirstDead();
            this.double.reset(posX, 0);
            this.double.body.velocity.y = 200;

        }

    };
    //添加爆炸物
    this.add_boom = function() {
        if (!onGamePause) {
            var posX = Math.floor(Math.random() * 300);
            this.boom = this.booms.getFirstDead();
            this.boom.reset(posX, 0);
            this.boom.body.velocity.y = 200;

        }

    };
    //=============================
    //可用炸弹数增加
    //player我方飞机，boom炸弹
    //=============================
    this.boomplus = function(player, boom) {
        this.playMusic(get_bomb);
        boom.kill();
        bmNum++;
        this.label_boomNum.text = " X " + bmNum;

    };
    //=============================
    //并行子弹增加
    //player我方飞机，double双弹元素
    //=============================
    this.doubleplus = function(player, double) {
        //增加双弹
        this.playMusic(get_double_laser);
        double.kill();
        switch (bulletN) {
            case 1:
            this.timer.callback = this.add_two_bullet;
            break;
            case 2:
            this.timer.callback = this.add_three_bullet;
            break;
            case 3:
            this.timer.callback = this.add_four_bullet;
            break;
            case 4:
            this.timer.callback = this.add_five_bullet;
            break;
            default:
            break;

        }
        bulletN++;

    };
    //重力检测
    this.deviceOrientationListener = function(event) {
        betadirection = Math.round(event.beta);
        gammadirection = Math.round(event.gamma);

    };
    //全屏爆炸
    this.allBoom = function() {
        this.playMusic(use_bomb);
        this.everyBoom(this.enemySmalls);
        this.everyBoom(this.enemyMiddles);
        this.everyBoom(this.enemyBosses);
        setTimeout(function() {
            onStopBoom = 1;

        },
        200);

    };
    //=============================
    //引爆每架敌机，根据敌机增加分数
    //a敌机类型
    //=============================
    this.everyBoom = function(a) {
        //引爆每架敌机
        if (a.children[0].key == 'enemySmall') {
            for (var i = 0; i < a.children.length; i++) {
                a.children[i].animations.add('stopBoom', [0], 10, false);
                if (a.children[i].alive) {
                    a.children[i].animations.add('sBoom', [0, 1], 10, false);
                    a.children[i].animations.play('sBoom');

                }

            }
            score += a.countLiving();

        } else if (a.children[0].key == 'enemyMiddle') {
            for (i = 0; i < a.children.length; i++) {
                a.children[i].animations.add('stopBoom', [0], 10, false);
                if (a.children[i].alive) {
                    a.children[i].animations.add('mBoom', [0, 1], 10, false);
                    a.children[i].animations.play('mBoom');

                }

            }
            score += a.countLiving() * 2;

        } else if (a.children[0].key == 'enemyBoss') {
            for (i = 0; i < a.children.length; i++) {
                a.children[i].animations.add('stopBoom', [0], 10, false);
                if (a.children[i].alive) {
                    a.children[i].animations.add('bBoom', [0, 1, 2, 3], 10, false);
                    a.children[i].animations.play('bBoom');

                }

            }
            score += a.countLiving() * 3;

        }

    };
    //=============================
    //爆炸结束，清除敌机
    //a敌机类型
    //=============================
    this.stopBoom = function(a) {
        for (var i = 0; i < a.children.length; i++) {
            a.children[i].animations.play('stopBoom');
            a.children[i].kill();

        };

    };
    //=============================
    //添加敌机
    //enemyType敌机类型，v速度，picWidth, picHeigth 敌机狂傲，life敌机生命值
    //=============================
    this.add_enemy = function(enemyType, v, picWidth, picHeigth, life) {
        this.enemy = enemyType.getFirstDead();
        this.enemy.reset(rnd(0, game.width - picWidth), -1 * picHeigth);
        this.enemy.body.velocity.y = v;
        this.enemy.lives = life;

    };
    //=============================
    //增加数组元素
    //name数组名称，number数组长度，pic元素原型
    //=============================
    this.createArr = function(name, number, pic) {
        name.enableBody = true;
        name.physicsBodyType = Phaser.Physics.ARCADE;
        name.createMultiple(number, pic);
        name.setAll('checkWorldBounds', true);
        name.setAll('outOfBoundsKill', true);

    };
    //=============================
    //增加敌机集
    //enemyType敌机类型，number数组长度，pic敌机原型
    //=============================
    this.createEnemys = function(enemyType, number, pic) {
        enemyType.enableBody = true;
        enemyType.physicsBodyType = Phaser.Physics.ARCADE;
        enemyType.createMultiple(number, pic);
        enemyType.setAll('checkWorldBounds', true);
        enemyType.setAll('outOfBoundsKill', true);

    };
    //游戏结束
    this.gameOver = function() {
        onGameStart = false;
        onGameOver = true;
        onGamePause = true;
        onGamePauseF = true;

        this.gameOverAllBoom();
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);

        }
        this.playMusic(game_over);
        //分数面板
        this.gameOverShow = game.add.sprite(52, game.height * 0.5 / 2, 'gateFail');
        //重新开始按钮
        overRestartBtn = game.add.button(game.width / 2, game.height * 0.85 / 2, 'restart', 
        function() {
            resetStatus();
            gateN = 1;
            game.state.start('gateWelcome');

        });
        overRestartBtn.anchor.setTo(0.5, 0.5);
        var onceShowRank = 1;
        //显示排行榜按钮
        returnM = game.add.button(game.width / 2, game.height * 1.03 / 2, 'returnMenu', 
        function() {
            resetStatus();
            gateN = 1;
            game.state.start('menu');

        });
        returnM.anchor.setTo(0.5, 0.5);

    };
    //游戏结束时的全屏爆炸
    this.gameOverAllBoom = function() {
        if (!onGameOverF) {
            this.gameOverEveryBoom(this.enemySmalls);
            this.gameOverEveryBoom(this.enemyMiddles);
            this.gameOverEveryBoom(this.enemyBosses);
            this.player.animations.play("planeBoom");

            onGameOverF = true;

        }
        setTimeout(function() {
            onStopBoom = 1;

        },
        200);

    };
    //=============================
    //游戏结束时每一个元素爆炸
    //a敌机类型
    //=============================
    this.gameOverEveryBoom = function(a) {
        for (var i = 0; i < a.children.length; i++) {
            a.children[i].animations.add('stopBoom', [0], 10, false);
            if (a.children[i].key == 'enemySmall') {
                a.children[i].animations.add('sBoom', [0, 1], 10, false);
                a.children[i].animations.play('sBoom');

            } else if (a.children[i].key == 'enemyMiddle') {
                a.children[i].animations.add('mBoom', [0, 1], 10, false);
                a.children[i].animations.play('mBoom');

            } else if (a.children[i].key == 'enemyBoss') {
                a.children[i].animations.add('bBoom', [0, 1, 2, 3], 10, false);
                a.children[i].animations.play('bBoom');

            }

        }

    };
    //游戏暂停
    this.pauseGame = function() {
        if (!pauseGameOnce) {
            pauseGameOnce = 1;
            if (!onGameOver) {
                this.player.animations.play('pause');

            } else {
                this.player.animations.play('planeBoom');

            }
            pauseGameOnce = 0;

        }

    };
    //游戏继续
    this.containueGame = function() {
        if (!containueGameOnce) {
            containueGameOnce = 1;
            onGamePause = false;
            containueGameOnce = 0;

        }


    };
    //=============================
    //播放音乐
    //m音乐名称，如为bgm则循环播放
    //=============================
    this.playMusic = function(m) {
        if (musicSwitch) {
            if (m == game_music) {
                m.loop = true;

            }
            m.play();

        }

    };
    //=============================
    //子弹打中敌机
    //bullet子弹，enemy敌机
    //=============================
    this.bulletHitMiddle = function(bullet, enemy) {
        bullet.kill();
        if (enemy.lives > 1) {
            enemy.lives--;

        } else {
            enemy.animations.add('stopBoom', [0], 10, false);
            if (enemy.key == 'enemySmall') {
                enemy.animations.add('smallBoom', [0, 1], 10, false);
                enemy.animations.play('smallBoom');
                this.playMusic(enemy1_down);
                score = score * 1 + 1;

            } else if (enemy.key == 'enemyMiddle') {
                enemy.animations.add('middleBoom', [0, 1], 10, false);
                enemy.animations.play('middleBoom');
                this.playMusic(enemy2_down);
                score = score * 1 + 2;

            } else if (enemy.key == 'enemyBoss') {
                enemy.animations.add('bossBoom', [0, 1, 2, 3], 10, false);
                enemy.animations.play('bossBoom');
                this.playMusic(enemy3_down);
                score = score * 1 + 3;

            }

            setTimeout(function() {
                enemy.animations.play('stopBoom');
                enemy.kill();

            },
            200);

        }

    }

};
//=============================
//bossWelcome状态，显示关卡数和关卡名称
//=============================
game.States.bossWelcome = function() {
    this.create = function() {
        //背景图
        game.add.tileSprite(0, 0, game.width, game.height, 'background');
        //关卡指示
        game.add.text(80, 200, "Boss战-" + gateN + "/5", ftStyle);
        setTimeout(function() {
            //指向boss状态
            game.state.start('boss');

        },
        800);

    };

};
//=============================
//boss状态，闯关模式boss战程序
//=============================
game.States.boss = function() {
    this.create = function() {
        onGameStart = true;
        //背景图
        this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        this.background.autoScroll(0, bgcSpeed + bgcGrowth * gateN);
        //添加飞机
        this.player = game.add.sprite(game.width / 2 - 35, game.height - 89, 'player');
        //禁止飞机飞出界外
        game.physics.enable([this.player], Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.inputEnabled = true;
        //添加触控
        this.player.input.enableDrag();
        game.physics.arcade.enable(this.player);
        //飞机飞行动画
        this.player.animations.add('fly', [0, 1], 10, true);
        this.player.animations.add('pause', [1]);
        this.player.animations.add('planeBoom', [1, 2], 10, false);
        this.player.animations.play('fly');
        this.player.body.setSize(20, 80, 27, 0);
        //添加boss
        this.boss = game.add.sprite(150, 5, 'boss' + gateN);
        //禁止boss飞出界外
        game.physics.enable([this.boss], Phaser.Physics.ARCADE);
        this.boss.body.collideWorldBounds = true;
        game.physics.arcade.enable(this.boss);
        //飞机飞行动画
        this.boss.animations.add('bossFly', [0], 10, true);
        this.boss.animations.add('bigBossBoom', [0, 1, 2, 3], 10, false);
        this.boss.animations.play('bossFly');
        this.boss.body.velocity.x = bossV + bossVGrowth * gateN;
        bossHpOld = bossH + bossHGrowth * gateN;
        bossHP = bossHpOld;
        //炸弹集
        this.booms = game.add.group();
        this.createArr(this.booms, 20, 'boom');
        //双弹buff集
        this.doubles = game.add.group();
        this.createArr(this.doubles, 20, 'double');
        //子弹集
        this.bullets = game.add.group();
        this.createArr(this.bullets, 100, 'bullet');
        //boss子弹集
        this.bossbullets = game.add.group();
        this.createArr(this.bossbullets, 100, 'boss_bullet');

        switch (gateN) {
            case 1:
        case 2:
            this.bossBullet = this.add_one_bossBullet;
            break;
            case 3:
        case 4:
            this.bossBullet = this.add_two_bossBullet;
            break;
            case 5:
            this.bossBullet = this.add_three_bossBullet;
            break;
            default:
            break;

        }
        bulletN = 1;
        //启动子弹发射
        this.timer = game.time.events.loop(playerBulletMake - playerBulletMakeGrowth * gateN, this.add_one_bullet, this);
        this.timerB = game.time.events.loop(bossBulletMake - bossBulletMakeGrowth * gateN, this.bossBullet, this);
        //分数显示
        this.label_score = game.add.text(70, 5, score.toString(), ftStyle);
        //关卡显示 
        this.label_gateN = game.add.text(12, 50, "第 " + gateN + " 关", ftStyle2);
        //血量
        this.label_hp = game.add.text(190, 50, "BossHp:", ftStyle2);
        this.label_hps = game.add.text(305, 52, bossHP, ftStyle3);
        this.hpbg = game.add.sprite(287, 50, 'hpbg');
        this.hpslide = game.add.sprite(289, 52, 'hp');
        //炸弹数显示
        this.label_boomNum = game.add.text(240, 5, " X " + bmNum, ftStyle);
        //爆炸按钮
        boomBtn = game.add.button(190, 8, 'boomNum', 
        function() {
            if (!onGamePause) {
                if (bmNum != 0) {
                    onBoom = 1;
                    bmNum--;

                }

            }

        });
        //暂停按钮
        pauseBtn = game.add.button(8, 10, 'pause', 
        function() {
            if (!onGamePause) {
                onGamePause = true;
                onGamePauseF = true;
                game.input.onDown.add(function(e) {
                    var x1 = containueBtn.left;
                    var x2 = containueBtn.left + containueBtn.width;
                    var y1 = containueBtn.top;
                    var y2 = containueBtn.top + containueBtn.height;
                    var x3 = restartBtn.left;
                    var x4 = x3 + restartBtn.width;
                    var y3 = restartBtn.top;
                    var y4 = y3 + restartBtn.height;
                    if (e.x > x1 && e.x < x2 && e.y > y1 && e.y < y2) {
                        this.game.paused = false;
                        onGamePause = false;
                        containueBtn.kill();
                        restartBtn.kill();

                    } else if (e.x > x3 && e.x < x4 && e.y > y3 && e.y < y4) {
                        this.game.paused = false;
                        resetStatus();
                        gateN = 1;
                        game.state.start('gateWelcome');

                    }

                },
                this);
                this.game.paused = true;
                //重新开始按钮  
                restartBtn = game.add.button(game.width / 2, game.height * 0.9 / 2, 'restart', 
                function() {
                    });
                //继续游戏按钮       
                containueBtn = game.add.button(game.width / 2, game.height * 0.7 / 2, 'continue', 
                function() {
                    });
                restartBtn.anchor.setTo(0.5, 0.5);
                containueBtn.anchor.setTo(0.5, 0.5);

            }

        });
        //小敌机
        this.enemySmalls = game.add.group();
        this.createEnemys(this.enemySmalls, 30, 'enemySmall');
        //添加重力感应监听
        window.addEventListener("deviceorientation", this.deviceOrientationListener);

    };
    //=============================
    //刷新函数，检测状态标志字，响应响应状态
    //修改游戏画面文本
    //碰撞检测
    //智能添加敌机
    //按键检测
    //=============================
    this.update = function() {
        //闯关成功检测
        if (onGateSuccess) {
            onGateSuccess = 0;
            this.gateSuccess();

        }
        //boss撞墙检测
        if (this.boss.x >= game.width - this.boss.width) {
            this.boss.body.velocity.x = -bossV;

        } else if (this.boss.x <= 0) {
            this.boss.body.velocity.x = bossV;

        }
        if (score > 100 * gateN) {
            score = 100 * gateN;

        }
        this.hpslide.scale.x = bossHP / bossHpOld;
        this.label_boomNum.text = " X " + bmNum;
        this.label_score.text = score;
        //全屏爆炸检测
        if (onBoom == 1) {
            this.allBoom();
            onBoom = 0;

        }
        //游戏暂停后继续检测
        if (onGameContainue) {
            this.containueGame();
            onGameContainue = false;

        }
        //游戏暂停检测
        if (onGamePause) {
            if (onGamePauseF) {
                this.pauseGame();
                onGamePauseF = false;

            }

        } else {
            if (!game.device.desktop) {
                //响应重力感应
                this.player.body.velocity.x = gammadirection * 10;
                this.player.body.velocity.y = betadirection * 10;

            } else {
                //键盘操作
                if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                    this.player.body.velocity.x = -200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    this.player.body.velocity.x = 200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                    this.player.body.velocity.y = -200;

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                    this.player.body.velocity.y = 200;

                } else {
                    this.player.body.velocity.x = 0;
                    this.player.body.velocity.y = 0;

                }

            }
            //随机生成全屏爆炸物
            if (percentDetermination(0.001)) {
                this.add_boom();

            }
            //随机生成双弹buff
            if (percentDetermination(0.001) && bulletN < 5) {
                this.add_double();

            }
            //随机生成敌机并控制屏幕敌机数量
            if (percentDetermination(onBossGateSmallMake + onBossGateSmallMakeGrowth * gateN) && this.enemySmalls.total < 5) {
                this.add_enemy(this.enemySmalls, onBossGateSmallSpeed + onBossGateSmallSpeedGrowth * gateN, 35, 24, onBossGateSmallHealth + onBossGateSmallHealthGrowth * gateN);

            }


        }
        //全屏爆炸停止检测
        if (onStopBoom) {
            this.stopBoom(this.enemySmalls);
            if (onGameOver) {
                this.player.kill();

            }
            onStopBoom = 0;

        }
        //碰撞检测部分player与buff
        this.game.physics.arcade.overlap(this.player, this.booms, this.boomplus, null, this);
        this.game.physics.arcade.overlap(this.player, this.doubles, this.doubleplus, null, this);
        //bullet与enemy
        this.game.physics.arcade.overlap(this.bullets, this.enemySmalls, this.bulletHitMiddle, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyMiddles, this.bulletHitMiddle, null, this);
        this.game.physics.arcade.overlap(this.bullets, this.enemyBosses, this.bulletHitMiddle, null, this);
        //player与enemy
        this.game.physics.arcade.overlap(this.player, this.enemySmalls, this.gameOver, null, this);
        //player与boss
        this.game.physics.arcade.overlap(this.player, this.boss, this.gameOver, null, this);
        //player与bossBullets
        this.game.physics.arcade.overlap(this.player, this.bossbullets, this.gameOver, null, this);
        //boss与bullets 
        this.game.physics.arcade.overlap(this.boss, this.bullets, this.bossHurt, null, this);
        //标识提前
        game.world.bringToTop(boomBtn);
        game.world.bringToTop(pauseBtn);
        game.world.bringToTop(this.label_boomNum);
        game.world.bringToTop(this.label_score);
        game.world.bringToTop(this.label_gateN);
        game.world.bringToTop(this.label_hp);
        game.world.bringToTop(this.hpbg);
        game.world.bringToTop(this.hpslide);
        game.world.bringToTop(this.label_hps);

    };
    //boss发射单炮
    this.add_one_bossBullet = function() {
        if (!onGamePause) {
            this.bossbullet = this.bossbullets.getFirstDead();
            this.bossbullet.reset(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height);
            this.bossbullet.body.velocity.y = bossBulletSpeed + bossBulletSpeedGrowth * gateN;

        }

    };
    //boss发射双炮
    this.add_two_bossBullet = function() {
        if (!onGamePause) {
            this.bossbullet = this.bossbullets.getFirstDead();
            this.bossbullet.reset(this.boss.x + this.boss.width / 2 - 15, this.boss.y + this.boss.height);
            this.bossbullet.body.velocity.y = bossBulletSpeed + bossBulletSpeedGrowth * gateN;

            this.bossbullet = this.bossbullets.getFirstDead();
            this.bossbullet.reset(this.boss.x + this.boss.width / 2 + 15, this.boss.y + this.boss.height);
            this.bossbullet.body.velocity.y = bossBulletSpeed + bossBulletSpeedGrowth * gateN;

        }

    };
    //boss发射三炮
    this.add_three_bossBullet = function() {
        if (!onGamePause) {
            this.bossbullet = this.bossbullets.getFirstDead();
            this.bossbullet.reset(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height);
            this.bossbullet.body.velocity.y = bossBulletSpeed + bossBulletSpeedGrowth * gateN;

            this.bossbullet = this.bossbullets.getFirstDead();
            this.bossbullet.reset(this.boss.x + this.boss.width / 2 - 25, this.boss.y + this.boss.height);
            this.bossbullet.body.velocity.y = bossBulletSpeed + bossBulletSpeedGrowth * gateN;

            this.bossbullet = this.bossbullets.getFirstDead();
            this.bossbullet.reset(this.boss.x + this.boss.width / 2 + 25, this.boss.y + this.boss.height);
            this.bossbullet.body.velocity.y = bossBulletSpeed + bossBulletSpeedGrowth * gateN;

        }

    };
    //发射单炮
    this.add_one_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射双炮
    this.add_two_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射三炮
    this.add_three_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 15, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射四炮
    this.add_four_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 8, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 8, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 24, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 24, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //发射五炮
    this.add_five_bullet = function() {
        if (!onGamePause) {
            this.playMusic(bullet_on);
            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 13, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 13, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 - 26, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

            this.bullet = this.bullets.getFirstDead();
            this.bullet.reset(this.player.x + 33 + 26, this.player.y);
            this.bullet.body.velocity.y = -(playerBulletSpeed + playerBulletSpeedGrowth * gateN);

        }

    };
    //添加双弹buff
    this.add_double = function() {
        if (!onGamePause) {
            var posX = Math.floor(Math.random() * 300);
            this.double = this.doubles.getFirstDead();
            this.double.reset(posX, 0);
            this.double.body.velocity.y = 200;

        }

    };
    //添加爆炸物
    this.add_boom = function() {
        if (!onGamePause) {
            var posX = Math.floor(Math.random() * 300);
            this.boom = this.booms.getFirstDead();
            this.boom.reset(posX, 0);
            this.boom.body.velocity.y = 200;

        }

    };
    //=============================
    //可用炸弹数增加
    //player我方飞机，boom炸弹
    //=============================
    this.boomplus = function(player, boom) {
        this.playMusic(get_bomb);
        boom.kill();
        bmNum++;
        this.label_boomNum.text = " X " + bmNum;

    };
    //=============================
    //并行子弹增加
    //player我方飞机，double双弹元素
    //=============================
    this.doubleplus = function(player, double) {
        this.playMusic(get_double_laser);
        double.kill();
        switch (bulletN) {
            case 1:
            this.timer.callback = this.add_two_bullet;
            break;
            case 2:
            this.timer.callback = this.add_three_bullet;
            break;
            case 3:
            this.timer.callback = this.add_four_bullet;
            break;
            case 4:
            this.timer.callback = this.add_five_bullet;
            break;
            default:
            break;

        }
        bulletN++;

    };
    //重力检测
    this.deviceOrientationListener = function(event) {
        betadirection = Math.round(event.beta);
        gammadirection = Math.round(event.gamma);

    };
    //全屏爆炸
    this.allBoom = function() {
        this.playMusic(use_bomb);
        this.everyBoom(this.enemySmalls);
        setTimeout(function() {
            onStopBoom = 1;

        },
        200);

    };
    //=============================
    //引爆每架敌机，根据敌机增加分数
    //a敌机类型
    //=============================
    this.everyBoom = function(a) {
        if (a.children[0].key == 'enemySmall') {
            for (var i = 0; i < a.children.length; i++) {
                a.children[i].animations.add('stopBoom', [0], 10, false);
                if (a.children[i].alive) {
                    a.children[i].animations.add('sBoom', [0, 1], 10, false);
                    a.children[i].animations.play('sBoom');

                }

            }

        }

    };
    //=============================
    //爆炸结束，清除敌机
    //a敌机类型
    //=============================
    this.stopBoom = function(a) {
        for (var i = 0; i < a.children.length; i++) {
            a.children[i].animations.play('stopBoom');
            a.children[i].kill();

        };

    };
    //=============================
    //添加敌机
    //enemyType敌机类型，v速度，picWidth, picHeigth 敌机宽高，life敌机生命值
    //=============================
    this.add_enemy = function(enemyType, v, picWidth, picHeigth, life) {
        //添加敌机
        this.enemy = enemyType.getFirstDead();
        this.enemy.reset(rnd(0, game.width - picWidth), -1 * picHeigth);
        this.enemy.body.velocity.y = v;
        this.enemy.lives = life;

    };
    //=============================
    //增加敌机集
    //enemyType敌机类型，number数组长度，pic敌机原型
    //=============================
    this.createEnemys = function(enemyType, number, pic) {
        enemyType.enableBody = true;
        enemyType.physicsBodyType = Phaser.Physics.ARCADE;
        enemyType.createMultiple(number, pic);
        enemyType.setAll('checkWorldBounds', true);
        enemyType.setAll('outOfBoundsKill', true);

    };
    //=============================
    //增加数组元素
    //name数组名称，number数组长度，pic元素原型
    //=============================
    this.createArr = function(name, number, pic) {
        name.enableBody = true;
        name.physicsBodyType = Phaser.Physics.ARCADE;
        name.createMultiple(number, pic);
        name.setAll('checkWorldBounds', true);
        name.setAll('outOfBoundsKill', true);

    };
    //游戏结束
    this.gameOver = function() {
        onGameStart = false;
        onGameOver = true;
        onGamePause = true;
        onGamePauseF = true;

        this.gameOverAllBoom();
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);

        }
        this.playMusic(game_over);
        //分数面板
        this.gameOverShow = game.add.sprite(52, game.height * 0.5 / 2, 'gateFail');
        //重新开始按钮
        overRestartBtn = game.add.button(game.width / 2, game.height * 0.85 / 2, 'restart', 
        function() {
            resetStatus();
            gateN = 1;
            game.state.start('gateWelcome');

        });
        overRestartBtn.anchor.setTo(0.5, 0.5);
        var onceShowRank = 1;
        //显示排行榜按钮
        returnM = game.add.button(game.width / 2, game.height * 1.03 / 2, 'returnMenu', 
        function() {
            resetStatus();
            gateN = 1;
            game.state.start('menu');

        });
        returnM.anchor.setTo(0.5, 0.5);

    };
    //游戏结束
    this.gateSuccess = function() {
        onGameStart = false;
        onGameOver = true;
        onGamePause = true;
        onGamePauseF = true;

        this.gameOverAllBoom();
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);

        }
        this.playMusic(game_over);
        //分数面板
        this.gameOverShow = game.add.sprite(52, game.height * 0.5 / 2, 'gateOver');
        //重新开始按钮
        overRestartBtn = game.add.button(game.width / 2, game.height * 0.85 / 2, 'restart', 
        function() {
            resetStatus();
            gateN = 1;
            game.state.start('gateWelcome');

        });
        overRestartBtn.anchor.setTo(0.5, 0.5);
        var onceShowRank = 1;
        //显示排行榜按钮
        returnM = game.add.button(game.width / 2, game.height * 1.03 / 2, 'returnMenu', 
        function() {
            resetStatus();
            gateN = 1;
            game.state.start('menu');

        });
        returnM.anchor.setTo(0.5, 0.5);

    };
    //=================================
    //boss受伤扣血
    //=================================
    this.bossHurt = function(boss, bullet) {
        bullet.kill();
        bossHP--;
        if (bossHP <= 0) {
            bossHP = 0;
            this.bossbullets.removeAll();
            this.boss.play('bigBossBoom');
            if (!onGateOver) {
                onBoom = 1;
                onGateOver = true;
                onGamePause = true;
                setTimeout(function() {
                    onGateOver = false;
                    onGamePause = false;
                    gateN++;
                    if (gateN == 6) {
                        onGateSuccess = 1;

                    } else {
                        game.state.start('gateWelcome');

                    }

                },
                700);

            }

        }
        this.label_hps.text = bossHP;

    };
    //游戏结束时的全屏爆炸
    this.gameOverAllBoom = function() {
        if (!onGameOverF) {
            this.gameOverEveryBoom(this.enemySmalls);
            this.player.animations.play("planeBoom");
            onGameOverF = true;

        }
        setTimeout(function() {
            onStopBoom = 1;

        },
        200);

    };
    //=============================
    //游戏结束时每一个元素爆炸
    //a敌机类型
    //=============================
    this.gameOverEveryBoom = function(a) {
        for (var i = 0; i < a.children.length; i++) {
            a.children[i].animations.add('stopBoom', [0], 10, false);
            if (a.children[i].key == 'enemySmall') {
                a.children[i].animations.add('sBoom', [0, 1], 10, false);
                a.children[i].animations.play('sBoom');

            }

        }
        this.boss.kill();

    };
    //游戏暂停
    this.pauseGame = function() {
        if (!pauseGameOnce) {
            pauseGameOnce = 1;
            if (!onGameOver) {
                this.player.animations.play('pause');

            } else {
                this.player.animations.play('planeBoom');

            }
            pauseGameOnce = 0;

        }

    };
    //游戏继续
    this.containueGame = function() {
        if (!containueGameOnce) {
            containueGameOnce = 1;
            onGamePause = false;
            containueGameOnce = 0;

        }


    };
    //=============================
    //播放音乐
    //m音乐名称，如为bgm则循环播放
    //=============================
    this.playMusic = function(m) {
        if (musicSwitch) {
            if (m == game_music) {
                m.loop = true;

            }
            m.play();

        } else {
            game.sound.stopAll();

        }

    };
    //=============================
    //子弹打中敌机
    //bullet子弹，enemy敌机
    //=============================
    this.bulletHitMiddle = function(bullet, enemy) {
        bullet.kill();
        if (enemy.lives > 1) {
            enemy.lives--;

        } else {
            enemy.animations.add('stopBoom', [0], 10, false);
            if (enemy.key == 'enemySmall') {
                enemy.animations.add('smallBoom', [0, 1], 10, false);
                enemy.animations.play('smallBoom');
                this.playMusic(enemy1_down);

            }
            setTimeout(function() {
                enemy.animations.play('stopBoom');
                enemy.kill();

            },
            200);

        }

    }

};
//======================
//生成从a到b的随机数
//a左侧，b右侧
//======================
function rnd(a, b) {
    return a + Math.floor(Math.random() * (b - a));

}
//======================
//根据百分比获取 true  false
//======================
function percentDetermination(v) {
    return Math.random() < v ? true: false;

}
//======================
//排行榜函数
//a排行榜所在位置
//使用ajax实现，jsonp方式解决跨域，php+mysql处理数据
//======================
function showRank(a) {
    var rst = new Object();
    $.ajax({
        url: "http://xingguang123.sinaapp.com/plane.php?name=" + username + "&score=" + bestScore,
        dataType: 'jsonp',
        success: function(json) {
            rst = {
                top: json[0],
                rank: json[1]

            };
            if (!onGameStart) {
                if (a == 1) {
                    label_rank_top = game.add.text(200, 100, rst.top, ftStyle1);
                    //分数显示
                    label_rank_best = game.add.text(200, 136, bestScore, ftStyle1);
                    //分数显示
                    label_rank_m = game.add.text(200, 170, rst.rank, ftStyle1);
                    //分数显示

                } else if (a == 2) {
                    label_rank_top = game.add.text(200, 386, rst.top, ftStyle1);
                    //分数显示
                    label_rank_best = game.add.text(200, 422, bestScore, ftStyle1);
                    //分数显示
                    label_rank_m = game.add.text(200, 458, rst.rank, ftStyle1);
                    //分数显示

                }

            }

        },
        error: function() {
            alert("Error");
            console.log(this.url);

        },

    });

}
//重置游戏状态
function resetStatus() {
    onGamePause = false;
    onGamePauseF = false;
    onGameContainue = false;
    onGameOverF = false;
    onGameOver = false;
    pauseGameOnce = false;
    containueGameOnce = false;
    score = 0;
    bmNum = "1";
    onBoom = 0;
    bulletN = 1;
    vSmall = 50;
    vMiddle = 30;
    vBoss = 20;

}
//添加游戏状态字面量
game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('menu', game.States.menu);
game.state.add('gateWelcome', game.States.gateWelcome);
game.state.add('gate', game.States.gate);
game.state.add('bossWelcome', game.States.bossWelcome);
game.state.add('boss', game.States.boss);
game.state.add('play', game.States.play);
//启动游戏
game.state.start('boot');