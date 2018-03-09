let sounds = {};

let audioHolder = document.getElementById('audio-holder');

const click = audioHolder.querySelector('#audio-click');
const tada = audioHolder.querySelector('#audio-tada');
const wrong = audioHolder.querySelector('#audio-wrong');
const success = audioHolder.querySelector('#audio-success');
const main = audioHolder.querySelector('#audio-main');

sounds.playClick = play.bind(null, click, 0.5);
sounds.playWrong = play.bind(null, wrong, 0.5);
sounds.playSuccess = play.bind(null, success, 0.5);
sounds.playMain = play.bind(null, main, 0.05);
// По какой-то неведомой мне причине, звуки, проигрываемые при окончании воспроизводятся дважды
// если проигрывать с помощью play. Потому для финального звука другая функция
sounds.playTada = () => {
    if (tada.paused) {
        tada.play();
    }
};
sounds.play = play;

function play(audio, volume) {
    audio.volume = volume;

    audio.pause();
    audio.currentTime = 0;
    audio.play();
}