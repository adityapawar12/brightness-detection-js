var w = 560;
var h = 315;

var imageCanvas = document.getElementById('image-canvas');
var imagectx = imageCanvas.getContext('2d');

var brightnessCanvas = document.getElementById('brightness-canvas');
var brightnessctx = brightnessCanvas.getContext('2d');

var rangeBrightness = 50;
var rangeThreshold = 127
var thPercent = 0;
var overPercent = 0;
var underPercent = 0;
var video = document.createElement('video');
video.autoplay = 'autoplay';
video.width = w;
video.height = h;
var constraints = { 'video': true };

// EXECUTION ORDER 1
if (navigator.webkitGetUserMedia) {
  // USED TO SET THE HEIGHT AND WIDTH OF THE CAMERA.
  constraints = {
    video: {
      mandatory: {
        maxWidth: w,
        maxHeight: h
      }
    }
  };
}

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

window.requestAnimFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame;

// EXECUTION ORDER 3
init = function () {
  imageCanvas.height = video.videoHeight;
  imageCanvas.width = video.videoWidth;
  brightnessCanvas.height = imageCanvas.height / 3;
  brightnessCanvas.width = imageCanvas.width / 2;
  update();
}

// EXECUTION ORDER 5
brightness = function (pixels, adjustment) {
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    d[i] += adjustment;
    d[i + 1] += adjustment;
    d[i + 2] += adjustment;
  }
  return pixels;
};

average = function (imgData) {
  var d = imgData.data;
  var rgb = { r: 0, g: 0, b: 0 };
  for (var i = 0; i < d.length; i += 4) {
    rgb.r += d[i];
    rgb.g += d[i + 1];
    rgb.b += d[i + 2];
  }
  rgb.r = ~~(rgb.r / (d.length / 4));
  rgb.g = ~~(rgb.g / (d.length / 4));
  rgb.b = ~~(rgb.b / (d.length / 4));
  return rgb;
};

// EXECUTION ORDER 4
update = function () {
  var alpha, data;
  if (rangeBrightness < 50) {
    alpha = 0 - ((1 - (rangeBrightness / 50)) * 255);
  } else {
    alpha = ((rangeBrightness - 50) / 50) * 255;
  }

  pixThreshold = rangeThreshold;
  imagectx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, imageCanvas.width, imageCanvas.height);
  data = brightness(imagectx.getImageData(0, 0, imageCanvas.width, imageCanvas.height), alpha);
  imagectx.putImageData(data, 0, 0);

  data = average(imagectx.getImageData(0, 0, imageCanvas.width, imageCanvas.height));


  let avg = Math.ceil(Math.round(((0.2126 * data.r + 0.7152 * data.g + 0.0722 * data.b) / 255) * 100 * 100) / 100);
  if (avg < 50) {
    let diff = Math.floor(50 - avg);
    document.getElementById('brightness-inc').innerHTML = diff + '%';
    // rangeBrightness = Math.floor(rangeBrightness + diff);
  } else {
    let diff = Math.floor(avg - 50);
    document.getElementById('brightness-dec').innerHTML = diff + '%';
    // rangeBrightness = Math.floor(rangeBrightness - diff);
  }
  document.getElementById('avg-brightness').innerHTML = avg + '%';
  brightnessctx.fillStyle = 'rgb(' + data.r + ',' + data.g + ',' + data.b + ')';
  brightnessctx.fillRect(0, 0, brightnessCanvas.width, brightnessCanvas.height);

  window.requestAnimationFrame(update);
}

error = function (e) {
  console.log('Snap!', e);
  alert('No camera or getUserMedia() not available')
}

// EXECUTION ORDER 2
if (navigator.getUserMedia) {
  navigator.getUserMedia(
    constraints,
    function (stream) {
      video.srcObject = stream;
      // onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
      vidReady = setInterval(function () {
        if (video.videoHeight !== 0) {
          clearInterval(vidReady);
          init();
        }
      }, 100)
    }, error);
} else {
  error('No getUserMedia')
}