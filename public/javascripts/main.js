// do all the stuff

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var img;
var imgWidth, imgHeight;

var imgScale = 1.0;
var points = [];
var pixels, bwPixels;

/*
function handleCanvasClick(evt) {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  
  if (!pixels) {
    pixels = context.getImageData(0,0, canvas.width, canvas.height);
    bwPixels = RGBA2A(pixels, context);
  }

  var coords = canvas.relMouseCoords(event);
  var x = coords.x/imgScale;
  var y = coords.y/imgScale;

  if (x >= 0 && x < imgWidth && y >= 0 && y < imgHeight)
    points.push([x, y]);

  context.beginPath();
  context.arc(x, y, 3, 0, Math.PI*2, true); 
  context.closePath();
  context.fill();
  
  if (points.length == 2)
  {
    var sum = 0;
    var n = 0;
    var w = bwPixels.width;

    xiaolinWuLineIterator(points[0][0],points[0][1], points[1][0], points[1][1], function(x, y, c) { 
      n += c; 
      sum += c* bwPixels.data[x+w*y];
      pixels.data[4*(x+w*y)] = (1-c) * pixels.data[4*(x+w*y)] + c * 0;
      pixels.data[4*(x+w*y)+1] = (1-c) * pixels.data[4*(x+w*y)+1] + c * 0;
      pixels.data[4*(x+w*y)+2] = (1-c) * pixels.data[4*(x+w*y)+2] + c * 0;
      //pixels.data[4*(x+w*y)+3] = 255;
    });
    //alert("s: " + sum + " n: " + n + " avg: " + (sum/n));

    //lineIterator(points[0][0],points[0][1], points[1][0], points[1][1], function(x, y) { 
    //  n++; 
    //  sum += bwPixels[x+w*y];
    //  pixels.data[4*(x+w*y)] = 255 - pixels.data[4*(x+w*y)];
    //  pixels.data[4*(x+w*y)+1] = 255 - pixels.data[4*(x+w*y)+1];
    //  pixels.data[4*(x+w*y)+2] = 255 - pixels.data[4*(x+w*y)+2];
    //});
    //

    //alert("s: " + sum + " n: " + n + " " + (sum/n));

    context.putImageData(pixels, 0, 0);
    
    //document.getElementById('outputText').value = "convert ..\\..\\web\\" + fileName + " -virtual-pixel transparent -distort Perspective \"" + s + "\" " + fileName + "out.png";
    //handleLoad(img);
    points = [];
  }
}
*/

/* 
function drawImage(img) {
  var canvas = document.getElementById('canvas');
  
  canvas.width = img.width;
  canvas.height = img.height;
  imgWidth = img.width;
  imgHeight = img.height;
  
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0, img.width, img.height);
}
*/

/*
function scaleImage(scale)
{
  imgScale *= scale;
  var canvas = document.getElementById('canvas');
  canvas.style.width = "" + (imgWidth*imgScale) +"px";
  canvas.style.height = "" + (imgHeight*imgScale) +"px";
  //    
  //canvas.height = imgHeight;
}
*/



/*
function xffdlj() {
  //pixels = context.getImageData(0,0, canvas.width, canvas.height);
  //bwPixels = RGBA2A(pixels, context);
  // applyKernelAlpha(pixels, kernel, x, y)
}
*/

var start = Date.now();
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var canvasOut = document.createElement('canvas');
var contextOut = canvasOut.getContext('2d');

var hist = {};
function handleTestClick()
{
  var pixels = context.getImageData(0,0, canvas.width, canvas.height);

  var bwPixels = RGBA2A(pixels, context);
  var bwPixelsSobolev = RGBA2A(pixels, context);

  var x, y;

  applyKernelAlphaOnPixels(bwPixels, dxx, dyy, bwPixelsSobolev)

  var grayPixels = A2RGBA(bwPixelsSobolev, context);
  
  contextOut.putImageData(grayPixels, 0,0);
}

var step = function (timestamp) {
  var progress = timestamp - start;
  start = timestamp;

  window.requestAnimationFrame(step);
};

var main = function(ev) {

  document.body.appendChild(canvas);
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  document.body.appendChild(canvasOut);
  canvasOut.width = canvasOut.offsetWidth;
  canvasOut.height = canvasOut.offsetHeight;

  context.fillStyle = 'red';
  context.fillRect(64, 64, 32, 32);

  handleTestClick();

  step(start);
};


document.addEventListener('DOMContentLoaded', main);

