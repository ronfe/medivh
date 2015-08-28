var orientationChangeEv = function(){
  var winW = window.innerWidth, w, fontSize;
  //保证window内部的宽度在320-640之间，最小为320，最大为640
  w = (winW <= 320) ? 320 : ((winW >= 640) ? 640 : winW);
  //根据窗口的大调整字体的大小
  fontSize = 100 * (w / 320); 
  document.documentElement.style.fontSize = fontSize/10 + 'px';
};
//绑定window的resize事件
window.addEventListener('resize',orientationChangeEv);
//初始时，执行一次
setTimeout(orientationChangeEv, 0);
