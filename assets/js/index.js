let name = "";
let hero = "";
let panel = "start";
let game = {
    game:[]
}

function nav() {

    document.onclick = (ev)=>{

        ev.preventDefault();

        let page = ev.path[0].id;

        switch (page) {

            case "startButton":
                go("game","d-block");
                break;
            case "die":
                go("end","w-100 h-100 d-flex justify-content-center align-items-center");
                break;
            case "restart":
                go("game","d-block");
                $(".elements").remove();
                $("#game").append("<div class='elements'></div>")
                break;
            case "mario":
                heroChange("mario");
                break;
            case "luigi":
                heroChange("luigi")
                break;

        }
    }

}
function go(page, attr) {

    let pages = ['start','end','game'];
    $(`#${page}`).attr("class",attr);
    panel = page;
    pages.forEach(e=>{
        if(e != page){
            $(`#${e}`).attr("class","d-none");
        }
    })

}
function heroChange(h){

    let heroes = ['mario','luigi'];
    hero = h;
    $(`#${h}`).css({
        opacity:1,
        transform:"translateY(-10px)"
    });
    $("#heroImg").hide();
    $("#heroImg").attr("src",`assets/img/animation/${h}/idle.gif`);
    $("#heroImg").fadeIn(1000);
    heroes.forEach(e=>{
        if(e != h){
            $(`#${e}`).css({
                opacity:0.3,
                transform:"translateY(10px)"
            });
        }
    })
}
function startLoop() {
    let inter = setInterval(()=>{
        if(panel === "start"){
            checkName();
        }
        else{
            clearInterval(inter)
        }
    },100)
}
function checkName() {

    name = $("#nameInput").val();

    if(hero != "" && name != ""){
        $("#startButton").attr("disabled",false);
        $("#startButton").attr("class","btn btn-warning");
    }
    else{
        $("#startButton").attr("disabled",true);
        $("#startButton").attr("class","btn disabled");
    }
}