// do all the stuff

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();



var paused = false;
var time = 0;
var points = [];
var pixels, bwPixels;

var start = Date.now();
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var canvasOut = document.createElement('canvas');
var contextOut = canvasOut.getContext('2d');
var canvasTri = document.createElement('canvas');
var contextTri = canvasTri.getContext('2d');

var allBaseLines = new Array();

function getDistant(cpt, bl) {
    var Vy = bl[1].x - bl[0].x;
    var Vx = bl[0].y - bl[1].y;
    return (Vx * (cpt.x - bl[0].x) + Vy * (cpt.y -bl[0].y))
}


function findMostDistantPointFromBaseLine(baseLine, points) {
    var maxD = 0;
    var maxPt = null; //new Array();
    var newPoints = new Array();
    for (var idx in points) {
        var pt = points[idx];
        var d = getDistant(pt, baseLine);
        
        if ( d > 0) {
            newPoints.push(pt);
        } else {
            continue;
        }
        
        if ( d > maxD ) {
            maxD = d;
            maxPt = pt;
        }
    
    } 
    return {'maxPoint':maxPt, 'newPoints':newPoints}
}



function buildConvexHull(baseLine, points) {
    
    allBaseLines.push(baseLine)
    var convexHullBaseLines = new Array();
    var t = findMostDistantPointFromBaseLine(baseLine, points);
    if (t.maxPoint) { // if there is still a point "outside" the base line
        convexHullBaseLines = 
            convexHullBaseLines.concat( 
                buildConvexHull( [baseLine[0],t.maxPoint], t.newPoints) 
            );
        convexHullBaseLines = 
            convexHullBaseLines.concat( 
                buildConvexHull( [t.maxPoint,baseLine[1]], t.newPoints) 
            );
        return convexHullBaseLines;
    } else {  // if there is no more point "outside" the base line, the current base line is part of the convex hull
        return [baseLine];
    }    
}

function getConvexHull(points) {
    //find first baseline
    var maxX, minX;
    var maxPt, minPt;
    for (var idx in points) {
        var pt = points[idx];
        if (pt.x > maxX || !maxX) {
            maxPt = pt;
            maxX = pt.x;
        }
        if (pt.x < minX || !minX) {
            minPt = pt;
            minX = pt.x;
        }
    }
    var ch = [].concat(buildConvexHull([minPt, maxPt], points),
                       buildConvexHull([maxPt, minPt], points))
    return ch;
}


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

var sortFuncCenteredAt = function(center) {

  var fixBool = function(b) {
    if (b) {
      return 1;
    } else {
      return -1;
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

    if (det < 0) {
      return fixBool(true);
    }
    if (det > 0) {
      return fixBool(false);
    }

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
      return -1;
    } else if (aa < bb) {
      return 1;
    } else {
      return 0;
    }
  };

  var sortClockwise3 = function(a, b) {
    // compute the cross product of vectors (center -> a) x (center -> b)
    var det = (a.x-center.x) * (b.y-center.y) - (b.x - center.x) * (a.y - center.y);
    if (det < 0) {
      return -1;
    } else if (det > 0) {
      return 1;
    } else {
      return 0;
    }
  };

  var sortClockwise4 = function(a, b) {
    var dx2 = (b.x - a.x) ^ 2;
    var dy2 = (b.y - a.y) ^ 2;
    return Math.sqrt(dx2 + dy2);
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

var mergeVertices = function(vertices, precision) {
  var verticesMap = new Object();
  var unique = new Array();
  var i;
  var il;

  for (i = 0, il = vertices.length; i < il; i++) {
    var v = vertices[i];
    /*
    var rx = Math.round(v.x / precision) * precision;
    if (rx < v.x) {
      rx += precision;
    } else {
      rx -= precision;
    }
    */
    /*
    var ry = Math.round(v.y / precision) * precision;
    if (ry < v.y) {
      ry += precision / 2;
    } else {
      ry -= precision / 2;
    }
    */

    var rx0 = Math.round(v.x / precision) * precision;
    var ry0 = Math.round(v.y / precision) * precision;
    var rx1 = Math.floor(v.x / precision) * precision;
    var ry1 = Math.floor(v.y / precision) * precision;
    var rx2 = Math.ceil(v.x / precision) * precision;
    var ry2 = Math.ceil(v.y / precision) * precision;

    //var rx = Math.floor(v.x * (1 / precision)) * precision;
    //var ry = Math.floor(v.y * (1 / precision)) * precision;
    //var rx = (v.x % precision) * precision;
    //var ry = (v.y % precision) * precision;
    var key0 = [rx0, ry0].join('_');
    var key1 = [rx1, ry1].join('_');
    var key2 = [rx2, ry2].join('_');
    if (
      verticesMap[key0] === undefined &&
      verticesMap[key1] === undefined &&
      verticesMap[key2] === undefined
    ) {
      verticesMap[key0] = i;
      verticesMap[key1] = i;
      verticesMap[key2] = i;
      unique.push({x: rx0, y: ry0});
      //unique.push(vertices[i]);
    } else {
      //console.log('Duplicate vertex found. ', i, ' could be using ', key, v.x, v.y);
    }
  }

  return unique;
};

var handleTestClick = function() {
  var pixels = context.getImageData(0, 0, canvas.width, canvas.height);

  var bwPixels = RGBA2A(pixels, context);
  var bwPixelsSobolev = RGBA2A(pixels, context);

  var points = new Array();

  applyKernelAlphaOnPixels(bwPixels, dxx, dyy, bwPixelsSobolev, points)
  //var grayPixels = A2RGBA(bwPixelsSobolev, context);
  //contextOut.putImageData(grayPixels, 0,0);

  var p = 1;
  var p2 = 4;

  //var p3 = 1;
  //var mergedPoints = simplify(mergeVertices(points, p), p, true);

  var preConvexLines = getConvexHull(points);
  var preConvexPoints = [];
  for (var idx in preConvexLines) {
    var line = preConvexLines[idx];
    preConvexPoints.push(line[0]);
    preConvexPoints.push(line[1]);
  }

  var mergedPoints = preConvexPoints;

  var centroid = get_polygon_centroid(points);
  contextOut.fillStyle = 'black';
  contextOut.fillRect(centroid.x - 5, centroid.y - 5, 10, 10);

  //var sortFunc = sortFuncCenteredAt(centroid);
  //mergedPoints.sort(sortFunc);

/*
  var convexLines = getConvexHull(mergedPoints);
  var convexPoints = null;

  if (1) {
    convexPoints = [];
    for (var idx in convexLines) {
      var line = convexLines[idx];
      convexPoints.push(line[0]);
      convexPoints.push(line[1]);
    }
  } else {
    convexPoints = mergedPoints;
  }
*/

  var simplifiedPoints = simplify(mergedPoints, p2, true);
  //var simplifiedPoints = (mergeVertices(convexPoints, p3));
  //var simplifiedPoints = mergedPoints;
  //var simplifiedMergedPoints = mergeVertices(simplifiedPoints, p3);

  contextOut.fillStyle = 'red';
  for (var i=0; i<simplifiedPoints.length; i++) {
    contextOut.fillRect(simplifiedPoints[i].x - 8, simplifiedPoints[i].y - 8, 16, 16);
  }

  //contextOut.fillStyle = 'blue';
  //for (var i=0; i<convexPoints.length; i++) {
  //  contextOut.fillRect(convexPoints[i].x - 2, convexPoints[i].y - 2, 4, 4);
  //}

  contextOut.fillStyle = 'purple';
  for (var i=0; i<mergedPoints.length; i++) {
    contextOut.fillRect(mergedPoints[i].x - 4, mergedPoints[i].y - 4, 8, 8);
  }

  contextOut.fillStyle = 'green';
  for (var i=0; i<points.length; i++) {
    contextOut.fillRect(points[i].x - 1, points[i].y - 1, 2, 2);
  }

  //contextOut.fillStyle = 'blue';
  //for (var i=0; i<simplifiedMergedPoints.length; i++) {
  //  contextOut.fillRect(simplifiedMergedPoints[i].x, simplifiedMergedPoints[i].y, 3, 3);
  //}

  var pointsToTriangulate = mergeVertices(simplifiedPoints, 1);

  if (pointsToTriangulate.length >= 3) {

    var TRIANGLE_FILL_STYLE = "#e0c4ef";
    var TRIANGLE_STROKE_STYLE = "#911ccd";
    //var TRIANGLE_FILL_STYLE = "#e0c4ef";
    //var TRIANGLE_STROKE_STYLE = TRIANGLE_FILL_STYLE;
    var CONSTRAINT_STYLE = "rgba(0,0,0,0.6)";
    var ERROR_STYLE = "rgba(255,0,0,0.8)";
    var MARGIN = 64;

    // auto scale / translate
    //bounds = swctx.getBoundingBox();
    //xscale = (contextTri.canvas.width - 2 * MARGIN) / (bounds.max.x - bounds.min.x);
    //yscale = (contextTri.canvas.height - 2 * MARGIN) / (bounds.max.y - bounds.min.y);
    //scale = Math.min(xscale, yscale);
    //contextTri.translate(MARGIN, MARGIN);
    //contextTri.scale(scale, scale);
    //contextTri.translate(-bounds.min.x, -bounds.min.y);
    //linescale = 1 / scale;
    var linescale = 1;

    // draw constraints
    contextTri.lineWidth = 1; //4 * linescale;
    contextTri.strokeStyle = CONSTRAINT_STYLE;
    contextTri.fillStyle = CONSTRAINT_STYLE;
    polygonPath(contextTri, pointsToTriangulate);
    contextTri.stroke();

    var swctx = new poly2tri.SweepContext(pointsToTriangulate, {cloneArrays: true});
    //swctx.addPoint(centroid);
    swctx.triangulate();
    var triangles = swctx.getTriangles();

    if (true) {
      // draw result
      contextTri.lineWidth = linescale;
      contextTri.fillStyle = TRIANGLE_FILL_STYLE;
      contextTri.strokeStyle = TRIANGLE_STROKE_STYLE;

      triangles.forEach(function(t) {
        polygonPath(contextTri, [t.getPoint(0), t.getPoint(1), t.getPoint(2)]);
        contextTri.fill();
        contextTri.stroke();
      });
    }
  }

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
  time += progress;

  context.clearRect(0, 0, canvas.width, canvas.height);
  contextOut.clearRect(0, 0, canvas.width, canvas.height);
  contextTri.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'white';
  context.fillRect(64, 64, 30, 30);
  context.fillRect(64 + ((Math.sin(time * 0.0005) * 15.0)), 64 + ((Math.sin(time * 0.0005) * 15.0)), 32, 32);
  context.beginPath();
  context.fillStyle = 'white';
  context.arc(64 + ((Math.sin(time * 0.0005) * 126.0)), 64 + ((Math.cos(time * 0.0005) * 16.0)), 17, 0, 2 * Math.PI, false);
  context.closePath();
  context.fill();

  contextTri.save();
  handleTestClick();
  contextTri.restore();

  if (!paused) {
    window.requestAnimationFrame(step);
  }
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

  step(start);
};

document.addEventListener('DOMContentLoaded', main);
