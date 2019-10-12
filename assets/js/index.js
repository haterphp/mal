let selectedHero = "";
let name = "";
let panel = "start";
let images = [];
let game = {
    game:''
};

function nav() {

    document.onclick = function (ev) {

        ev.preventDefault();

        let path = ev.path[0].id;

        switch (path) {

            case "startButton":
                go('game','block');
                break;
            case "mario":
                selectHero("mario");
                break;
            case "luigi":
                selectHero("luigi");
                break;
            case "restart":

                go("start");
                break;

        }

    }

}

function go(page,display = "flex") {

    panel = page;
    let pages = ['start', 'game' , 'end'];

    $(`#${page}`).css({
        display:display
    })

    pages.forEach(e=>{

        if(e != page){
            $(`#${e}`).css({
                display:"none"
            })
        }

    })

}

function selectHero(hero) {

    selectedHero = hero;

    let heroes = ['mario', 'luigi'];

    $(`#${hero}`).css({
        opacity:1,
        transform:'translateY(-5px)'
    })

    heroes.forEach(e=>{

        if(e != hero){
            $(`#${e}`).css({
                opacity:0.3,
                transform:'translateY(5px)'
            })
        }

    })

}

function startLoop() {

    let inter = setInterval(()=>{

        if(panel === "start"){

            checkName();

        }
        else{
            clearInterval(inter);
        }

    },10);

}
function checkName() {


    name = $('#nameInput').val();

    let button = $("#startButton");

    if(name != "" && selectedHero != ""){


        button.attr("disabled",false);
        button.attr("class","btn active");

    }
    else{
        button.attr("disabled",true);
        button.attr("class","btn disabled");

    }

}

function setIns(img,pred = false){

    if(pred){
        $(pred).remove();
    }
    $('#SlideInstruction').append(img);

}
function insturction() {

    let i = 0;
    setIns(images[i]);
    setInterval(()=>{
        i++;
        setIns(images[i],images[i - 1]);
        if(i >= 3){
            setTimeout(()=>{images[3].remove()},3000);
            i = 0;
        }
    },3000);

}

function loadImages() {

    let img = ['ins1.gif','ins2.gif','ins3.gif','ins4.gif'];


    img.forEach((e,index)=>{
        images[index] = new Image();
        images[index].src = `assets/img/${e}`;
        images[index].className = `slide`;
    })

}
function end() {

    go("end");

}
