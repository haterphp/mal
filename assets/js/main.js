function random(min, max) { //рандом

    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

class Drawable { //класс отрисовки объкта на карте

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

    createElement() { //создание персонажа
        this.$element = $(`<div class='element ${this.constructor.name.toLowerCase()}'></div>`);
        this.game.$zone.append(this.$element);
    }

    removeElement() {// удаление персонажа из DOM структуры
        this.$element.remove();
    }

    draw() {//отрисовка объкта

        this.$element.css({
            left: this.x + "px",
            top: this.y + "px",
            width: this.w + "px",
            height: this.h + "px",
        })

    }

    update() {//обновление объекта

        this.x += this.offsets.x;
        this.y += this.offsets.y;

    }

    isCollision(el) {//коллизия с объетом

        let obj1 = {
            x1: this.x,
            x2: this.x + this.w,
            y1: this.y,
            y2: this.y + this.h,
        }

        let obj2 = {
            x1: el.x,
            x2: el.x + el.w,
            y1: el.y,
            y2: el.y + el.h,
        }

        return obj1.x1 < obj2.x2 && obj2.x1 < obj1.x2 && obj1.y1 < obj2.y2 && obj2.y1 < obj1.y2;
    }

    changeAnimation(path) {//изменение анимации объекта

        this.$element.css({
            background: `url('assets/img/animate/${path}.gif') center no-repeat`,
            backgroundSize: `90% 90%`,
        })

    }

    changeVec(vec) {//изменение направленеи объекта
        this.$element.css({
            transform: `scaleX(${vec})`
        })
    }
}

class Mushroom extends Drawable { //класс гриба
    constructor(game) {
        super(game);

        this.x = random(300, this.game.$zone.width() / 1.5);
        this.w = 50;
        this.h = 50;
        this.y = this.game.$zone.height() - (this.h + 150);


        this.createElement();
    }

    update() {

        if (this.isCollision(this.game.player)) {

            if (this.game.remove(this)) {
                this.removeElement();
                this.game.score += 1000;
                this.game.player.hp += 3;
            }

        }

        super.update();
    }
}

class Goombas extends Drawable { //класс врага 1

    constructor(game, x) {
        super(game);

        this.x = x;
        this.w = 50;
        this.h = 50;
        this.y = this.game.$zone.height() - (this.h + 150);

        this.offsets.x = 5;

        this.counter = 0;

        this.corner = {
            x1: this.x + 250,
            x2: this.x - 250
        }

        this.createElement();
    }

    update() {

        if (this.isCollision(this.game.player)) { //если я соприкасаюсь с врагом

            if (!this.isKilled()) { //но не напрыгиваю на него с вврху

                this.counter++;

                if (this.counter === 1) {
                    this.game.player.hp--; //наноситься урон
                } else if (this.counter >= 50) {
                    this.counter = 0;
                }
            } else {//иначе
                if (this.game.remove(this)) {//убиваю его
                    this.removeElement();
                    this.game.score += 500;
                }
            }


        } else {
            this.counter = 0;
        }

        if (this.x >= this.corner.x1) {
            this.changeDirection();
        } else if (this.x <= this.corner.x2) {
            this.changeDirection();
        }

        super.update();
    }

    changeDirection() {
        this.offsets.x *= -1;
    }

    isKilled() {

        return this.y <= this.game.player.y + this.game.player.h && this.game.player.offsets.y > 0;

    }

}

class Turtle extends Drawable { //класс врага 2

    constructor(game, x) {
        super(game);

        this.x = x;
        this.w = 50;
        this.h = 70;
        this.y = this.game.$zone.height() - (this.h + 150);

        this.offsets.x = 5;

        this.corner = {
            x1: this.x + 250,
            x2: this.x - 250
        };
        this.createElement();
    }

    update() {

        if (this.isCollision(this.game.player)) { // тоже что и врага 1

            if (!this.isKilled()) {

                this.counter++;

                if (this.counter === 1) {
                    this.game.player.hp--;
                } else if (this.counter >= 50) {
                    this.counter = 0;
                }
            } else {
                if (this.game.remove(this)) {
                    this.removeElement();
                    this.game.score += 500;
                }
            }

        } else {
            this.counter = 0;
        }

        if (this.x >= this.corner.x1) {
            this.changeVec(-1);
            this.changeDirection();
        } else if (this.x <= this.corner.x2) {
            this.changeVec(1);
            this.changeDirection();
        }

        super.update();
    }

    changeDirection() {
        this.offsets.x *= -1;
    }

    isKilled() {

        return this.y <= this.game.player.y + this.game.player.h && this.game.player.offsets.y > 0;

    }
}

class Player extends Drawable { //класс героя

    constructor(game) {
        super(game);

        this.w = 50;
        this.h = 100;
        this.x = this.game.$zone.x;
        this.y = this.game.$zone.height() - (this.h + 150);
        this.type = "";
        this.hp = 10;
        this.gravity = 0.35;
        this.jumpCount = 0;

        this.speed = 10;
        this.keys = new Map()
            .set("ArrowLeft", null)
            .set("ArrowRight", null)
            .set("ArrowUp", null);

        this.actions = new Map()
            .set("Platform", null);

        this.createElement();
        this.bindKey();
    }

    bindKey() { //отслеживаю нажатие клаввиш

        addEventListener('keydown', e => this.changeStatus(e.key, "keydown"));
        addEventListener('keyup', e => this.changeStatus(e.key, "keyup"));

    }

    changeStatus(code, value) { //устанавливаю статус для кнопки
        if (this.keys.get(code) !== undefined) {
            this.keys.set(code, value);
        }
    }

    update() {

        this.keys.forEach((value, key) => {
            if (this["go" + key]) {
                this["go" + key](value);
            }
        });


        super.update();
    }

    goArrowRight(ev) { //движение вправо

        switch (ev) {

            case "keydown":
                this.changeVec(1);
                this.changeAnimation(`${this.type}/run-${this.type}`);

                if (this.x > this.game.$zone.w / 2 - this.w + this.game.$zone.x && this.game.$zone.x < this.game.$zone.width() - this.game.$zone.w - (this.x + this.w)) {
                    this.game.$zone.x += this.speed;
                } else {
                    this.offsets.x = this.speed;
                    if (this.x >= this.game.$zone.width() - (this.x)) {
                        this.game.end();
                        this.offsets.x = 0;
                        this.keys.set("ArrowRight", null);
                        return;
                    }
                }

                break;
            case "keyup":

                this.changeAnimation(`${this.type}/idle-${this.type}`);
                this.offsets.x = 0;
                this.keys.set("ArrowRight", null);

                break;
        }

    }

    goArrowLeft(ev) {

        switch (ev) {

            case "keydown":
                this.changeVec(-1);
                this.changeAnimation(`${this.type}/run-${this.type}`);

                let corner = this.x - this.game.$zone.x;


                if (this.x < this.game.$zone.w / 2 - this.w + this.game.$zone.x && this.game.$zone.x > 0) {
                    this.game.$zone.x -= this.speed;
                } else {
                    this.offsets.x = -this.speed;
                    if (corner <= 0) {
                        this.offsets.x = 0;
                        this.keys.set("ArrowLeft", null);
                        return;
                    }
                }

                break;
            case "keyup":

                this.changeAnimation(`${this.type}/idle-${this.type}`);
                this.offsets.x = 0;
                this.keys.set("ArrowLeft", null);

                break;
        }

    } //движение влево

    stopJump() {

        this.offsets.y = 0;
        this.jumpCount = 0;
        this.y -= 10;
    }

    goArrowUp(ev) { //движение вверх

        switch (ev) {

            case "keyup":
            case "keydown":

                this.changeAnimation(`${this.type}/jump-${this.type}`);
                if (this.isCollisionBottom()) {
                    this.stopJump();
                    this.changeAnimation(`${this.type}/idle-${this.type}`);
                    this.keys.set("ArrowUp", null);
                } else {
                    this.jumpCount++;
                    this.offsets.y = -(this.speed - this.gravity * this.jumpCount);
                }

                break;
        }

    }

    isCollisionBottom() { //коллизия с землёй

        return this.y > this.game.$zone.height() - (this.h + 150);

    }

}

class Game {

    constructor() {

        $("#game .elements").remove();
        $("#game ").append('<div class="elements"></div>');
        this.$zone = $("#game .elements");
        this.$zone.w = this.$zone.width() / 3;
        this.$zone.x = 0;
        this.elements = [];
        this.player = this.generate(Player);
        this.player.type = selectedHero;
        this.player.changeAnimation(`${this.player.type}/idle-${this.player.type}`);
        this.pause = false;
        this.name = name;

        this.pos = {
            goombas: [500, 1300, 1900],
            turtle: [700, 1500, 1700],
        }

        this.score = 0;

        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0,
        }

        this.counter = 0;
        this.keyEvents();
    }

    keyEvents() {

        addEventListener("keydown", (e) => {

            if (e.key == "Escape") {

                if (!this.pause) {
                    this.pause = true;
                } else if (this.pause) {
                    this.pause = false;
                }

            }

        })
    }

    end() {
        this.pause = true;
        end();
    }

    start() { //начало игры
        this.generateMany(Goombas, 3, 1000);
        this.generateMany(Turtle, 3, 1000);
        this.generateMany(Mushroom, 3, 1000);
        this.loop();

    }

    remove(el) { //удаление объекта

        let idx = this.elements.indexOf(el);

        if (idx !== -1) {
            this.elements.splice(idx, 1);
            return true;
        }
        return false;
    }

    setParams() { //установка параметров игры

        let arr = [this.player.hp, this.score, this.name, this.player.type]

        let param = ['hp', 'score', 'name', 'heroName'];

        for (let i = 0; i < arr.length; i++) {

            $(`#${param[i]}`).html(arr[i]);

        }

    }

    generateMany(className, quantity, timeout) { //генерация объектов

        for (let i = 0; i < quantity; i++) {
            setTimeout(() => {
                if (className === Goombas) {
                    let el = new className(this, this.pos.goombas[i]);
                    this.elements.push(el);
                } else if (className === Turtle) {
                    let el = new className(this, this.pos.turtle[i]);
                    this.elements.push(el);
                } else if (className === Mushroom) {
                    this.generate(className);
                }
            }, i * timeout);
        }

    }

    generate(className) {

        let el = new className(this);
        this.elements.push(el);

        return el;

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

    updateElements() {// обновление объекта

        this.elements.forEach(e => {

            e.update();
            e.draw();

        });

    }

    loop() {//игровой цикл
        requestAnimationFrame(() => {
            if (!this.pause) {

                this.$zone.css({
                    left: `${-this.$zone.x}px`
                })

                this.setParams();

                this.counter++;

                if (this.counter % 60 === 0) {
                    this.timer();
                }
                if (this.counter % 600 === 0) {
                    this.player.hp--;
                }

                if (this.player.hp <= 0) {
                    this.pause = true;
                    this.end();
                }

                this.updateElements();

            }

            this.loop();
        })
    }
}

window.onload = () => {

    nav();
    startLoop();
    loadImages();
    insturction();

    let startgame = setInterval(function () {
        if (panel === 'game') {
            game.game = new Game();
            game.game.start();
            panel = "startgame";
        }

    }, 100);
}

document.querySelector("#restart").onclick = ()=>{
    delete game.game;

    //game = new Game();
    //game.start();
}