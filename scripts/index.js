let $mainLogo = $('.main-logo');
let $mainTitle = $('.main-title');
let $startButton = $('.start-button');
let $overlay = $('.overlay');
let $cardTemplate = $('#card-template');

const suits = ['C', 'D', 'H', 'S'];
const types = ['0', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'J', 'K', 'Q'];
const delay = 5000;
const animationDuration = 1000;

sounds.playMain();
blockInteractions(animationDuration);

$startButton.one('click', function () {
    sounds.playClick();
    reAnimate($mainLogo, 'bounceInDown', 'flyOutUp');
    reAnimate($mainTitle, 'fadeInLeft', 'fadeOutLeft');
    reAnimate($startButton, 'fadeIn', 'fadeOut');
    $startButton.removeClass('delayed');
    $startButton.one('animationend', function () {
        $startButton.remove();

        new Game().initGame();
    })
});

function Game() {
    let cardList = makeRandomCardList();

    this.firstPickCard = undefined;
    this.firstPickValue = undefined;
    this.rightGuesses = 0;
    this.points = 0;
    this.board = this.createBoard(cardList);
}

Game.prototype = {
    initGame: function () {
        let currentGame = this;
        let $playground = $('#playground');
        let $board = $(currentGame.board);
        setTimeout(function () {
            let $flipCheckers =  $board.find('[type="checkbox"]');

            $flipCheckers.on('change', function () {
                let $flipChecker = $(this);
                if ($flipChecker.prop('checked')) {
                    $flipChecker.next()
                        .attr('data-tid', 'Card-flipped');
                 } else {
                    $flipChecker.next()
                        .attr('data-tid', 'Card');
                }
            });

            $board.on('click', '.card', function () {
                // this === div.card
                // Фиксируем поворот карты чекбоксом
                let $flipChecker = $(this).prev();

                if (!$flipChecker.prop('checked')) {
                    $flipChecker.prop('checked', true).change();

                    currentGame.makeMove(this, $flipChecker.val());
                }
            });

            $board.on('restore', '.card', function () {
                let $flipChecker = $(this).prev();
                $flipChecker.prop('checked', false).change();
            });

            $flipCheckers.prop('checked', false).change();
        }, delay);

        $playground.empty().append($board);
    },
    createBoard: function(links) {
        let cardList = links.map(makeCard);

        let $counter = $('<span>')
            .addClass('game-board__counter')
            .attr('data-tid', 'Menu-scores')
            .html(this.points);

        let $points = $('<span>')
            .addClass('game-board__points')
            .html(`Очки: `)
            .append($counter);
        this.$pointsHolder = $counter;

        let $tryAgain = $('<button>')
            .addClass('game-board__again button_dark')
            .attr('data-tid', 'Menu-newGame')
            .html('Начать заново');

        $tryAgain.one('click', function () {
            sounds.playClick();
            new Game().initGame();
        });

        let $board = $('<div>')
            .addClass('game-board')
            .attr('data-tid', 'Deck')
            .append($points, $tryAgain, cardList);

        return $board.get(0);
    },
    makeMove: function (currentCard, currentValue) {
        if (!this.firstPickValue) {
            this.setPick(currentCard, currentValue);

            return;
        }

        let firstPickedCard = this.firstPickCard;
        if (this.firstPickValue === currentValue) {
            this.updatePoints(true);
            this.rightGuesses++;
            sounds.playSuccess();

            setTimeout(function () {
                $(firstPickedCard).remove();
                $(currentCard).remove();

                if (this.currentGameState() === 'completed') {
                    this.endGame();
                }
            }.bind(this), animationDuration);
        } else {
            this.updatePoints(false);
            sounds.playWrong();

            setTimeout(function () {
                $(firstPickedCard).trigger('restore');
                $(currentCard).trigger('restore');
            }.bind(this), animationDuration);
        }
        this.resetPick();
    },
    endGame: function () {
        $(this.board).replaceWith(makeEndScreen(this.points));
        sounds.playTada();
    },
    setPick: function (card, value) {
        this.firstPickCard = card;
        this.firstPickValue = value;
    },
    resetPick: function () {
        this.firstPickCard = undefined;
        this.firstPickValue = undefined;
    },
    currentGameState: function() {
        return this.rightGuesses === 9 ? 'completed' : 'going'
    },
    updatePoints: function (isCorrect) {
        if (isCorrect) {
            this.points += (9 - this.rightGuesses) * 42;
        } else {
            this.points -= this.rightGuesses * 42;
        }
        this.$pointsHolder.html(this.points);
    }
};

function makeCard(link) {
    let $card = $($cardTemplate.clone().prop('content'));

    $card.find('[type="checkbox"]').prop('value', link.split('/').pop());
    $card.find('.card__front').attr('src', link);

    return $card.get(0);
}

function makeEndScreen(points) {
    let $endScreen = $('<div>').addClass('container_ending container');

    let $endImage = $('<img>')
        .addClass('end-image bounceInDown animated')
        .attr({
            src: 'images/Group2.png',
            srcset: 'images/Group2@2x.png 2x'
        });

    let $endText = $('<p>')
        .addClass('end-text bounceInDown animated')
        .html(`Поздравляем!<br>Ваш итоговый счет: ${points}`);

    let $restartButton = $('<button>')
        .addClass('restart-button button_light button_m fadeIn animated delayed')
        .attr('data-tid', 'EndGame-retryGame')
        .html('Ещё раз');

    $restartButton.one('click', function () {
        sounds.playClick();
        $(this).prop('disabled', true);
        reAnimate($endImage, 'bounceInDown', 'flyOutUp');
        reAnimate($endText, 'bounceInDown', 'fadeOutLeft');
        reAnimate($restartButton, 'fadeIn', 'fadeOut');
        $restartButton.removeClass('delayed');
        // После reAnimate событие animationend не срабатывает в firefox, поэтому setTimeout
        setTimeout(function () {
            $restartButton.remove();

            new Game().initGame();
        }, animationDuration);
    });

    $endScreen.append($endImage, $endText, $restartButton);

    return $endScreen;
}

function blockInteractions(milliseconds) {
    $overlay.removeClass('overlay-off');
    setTimeout(function () {
        $overlay.addClass('overlay-off');
    }, milliseconds)
}

function reAnimate($element, oldAnimClass, newAnimClass) {
    // Обращаюсь к css свойству, чтобы принудительно вызвать перерисовку
    $element.removeClass(oldAnimClass);
    $element.css('height');
    $element.addClass(newAnimClass);
}

function getRandomCardLink() {
    let randSuit = suits[Math.floor(Math.random() * suits.length)];
    let randType = types[Math.floor(Math.random() * types.length)];

    return `/MemoryGame/images/cards/${randType + randSuit}.png`;
}

function makeRandomCardList() {
    let cardList = [];
    let usedCards = [];
    while(cardList.length < 18) {
        let link = getRandomCardLink();
        if (usedCards.includes(link)) {
            continue;
        }
        usedCards.push(link);
        cardList.push(link, link);
    }

    return shuffle(cardList);
}

function shuffle(array) {
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
