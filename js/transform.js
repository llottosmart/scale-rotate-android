//读写一个元素的某个transform值




(function(w){
	
	w.$ = {}
	w.css = function(node,name,value){
		
		//存储已有的属性
		if(!node.transform){
			node.transform = {}
		}
		
		if(arguments.length > 2){
			//写
			switch(name){
					case 'skew':
					case 'skewX':
					case 'skewY':
					case 'ratate':
					case 'ratateX':
					case 'ratateY':
					value += 'deg';
					break;
					case 'translate':
					case 'translateX':
					case 'translateY':
					case 'translateZ':
					value += 'px'
					break;
				}
			node.transform[name] = value;
			var result = '';
			for (var item in node.transform) {
				result += item + '('+ node.transform[item]+') '
			}
			node.style.transform = node.style.webkitTransform = result;
			
		}else{
			//读 scale skew ratate translate
			value = node.transform[name]
			if(typeof node.transform[name] == 'undefined'){
				if(name == 'scale' || name == 'scaleX' || name == 'scaleY'){
					value = 1
				}else{
					value = 0
				}
			}
			return value
		}
	}
	
	
	
	w.$.drag = function(wrap,content,callback){
			css(content,"translateZ",0.01); //开启3d加速
			var startPoint;
			var elementPoint;
			var nowPoint;
			var dis;
			var nowY;
			var scale;
			var lastTime;
			var nowTime;
			var lastValue;
			var nowValue;
			var disTime;
			var disValue;
			var speed;
//			var minY = document.documentElement.clientHeight - content.offsetHeight - 270;
			var minY = wrap.clientHeight - content.offsetHeight;
			//模拟线性和过渡超出
			var Tween={
	        	Linear:function(t,b,c,d){ return c*t/d + b; },
	        	Back:function(t,b,c,d,s){
		            if (s == undefined) s = 1.70158;
		            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	        	}
	        }
			
			wrap.addEventListener('touchstart',function(ev){
				clearInterval(wrap.cleartime);
				minY = wrap.clientHeight - content.offsetHeight;
				content.style.transition="none";
				disTime = 1;
				disValue = 0;
				ev = ev || event;
				startPoint = {clientX:ev.changedTouches[0].clientX,clientY:ev.changedTouches[0].clientY}
				elementPoint = {clientX:parseInt(css(content,'translateX')),clientY:parseInt(css(content,'translateY'))}
				lastTime = new Date().getTime()
				lastValue = elementPoint.clientY
				if(callback&&callback['start']){
					callback['start']()
				}
				
			})
			wrap.addEventListener('touchmove',function(ev){
				ev = ev || event;
				nowPoint = ev.changedTouches[0]
				dis = {clientX:nowPoint.clientX-startPoint.clientX,clientY:nowPoint.clientY-startPoint.clientY}
				nowY = elementPoint.clientY + dis.clientY
				//做一个橡皮筋效果
				if(nowY>0){
//					nowY = 0
					scale = document.documentElement.clientHeight/(nowY+document.documentElement.clientHeight*2.5)
					nowY = nowY * scale
					
				}else if(nowY<minY){
//					nowY=minY
					var over = minY - nowY;
					scale = document.documentElement.clientHeight/(over+document.documentElement.clientHeight*2.5)
					nowY=minY - over * scale
				}
				//为释放后回弹效果和快速滑屏做准备
				nowTime = new Date().getTime()
				nowValue = nowY;
				
				disTime = nowTime - lastTime
				disValue = nowValue - lastValue
				
				lastTime = nowTime
				lastValue = nowValue
				css(content,'translateY',nowY)
				if(callback&&callback['move']){
					callback['move']()
				}
				
			})
			wrap.addEventListener('touchend',function(){
				//做快速滑屏及回弹效果
//				var bsel = '';
				var type = 'Linear'
				speed = disValue/disTime
				var target = parseInt(css(content,'translateY')) + speed * 200;
				var time = Math.abs(speed) * 0.15
				time = time < 0.3?0.3:time
				if(target>0){
					target = 0
//					bsel = 'cubic-bezier(.76,1.42,.77,1.4)'
					type = 'Back'
				}else if(target<minY){
					target=minY
//					bsel = 'cubic-bezier(.76,1.42,.77,1.4)'
					type = 'Back'
				}
//				content.style.transition = (time * 5) + 's ' + bsel;
//				css(content,'translateY',tagert)
				move(time,target,type)
				if(callback&&callback["end"]){
					callback["end"]();
				}
			})
			
			function move(time,target,type){
			//      t,当前次数(从1开始)
			//      b,初始位置
			//      c,最终位置与初始位置之间的差值
			//      d,总次数
			//      s,回弹距离
			//		返回值:每次运动需要达到的位置
				var s=0;
				var t =0;
				var b= parseInt(css(content,'translateY'));
				var c= target - b;//如果没有经过touchmove   c的值就是0
				var d= time/0.02;
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
						css(content,"translateY",point);
						if(callback&&callback["move"]){
							callback["move"]();
						}
					}
					
				},10)

			
			
			}
			
	}
	
	
})(window)






