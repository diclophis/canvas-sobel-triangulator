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

var mergeVertices = function(vertices) {
  var precision = 0.1;

  var verticesMap = new Object();
  var unique = new Array();
  var i;
  var il;

  for (i = 0, il = vertices.length; i < il; i++) {
    var v = vertices[i];
    var key = [Math.round(v.x * precision), Math.round(v.y * precision)].join( '_' );
    if (verticesMap[key] === undefined) {
      verticesMap[key] = i;
      unique.push(vertices[i]);
      //changes[ i ] = unique.length - 1;
    } else {
      //console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key], v);
      //changes[ i ] = changes[ verticesMap[ key ] ];
    }
  }

  return unique;
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

  console.log("unmerged", points.length);

  var mergedPoints = mergeVertices(points);
  
  console.log("merged", mergedPoints.length);

  simplifiedPoints = simplify(points, 1, true);

  console.log(simplifiedPoints.length);
  
  var grayPixels = A2RGBA(bwPixelsSobolev, context);
  
  contextOut.putImageData(grayPixels, 0,0);

  contextOut.fillStyle = 'yellow';
  contextOut.fillRect(centroid.x, centroid.y, 1, 1);

  contextOut.fillStyle = 'green';
  for (var i=0; i<points.length; i++) {
    contextOut.fillRect(points[i].x, points[i].y, 1, 1);
  }

  contextOut.fillStyle = 'purple';
  for (var i=0; i<mergedPoints.length; i++) {
    contextOut.fillRect(mergedPoints[i].x, mergedPoints[i].y, 1, 1);
  }

  //var contour = new Array();

  contextOut.fillStyle = 'red';
  for (var i=0; i<simplifiedPoints.length; i++) {
    //console.log(simplifiedPoints[i]);
    //contextOut.arc(simplifiedPoints[i].x, simplifiedPoints[i].y, 10, 0, 2 * Math.PI);
    contextOut.fillRect(simplifiedPoints[i].x, simplifiedPoints[i].y, 2, 2);
    //contour.push(new poly2tri.Point(simplifiedPoints[i].x, simplifiedPoints[i].y));
  }


  //var contour = [
  //  new poly2tri.Point(100, 100),
  //  new poly2tri.Point(100, 300),
  //  new poly2tri.Point(300, 300),
  //  new poly2tri.Point(300, 100)
  //];
  var swctx = new poly2tri.SweepContext(simplifiedPoints);

  swctx.triangulate();
  var triangles = swctx.getTriangles();

  //console.log(triangles.length, triangles);

  var polygonPath = function(ctx, points) {
    ctx.beginPath();
    points.forEach(function(point, index) {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
  };

  var TRIANGLE_FILL_STYLE = "#e0c4ef";
  var TRIANGLE_STROKE_STYLE = "#911ccd";
  var CONSTRAINT_STYLE = "rgba(0,0,0,0.6)";
  var ERROR_STYLE = "rgba(255,0,0,0.8)";
  var MARGIN = 16;

  // auto scale / translate
  bounds = swctx.getBoundingBox();
  xscale = (context.canvas.width - 2 * MARGIN) / (bounds.max.x - bounds.min.x);
  yscale = (context.canvas.height - 2 * MARGIN) / (bounds.max.y - bounds.min.y);
  scale = Math.min(xscale, yscale);
  //scale = 1;
  //context.translate(MARGIN, MARGIN);
  context.scale(scale, scale);
  context.translate(-bounds.min.x, -bounds.min.y);
  linescale = 1 / scale;

  // draw result
  context.lineWidth = linescale;
  context.fillStyle = TRIANGLE_FILL_STYLE;
  context.strokeStyle = TRIANGLE_STROKE_STYLE;
  //context.setLineDash(null);

  triangles.forEach(function(t) {
    polygonPath(context, [t.getPoint(0), t.getPoint(1), t.getPoint(2)]);
    context.fill();
    context.stroke();
  });

  /*
  // draw constraints
  context.lineWidth = 4 * linescale;
  context.strokeStyle = CONSTRAINT_STYLE;
  context.fillStyle = CONSTRAINT_STYLE;
  //context.setLineDash([10 * linescale, 5 * linescale]);

  polygonPath(context, contour);
  context.stroke();
  */

  //holes.forEach(function(hole) {
  //    polygonPath(ctx, hole);
  //    ctx.stroke();
  //});

/*
      points.forEach(function(point) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, ctx.lineWidth, 0, 2 * Math.PI, false);
          ctx.closePath();
          ctx.fill();
      });

  // highlight errors, if any
  if (error_points) {
      ctx.lineWidth = 4 * linescale;
      ctx.fillStyle = ERROR_STYLE;
      error_points.forEach(function(point) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, ctx.lineWidth, 0, 2 * Math.PI, false);
          ctx.closePath();
          ctx.fill();
      });
  }
*/





}

var step = function (timestamp) {
  var progress = timestamp - start;
  start = timestamp;

  //window.requestAnimationFrame(step);
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

