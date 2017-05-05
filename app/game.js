const ROBOT_WAR = (function() {

    let instance;

    function RobotWar() {

        const _bombs = {
            bombsArr: [],
            counter: 100,
            width: 20,
            height: 20,
            speed: 5,
            nextBombAfter: 800
        };

        const _player = {
            lives: 3,
            points: 0,
            bombs: _bombs.counter
        };

        const _game = {
            gameWidth: $("#game")[0].clientWidth,
            gameHeight: $("#game")[0].clientHeight,
            play: false,
            poitsForWin: 5,
            poits: 5,
            $points: $("#scoreValue"),
            $lives: $("#livesValue"),
            $bombs: $("#bombValue")
        };

        const _gameMoves = {
            keyLeft: 37,
            keyRight: 39,
            keyShoot: 38,
        };

        const _enemy = {
            width: $("#enemy").width(),
            height: $("#enemy").height(),
            nextX: 0,
            speed: 3.5,
            dom: $("#enemy"),
            x: $("#enemy").position().left,
            y: $("#enemy").position().top

        };

        const _tank = {
            width: $("#tank").width(),
            height: $("#tank").height(),
            shooting: false,
            speed: 2.5,
            dom: $("#tank"),
            x: $("#tank").position().left,
            y: $("#tank").position().top
        };

        const rules = `afffffffffff ffffffffffff ffffaaa aaaaaaaaaaaa`;

        let keyEvents = function(keyCode, state) {
            if (keyCode == _gameMoves.keyLeft) {
                _tank.moveLeft = state;
            }

            if (keyCode == _gameMoves.keyRight) {
                _tank.moveRight = state;
            }

            if (keyCode == _gameMoves.keyShoot) {
                _tank.shooting = state;
                shoot();
            }
        }

        let bindEvents = function() {

            $(document).keyup(function(event) {
                keyEvents(event.keyCode, false);
            });

            $(document).keydown(function(event) {
                keyEvents(event.keyCode, true);
            });
        }

        let enemyMove = function() {

            if (_enemy.nextX < _enemy.x + _enemy.speed && _enemy.nextX > _enemy.x - _enemy.speed) {
                _enemy.nextX = Math.floor(Math.random() * ($("#game")[0].clientWidth - $("#enemy").width()));
            }

            if (_enemy.x > _enemy.nextX) {
                _enemy.x -= _enemy.speed;
            }

            if (_enemy.x < _enemy.nextX) {
                _enemy.x += _enemy.speed;
            }

            _enemy.dom.css("left", (_enemy.x + 'px'));
            _enemy.dom.css("top", (_enemy.y + 'px'));

        }

        let tankMove = function() {
            if (_tank.moveLeft && _tank.x > 0) {
                _tank.x -= _tank.speed;
            }

            if (_tank.moveRight && _tank.x < $("#game")[0].clientWidth - _tank.width) {
                _tank.x += _tank.speed;
            }
            _tank.dom.css("left", (_tank.x + 'px'));
        }

        let createBombs = function() {
            for (let i = 0; i < _bombs.counter; i++) {
                let bombElement = $("<div></div>")
                    .attr('id', 'bomb')
                    .appendTo("#game");
                let bomb = {
                    dom: bombElement,
                    isShot: false,
                    y: 0,
                }
                _bombs.bombsArr.push(bomb);
            }
        }

        let getFirstBomb = function() {
            for (let i = 0; i < _bombs.bombsArr.length; i++) {
                if (!_bombs.bombsArr[i].isShot) {
                    return _bombs.bombsArr[i];
                }
            }
        }

        let moveBombs = function() {
            for (let i = 0; i < _bombs.bombsArr.length; i++) {
                let bomb = _bombs.bombsArr[i];

                if (bomb.y <= 0 && bomb.isShot) {
                    bomb.isShot = false;
                    bomb.dom.css("display", ('none'));
                    continue;
                }

                if (!bomb.isShot) {
                    continue;
                }

                checkForCollision(bomb);

                bomb.y -= _bombs.speed;
                bomb.dom.css("top", (bomb.y + 'px'));

            }
        }

        let shoot = function() {
            let lastTimeShot;
            let currentTime = Date.now();
            let bomb = getFirstBomb();

            if (!_tank.shooting) {
                return;
            }

            if (lastTimeShot && currentTime - lastTimeShot < _bombs.nextBombAfter) {
                return;
            }

            if (!bomb) {
                return;
            }

            let top = $("#game")[0].clientHeight - _tank.height;
            bomb.dom.css("top", (top + 'px'));
            bomb.y = top;
            bomb.dom.css("top", (_tank.width + 'px'));

            bomb.dom.css("left", (_tank.x + (_tank.width / 2 - _bombs.width / 2) + 'px'));
            bomb.dom.css("display", ('block'));
            bomb.isShot = true;

            lastTimeShot = currentTime;

            if (_player.bombs == 0) {
                _tank.shooting = false;
                return;
            }

            --_player.bombs;
            bomb.x = _tank.x + (_tank.width / 2 - _bombs.speed / 2)
        }

        let play = function() {
            $("#play").remove();
            $("#playButton").remove();
            $("#howToPlayButton").remove();
            _game.play = true;
            gameLoop();
        }

        let playAgain = function() {
            let interval;

            if (_player.lives === 0) {
                $("#alert").remove();
                div = $("<div></div>")
                    .attr('id', 'alert')
                    .html('Would you like to play again?')
                    .appendTo('#game');

                if (interval) {
                    clearTimeout(interval);
                }

                interval = setTimeout(function() {

                    return location.reload();
                }, 2000);
            }
            if (_player.lives > 0) {

                if (interval) {
                    clearTimeout(interval);
                }

                interval = setTimeout(function() {
                    _game.play = true;
                    _player.bombs = _bombs.counter;
                    play()
                    $("#alert").remove();
                }, 1000);
            }
        }

        let removeRules = function() {
            if ($("#rules")) {
                $("#rules").remove();
            }
        }

        let howToPlay = function() {
            removeRules();
            div = $("<p></p>")
                .attr('id', 'rules')
                .html(rules)
                .click(function() {
                    removeRules();
                })
                .appendTo('#play');
        }

        let playScreen = function() {
            let background = $("<section></section>")
                .attr('id', 'play')
                .appendTo("body");

            let playButton = $("<input></input>")
                .attr('id', 'playButton')
                .attr('type', 'button')
                .val('play')
                .click(function() {
                    play();
                })
                .appendTo("body");

            let howToPlayButton = $("<input></input>")
                .attr('id', 'howToPlayButton')
                .attr('type', 'button')
                .val('how to play')
                .click(function() {
                    howToPlay();
                })
                .appendTo("body");

        }

        let checkForWin = function() {
            let div;

            if (_player.points >= _game.poitsForWin) {

                div = $("<div></div>")
                    .attr('id', 'alert')
                    .html('Congratulations! You win')
                    .appendTo('#game');
                _game.play = false;
                _player.lives++;
                alert(_game.poitsForWin)
                _game.poitsForWin = _player.points + _game.poits;
                alert(_game.poitsForWin)

                return playAgain();
            }

            if (_player.points < _game.poitsForWin && _player.bombs == 0) {
                div = $("<div></div>")
                    .attr('id', 'alert')
                    .html('You lose! Maybe Next Time!')
                    .appendTo('#game');
                _player.lives--;
                _game.play = false;
                return playAgain();
            }
        }

        let checkForCollision = function(bomb) {
            let interval;
            if (bomb.y < _enemy.y + $("#enemy").height() && bomb.y > _enemy.y && bomb.x + _bombs.height > _enemy.x && bomb.x < _enemy.x + $("#enemy").width()) {
                _player.points++;

                _enemy.dom.fadeTo(100, 0.5);
                if (interval) {
                    clearTimeout(interval);
                }

                interval = setTimeout(function() {
                    _enemy.dom.fadeTo(100, 1);
                }, 200);
                bomb.isShot = false;
                bomb.dom.css("display", ('none'));
            }
        }

        let updateInformation = function() {
            _game.$points.html(_player.points);
            _game.$lives.html(_player.lives);
            _game.$bombs.html(_player.bombs);
        }

        let gameLoop = function() {
            enemyMove();
            tankMove();
            moveBombs();
            checkForWin();
            updateInformation();
            if (_game.play) {
                requestAnimationFrame(gameLoop);
            }
        };

        return {
            init: function() {
                playScreen();
                updateInformation();
                bindEvents();
                createBombs();
                gameLoop();
            },
        };
    }

    return {
        getInstance: function() {

            if (!instance) {
                instance = new RobotWar();
            }

            return instance;
        }
    };

})();
