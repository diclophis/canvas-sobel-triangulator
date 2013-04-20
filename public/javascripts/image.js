// http://www.wizards23.net/projects2011/surfaceaugmenter/SobelOperatorDemo.html?

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

/*
var dxx = {
  data:[-1,0,1,  
		    -2,0,2,  
		    -1,0,1], width:3, height:3, scale:1.0};
var dyy = {
  data:[-1,-2,-1,  
		     0,0,0,  
		     1,2,1], width:3, height:3, scale:1.0};
*/

var dxx = {
  data:[-1,0,1,  
		    -1,0,1,  
		    -1,0,1], width:3, height:3, scale:1.0};
var dyy = {
  data:[1,2,1,  
		     0,0,0,  
		     -1,-2,-1], width:3, height:3, scale:1.0};

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

function applyKernelAlphaOnPixels(pixels, kernelx, kernely, pixelsOut, pointsOut)
{
	var outIndex = 0;
	for (y = 0; y < pixels.height; y++) {
		for (x = 0; x < pixels.width; x++) {
      var dx = applyKernelAlphaOnPixel(pixels, kernelx, x, y);
      var dy = applyKernelAlphaOnPixel(pixels, kernely, x, y);
      var c = Math.floor(Math.sqrt(dx*dx+dy*dy));
      if (c > 0) { // && (outIndex % 4) == 0) {
        //console.log(x, y, c);
        pointsOut.push({x: x, y: y});
      }
      pixelsOut.data[outIndex] = c;
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
