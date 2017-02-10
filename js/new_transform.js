(function(w){
	w.$={};
	
	w.css=function(node,name,val){
		if(!node.transform){
			node.transform ={};
		}
		
		if(arguments.length>2){
			//写
			node.transform[name]=val;
			var reschildt="";
			for(var item in node.transform){
				switch (item){
					case "rotate":
					case "skew":
					case "skewX":
					case "skewY":
						reschildt +=item+"("+node.transform[item]+"deg) ";
						break;
					case "scale":
					case "scaleX":
					case "scaleY":
						reschildt +=item+"("+node.transform[item]+") ";
						break;
					case "translate":
					case "translateX":
					case "translateY":
					case "translateZ":
						reschildt +=item+"("+node.transform[item]+"px) ";
						break;
				}
			}
			node.style.transform=node.style.webkitTransform=reschildt;
		}else{
			//读
			val =node.transform[name];
			if(typeof node.transform[name] == "undefined"){
				//赋默认值
				if(name=="scale"||name=="scaleX"||name=="scaleY"){
					val=1;
				}else{
					val=0;
				}
				
			}
			return val;
		}
		
	}

	//竖向滑屏（快速滑屏   即点即停   带滚动条    防抖动   响应dom结构的变化）
	/*	即点即停:我们一开始的滑屏模型使用的是transtion实现过渡,
			transtion只关注 初始位置,目标位置,过渡时间与形式
			
			使用Tween算法来模拟transtion过渡,
			Tween算法:为我们提供数据(每次运动后的位置)
				t:当前次数
				b:初始位置
				c:目标位置与初始位置之间的差值
				d:总次数
				s:回弹距离
				
			配合循环定时器实现过渡效果
			通过清除定时器实现即点即停
	*/
	w.$.drag=function(wrap,callback){
		var child = wrap.children[0];
		css(child,"translateZ",0.01);
		var startP={};
		var elementP={};
		var minY = wrap.clientHeight - child.offsetHeight;
		var lastTime = 0;
		var lastPoint = 0;
		var timeVal = 1;
		var disVal = 0;
		var isY =true;
		var isFirst=true;
		var Tween={
        	Linear:function(t,b,c,d){ return c*t/d + b; },
        	Back:function(t,b,c,d,s){
	            if (s == undefined) s = 1.70158;
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        	}
        }
		
		wrap.addEventListener("touchstart",function(ev){
			minY = wrap.clientHeight - child.offsetHeight;
			clearInterval(wrap.cleartime);
			child.style.transition="none";
			startP={clientX:ev.changedTouches[0].clientX,clientY:ev.changedTouches[0].clientY};
			elementP={clientX:css(child,"translateX"),clientY:css(child,"translateY")};
			lastTime = new Date().getTime();
			lastPoint=elementP.clientY;
			timeVal = 1;
			disVal = 0;
			if(callback&&callback["start"]){
				callback["start"]();
			}
			isY =true;
			isFirst=true;
		})
		
		wrap.addEventListener("touchmove",function(ev){
			if(!isY){
				return;
			}
			var nowP = ev.changedTouches[0];
			var disX = nowP.clientX - startP.clientX;
			var disY = nowP.clientY - startP.clientY;
			var translateY = elementP.clientY+disY;
			var scale = 0;
			if(translateY>0){
				scale=document.documentElement.clientHeight/(translateY+document.documentElement.clientHeight*2.5);
				translateY=translateY*scale;
			}else if(translateY<minY){
				var over = minY-translateY;
				scale=document.documentElement.clientHeight/(over+document.documentElement.clientHeight*2.5);
				translateY=minY-over*scale;
			}
			
			var nowTime=new Date().getTime();
			var nowPoint=translateY;
			timeVal = nowTime - lastTime;
			disVal = nowPoint - lastPoint;
			lastTime = nowTime;
			lastPoint = nowPoint;
			
			if(isFirst){
				isFirst=false;
				if(Math.abs(disY)<Math.abs(disX)){
					isY=false;
					return;
				}
			}
			
			css(child,"translateY",translateY);
			if(callback&&callback["move"]){
				callback["move"]();
			}
		})
		
		wrap.addEventListener("touchend",function(){
			if(!isY){
				return;
			}
			var speed = disVal /timeVal;
			var traget = css(child,"translateY")+speed*200;
			var type ="Linear";
			var time = Math.abs(speed)*0.15;
			time =time<0.3?0.3:time;
			
			if(traget>0){
				traget = 0;
				type ="Back";
			}else if(traget<minY){
				traget=minY;
				type ="Back";
			}
			move(time,traget,type);
			
			if(callback&&callback["end"]){
				callback["end"]();
			}
		})
		
		
		function move(time,traget,type){
			var s=0;
			var t =0;
			var b= css(child,"translateY");
			var c= traget - b;
			var d= Math.ceil(time/0.02);
			var point=0;
			
			clearInterval(wrap.cleartime);
			wrap.cleartime=setInterval(function(){
				t++;
				if(t>d){
					clearInterval(wrap.cleartime);
					if(callback&&callback["over"]){
						callback["over"]();
					}
				}else{
					point = Tween[type](t,b,c,d,s);
					css(child,"translateY",point);
					if(callback&&callback["move"]){
						callback["move"]();
					}
				}
			},20)
		}
	}

})(window)






