let sounds = {};

let audioHolder = document.getElementById('audio-holder');

const click = audioHolder.querySelector('#audio-click');
const tada = audioHolder.querySelector('#audio-tada');
const wrong = audioHolder.querySelector('#audio-wrong');
const success = audioHolder.querySelector('#audio-success');
const main = audioHolder.querySelector('#audio-main');

sounds.playClick = play.bind(null, click);
sounds.playTada = play.bind(null, tada);
sounds.playWrong = play.bind(null, wrong);
sounds.playSuccess = play.bind(null, success);
sounds.playMain = () => {
    setVolume(main, 0.05);
    play(main);
};

function setVolume(audio, volume) {
    audio.volume = volume;
}

function play(audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.play();
}