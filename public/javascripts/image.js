/*
var Filters = {};

Filters.getPixels = function(img) {
  var c = this.getCanvas(img.width, img.height);
  var ctx = c.getContext('2d');
  ctx.drawImage(img);
  return ctx.getImageData(0,0,c.width,c.height);
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

*/

function APixelsFill(pixels, value)
{
	var len = pixels.width * pixels.height;
	var d = pixels.data;

	for (var i=0; i<len; i++) {
		d[i] = value;
	}
	pixels.data = d;
}


function RGBA2A(pixels, context) {
	var d = pixels.data;
	var out = createImageDataA(pixels.width, pixels.height)
	var outData = out.data;

	var j = 0;
	for (var i=0; i<d.length; i+=4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		outData[j] = 0.2126*r + 0.7152*g + 0.0722*b;
		j++;
		
	}
	return out;
};

function A2RGBA(pixels, context) {
	var d = pixels.data;
	var out = context.createImageData(pixels.width,pixels.height);
	var outData = out.data;
	out.width = pixels.width;
	out.height = pixels.height;

	var j = 0;
	for (var i=0; i<d.length; i++) {
		var v = d[i];

		outData[j] = outData[j+1] = outData[j+2] = v;
		outData[j+3] = 255;
		j += 4;
	}
	return out;
};

function createImageDataA(width, height)
{
	var out = {};
	out.data = [];
	out.width = width;
	out.height = height;
	return out;
}


// dont use 0 as a state because it is equal to false
function fill4(x, y, evalFn, state) {
	var toEvaluate = [[x, y, state]];
	var pos;
	while (toEvaluate.length != 0) {
		pos = toEvaluate.pop();
		x = pos[0]; y = pos[1];
		state = evalFn(x, y, pos[2]);
		if (state != false) {
			toEvaluate.push([x, y+1, state]);
			toEvaluate.push([x, y-1, state]);
			toEvaluate.push([x-1, y, state]);
			toEvaluate.push([x+1, y, state]);
		}
	}
}

var dxx = {data:[-1,0,1,  
		 -2,0,2,  
		 -1,0,1], width:3, height:3, scale:1};
var dyy = {data:[-1,-2,-1,  
		  0,0,0,  
		  1,2,1], width:3, height:3, scale:1};
  

function applyKernelAlphaOnPixel(pixels, kernel, x, y)
{
	var xx, yy, kernelIndex, pixelIndex;
	var sum = 0;

	var startx = (kernel.width-1)/2;
	var starty = (kernel.height-1)/2;

	kernelIndex = 0;
	for (yy = -starty; yy <= starty; yy++) {
		for (xx = -startx; xx <= startx; xx++) {
			var xxx = x + xx;
			var yyy = y + yy;
			if (xxx > 0 && yyy > 0 && xxx < pixels.width && yyy < pixels.height) {
				pixelIndex =  xxx + yyy*pixels.width;
				sum += kernel.data[kernelIndex]*pixels.data[pixelIndex];
			}
			kernelIndex++;
		}
	}
	return sum*kernel.scale;
}

function applyKernelAlphaOnPixels(pixels, kernelx, kernely, pixelsOut)
{
	var outIndex = 0;
	for (y = 0; y < pixels.height; y++) {
		for (x = 0; x < pixels.width; x++) {
			//if (mask.data[outIndex] > 0) {
				var dx = applyKernelAlphaOnPixel(pixels, kernelx, x, y);
				var dy = applyKernelAlphaOnPixel(pixels, kernely, x, y);
				pixelsOut.data[outIndex] = Math.sqrt(dx*dx+dy*dy);
			//}
			//else
			//	pixelsOut.data[outIndex] = 0;
			outIndex++;
		}
	}
}

function applyMaskAlphaOnPixels(pixels, mask, pixelsOut)
{
	var outIndex = 0;
	for (y = 0; y < pixels.height; y++) {
		for (x = 0; x < pixels.width; x++) {
			if (mask.data[outIndex] > 0) {
				pixelsOut.data[outIndex] = pixels.data[outIndex];
			}
			else
				pixelsOut.data[outIndex] = 0;
			outIndex++;
		}
	}
}


// adapted from: http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
function lineIterator(x0, y0, x1, y1, callback) {
	var disty = y1 - y0;
	if (disty < 0) disty = -disty;
	var distx = x1 - x0;
	if (distx < 0) distx = -distx;

	var steep = disty > distx;
	if (steep) {
		//swap(x0, y0)
		//swap(x1, y1)
		var tmp = x0;
		x0 = y0;
		y0 = tmp;
		tmp = x1;
		x1 = y1;
		y1 = tmp;
	}
	if (x0 > x1) {
		//swap(x0, x1)
		//swap(y0, y1)
		var tmp = x0;
		x0 = x1;
		x1 = tmp;
		tmp = y0;
		y0 = y1;
		y1 = tmp;
	}	
	var deltax = x1 - x0;
	var deltay = y1 - y0;
	if (deltay < 0) deltay = -deltay;
	var error = deltax / 2;
	var ystep;
	var y = y0;
	if (y0 < y1) ystep = 1;
	else ystep = -1;

	for (x = x0; x <= x1; x++) {
        	if (steep) callback(y,x);
		else callback(x,y);
         	error = error - deltay;
         	if (error < 0) {
             		y = y + ystep;
             		error = error + deltax;
		}
	}
}

// adapted from: http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
function lineDirectedIterator(x0, y0, x1, y1, callback) {
	var disty = y1 - y0;
	if (disty < 0) disty = -disty;
	var distx = x1 - x0;
	if (distx < 0) distx = -distx;

	var steep = disty > distx;
	var rev = false;
	if (steep) {
		//swap(x0, y0)
		//swap(x1, y1)
		var tmp = x0;
		x0 = y0;
		y0 = tmp;
		tmp = x1;
		x1 = y1;
		y1 = tmp;
	}
	if (x0 > x1) {
		rev = true;
		//swap(x0, x1)
		//swap(y0, y1)
		var tmp = x0;
		x0 = x1;
		x1 = tmp;
		tmp = y0;
		y0 = y1;
		y1 = tmp;
	}	
	var deltax = x1 - x0;
	var deltay = y1 - y0;
	if (deltay < 0) deltay = -deltay;
	var error = deltax / 2;
	var ystep;
	var y = y0;
	if (y0 < y1) ystep = 1;
	else ystep = -1;

	var pos = [];
	for (x = x0; x <= x1; x++) {
        	if (steep) pos.push([y,x]);
		else pos.push([x,y]);
         	error = error - deltay;
         	if (error < 0) {
             		y = y + ystep;
             		error = error + deltax;
		}
	}
	if (rev) {
		for (var i = pos.length - 1; i >= 0; i--)
			callback(pos[i][0], pos[i][1]);
	}
	else {
		for (var i = 0; i < pos.length; i++)
		callback(pos[i][0], pos[i][1]);
	}	
}


///////////////////////
// adapted from: http://en.wikipedia.org/wiki/Xiaolin_Wu%27s_line_algorithm

function ipart(x) {
    return Math.floor(x);
}

function fpart(x) {
    return x - Math.floor(x);
}

function rfpart(x) {
    return 1 - fpart(x);	
}

function xiaolinWuLineIterator(x1,y1, x2,y2,  plot) {
    var swapPlot;
    var dx = x2 - x1;
    var dy = y2 - y1;

    if (Math.abs(dx) < Math.abs(dy)) {    
        swapPlot = function(x, y, c) { plot(y, x, c); };             
        var t;
        t = x1; x1 = y1; y1 = t;
        t = x2; x2 = y2; y2 = t;
        t = dx; dx = dy; dy = t;
        //swap x1, y1
        //swap x2, y2
        //swap dx, dy
    }
    else
	swapPlot = function(x, y, c) { plot(x, y, c); };  

    if (x2 < x1) {
        //swap x1, x2
        //swap y1, y2
        t = x1; x1 = x2; x2 = t;
        t = y1; y1 = y2; y2 = t;
    }
    var gradient = dy / dx;

    // handle first endpoint
    var xend = Math.round(x1);
    var yend = y1 + gradient * (xend - x1);
    var xgap = rfpart(x1 + 0.5);
    var xpxl1 = xend;  // this will be used in the main loop
    var ypxl1 = ipart(yend);

    swapPlot(xpxl1, ypxl1, rfpart(yend) * xgap);
    swapPlot(xpxl1, ypxl1 + 1, fpart(yend) * xgap);
    var intery = yend + gradient; // first y-intersection for the main loop

    // handle second endpoint
    xend = Math.round(x2);
    yend = y2 + gradient * (xend - x2);
    xgap = fpart(x2 + 0.5);
    var xpxl2 = xend;  // this will be used in the main loop
    var ypxl2 = ipart(yend);
    swapPlot(xpxl2, ypxl2, rfpart(yend) * xgap);
    swapPlot(xpxl2, ypxl2 + 1, fpart(yend) * xgap);

    // main loop
    for (x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
        swapPlot(x, ipart(intery), rfpart(intery));
        swapPlot(x, ipart(intery) + 1, fpart(intery));
        intery = intery + gradient;
    }
}

