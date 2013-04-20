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

var start = Date.now();
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var canvasOut = document.createElement('canvas');
var contextOut = canvasOut.getContext('2d');

var sortFuncCenteredAt = function(center) {

//var center = {x: 72, y: 72};

  var fixBool = function(b) {
  return 0;
    if (b) {
      return -1;
    } else {
      return 1;
    }
  };

  var sortClockwise = function(a, b) {


    if (a.x >= 0 && b.x < 0) {
      return fixBool(true);
    }

    if (a.x == 0 && b.x == 0) {
      return fixBool(a.y > b.y);
    }

    // compute the cross product of vectors (center -> a) x (center -> b)
    var det = (a.x-center.x) * (b.y-center.y) - (b.x - center.x) * (a.y - center.y);

    return det;

    if (det < 0) {
      return fixBool(true);
    }
    if (det > 0) {
      return fixBool(false);
    }

    return 0;

    // points a and b are on the same line from the center
    // check which point is closer to the center
    var d1 = (a.x-center.x) * (a.x-center.x) + (a.y-center.y) * (a.y-center.y);
    var d2 = (b.x-center.x) * (b.x-center.x) + (b.y-center.y) * (b.y-center.y);
    return fixBool(d1 > d2);
  };

  var sortClockwise2 = function (a, b) {
    var aa = Math.atan2(a.y - center.y, a.x - center.x);
    var bb = Math.atan2(b.y - center.y, b.x - center.x);

    if (aa > bb) {
      return 1;
    } else if (aa < bb) {
      return -1;
    } else {
      return 0;
    }
  };

  return sortClockwise2;
};

/*
var get_polygon_centroid = function(pts) {
   var twicearea=0,
       x=0, y=0,
       nPts = pts.length,
       p1, p2, f;

   for (var i=0, j=nPts-1; i<nPts; j=i++) {
      p1 = pts[i]; p2 = pts[j];
      twicearea += p1.x * p2.y;
console.log(twicearea);
      twicearea -= p1.y * p2.x;
console.log(twicearea, p1, p2);
      f = p1.x * p2.y - p2.x * p1.y;
      x += (p1.x + p2.x) * f;
      y += (p1.y + p2.y) * f;
   }
   f = twicearea * 3;
console.log(x, y, f, twicearea);
   return {x: x / f, y: y / f};
}
*/

var get_polygon_centroid = function(points) {  
  var centroid = {x: 0, y: 0};
  for(var i = 0; i < points.length; i++) {
     var point = points[i];
     centroid.x += point.x;
     centroid.y += point.y;
  }
  centroid.x /= points.length;
  centroid.y /= points.length;
  return centroid;
};

var hist = {};
function handleTestClick()
{
  var pixels = context.getImageData(0,0, canvas.width, canvas.height);

  var bwPixels = RGBA2A(pixels, context);
  var bwPixelsSobolev = RGBA2A(pixels, context);

  var x, y;

  var points = new Array();

  applyKernelAlphaOnPixels(bwPixels, dxx, dyy, bwPixelsSobolev, points)

  var centroid = get_polygon_centroid(points);

  console.log(centroid);

  var sortFunc = sortFuncCenteredAt(centroid);

  points.sort(sortFunc);

  console.log(points.length);

  simplifiedPoints = simplify(points);

  console.log(simplifiedPoints.length);
  
  var grayPixels = A2RGBA(bwPixelsSobolev, context);
  
  contextOut.putImageData(grayPixels, 0,0);

  contextOut.fillStyle = 'yellow';
  contextOut.fillRect(centroid.x, centroid.y, 1, 1);

  contextOut.fillStyle = 'green';
  for (var i=0; i<points.length; i++) {
    //console.log(simplifiedPoints[i]);
    //contextOut.arc(simplifiedPoints[i].x, simplifiedPoints[i].y, 10, 0, 2 * Math.PI);
    contextOut.fillRect(points[i].x, points[i].y, 1, 1);
    //console.log(points[i]);
    //if (i > 150) {
    //  break;
    //}
  }

  contextOut.fillStyle = 'red';
  for (var i=0; i<simplifiedPoints.length; i++) {
    //console.log(simplifiedPoints[i]);
    //contextOut.arc(simplifiedPoints[i].x, simplifiedPoints[i].y, 10, 0, 2 * Math.PI);
    contextOut.fillRect(simplifiedPoints[i].x, simplifiedPoints[i].y, 2, 2);
  }
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

