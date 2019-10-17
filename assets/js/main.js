class Drawable {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;

        this.offests = {
            x: 0,
            y: 0,
        }
    }

    createElement() {
        this.$element = $(`<div class="element ${this.constructor.name.toLowerCase()}"></div>`);
        this.game.$zone.append(this.$element);
    }

    draw() {
        this.$element.css({
            left: this.x + "px",
            top: this.y + "px",
            width: this.w + "px",
            height: this.h + "px",
        })
    }

    update() {
        this.x += this.offests.x;
        this.y += this.offests.y;
    }

    isCollision(el) {
        let a = {
            x1: this.x,
            x2: this.x + this.w,
            y1: this.y,
            y2: this.y + this.h,
        }
        let b = {
            x1: el.x,
            x2: el.x + el.w,
            y1: el.y,
            y2: el.y + el.h,
        }

        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2
    }

    changeVec(vec) {
        this.$element.css({
            transform: `scaleX(${vec})`
        })
    }

    changeAnimation(path) {
        this.$element.css({
            background: `url("assets/img/animation/${path}.gif") center no-repeat`,
            backgroundSize: "100% 100%"
        })
    }

    removeElement() {
        this.$element.remove();
    }
}

class Enemy extends Drawable {

    constructor(game) {
        super(game);
        this.counter = 0;
    }

    move() {
        if (this.x >= this.corner.x1) {
            this.changeDirection();
            this.changeVec(-1);
        } else if (this.x <= this.corner.x2) {
            this.changeDirection();
            this.changeVec(1);

        }
    }

    collisionWithPlayer(player) {
        if (this.isCollision(player)) {
            if (!this.isKilled(player)) {
                this.counter++;
                if (this.counter === 1) {
                    player.hp--;
                } else if (this.counter >= 150) {
                    this.counter = 0;
                }
            } else {
                if (this.game.remove(this)) {
                    this.removeElement();
                    this.game.killedEnemies++;
                }
            }
        } else {
            this.counter = 0;
        }
    }

    isKilled(player) {
        return this.y <= player.y + player.h && player.offests.y > 0;
    }

    changeDirection() {
        this.offests.x *= -1;
    }
}

class Turtle extends Enemy {

    constructor(game, x) {
        super(game);

        this.h = 70;
        this.w = 40;
        this.y = this.game.$zone.height() - this.h - (this.game.$zone.height() / 100 * 5);
        this.x = x;

        this.corner = {
            x1: this.x + 250,
            x2: this.x - 250,
        };

        this.offests.x = 2;
        this.createElement();
    }

    update() {
        this.move();
        this.collisionWithPlayer(this.game.player);
        super.update()
    }

}

class Owl extends Enemy {
    constructor(game, x) {
        super(game);

        this.h = 50;
        this.w = 50;
        this.y = this.game.$zone.height() - this.h - (this.game.$zone.height() / 100 * 5);
        this.x = x;

        this.corner = {
            x1: this.x + 250,
            x2: this.x - 250,
        }

        this.offests.x = 5;
        this.createElement();
    }

    update() {
        this.move();
        this.collisionWithPlayer(this.game.player);
        super.update();
    }
}

class Block {
    constructor(el) {
        this.el = el;
        this.w = 0;
        this.h = 0;
        this.x = 0;
        this.y = 0;
        this.type = "";
    }

    generate() {
        this.$element = $(`<div class="block ${this.constructor.name.toLowerCase()}"></div>`);

        this.el.append(this.$element)
    }

    draw() {
        this.$element.css({
            width: this.w + "px",
            height: this.h + "px"
        })
    }

    update() {
        return false;
    }
}

class Mushroom extends Drawable{
    constructor(game,data){
        super(game);

        this.h = data.h;
        this.w = data.w;
        this.x = data.x;
        this.y = data.y - this.h;

        this.createElement();
    }

    update(){
        if(this.isCollision(this.game.player)){
            if(this.game.remove(this)){
                this.removeElement();
                this.game.mushrooms++;
                this.game.player.hp += 3;
            }
        }
        super.update()
    }

}

class DefaultBlock extends Block {
    constructor(el, data) {
        super(el);
        this.w = data.w;
        this.h = data.h;
        this.type = "default";
        this.generate();
    }
}

class SpecialBlock extends Block {
    constructor(el, data, game) {
        super(el);
        this.game = game;
        this.w = data.w;
        this.h = data.h;
        this.type = "special";
        this.generate();
        this.offset = 0;
        this.x = 0;
        this.y = 0;
        this.counter = 0;
    }

    update() {

        if(this.counter <= 1){
            this.offset = this.$element.offset();
            this.x = this.offset.left;
            this.y = this.offset.top;
            this.counter++;
        }

        if(this.isCollisionBottomBlock() && this.type === "special"){
            this.type = "disabled";
            this.$element.css({
                background: `url("assets/img/animation/disabled.gif") center no-repeat`,
                backgroundSize: "100% 100%"
            });
            let data = {
                x:this.x,
                y:this.y,
                h:this.h,
                w:this.w,
            };
            this.game.elements.push(new Mushroom(this.game, data));
        }

    }

    isCollisionBottomBlock(){
        return this.isCollision(this.game.player) && this.y + this.h + 3 > this.game.player.y && this.game.player.offests.y < 0;
    }

    isCollision(el) {

        let a = {
            x1: this.x,
            x2: this.x + this.w,
            y1: this.y,
            y2: this.y + this.h,
        }
        let b = {
            x1: el.x,
            x2: el.x + el.w,
            y1: el.y,
            y2: el.y + el.h,
        }

        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2

    }
}

class Platform extends Drawable {
    constructor(game, data) {
        super(game);
        this.intoBlockSize = {
            h: 50,
            w: 50,
        };
        this.blocks = [];
        this.w = this.intoBlockSize.w * data.blocks.length;
        this.h = 50;
        this.x = data.pos;
        this.y = this.game.$zone.height() - this.h - (this.game.$zone.height() / 100 * 30);

        this.createElement();
        this.generateIntoBlocks(data.blocks);

    }

    generateIntoBlocks(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            let block;
            switch (blocks[i]) {
                case 0:

                    block = new DefaultBlock(this.$element, this.intoBlockSize);
                    this.blocks.push(block);
                    this.$element.append(block);
                    break;
                case 1:

                    block = new SpecialBlock(this.$element, this.intoBlockSize, this.game);
                    this.blocks.push(block);
                    this.$element.append(block);
                    break;
            }
        }
    }
    update() {
        this.blocks.forEach(e => {
            e.update();
            e.draw();
        })
        if (this.game.player.isCollisionPlatform(this)) {
            this.game.player.actions.set("PlatformUp", this);
        }
        if (this.game.player.isCollisionPlatformBottom(this)) {
            this.game.player.actions.set("PlatformBottom", this);
        }
        super.update();
    }
}

class Player extends Drawable {
    constructor(game) {
        super(game);
        this.w = 40;
        this.h = 70;
        this.x = this.game.$zone.x;
        this.y = this.game.$zone.height() - this.h - (this.game.$zone.height() / 100 * 5);

        this.speed = 10;
        this.verticalSpeed = 15;

        this.platformCounter = 0;

        this.type = "";
        this.hp = 10;

        this.gravity = 0.35;
        this.jumpCount = 0;

        this.keys = new Map()
            .set("ArrowRight", null)
            .set("ArrowLeft", null)
            .set("ArrowUp", null);

        this.actions = new Map()
            .set("PlatformUp", null)
            .set("PlatformBottom", null);

        this.createElement();
        this.keyEvent();
    }

    keyEvent() {
        addEventListener('keydown', (e) => this.changeStatus(e.key, "keydown"));
        addEventListener('keyup', (e) => this.changeStatus(e.key, "keyup"));
    }

    changeStatus(key, value) {
        if (this.keys.get(key) !== undefined) {
            this.keys.set(key, value);
        }
    }

    update() {

        this.keys.forEach((value, key) => {
            if (this["go" + key]) {
                this["go" + key](value);
            }
        });
        this.actions.forEach((value, key) => {
            if (this["action" + key]) {
                this["action" + key](value);
            }
        });
        super.update();
    }

    goArrowRight(ev) {
        switch (ev) {
            case "keydown":
                this.changeAnimation(`${this.type}/run`);
                this.changeVec(1);

                if (this.x > (this.game.$zone.x + this.game.$zone.w / 2) - this.w && this.x < (this.game.$zone.width() - this.game.$zone.w / 2) - this.w) {
                    this.offests.x = 0;
                    this.game.$zone.x += this.speed;
                } else {
                    this.offests.x = this.speed;
                    if (this.x >= this.game.$zone.width() - this.w) {
                        this.offests.x = 0;
                        this.keys.set("ArrowRight", null);
                        this.game.end();
                    }
                }
                break;
            case "keyup":
                this.offests.x = 0;
                this.keys.set("ArrowRight", null);
                this.changeAnimation(`${this.type}/idle`);
                break;
        }
    }

    goArrowLeft(ev) {
        switch (ev) {
            case "keydown":
                this.changeAnimation(`${this.type}/run`);
                this.changeVec(-1);

                let corner = this.x - this.game.$zone.x;

                if (this.x < (this.game.$zone.x + this.game.$zone.w / 2) - this.w && this.game.$zone.x > 0) {
                    this.offests.x = 0;
                    this.game.$zone.x -= this.speed;
                } else {
                    this.offests.x = -this.speed;
                    if (corner <= 0) {
                        this.offests.x = 0;
                        this.keys.set("ArrowLeft", null);
                    }
                }
                break;
            case "keyup":
                this.offests.x = 0;
                this.keys.set("ArrowLeft", null);
                this.changeAnimation(`${this.type}/idle`);
                break;
        }
    }

    goArrowUp(ev) {
        switch (ev) {
            case "keydown":
            case "keyup":
                this.changeAnimation(`${this.type}/jump`);
                if (this.isCollisionBottom()) {
                    this.stopJump()
                    this.changeAnimation(`${this.type}/idle`);
                    this.keys.set("ArrowUp", null);
                } else {
                    this.jumpCount++;
                    this.offests.y = -(this.verticalSpeed - this.gravity * this.jumpCount);
                }
                break;
        }
    }

    actionPlatformUp(platform) {

        if (platform) {

            this.platformCounter++;
            if(this.platformCounter <= 2 ){
                this.keys.set("ArrowUp",null);
            }
            this.changeAnimation(`${this.type}/idle`);

            if (this.keys.get("ArrowUp") === "keydown") {
                this.actions.set("PlatformUp", null);
                this.platformCounter = 0;
                return;
            }
            if (this.keys.get("ArrowLeft") === "keydown") {
                this.changeAnimation(`${this.type}/run`);
                this.changeVec(-1);
            }
            if (this.keys.get("ArrowRight") === "keydown") {
                this.changeAnimation(`${this.type}/run`);
                this.changeVec(1);
            }
            if (this.isCollisionPlatform(platform)) {
                this.stopJump();
                return;
            }
            if (this.isCollisionBottom()) {
                this.actions.set("PlatformUp", null);
                this.platformCounter = 0;
                this.stopJump();
                return;
            }
            this.offests.y = this.speed;
        }
    }

    actionPlatformBottom(platform) {
        if (platform) {
            if (this.isCollisionPlatformBottom(platform)) {
                this.stopJump();
            }
            if (this.isCollisionBottom()) {
                this.stopJump();
                this.actions.set("PlatformBottom", null);
                return;
            }
            this.offests.y = this.speed;
        }
    }

    stopJump() {
        this.offests.y = 0;
        this.jumpCount = 0;
    }

    isCollisionBottom() {
        return this.y >= this.game.$zone.height() - this.h - this.verticalSpeed - (this.game.$zone.height() / 100 * 5) && this.offests.y > 0;
    }

    isCollisionPlatform(platform) {
        return this.isCollision(platform) && this.y + this.h - this.verticalSpeed <= platform.y;
    }

    isCollisionPlatformBottom(platform) {
        return this.y - this.verticalSpeed < platform.y + platform.h && this.isCollision(platform) && this.offests.y < 0;
    }
}

class Game {
    constructor() {
        this.$zone = $("#game .elements");

        this.$zone.x = 0;
        this.$zone.w = this.$zone.width() / 3;
        this.elements = [];
        this.player = this.generate(Player);
        this.player.type = hero;
        this.player.changeAnimation(`${this.player.type}/idle`);
        this.pause = 0;
        this.counter = 0;
        this.ended = false;
        this.score = 0;
        this.killedEnemies = 0;
        this.mushrooms = 0;
        this.pausecounter = 0;
        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0
        }

        this.generate_pos = this.$zone.width() / 100;

        this.generateBlocks = {
            owl: [this.generate_pos * 20, this.generate_pos * 47, this.generate_pos * 90],
            turtle: [this.generate_pos * 33, this.generate_pos * 60, this.generate_pos * 70],
            platforms: [
                {
                    pos: this.generate_pos * 11,
                    blocks: [0, 0, 0, 0, 1, 0]
                },
                {
                    pos: this.generate_pos * 23,
                    blocks: [0, 0, 0]
                },
                {
                    pos: this.generate_pos * 30,
                    blocks: [0, 0, 0, 0]
                },
                {
                    pos: this.generate_pos * 35,
                    blocks: [0, 1, 0]
                },
                {
                    pos: this.generate_pos * 43,
                    blocks: [0]
                },
                {
                    pos: this.generate_pos * 50,
                    blocks: [0, 0, 0, 0, 0, 1]
                },
                {
                    pos: this.generate_pos * 60,
                    blocks: [0, 0, 0, 0],
                },
                {
                    pos: this.generate_pos * 67,
                    blocks: [0],
                },
                {
                    pos: this.generate_pos * 75,
                    blocks: [0, 0, 1, 0],
                },
                {
                    pos: this.generate_pos * 85,
                    blocks: [0, 0, 0]
                }
            ]
        };

        this.name = name;
        this.keyEvent();
    }

    keyEvent() {

        addEventListener("keydown", (e) => {
            if (!this.ended) {
                if (e.key === "Escape") {
                    this.pause = !this.pause;
                }
            }
        });

    }

    start() {
        this.generateMany(Turtle, 3, this.generateBlocks.turtle);
        this.generateMany(Owl, 3, this.generateBlocks.owl);
        this.generateMany(Platform, 10, this.generateBlocks.platforms);
        this.loop();
    }

    end() {
        this.ended = true;
        go("end", "w-100 h-100 d-flex justify-content-center align-items-center");
    }

    remove(el) {
        let idx = this.elements.indexOf(el);

        if (idx !== -1) {
            this.elements.splice(idx, 1);
            return true;
        }
        return false;
    }

    generateMany(className, quantity, data = []) {

        for (let i = 0; i < quantity; i++) {
            this.generate(className, data[i], true)
        }

    }

    generate(className, data, flag = false) {


        if (!flag) {
            let el = new className(this);
            this.elements.push(el);

            return el;
        } else {
            let el = new className(this, data);
            this.elements.push(el);
        }
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

        let str = `${this.time.m1}${this.time.m2} : ${this.time.s1}${this.time.s2}`;

        $("#timer").html(str);
    }

    loop() {
        requestAnimationFrame(() => {
            if (!this.pause) {
                $("#pause").hide();
                this.pausecounter = 0;
                this.$zone.css({
                    left: -this.$zone.x + "px"
                })

                this.counter++;
                if (this.counter % 60 === 0) {
                    this.timer();
                }
                if (this.counter % 600 === 0) {
                    this.player.hp--;
                }
                if (this.player.hp <= 0) {
                    this.end();
                }
                this.setParams();
                this.updateElements();
            } else {
                this.pausecounter++;
                if (this.pausecounter === 1) {
                    $("#pause").css("display", "flex").hide().fadeIn(500);
                    this.player.changeAnimation(`${this.player.type}/idle`);
                }
            }
            if (!this.ended) {
                this.loop();
            }
        })
    }

    setParams() {
        let params = ["name", "selectedHero", "hp", "mushrooms"];

        let arr = [this.name, this.player.type, this.player.hp, this.mushrooms];

        arr.forEach((e, index) => {
            $(`#${params[index]}`).html(e);
        })
    }

    updateElements() {
        this.elements.forEach((e) => {
            e.update();
            e.draw();
        })
    }
}

window.onload = () => {
    nav();
    startLoop();

    setInterval(() => {
        if (panel === "game") {
            game.game = new Game();
            game.game.start();
            panel = "gameprocess";
        }
    }, 100);
};