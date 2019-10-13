function playMusic() {
    let music = document.getElementById("audio");
    music.volume = 0.2;
    music.play();
}

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Drawable {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;

        this.offsets = {
            x: 0,
            y: 0,
        }
    }

    createElement() {
        this.$element = $(`<div class='element ${this.constructor.name.toLowerCase()}'></div>`);
        this.game.$zone.append(this.$element);
    }
    removeElement(){
        this.$element.remove();
    }
    update() {
        this.x += this.offsets.x;
        this.y += this.offsets.y;
    }

    draw() {
        this.$element.css({
            left: this.x + 'px',
            top: this.y + 'px',
            height: this.h + 'px',
            width: this.w + 'px',
        });
    }

    isCollision(element) {
        let obj1 = {
            x1: this.x,
            x2: this.x + this.w,
            y1: this.y,
            y2: this.y + this.h,
        }
        let obj2 = {
            x1: element.x,
            x2: element.x + element.w,
            y1: element.y,
            y2: element.y + element.h,
        }
        return obj1.x1 < obj2.x2 && obj2.x1 < obj1.x2 && obj1.y1 < obj2.y2 && obj2.y1 < obj1.y2;
    }

    changeAnimation(path) {
        this.$element.css({
            background: `url("assets/img/animate/${path}.gif")`,
            backgroundSize: "100% 100%",
        })
    }

    changeVec(vec) {
        this.$element.css({
            transform: `scaleX(${vec})`
        })
    }
}

class Player extends Drawable {

    constructor(game) {
        super(game);

        this.h = 100;
        this.w = 60;
        this.x = this.game.$zone.x;
        this.y = this.game.$zone.height() - (this.h + (this.game.$zone.height() / 100 * 15));

        this.speed = 7;
        this.speedVertical = 13;
        this.jumpCount = 0;
        this.gravity = 0.35;

        this.hp = 10;
        this.type = "luigi";

        this.keys = new Map()
            .set("ArrowRight", null)
            .set("ArrowLeft", null)
            .set("ArrowUp", null);

        this.actions = new Map()
            .set("Platform", null);

        this.createElement();
        this.keyEvent();
        this.changeAnimation(`${this.type}/idle-${this.type}`);
    }

    keyEvent() {
        addEventListener("keydown", (e) => this.changeStatus(e.key, 'keydown'));
        addEventListener("keyup", (e) => this.changeStatus(e.key, 'keyup'));
    }

    changeStatus(key, value) {
        if (this.keys.get(key) !== undefined) {
            this.keys.set(key, value);
        }
    }

    update() {
        this.keys.forEach((value, key) => {
            if (this[`go${key}`]) {
                this[`go${key}`](value);
            }
        });
        super.update();
    }

    goArrowRight(ev) {
        switch (ev) {
            case 'keydown':
                this.changeAnimation(`${this.type}/run-${this.type}`);
                this.changeVec(1);

                if (this.x > (this.game.$zone.x + this.game.$zone.w / 2) - this.w && this.x < (this.game.$zone.width() - this.game.$zone.w / 2) - this.w) {
                    this.offsets.x = 0;
                    this.game.$zone.x += this.speed;
                } else {
                    this.offsets.x = this.speed;
                    if (this.x >= this.game.$zone.width() - this.w - this.speed) {
                        this.game.end();
                        this.offsets.x = 0;
                        this.keys.set("ArrowRight", null);
                    }
                }
                break;
            case 'keyup':
                this.offsets.x = 0;
                this.keys.set("ArrowRight", null);
                this.changeAnimation(`${this.type}/idle-${this.type}`);
                break;
        }
    }

    goArrowLeft(ev) {
        switch (ev) {
            case 'keydown':
                this.changeAnimation(`${this.type}/run-${this.type}`);
                this.changeVec(-1);
                let corner = this.x - this.game.$zone.x;
                if (this.x < (this.game.$zone.x + this.game.$zone.w / 2) - this.w && this.game.$zone.x > 0) {
                    this.offsets.x = 0;
                    this.game.$zone.x -= this.speed;
                } else {
                    this.offsets.x = -this.speed;
                    if (corner <= 0) {
                        this.offsets.x = 0;
                        this.keys.set("ArrowLeft", null);
                    }
                }
                break;
            case 'keyup':
                this.offsets.x = 0;
                this.keys.set("ArrowLeft", null);
                this.changeAnimation(`${this.type}/idle-${this.type}`);
                break;
        }
    }

    goArrowUp(ev) {
        switch (ev) {
            case 'keydown':
            case 'keyup':
                if (this.isCollisionBottom()) {
                    this.jumpStop();
                    this.keys.set("ArrowUp", null);
                    this.changeAnimation(`${this.type}/idle-${this.type}`);
                } else {
                    this.jumpCount++;
                    this.offsets.y = -(this.speedVertical - this.gravity * this.jumpCount);
                    this.changeAnimation(`${this.type}/jump-${this.type}`);
                }
                break;
        }
    }

    jumpStop() {
        this.offsets.y = 0;
        this.jumpCount = 0;
    }

    isCollisionBottom() {
        return this.y > this.game.$zone.height() - ((this.game.$zone.height() / 100 * 15) + this.h + this.speed) && this.offsets.y > 0;
    }
}

class Enemy extends Drawable {
    constructor(game) {
        super(game);
        this.counter = 0;
    }

    moving() {
        if (this.x >= this.corner.x1) {
            this.changeDirection();
            this.changeVec(-1);
        } else if (this.x <= this.corner.x2) {
            this.changeDirection();
            this.changeVec(1);
        }
    }

    collisionWithPlayer(player){
        if (this.isCollision(player)) {
            if(!this.isKilled(player)){
                this.counter++;
                if(this.counter === 1){
                    player.hp--;
                }
                else if(this.counter >= 150){
                    this.counter = 0;
                }
            }
            else{
                if(this.game.remove(this)){
                    this.removeElement();
                    this.game.killedEnemies++;
                }
            }
        }
        else{
            this.counter = 0;
        }
    }

    changeDirection() {
        this.offsets.x *= -1;
    }

    isKilled(player) {
        return this.y <= player.y + player.h && player.offsets.y > 0;
    }
}

class Turtle extends Enemy {

    constructor(game) {
        super(game);
        this.w = 50;
        this.h = 70;
        this.y = this.game.$zone.height() - (this.h + (this.game.$zone.height() / 100 * 15));
        this.x = random(350, this.game.$zone.width() - this.w - 250);
        this.speed = 2;
        this.offsets.x = this.speed;

        this.corner = {
            x1: this.x + 250,
            x2: this.x - 250,
        }

        this.createElement();
    }
    update() {
        this.moving();
        this.collisionWithPlayer(this.game.player);
        super.update();
    }
}

class Goombas extends Enemy{

    constructor(game) {
        super(game);
        this.w = 50;
        this.h = 50;
        this.y = this.game.$zone.height() - (this.h + (this.game.$zone.height() / 100 * 15));
        this.x = random(350, this.game.$zone.width() - this.w - 250);
        this.speed = 4;
        this.offsets.x = this.speed;

        this.corner = {
            x1: this.x + 250,
            x2: this.x - 250,
        }

        this.createElement();
    }
    update() {
        this.moving();
        this.collisionWithPlayer(this.game.player);
        super.update();
    }
}

class Game {
    constructor() {
        this.$zone = $('#game .elements');
        this.$zone.x = 0;
        this.$zone.w = this.$zone.width() / 3;

        this.elements = [];
        this.counter = 0;

        this.player = this.generate(Player);
        this.ended = false;
        this.score = 0;
        this.mushrooms = 0;
        this.killedEnemies = 0;
        this.name = "user";
        this.pause = false;
        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0,
        }
        this.keyEvents();
    }

    keyEvents() {
        addEventListener("keydown", e => {
            if (!this.ended) {
                if (e.key === "Escape") {
                    this.changePause();
                }
            }
        })
    }

    changePause() {
        this.pause = !this.pause;
    }

    start() {
        this.generateMany(Goombas,3, 100);
        this.generateMany(Turtle, 3, 100);
        this.loop();
    }

    end() {
        this.ended = true;
        $("#restart").show();
    }

    remove(element){
        let idx = this.elements.indexOf(element);
        if(idx !== -1){
            this.elements.splice(idx, 1);
            return true;
        }
        return false;
    }

    generateMany(className, quantity, timeout) {
        for (let i = 0; i < quantity; i++) {
            setTimeout(() => this.generate(className), i * timeout);
        }
    }

    generate(className) {
        let el = new className(this);
        this.elements.push(el);
        return el;
    }

    loop() {
        requestAnimationFrame(() => {
            if (!this.pause) {
                this.$zone.css({
                    left: -this.$zone.x + "px"
                })

                $("#pause").hide();

                if (this.player.hp <= 0) {
                    this.end();
                }

                this.counter++;
                if (this.counter % 60 === 0) {
                    this.timer();
                }
                if (this.counter % 600 === 0) {
                    this.player.hp--;
                }
                this.setParams();
                this.updateElements();
            }
            if (this.pause) {
                $("#pause").show(0, () => {
                    $("#pause").css({
                        display: "flex"
                    });
                });
            }
            if (!this.ended) {
                this.loop();
            }
        })
    }

    timer() {
        this.time.s2++;
        if (this.time.s2 >= 10) {
            this.time.s2 = 0;
            this.time.s1++;
        }
        if (this.time.s1 >= 6) {
            this.time.s1 = 0;
            this.time.m2++;
        }
        if (this.time.m2 >= 10) {
            this.time.m2 = 0;
            this.time.m1++;
        }

        let time = `${this.time.m1}${this.time.m2} : ${this.time.s1}${this.time.s2}`;

        $("#timer").html(time);
    }

    setParams() {
        let params = ['name', 'heroName', 'hp', 'mushrooms'];
        let data = [this.name, this.player.type, this.player.hp, this.mushrooms];

        data.forEach((value, index) => {
            $(`#${params[index]}`).html(value);
        })
    }

    updateElements() {
        this.elements.forEach((e) => {
            e.update();
            e.draw();
        })
    }
}

let game = {
    game: []
}

function restart() {
    delete game.game;

    $(".elements").remove();
    $("#game").append("<div class='elements'></div>");
    $("#restart").hide();

    game.game = new Game();
    game.game.start();

}

window.onload = () => {

    game.game = new Game();
    game.game.start();

    document.onkeydown = () => {
        //playMusic();
    }
}