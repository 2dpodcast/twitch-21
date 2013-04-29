/// <reference path="../../phaser/Phaser/Game.ts" />
/// <reference path="./FontTexture.ts" />

String.prototype["pad"] = function (l, s) {
    return (l -= this.length) > 0
        ? (s = new Array(Math.ceil(l / s.length) + 1).join(s)).substr(0, s.length) + this + s.substr(0, l - s.length)
        : this;
};

(function () {
    // Create game instance and connect init, create and update methods
    var myGame = new Phaser.Game(this, 'game', 800, 480, init, create, update, render);
    var buttons: Phaser.Sprite[] = [];
    var buttonPadding: number = 30;
    var totalButtons: number = 5;
    var mainNumber: number;
    var timeValue: number;
    var timeDelay: number;
    var mainButton: Phaser.Sprite;
    var mode: number;
    var START_GAME: number = 0;
    var IN_GAME: number = 1;
    var GAME_OVER: number = 2;
    var score: number = 0;
    var cardsUsed: number = 0;
    var valueLost: number = 0;
    var smallFont: Phaser.FontTexture;
    var tweenedValues: any = { value: 0 };
    var scoreTweenedValue: any = { value: 0 };
    var scoreTween: Phaser.Tween
    var overTween: Phaser.Tween
    var logo: Phaser.Sprite;
    var startText: Phaser.Sprite;
    var instructions: Phaser.Sprite;
    var restart: Phaser.Sprite;
    var blink: number = 0;
    var streak: number = -1;

    function init() {
        myGame.loader.addTextureAtlas('entities', 'assets/textures/entities.png', 'assets/textures/entities.txt');
        myGame.loader.addImageFile('nokia-24', 'assets/textures/nokia-24.png');
        myGame.loader.addTextFile('nokia-24-atlas', 'assets/textures/nokia-24.txt');
        myGame.loader.load();
    }
    function create() {

        // Create button loop
        for (var i = 0; i < totalButtons; i++) {
            var button: Phaser.Sprite = myGame.createSprite(0, 0, "entities");
            button.exists = false;
            button.alpha = .7;
            buttons.push(button);
        }

        mainButton = myGame.createSprite(myGame.stage.centerX, myGame.stage.centerY, "entities");
        mainButton.exists = false;

        mode = START_GAME;

        myGame.input.onDown.add(click, this);

        logo = myGame.createSprite(myGame.stage.centerX - 306, myGame.stage.centerY - 200, "entities");
        logo.frameName = "logo.png";

        startText = myGame.createSprite(myGame.stage.centerX - 145, myGame.stage.centerY - 50, "entities");
        startText.frameName = "start-text.png";

        instructions = myGame.createSprite(myGame.stage.centerX - 386, myGame.stage.centerY + 50, "entities");
        instructions.frameName = "instructions.png";

        restart = myGame.createSprite(myGame.stage.centerX - 147, myGame.stage.centerY -150, "entities");
        restart.frameName = "restart.png";
        restart.exists = false;

        smallFont = new Phaser.FontTexture(myGame, 0, 0, "nokia-24", 10, 10);
        smallFont.alpha = .6;
        scoreTween = myGame.createTween(tweenedValues);
        
    }

    function click(value) {
        
        if (mode == START_GAME) {
            if (myGame.input.mouse.isDown) {
                newRound();
            }
            return;
        } else if (mode == GAME_OVER) {
            // UPDATE DISPLAY FOR GAME OVER
            if (myGame.input.mouse.isDown && score == scoreTweenedValue.value) {
                newRound();
            }
            return;
        } if (mode == IN_GAME) {

            if (tweenedValues.value != mainNumber)
                return;

            // we can assume mode is IN_GAME"


            // test for input
            if (myGame.input.mouse.isDown) {

                for (var i = 0; i < totalButtons; i++) {
                    var button: Phaser.Sprite = buttons[i];

                    //TODO this should be in a group
                    if (contains(button, myGame.input.x, myGame.input.y)) {
                        var value: number = Number(button.name);
                        
                        mainNumber += value
                        tweenedValues.value = mainNumber;
                        button.exists = false;
                        timeValue = 0;
                        cardsUsed++;
                    }
                }

                if (contains(mainButton, myGame.input.x, myGame.input.y)) {
                    submitScore();
                    return;
                }
            }
        }
    }

    function increateMainNumber(newValue, speed = 500, delay = 0) {
        scoreTween.to({ value: newValue }, speed, Phaser.Easing.Quadratic.Out);
        scoreTween.delay = delay;
        scoreTween.start();
    }

    function newRound() {

        restart.exists = startText.exists= instructions.exists = logo.exists = false;
        

        streak += 1;
        //Reset timer
        timeValue = 0;
        cardsUsed = 0;
        valueLost = 0;
        tweenedValues.value = 0;

        // Create new main number
        mainNumber = myGame.rnd.integerInRange(1, 11);
        increateMainNumber(mainNumber);

        var startOffsetX = 150;
        var startOffsetY = myGame.stage.height - 100;
        // Reset Buttons
        for (var i = 0; i < totalButtons; i++) {
            var value: number = myGame.rnd.integerInRange(1, 11);
            // Create button loop
            var button: Phaser.Sprite = buttons[i];
            button.name = value.toString();
            button.frameName = "small-font-" + (value < 10 ? "0" + value.toString() : value.toString()) + ".png";
            button.x = (i * (button.width + buttonPadding)) + startOffsetX;
            button.y = startOffsetY;
            button.exists = true;
        }

        var tmpValue: number = Math.round(tweenedValues.value);
        // Reset Main button
        mainButton.frameName = "large-font-" + (tmpValue < 10 ? "0" + tmpValue.toString() : tmpValue.toString()) + ".png";
        mainButton.exists = true;
        mainButton.x = (myGame.stage.width - mainButton.width) * .5;
        mainButton.y = (myGame.stage.height - mainButton.height) * .5;

        mode = IN_GAME;

    }

    function update() {

        blink += myGame.time.delta;
        
        if (mode == START_GAME) {

            if (blink > 500) {
                startText.visible = !startText.visible;
                blink = 0;
            }
        }

        if (mode == GAME_OVER && scoreTweenedValue.value == score) {
            restart.exists = true;

            if (blink > 500) {
                restart.visible = !restart.visible;
                blink = 0;
            }
        }

        if (mode == IN_GAME) {
            // decrease main number
            

            if (Math.round(tweenedValues.value) == mainNumber)
                timeValue += myGame.time.delta;
            
            if (timeValue >= 1000) {
                timeValue = 0;
                mainNumber--;
                tweenedValues.value = mainNumber;
                valueLost++;
            }

            var tmpValue: number = Math.round(tweenedValues.value);
            mainButton.frameName = "large-font-" + (tmpValue < 10 ? "0" + tmpValue.toString() : tmpValue.toString()) + ".png";

            checkHand();
        } else if (mode == GAME_OVER) {
            var tmpValue: number = Math.round(tweenedValues.value);
            if (tmpValue == 0 && score == 0)
            mainButton.frameName = "large-font-xx.png";
            else
            mainButton.frameName = "large-font-" + (tmpValue < 10 ? "0" + tmpValue.toString() : tmpValue.toString()) + "-green.png";
        }

        if (mainNumber > 21)
            mainButton.frameName = "large-font-xx.png";

    }

    function getFrameName(tmpValue): string {
        var frameName: string = "larg-font-" + (tmpValue < 10 ? "0" + tmpValue.toString() : tmpValue.toString());


        if (mode == GAME_OVER)
            frameName += "-green";

        return frameName + ".png";
    }


    function render() {
        if (mode != START_GAME) {
            smallFont.drawText("score: " + Math.round(scoreTweenedValue.value).toString()["pad"](6, "0"), 20, 20, Phaser.ALIGN.LEFT);
            smallFont.drawText("streak: " + (streak > 0 ? streak : 0).toString()["pad"](2, "0"), myGame.stage.width - 200, 20, Phaser.ALIGN.LEFT);
        }
    }

    function checkHand() {
        // test main number
        if (mainNumber > 21) {
           // mainButton.frameName = "large-font-xx.png";
            mode = GAME_OVER;
            score = 0;
            tweenScore();
        } else if (mainNumber < 1) {
            //mainButton.frameName = "large-font-xx.png";
            mode = GAME_OVER;

            score = 0;
            tweenScore();
        }

        //TODO need to make sure if you can't get a hand it busts, especially if under 15
    }

    function tweenScore(delay:number = 0)
    {
        var finalScoreTween = myGame.createTween(scoreTweenedValue);
        finalScoreTween.to({ value: score }, 1000, Phaser.Easing.Quadratic.Out);
        finalScoreTween.delay = delay;
        finalScoreTween.start();

        if (score == 0)
            streak = -1;
    }

    function submitScore() {
        if (mainNumber >= 15) {
            var tmpScore: number = mainNumber * (totalButtons+1 - cardsUsed) - valueLost * ((mainNumber == 21) ? 2 : 1)
            score += tmpScore;

            //TODO this needs to be tweened
            //scroeTweenedValue.value = score;
            increateMainNumber(0, 1000, 500);


            tweenScore(500);

            //console.log("tmpScore", tmpScore, "score", score, "cardsUsed", cardsUsed, "time", timeValue, "valueLost", valueLost);
            mode = GAME_OVER;
        }
    }
    
    function contains(target, x, y) {
        if (!target.exists)
            return false;

        if (x >= target.x && x <= (target.x + target.width) && y >= target.y && y <= (target.y + target.height)) {
            return true;
        }
        return false;
    }

})();