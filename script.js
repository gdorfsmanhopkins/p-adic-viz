var rainbow = new Rainbow(); //use this to generate colors programatically

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var params = { fullscreen: true };
//var two = new Two(params).appendTo(elem);

//Save the width and the height of the screen, compute the center
var screenWidth = screen.width;
var screenHeight = screen.height;
var origin = [screenWidth/2,2*screenHeight/5];
console.log(origin);
//Choose my prime and my resolution (i.e., n such that I'm drawing Z/p^n)
var p = 5;
var n = 6;

//And my points
var  points = []
for(var i=0;i<p**n;i++){
  ctx.beginPath();
  ctx.moveTo(origin[0],origin[1]);
  if(i==0){
    points.push(origin);
    ctx.arc(origin[0],origin[1],1,0,2*Math.PI);
    ctx.fill();
    continue;
  }
  //console.log(i);
  //first compute the p-adic valuation of i,
  var val=1;
  while((i)%(p**val)==0){
    val++;
  }
  //Higher powers of p should be closer to the origin
  radius = screenHeight/(3*val*val);
  //Figure out our rotation;
  var theta = 2*Math.PI*i/p**n
  var center = [origin[0] + radius*Math.cos(theta),origin[1] + radius*Math.sin(theta)];
  points.push(center);
  ctx.arc(center[0],center[1],1,0,2*Math.PI);
  ctx.fill();
}
