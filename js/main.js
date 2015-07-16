$(function(){
	var doc = Zepto('body');
	var pst = 1;//当前视觉视口显示的页数
	document.body.addEventListener("touchstart", function(event) {
		event.preventDefault();
	},false);
	doc.on('swipeUp',function(){
		slideToNext();
	});
	doc.on('swipeDown', function(){
		slideToPro();
	});
	//初始化页面js
	$(".btn-1").css("background-color","black");
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
            if(delta>0){
            	slideToPro();
            }else{
            	slideToNext();
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