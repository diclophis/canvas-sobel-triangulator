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
var canvasTri = document.createElement('canvas');
var contextTri = canvasTri.getContext('2d');

var sortFuncCenteredAt = function(center) {

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
    } else {
      //console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key], v);
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

  var sortFunc = sortFuncCenteredAt(centroid);

  points.sort(sortFunc);

  console.log("unmerged", points.length);

  var mergedPoints = mergeVertices(points);
  
  console.log("merged", mergedPoints.length);

  simplifiedPoints = simplify(points, 1, true);

  console.log("simplified", simplifiedPoints.length);

  simplifiedMergedPoints = mergeVertices(simplifiedPoints);

  console.log("simplifiedMerged", simplifiedMergedPoints.length);
  
  //var grayPixels = A2RGBA(bwPixelsSobolev, context);
  //contextOut.putImageData(grayPixels, 0,0);

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

  contextOut.fillStyle = 'red';
  for (var i=0; i<simplifiedPoints.length; i++) {
    contextOut.fillRect(simplifiedPoints[i].x, simplifiedPoints[i].y, 2, 2);
  }

  contextOut.fillStyle = 'blue';
  for (var i=0; i<simplifiedMergedPoints.length; i++) {
    contextOut.fillRect(simplifiedMergedPoints[i].x, simplifiedMergedPoints[i].y, 2, 2);
  }

  var swctx = new poly2tri.SweepContext(simplifiedMergedPoints);

  swctx.triangulate();
  var triangles = swctx.getTriangles();

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
  xscale = (contextTri.canvas.width - 2 * MARGIN) / (bounds.max.x - bounds.min.x);
  yscale = (contextTri.canvas.height - 2 * MARGIN) / (bounds.max.y - bounds.min.y);
  scale = Math.min(xscale, yscale);
  contextTri.translate(MARGIN, MARGIN);
  contextTri.scale(scale, scale);
  contextTri.translate(-bounds.min.x, -bounds.min.y);
  linescale = 1 / scale;

  /*
  // draw constraints
  contextTri.lineWidth = 4 * linescale;
  contextTri.strokeStyle = CONSTRAINT_STYLE;
  contextTri.fillStyle = CONSTRAINT_STYLE;
  polygonPath(contextTri, simplifiedMergedPoints);
  contextTri.stroke();
  */

  // draw result
  contextTri.lineWidth = linescale;
  contextTri.fillStyle = TRIANGLE_FILL_STYLE;
  contextTri.strokeStyle = TRIANGLE_STROKE_STYLE;

  triangles.forEach(function(t) {
    polygonPath(contextTri, [t.getPoint(0), t.getPoint(1), t.getPoint(2)]);
    contextTri.fill();
    contextTri.stroke();
  });

  //holes.forEach(function(hole) {
  //    polygonPath(ctx, hole);
  //    ctx.stroke();
  //});

  /*
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

  document.body.appendChild(canvasTri);
  canvasTri.width = canvasTri.offsetWidth;
  canvasTri.height = canvasTri.offsetHeight;

  context.fillStyle = 'red';
  context.fillRect(64, 64, 32, 32);
  context.fillRect(80, 80, 32, 32);

  handleTestClick();

  step(start);
};


document.addEventListener('DOMContentLoaded', main);

