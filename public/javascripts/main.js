// do all the stuff

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var start = Date.now();
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

var step = function (timestamp) {
  var progress = timestamp - start;
  start = timestamp;

  window.requestAnimationFrame(step);
};

var main = function(ev) {

  document.body.appendChild(canvas);
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  context.fillRect(128, 128, 128, 128);

  step(start);
};


document.addEventListener('DOMContentLoaded', main);

