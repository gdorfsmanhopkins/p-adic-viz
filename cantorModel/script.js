/*
*
* TO DOL
* * Allow for meaningful iteration of functions
* * Implement everything in p-adic digits
* * Restructure the animation to be consistent across scales
* * Fix exponentiation bugs:
* * * Floating point errors which explode stuff
* * * Cubing being surjective mod 5?????
* * Get the right sizing options working.
*
*/


var rainbow = new Rainbow(); //use this to generate colors programatically

var canvas = document.getElementById('canvas');
canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);

var ctx = canvas.getContext('2d');
var params = { fullscreen: true };
//var two = new Two(params).appendTo(elem);

//Save the width and the height of the screen, compute the center
var screenWidth = screen.width;
var screenHeight = screen.height;
var origin = [screenWidth/2,2*screenHeight/5];


//Choose my prime and my resolution (i.e., n such that I'm drawing Z/p^n)
var p = 3;
var n = 7;
//Also the settings for the linear function I will apply: f(x) = mx+b
var m = 1;
var b = 0;
//And why not exponentiation
var A = 1;
var e = 1;
//Trace lines?
var traceLines = false;


//initialize the animation queue, pointslist and colors:
var animationQueue = [];
var points = [];
var colors = [];
initializePointsList();
drawPoints();

//Initialize the settings GUI
var settings = QuickSettings.create(screenWidth/10,screenHeight/10,"Settings")
settings.addDropDown("Prime",[3,5,7,11],function setPrime(value){
  p=value.value;
  /*if(p==2){
    n=11;
  }*/
  if(p==3){
    n=7;
  }
  if(p==5){
    n=5;
  }
  if(p==7){
    n=4;
  }
  if(p==11){
    n=3;
  }
  initializePointsList();
  drawPoints();
});
settings.addBoolean("Trace Lines",false,function traceSwap(value){traceLines = value})
settings.addNumber("Multiply by m",-(p**n),p**n,1,1,function setMultiplyer(value){m=value});
settings.addNumber("Add b",-(p**n),p**n,0,1,function setAddition(value){b = value});
settings.addButton("Apply f(x) = mx+b",function applyLinearFunction(){applyFunction(function f(x){return m*x+b})});
settings.addNumber("Exponential coefficient A",-(p**n),p**n,1,1,function setExpMultiplyer(value){A = value});
settings.addNumber("Exponentiate by e",-(p*p),p*p,1,1,function setExponent(value){e = value});
settings.addButton("Apply f(x) = Ax^e",function applyExponentiation(){applyFunction(function f(x){return A*(x**e)})});
settings.addButton("Reset",function reset(){initializePointsList();drawPoints()});

//p-adic stuff
function computeBaseP(n){
  var digits = [];
  while(n!=0){
    var d = n % p;
    digits.push(d);
    n = (n-d)/p;
  }
  return digits;
}
function initializePointsList(){
  points = [];
  colors = [];
  for(var i=1;i<p**n+1;i++){
    //First compute i in base p, then compute the location and add it to the list
    var b = computeBaseP(i)
    points.push(computeLocation(b));
    //It might be worth initializing the colors list as well.  Try to weight it p-adically (so close colors are close)
    j = 0;
    for(var k=0;k<n;k++){
      if(b[k]){
        j += b[k]*(p**(n-k));
      }
    }
    j=100*j/p**(n+1);
    //console.log(j);
    colors.push('#'+rainbow.colourAt(j));
  }
}
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
//computes the location of a p-adic number t given in base p (as an array of length n);
function computeLocation(t){
  var coordinates = []
  coordinates.push(origin[0]);
  coordinates.push(origin[1]);
  for(var i=0;i<n;i++){
    //if(t[i]) does the asymetric disk model
    //if(t[i]>=0) does the symmetric model with 0 in the corner
    var radius = screenHeight/(3*((i+1)**(3)));
    var theta;
    if(t[i]){
      theta = 2*Math.PI*t[i]/p;
    }
    else{
      theta = 0;
    }
    coordinates[0] += radius*Math.cos(-theta);
    coordinates[1] += radius*Math.sin(-theta);
  }
  return coordinates;
}
function applyFunction(f){
  //We begin by computing the start and end points of each points, and saving them in the following lists.
  var initial = [];
  var final = [];
  for(var i=0;i<p**n;i++){
    initial.push(points[i]);
    //note, we use i+1 since we start counting at 1 when initializing.  This may be necessary to fix later.
    final.push(computeLocation(computeBaseP(f(i+1))));
  }
  //Then push the movement to the animation queue:
  animationQueue.push({
    start: performance.now(),
    duration: 3000,
    initial: initial,
    final: final,
    callback: (t) => {
      for(var i=0;i<p**n;i++){
        var newX = (1-t)*initial[i][0] + t*final[i][0];
        var newY = (1-t)*initial[i][1] + t*final[i][1];
        points[i] = [newX,newY];
      }
      drawPoints();
      if(traceLines){
        trace(initial);
      }
    },
    finish: () => {
      points = final;
      drawPoints();
      if(traceLines){
        trace(initial);
      }
    }
  })
}
//trace lines:
function trace(from){
  for(var i=0;i<p**n;i++){
    ctx.beginPath();
    ctx.moveTo(from[i][0],from[i][1]);
    ctx.lineTo(points[i][0],points[i][1]);
    ctx.strokeStyle = colors[i];
    ctx.stroke();
  }
}
//Animation functions!
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
