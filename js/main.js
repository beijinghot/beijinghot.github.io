$(function(){
	var doc = Zepto('body');
	var pst = 1;//当前视觉视口显示的页数
	var onMouseWheel = 0;
	var pageWidth = 1003; 
	const colors = ["#33B5E5","#0099CC","#AA66CC","#9933CC","#99CC00","#669900","#FFBB33","#FF8800","#FF4444","#CC0000"];
	var people =[
	["images/xingguang.jpg",
				   "姓名：邢光",
				   "年龄：20岁",
				   "职业：学生",
				   "爱好：篮球",
				   "大学：东北师范大学",
				   "balabala:balabala",
				   "balabala:balabala",
				   "balabala:balabala",
				   "balabala:balabala"
	],
	["images/xingguang.jpg",
				   "姓名：邢光",
				   "年龄：20岁",
				   "职业：学生",
				   "爱好：篮球",
				   "大学：东北师范大学",
				   "balabala:balabala",
				   "balabala:balabala",
				   "balabala:balabala",
				   "balabala:balabala",
				   "balabala:balabala",
				   "balabala:balabala",
				   "balabala:balabala"
	]
	];
	//添加移动端支持
	document.body.addEventListener("touchstart", function(event) {
		event.preventDefault();
	},false);
	doc.on('swipeUp',function(){
		slideToNext();
	});
	doc.on('swipeDown', function(){
		slideToPro();
	});
	window.addEventListener("resize", resize , false);
	//初始化页面
	$(".btn-1").css("background-color","black");
	function getCbLeft(){
		var	windowWidth = $(window).width(); 
		var cbWidth = $(".centerBox").width();
		var cbLeft = (windowWidth - cbWidth - 20)/2>0?(windowWidth - cbWidth)/2:0;
		return cbLeft;
	}
	var cbLeft = getCbLeft();
	$(".centerBox").css("left",cbLeft+10);
	var cbWidth = $(".centerBox").width();
	if(cbLeft == 0){
		$(".centerBox").css("width",$(window).width()-20);
	}else{
		$(".centerBox").css("width",cbWidth-20);
	}
	$(".centerBox").css("height",$(window).height()*0.8);
	$(".centerBox").css("top",$(window).height()*0.1);
	
	function resize(){
		var cbWidth = $(".centerBox").css("width");
		var cbLeft = getCbLeft();
		if($(window).width() < pageWidth){
			$(".centerBox").css("width",$(window).width()-20);
		}else{
			$(".centerBox").css("width",pageWidth-20);
		}
		$(".centerBox").css("left",cbLeft+10);
		$(".centerBox").css("top",$(window).height()*0.1);
		$(".centerBox").css("height",$(window).height()*0.8);
	}

	//添加简介内容
	for(var i=0;i<people.length;i++){
		var m = i + 1;
		var bgcolorNum = Math.floor(Math.random()*10);
		$(".cb-"+m).append("<div class='cfloat' style='background-color:"+colors[bgcolorNum]+";text-align:center;'><img height='100%' src='"+people[i][0]+"' /></div>");
		for (var j = 1; j < people[i].length; j++) {
			var bgcolorNum = Math.floor(Math.random()*10);
			console.log(people[i].length);
			console.log(i);
			$(".cb-"+m).append("<div class='cfloat' style='background-color:"+colors[bgcolorNum]+";'><p>"+people[i][j]+"</p></div>");
			if(j==11){
				break;
			}
		}
		$(".cb-"+m).append("<div class='clear'></div>");
	}
	//上翻页
	function slideToPro(){
		if(pst > 1){
			$(".slide").removeClass("slide-y-"+pst);
			$(".rbtn").css("background-color","white");
			pst--;
  			$(".slide").addClass("slide-y-"+pst);
  			$(".btn-"+pst).css("background-color","black");
		}
	}
	//下翻页
	function slideToNext(){
		if(pst < 6){
			$(".slide").removeClass("slide-y-"+pst);
			$(".rbtn").css("background-color","white");
			pst++;
  			$(".slide").addClass("slide-y-"+pst);
  			$(".btn-"+pst).css("background-color","black");
		}
	}
	//设置点击页面侧栏按钮事件
	$(".rbtn").each(function(i){
		i++;
		$(".btn-"+i).click(function(){
			var m = -(i-pst);
			var n = i+m;
			pst=pst-m;
			$(".slide").removeClass("slide-y-"+n);
			$(".rbtn").css("background-color","white");
			$(".slide").addClass("slide-y-"+i);
			$(".btn-"+i).css("background-color","black");
		});
	});
	function clickBtn(i){
		$(".slide").removeClass("slide-y-"+i);
		$(".rbtn").css("background-color","white");
		$(".slide").addClass("slide-y-"+i);
		$(".btn-"+i).css("background-color","black");
	}
	//设置鼠标滚轮事件
	
	jQuery(function($) {
    $('body').bind('mousewheel', function(event, delta) {
    	if(onMouseWheel == 0){
			if(delta>0){
            	slideToPro();
            }else{
            	slideToNext();
            }
            onMouseWheel = 1;
            setTimeout(function(){
            	onMouseWheel = 0;
            },500);
    	}
        });
	});
	//设置键盘事件
	$(document).keydown(function(event){
	switch(event.keyCode){
		case 38:
			event.preventDefault();
			slideToPro();
			break;
		case 40:
			event.preventDefault();
			slideToNext();
			break;
		default:
			break;
	}
});
});