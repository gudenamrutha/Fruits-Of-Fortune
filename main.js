const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x1b1b1b,
    antialias: true,
});

document.body.appendChild(app.view);

//Creating Background
const bg = new PIXI.Graphics();
bg.beginFill(0x120821);
bg.drawRect(0, 0, app.screen.width, app.screen.height);
bg.endFill();
app.stage.addChild(bg);

//Creating Game Name Text

const game_title = new PIXI.Text("FRUITS OF FORTUNE", {

    fill: 0xF6C453,
    fontFamily: 'Cinzel',
    fontWeight: 700,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 3
});

game_title.anchor.set(0.5);
game_title.x = app.screen.width / 2;
game_title.y = 50;
app.stage.addChild(game_title);
//Game Container - Whole Game
const gameContainer = new PIXI.Container();

app.stage.addChild(gameContainer);

//Reels Container - One Part of game

const reelsContainer = new PIXI.Container();

gameContainer.addChild(reelsContainer);

const REEL_COUNT = 5;
const SYMBOLS_PER_REEL = 5;
const SYMBOL_SIZE = 75;
const REEL_GAP = 15;
const SYMBOL_GAP = 7.5;
const SYMBOL_HEIGHT = SYMBOL_SIZE + SYMBOL_GAP;
const REEL_HEIGHT = SYMBOLS_PER_REEL * SYMBOL_HEIGHT;
const fruits = {
    coconut: "assets/fruits/coconut.png",
    apple: "assets/fruits/apple.png",
    lemon: "assets/fruits/lemon.png",
    pineapple: "assets/fruits/pineapple.png",
    cherry: "assets/fruits/cherry.png"
}
const SYMBOL_TYPES = [
    {
        type: fruits.coconut,
        color: 0xffd700
    },
    {
        type: fruits.apple,
        color: 0xff5555
    },
    {
        type: fruits.lemon,
        color: 0x55ff55
    },
    {
        type: fruits.pineapple,
        color: 0x5555ff
    },
    {
        type: fruits.cherry,
        color : 0xf5f5f5
    }
];
const FRUIT_SCALE = 0.7;
let balance = 1000;
const BET = 50;

const sounds = {
    spin: new Audio("assets/spin.mp3"),
    stop: new Audio("assets/stop.mp3"),
    win : new Audio("assets/win.mp3")
};

//Creating Fake Symbols
function createSymbol(type,color) {
    const symbol = new PIXI.Graphics();
    symbol.beginFill(0xffffff);
    symbol.drawRoundedRect(0, 0, SYMBOL_SIZE, SYMBOL_SIZE, 16);
    symbol.endFill();
    symbol.type = type;

    //Adding image inside color block
    const image = PIXI.Sprite.from(type);
    image.anchor.set(0.5);
    const bounds = symbol.getLocalBounds();

    image.width = bounds.width * FRUIT_SCALE;
    image.height = bounds.height * FRUIT_SCALE;

    image.x = bounds.width / 2;
    image.y = bounds.height / 2;
    symbol.addChild(image);
    return symbol;
}

//Creating Reels

const reels = [];
const colors = [0xffd770, 0x00ff00, 0xff0000, 0x0000ff]
for (let i = 0; i < REEL_COUNT; i++) {
    //Creating Reel
    const reel = new PIXI.Container();
    reel.x = i * (SYMBOL_SIZE + REEL_GAP);
    reelsContainer.addChild(reel);
    reel.symbols = [];
    reel.speed = 0;

    //Creating Symbols inside the reel
    for (let j = 0; j < SYMBOLS_PER_REEL; j++) {
        const data = SYMBOL_TYPES[j]; 
        const symbol = createSymbol(data.type, data.color);
        symbol.y = j * (SYMBOL_SIZE + SYMBOL_GAP);
        reel.addChild(symbol);
        reel.symbols.push(symbol);
    }

    reels.push(reel);
}

//Centering Reels to center of screen
//reelsContainer.anchor.set(0.5);
const totalwidth = (REEL_COUNT * SYMBOL_SIZE) + ((REEL_COUNT - 1) * REEL_GAP);
reelsContainer.x = (app.screen.width - totalwidth) / 2;
const totalheight = (SYMBOLS_PER_REEL * SYMBOL_SIZE) + (SYMBOLS_PER_REEL - 1) * 10;
reelsContainer.y = (app.screen.height - totalheight) / 2;


//Adding reel Background

reels.forEach(reel => {
    const bg = new PIXI.Graphics();
    bg.lineStyle(4, 0xffffff);
    bg.drawRoundedRect(
        -5,
        -5,
        SYMBOL_SIZE + 10,
        SYMBOLS_PER_REEL * (SYMBOL_SIZE + 10),
        20
    );
    reel.addChildAt(bg, 0);
});

//Creating SPIN Button

const start_button = new PIXI.Graphics();
start_button.lineStyle(2, 0xC99A2E);
start_button.beginFill(0xF6C453);
start_button.drawRoundedRect(0, 0, 150, 150, 75);
start_button.endFill();
start_button.interactive = true;
start_button.buttonMode = true;
start_button.cursor = "pointer";

start_button.x = 200;
start_button.y = app.screen.height - 150;

gameContainer.addChild(start_button);

//Creating SPIN Text
const button_text = new PIXI.Text("Start",{
    fontFamily: 'Montserrat',
    fontSize: 22,
    fontWeight: '600',
    fill: 0x000000,
});
button_text.anchor.set(0.5);
button_text.x = start_button.width / 2;
button_text.y = start_button.height / 2;

start_button.addChild(button_text);

//Clicking button event

start_button.on("pointerdown", () => {
    start_button.scale.set(0.98);

    

    startSpin();
});

start_button.on("pointerup", () => {
    console.log("Pointer up");
    start_button.scale.set(1);

});

start_button.on("pointerupoutside", () => {
    start_button.scale.set(1);
});

//Creating Stop Button
const stop_button = new PIXI.Graphics();
stop_button.lineStyle(2, 0x999999);
stop_button.beginFill(0xFFFFFF);
stop_button.drawRoundedRect(0, 0, 150, 150, 75);
stop_button.endFill();
stop_button.interactive = false;
stop_button.buttonMode = true;
stop_button.cursor = "default";
stop_button.alpha = 0.6;

stop_button.x = app.screen.width - 200;
stop_button.y = app.screen.height - 150;

gameContainer.addChild(stop_button);

//Creating SPIN Text
const stop_button_text = new PIXI.Text("Stop", {
    fontFamily: 'Montserrat',
    fontSize: 22,
    fontWeight: '600',
    fill: 0x000000,
});
stop_button_text.anchor.set(0.5);
stop_button_text.x = stop_button.width / 2;
stop_button_text.y = stop_button.height /2;

stop_button.addChild(stop_button_text);

//Clicking button event

stop_button.on("pointerdown", () => {
    stop_button.scale.set(0.98);


    stopReels();
});

stop_button.on("pointerup", () => {
    console.log("Pointer up");
    stop_button.scale.set(1);

});

stop_button.on("pointerupoutside", () => {
    stop_button.scale.set(1);
});

let isSpinning = false;
function startSpin() {
    toggleButtonInteractablity(false);
    sounds.spin.play();
    balance -= BET;
    balance_text.text = `Balance : ${balance}`;
    reels.forEach((reel, index) => {
        reel.speed = 20 + index * 5;

       
    });
   
}

function stopReels() {
    sounds.stop.play();
    reels.forEach((reel, index) => {
        setTimeout(() => {
           stopReel(reel);
            if (index == reels.length - 1) {
                onSpinComplete();
                toggleButtonInteractablity(true);
            }
        }, 1000 + index * 600);
    });
}

//Animation ticker

app.ticker.add(() => {
    reels.forEach((reel) => {
        if (reel.speed > 0) {
            reel.symbols.forEach(symbol => {
                symbol.y += reel.speed;

                //If symbol goes out of view , move it to the top
                if (symbol.y >= SYMBOLS_PER_REEL * (SYMBOL_SIZE + SYMBOL_GAP)) {
                    symbol.y -= SYMBOLS_PER_REEL * (SYMBOL_SIZE + SYMBOL_GAP);
                }
            });
        }
    });
});

function stopReel(reel) {
    reel.speed = 0;
    reel.symbols.forEach((symbol) => {
        const remainder = symbol.y % SYMBOL_HEIGHT;
        symbol.y -= remainder;
    });
    onNormalizeSymbols(reel);
}


function onSpinComplete() {
    //sounds.stop.play();
    const result = checkWin();
/*    applyWin(result);
    highlightWin(result);*/
    //console.log("Result " + result);
}

function onNormalizeSymbols(reel) {
    reel.symbols.forEach((symbol) => {
        if (symbol.y < 0) {
            symbol.y += REEL_HEIGHT;
        }
        if (symbol.y >= REEL_HEIGHT) {
            symbol.y -= REEL_HEIGHT;
        }
    });
}

function getVisibleSymbols() {
    let winningRows = 0;

    // Loop through each ROW
    for (let row = 0; row < SYMBOLS_PER_REEL; row++) {
        const firstSymbol = reels[0].symbols[row];
        let isRowMatch = true;
        let count = 1;
        // Compare same row across all reels
        for (let col = 1; col < reels.length; col++) {
            let flag_same = 0; 
            for (let k = 0; k < SYMBOLS_PER_REEL; k++) {
                const currentSymbol = reels[col].symbols[k];

                if (Math.abs(firstSymbol.y - currentSymbol.y) < EPSILON) {
                    if (firstSymbol.type === currentSymbol.type) {
                        console.log("matched with first symbol");
                        flag_same = 1;

                    }
                }
                else {
                    Console.log("First symbol Y" + firstSymbol.y);
                    Console.log("Current symbol Y" + currentSymbol.y);
                }
               
            }

            if (flag_same == 1) {
                count++;
            }
            
        }

        if (count == 3) {
            winningRows++;
        }
    }

    return winningRows;
}


//Creating Balance Text
const balance_text = new PIXI.Text(`Balance : ${balance}`, {
    fontSize: 24,
    fill: 0xffffff
});

balance_text.x = 20;
balance_text.y = 20;

gameContainer.addChild(balance_text);

function checkWin() {
    const winrow = getVisibleSymbols();
    if (winrow == 0) {
        console.log("No Win");
    }
    else {
        console.log("Number of Win Rows" + winrow);
    }
   /* const visible = getVisibleSymbols();
    const firstType = visible[0].type;
    const isWin = visible.every(sym => sym.type === firstType);
    return {
        isWin, symbols: visible
    };*/
}

function applyWin(result) {
    if (!result.isWin) {
        return;
    }

    const winAmount = BET * 5;
    balance += winAmount;
    balance_text.text = `Balance : ${balance}`;
    console.log("WIN ...!", winAmount);
    showWin(winAmount);
}

function highlightWin(result) {
    if (!result.isWin) {
        return;
    }
    sounds.win.play();
    console.log("Highligthing win");
    result.symbols.forEach(sym => {
        sym.scale.set(1.1);
    });

    setTimeout(() => {
        result.symbols.forEach(sym => {
            sym.scale.set(1);
        });
    }, 600);

    
}

//Enabling and disabling button

function toggleButtonInteractablity(isenabled) {
    setTimeout(() => {
        start_button.interactive = isenabled;
        stop_button.interactive = !isenabled
    }, 500);
   
    start_button.cursor = isenabled ? "pointer" : "default";
    start_button.alpha = isenabled ? 1 : 0.6;

    stop_button.cursor = !isenabled ? "pointer" : "default";
    stop_button.alpha = !isenabled ? 1 : 0.6;
}

//Create Win Text
const win_text = new PIXI.Text("", {
    fontSize: 36,
    fill: 0xffd700,
    fontWeight: "bold"
});

win_text.anchor.set(0.5);
win_text.x = (app.screen.width) / 2;
win_text.y = 140;
app.stage.addChild(win_text);

function showWin(amount) {
    win_text.text = `You Win ${amount}`;
    win_text.scale.set(0);
    win_text.visible = true;

    app.ticker.addOnce(() => {
        win_text.scale.set(1);
    });

    setTimeout(() => {
        win_text.visible = false;
    }, 1200);
}
