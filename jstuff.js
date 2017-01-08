'use strict';

var newSong = false;
var ad = document.querySelector('audio');
var lastPlayed = 0;
var loggedIn = false;

//Dunk dunk musik
var songList = ['0tfedA8z1Vo5DdMVBORMKu', '17Ng10tIgnYmAitl0SgT3R', '6PPuxhL33u7eoMdodGTSTM', '3vv9phIu6Y1vX3jcqaGz5Z', '4LaQCXDmZ6zwESNVBkW9qW', '6VRhkROS2SZHGlp0pxndbJ', '13H0KlqVctKdFvQD5X5S4E'];

var ScaleBar = {
  min: 5,
  max: -3,
  get: function get(fromMin, fromMax, valueIn) {
    var toMax = ScaleBar.max;
    var toMin = ScaleBar.min;

    fromMin = fromMax * 0.20;

    return (toMax - toMin) * (valueIn - fromMin) / (fromMax - fromMin) + toMin;
  }
};

var canvas = undefined,
    canvasContext = undefined,
    analyser = undefined,
    rafCall = undefined,
    bufferLength = undefined,
    frequencyData = undefined,
    circle = undefined;

canvas = document.querySelector('.music-visuals');
circle = document.querySelector('.vis-circle');

canvasContext = canvas.getContext('2d');

canvas.width = canvas.offsetWidth * window.devicePixelRatio;
canvas.height = canvas.offsetHeight * window.devicePixelRatio;

canvasContext.imageSmoothingEnabled = false;

var audioContext = new window.AudioContext();
var source = audioContext.createMediaElementSource(document.querySelector('audio'));

analyser = audioContext.createAnalyser();

source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 2048;
analyser.minDecibels = -70;
analyser.maxDecibels = 120;

bufferLength = analyser.frequencyBinCount;
frequencyData = new Uint8Array(bufferLength);

var MusicVisuals = {
  call: null,
  start: function start() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(frequencyData);

    var frequencyWidth = window.devicePixelRatio,
        frequencyHeight = 0,
        x = 0,
        scales = [],
        fd = [];

    var fdMin = Math.min.apply(Math, frequencyData);
    var fdMax = Math.max.apply(Math, frequencyData);

    for (var increment = 0; x < canvas.width; increment++) {
      frequencyHeight = frequencyData[increment] * (canvas.height / 250);

      if (increment < 15) {
        scales.push(frequencyHeight / 50);
      }

      fd.push(frequencyData[increment]);

      frequencyHeight = ScaleBar.get(fdMin, fdMax, frequencyData[increment]);
      frequencyHeight = frequencyData[increment];
      canvasContext.fillStyle = '#fff';

      var y = canvas.height - frequencyHeight;

      y = y > canvas.height - 1 ? canvas.height - 1 : y;
      y = y < 0 ? 0 : y;

      canvasContext.fillRect(x, y, frequencyWidth, canvas.height);
      x += frequencyWidth * 3;
    }

    var scale = scales.reduce(function (pv, cv) {
      return pv + cv;
    }, 0) / scales.length * 4.5;

    scale = scale < 1 ? 1 : scale;
    scale = scale > 3 ? 3 : scale;

    circle.style.transform = 'scale(' + scale + ')';

    rafCall = requestAnimationFrame(MusicVisuals.start);
  },
  stop: function stop() {
    cancelAnimationFrame(rafCall);
  }
};

function genWav(json, ap) {
  var url = json.preview_url;
  if (url === null) {
    alert("Preview not available for this song. :(");
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function (e) {
    if (this.status == 200) {
      var ad = document.querySelector('audio');
      var paused = ad.paused;
      ad.src = URL.createObjectURL(this.response);
      ad.oncanplaythrough = function () {
        this.play();
      };
      newSong = false;
    }
  };
  xhr.send();
}

function playSong(id) {
  WebAPI.tracks(id, function (json) {
    genWav(json);
  }, function (e) {
    console.log(e);
  });
}

function playPrev() {
  document.querySelector('.stage').classList.remove('hover');
  lastPlayed -= 1;
  var n = songList[lastPlayed];
  if (n == undefined) {
    playSong(songList[songList.length - 1]);
    lastPlayed = songList.length - 1;
    return;
  } else {
    playSong(n);
  }
}

function playNext() {
  document.querySelector('.stage').classList.remove('hover');
  lastPlayed++;
  var n = songList[lastPlayed];
  if (n === undefined) {
    playSong(songList[0]);
    return;
  } else {
    playSong(n);
  }
}

window.onload = function () {
  playSong(songList[0]);
  window.wallpaperRegisterAudioListener(wallpaperAudioListener);
  //$( ".playlist ul" ).sortable();
  //$( ".playlist ul").disableSelection();
};

document.querySelector('#play-btn').addEventListener('click', function () {
  ad.paused ? ad.play() : ad.pause();
});

ad.addEventListener('play', function () {
  document.querySelector('#play-btn').innerHTML = 'Pause';
  document.querySelector('.stage').classList.add('hover');
  MusicVisuals.start();
  document.querySelector('.cover-holder').style.animationPlayState = 'running';
});

ad.addEventListener('pause', function () {
  document.querySelector('#play-btn').innerHTML = 'Play';
  document.querySelector('.stage').classList.remove('hover');
  MusicVisuals.stop();
  document.querySelector('.cover-holder').style.animationPlayState = 'paused';
});

ad.addEventListener('timeupdate', function () {
  if (ad.duration - ad.currentTime <= 2) {
    document.querySelector('.stage').classList.remove('hover');
  }
}, false);

ad.addEventListener('ended', function () {
  playNext();
});

document.querySelector('#next-btn').addEventListener('click', function () {
  playNext();
});;

document.querySelector('#prev-btn').addEventListener('click', function () {
  playPrev();
});

document.querySelector('.search button').addEventListener('click', function () {
  newSong = true;
  document.querySelector('.stage').classList.remove('hover');
  var song = document.querySelector('input.spotify-url').value;
  if (song === '') return;
  console.log(song + ' -> ' + WebAPI.urlToId(song));
  song = song === '' ? 'spotify:track:7JD5OoA5hGBJDCBecoGlCy' : song;WebAPI.tracks(WebAPI.urlToId(song), function (json) {
    genWav(json);
  }, function (e) {
    console.log(e);
  });
}, false);

document.querySelector('input.spotify-url').onfocus = function () {
  this.select();document.querySelector('.stage').classList.remove('hover');
};

document.querySelector('input.spotify-url').onblur = function () {
  if (!newSong) {
    document.querySelector('.stage').classList.add('hover');
  }
};

document.querySelector('#open-file').onclick = function () {
  document.querySelector('#file-input').click();
};

function getInfoFromFileName(name) {
  name = name == null ? 'Unkown' : name;
  name = name.replace(/_/g, ' ');
  var artist = artist == null ? 'Unkown' : artist;
  if (name.indexOf(' - ') !== -1) {
    name = name.split(' - ');
    artist = name[0];
    name = name[1];
  }
  name = name.split('.')[0];
  return {
    artist: artist,
    title: name
  };
}

function fileLoad(file) {
  var fileInfo = getInfoFromFileName(file.name);
  ad.pause();
  window.spin = false;
  var url = URL.createObjectURL(file);
  ID3.clearAll();
  ID3.loadTags(url, function () {
    var tags = ID3.getAllTags(url);
    console.log(tags);

    ad.src = url;
    ad.play();
  }, {
    dataReader: FileAPIReader(file),
    tags: ['artist', 'album', 'title']
  });
}

document.querySelector('#file-input').onchange = function (e) {
  fileLoad(e.target.files[0]);
};

document.querySelector('#show-audio').onclick = function () {
  ad.classList.toggle('show');
};
