var rainbow = new Rainbow(); //use this to generate colors programatically

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var params = { fullscreen: true };
//var two = new Two(params).appendTo(elem);

//Save the width and the height of the screen, compute the center
var screenWidth = screen.width;
var screenHeight = screen.height;
var origin = [screenWidth/2,2*screenHeight/5];

//Choose my prime and my resolution (i.e., n such that I'm drawing Z/p^n)
var p = 5;
var n = 5;

//initialize the animation queue:
var animationQueue = [];

//And my points
var points = [];

//populate the list of points in their initial positions:
points.push(origin);
for(var i=1;i<p**n;i++){
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
}
//Also populate a list of colors:
var colors = [];
for(var i=0;i<p**n;i++){
  var j = Math.floor(100*i/(p**n-1));
  colors.push('#'+rainbow.colourAt(j));
}

drawPoints();


//Let's set up the animation:
function animate(){
  time = performance.now();
  for(i=0;i<animationQueue.length;i++){
    //t is the percentage of the animation that is finished
    const t = (time-animationQueue[i].start)/animationQueue[i].duration;
    //console.log(t);
    if(t>1){
      var finisher = animationQueue[i];
      animationQueue.splice(i,1);
      i-=1;
      finisher.finish();
    }
    else if (t>=0){
      animationQueue[i].callback(t);
    }
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

//This draws the points to their current location (using the global array points).  It clears the screen first.  It also applies color.
function drawPoints(){
  ctx.clearRect(0,0,screenWidth,screenHeight);
  for(var i=0;i<p**n;i++){
    ctx.beginPath();
    ctx.moveTo(points[i][0],points[i][1]);
    ctx.arc(points[i][0],points[i][1],1,0,2*Math.PI);
    ctx.fillStyle = colors[i];
    ctx.fill();
  }
}

//computes the location of a point
function computeLocation(i){
  //We know where zero goes:
  if(i==0){
    return origin;
  }
  //Otherwise...
  //first compute the p-adic valuation of i,
  var val=1;
  while((i)%(p**val)==0){
    val++;
  }
  //Higher powers of p should be closer to the origin
  radius = screenHeight/(3*val*val);
  //Figure out our rotation;
  var theta = 2*Math.PI*i/p**n
  return [origin[0] + radius*Math.cos(theta),origin[1] + radius*Math.sin(theta)];

}

//Let's try multiplication by m:
function multiply(m){
  //console.log("multiplying by",m);
  //We begin by computing the start and end points of each points, and saving them in the following lists.
  var initial = [];
  var final = [];
  for(var i=0;i<p**n;i++){
    initial.push(points[i]);
    final.push(computeLocation(m*i));
  }
  //Then push the movement to the animation queue:
  animationQueue.push({
    start: performance.now(),
    duration: 5000,
    initial: initial,
    final: final,
    callback: (t) => {

      //console.log("Callback time: ",t);
      for(var i=0;i<p**n;i++){
        //console.log(i);
        //console.log("initial");
        //console.log(initial[i]);
        //console.log("final");
        //console.log(final[i]);
        var newX = (1-t)*initial[i][0] + t*final[i][0];
        var newY = (1-t)*initial[i][1] + t*final[i][1];
        points[i] = [newX,newY];
      }
      drawPoints();
    },
    finish: () => {
      console.log("finishing");
      points = final;
      drawPoints();
    }
  })
}

function applyFunction(f){
  //We begin by computing the start and end points of each points, and saving them in the following lists.
  var initial = [];
  var final = [];
  for(var i=0;i<p**n;i++){
    initial.push(points[i]);
    final.push(computeLocation(f(i)));
  }
  //Then push the movement to the animation queue:
  animationQueue.push({
    start: performance.now(),
    duration: 5000,
    initial: initial,
    final: final,
    callback: (t) => {

      //console.log("Callback time: ",t);
      for(var i=0;i<p**n;i++){
        //console.log(i);
        //console.log("initial");
        //console.log(initial[i]);
        //console.log("final");
        //console.log(final[i]);
        var newX = (1-t)*initial[i][0] + t*final[i][0];
        var newY = (1-t)*initial[i][1] + t*final[i][1];
        points[i] = [newX,newY];
      }
      drawPoints();
    },
    finish: () => {
      console.log("finishing");
      points = final;
      drawPoints();
    }
  })
}

function f(x){
  return -5*x;
}
applyFunction(f);
//applyFunction(f);
/*
var time = performance.now();
for(var k=0;k<24;k++){
  const multiplyer = k+2;
  animationQueue.push({
    start: time + 5000*(k),
    multiplyer: multiplyer,
    duration: 50,
    callback: (t) => {},
    finish: () => {multiply(multiplyer)},
  })
}
*/
