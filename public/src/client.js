import { ClientCamera } from './ClientCamera';
import { ClientGame } from './ClientGame';
import { Input, TouchInput } from './Input';
import { lerp } from '../../GameMath';
import { Statusbar, XPBar } from './Bars';

window.socket = io.connect(location.url);

//https://stackoverflow.com/questions/6666907/how-to-detect-a-mobile-device-with-javascript
let isMobile = false;
if (/Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) 
{
    console.log("Platform: mobile");
    isMobile = true;
}
else
{
    console.log("Platform: PC");
}

const ctx = document.getElementById('canvas').getContext('2d');
let w, h;
let lastTime = new Date().getTime();

const camera = new ClientCamera(0, 0, 100);
const game = new ClientGame();

if (isMobile)
{
    window.input = new TouchInput(camera, game);
}
else
{
    window.input = new Input(camera, game);
}

let isMenuVisible = true;

window.debuggerRects = [];

let healthBar = new Statusbar('health-bar');
let chargeBar = new Statusbar('charge-bar');
let xpBar = new XPBar('xp-bar');

window.xp = 0.3;

// set data
socket.on('server-data', (dataJSON) => 
{
    window.debuggerRects = [];
    const serverData = JSON.parse(dataJSON, (key, value) =>
    {
        if (key == 'go') // put gameobjects back to where they came from! (maps)
        {
            if (value instanceof Array)
            {
                return new Map(value);
            }
        }
            
        return value;
    });

    // feed client game with server data
    game.setData(serverData);

    const clientData = {}

    if (game.mainPlayer)
    {
        // INPUT
        let changes = window.input.getChanges();
        if (Object.keys(changes).length > 0) // reduce data sent if no new input
        {
            clientData.input = changes;
        }

        // UI
        healthBar.set(game.mainPlayer.health);
        chargeBar.set(game.mainPlayer.charge);
        xpBar.set(xp);

        changeMenuVisibility(false);
    }
    else
    {
        window.input.getChanges(); // clears the history

        changeMenuVisibility(true);
    }

    if (Object.keys(clientData).length > 0) // only emit if data even exists
    {
        socket.emit('client-data', clientData);
    }
});

function loop()
{
    let time = new Date().getTime();
    let dt = (time - lastTime) * 0.001;
    lastTime = time;

    // update
    game.update(dt);
    
    //drawing
    updateCamera(dt);
    game.draw(ctx, camera, w, h);
    healthBar.update(dt);
    chargeBar.update(dt);
    xpBar.update(dt);

    window.setTimeout(loop, 15);
}
window.setTimeout(loop, 3);

// if you press enter in input field instead of the button
document.getElementById("nameInput").addEventListener('keypress', (e) => {
    if (e.keyCode == 13) 
        joinGame();
});

function joinGame()
{
    let nameInput = document.getElementById("nameInput");
    let name = nameInput.value.trim();
    let colorInput = document.getElementById('colorInput');
    let color = colorInput.value;

    socket.emit('request-join', name, color);

    socket.on('answer-join', ([ acceptJoin, reasoning = "Please enter a name!" ]) => 
    {
        let error = document.getElementById('nameError');
        if (acceptJoin)
        {
            error.classList.add("disabled");
        }
        else
        {
            error.innerHTML = reasoning;
            error.classList.remove("disabled");
        }
    });
}
window.joinGame = joinGame;

function updateCamera(dt)
{
    let d = Math.sqrt(window.innerWidth * window.innerHeight);
    camera.zoom = Math.floor(0.5 * d);
    
    let { x, y } = camera.CanvasToWorldVector({ x: 0.5 * window.innerWidth, y: 0.5 * window.innerHeight });

    if (game.mainPlayer)
    {
        let k = 1.5 * dt;
        camera.x = lerp(camera.x, (game.mainPlayer.x - x), k);
        camera.y = lerp(camera.y, (game.mainPlayer.y - y), k);

    }
    else
    {
        if (game.map)
        {
            camera.x = game.map.width * 0.5 - x;
            camera.y = game.map.height * 0.5 - y;
        }
    }
}

function changeMenuVisibility(turnMenuOn)
{
    if (turnMenuOn == isMenuVisible)
    {
        return; // no need to be update if already in right state
    }

    let joinCard = document.getElementById('join-window');
    let uiCurtain = document.getElementById('ui-curtain');
    let touchInput = document.getElementById('mobile-input');

    if (turnMenuOn)
    {
        // display join card
        joinCard.classList.remove('disabled');
        setTimeout(() => 
        {
            joinCard.classList.remove('opacity-zero');
        }, 20);

        // add dark curtain
        uiCurtain.classList.add('darkened');
        
        // disable touchInput
        touchInput.classList.add('disabled');
        
        isMenuVisible = true;
    }
    else
    {
        // remove join card
        joinCard.classList.add('opacity-zero');
        setTimeout(() =>
        {
            joinCard.classList.add('disabled');
        }, 400) // time must be same as in '.opacity-zero'
        
        // remove dark curtain
        uiCurtain.classList.remove('darkened');
        
        // display touchinput
        touchInput.classList.remove('disabled');
        
        isMenuVisible = false;
    }
}

// Window size
function resize()
{
    const can = document.getElementById('canvas');
    w = can.width = window.innerWidth;
    h = can.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// //https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
// /**
//  * Draws a rounded rectangle using the current state of the canvas.
//  * If you omit the last three params, it will draw a rectangle
//  * outline with a 5 pixel border radius
//  * @param {CanvasRenderingContext2D} ctx
//  * @param {Number} x The top left x coordinate
//  * @param {Number} y The top left y coordinate
//  * @param {Number} width The width of the rectangle
//  * @param {Number} height The height of the rectangle
//  * @param {Number} [radius = 5] The corner radius; It can also be an object 
//  *                 to specify different radii for corners
//  * @param {Number} [radius.tl = 0] Top left
//  * @param {Number} [radius.tr = 0] Top right
//  * @param {Number} [radius.br = 0] Bottom right
//  * @param {Number} [radius.bl = 0] Bottom left
//  * @param {Boolean} [fill = false] Whether to fill the rectangle.
//  * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
//  */
// function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
//     if (typeof stroke === 'undefined') {
//       stroke = true;
//     }
//     if (typeof radius === 'undefined') {
//       radius = 5;
//     }
//     if (typeof radius === 'number') {
//       radius = {tl: radius, tr: radius, br: radius, bl: radius};
//     } else {
//       var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
//       for (var side in defaultRadius) {
//         radius[side] = radius[side] || defaultRadius[side];
//       }
//     }
//     ctx.beginPath();
//     ctx.moveTo(x + radius.tl, y);
//     ctx.lineTo(x + width - radius.tr, y);
//     ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
//     ctx.lineTo(x + width, y + height - radius.br);
//     ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
//     ctx.lineTo(x + radius.bl, y + height);
//     ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
//     ctx.lineTo(x, y + radius.tl);
//     ctx.quadraticCurveTo(x, y, x + radius.tl, y);
//     ctx.closePath();
//     if (fill) {
//       ctx.fill();
//     }
//     if (stroke) {
//       ctx.stroke();
//     }
// }

// let s = 
//     '  __ _          _                                        _'+"\n" +
//     ' / _| | ___  __| | ___ _ __ _ __ ___   __ _ _   _ ___   (_) ___'+"\n" +
//     '| |_| |/ _ \\/ _` |/ _ | \'__| \'_ ` _ \\ / _` | | | / __|  | |/ _ \\'+"\n" +
//     '|  _| |  __| (_| |  __| |  | | | | | | (_| | |_| \\__  _ | | (_) |'+"\n" +
//     '|_| |_|\\___|\\__,_|\\___|_|  |_| |_| |_|\\__,_|\\__,_|___(_)|_|\\___/';

// let s = '\n' + 
// ' ______   __         ______     _____     ______     ______     __    __     ______     __  __     ______     __     ______     ' + '\n' + 
// '/\\  ___\\ /\\ \\       /\\  ___\\   /\\  __-.  /\\  ___\\   /\\  == \\   /\\ "-./  \\   /\\  __ \\   /\\ \\/\\ \\   /\\  ___\\   /\\ \\   /\\  __ \\   ' + '\n' + 
// '\\ \\  __\\ \\ \\ \\____  \\ \\  __\\   \\ \\ \\/\\ \\ \\ \\  __\\   \\ \\  __<   \\ \\ \\-./\\ \\  \\ \\  __ \\  \\ \\ \\_\\ \\  \\ \\___  \\  \\ \\ \\  \\ \\ \\/\\ \\  ' + '\n' + 
// ' \\ \\_\\    \\ \\_____\\  \\ \\_____\\  \\ \\____-  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\/\\_____\\  \\ \\_\\  \\ \\_____\\ ' + '\n' + 
// '  \\/_/     \\/_____/   \\/_____/   \\/____/   \\/_____/   \\/_/ /_/   \\/_/  \\/_/   \\/_/\\/_/   \\/_____/   \\/_____/   \\/_/   \\/_____/ ' + '\n';
                                                                                                                               
// let s = 
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████░░▒░░███████░░▒░░███\n' +
//     '███████████████░░░░░███████░░░░░███\n' +
//     '███████████████░░▒░░███████░░▒░░███\n' +
//     '███████████████░░░░░███████░░░░░███\n' +
//     '███████████████░░▒░░███████░░▒░░███\n' +
//     '███████████████░░░░░███████░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░███████████████████████████\n' +
//     '███░░░░░███████████████████████████\n' +
//     '███░░▒░░███████████████████████████\n' +
//     '███░░░░░███████████████████████████\n' +
//     '███░░▒░░███████████████████████████\n' +
//     '███░░░░░███████████████████████████\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░███████░░░░░███████░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░███████░░░░░███████░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░███████░░░░░███████░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░███████████████████░░▒░░███\n' +
//     '███░░░░░███████████████████░░░░░███\n' +
//     '███░░▒░░███████████████████░░▒░░███\n' +
//     '███░░░░░░░░█████████████░░░░░░░░███\n' +
//     '██████░░▒░░█████████████░░▒░░██████\n' +
//     '██████░░░░░░░░░░░░░░░░░░░░░░░██████\n' +
//     '██████░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░██████\n' +
//     '██████░░░░░░░░░░░░░░░░░░░░░░░██████\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░███████░░░░░███████░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░███████░░░░░███████░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░███████░░░░░███████░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████░░▒░░███████░░▒░░███\n' +
//     '████████████░░░░░░░░███████░░░░░███\n' +
//     '████████████░░▒░░▒░░███████░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░████░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░████░░░░░░░░░░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████████████████░░▒░░███\n' +
//     '████████████████████████░░░░░░░░███\n' +
//     '████████████████████████░░▒░░██████\n' +
//     '███████████████░░░░░░░░░░░░░░██████\n' +
//     '███████████████░░▒░░▒░░▒░░█████████\n' +
//     '███████████████░░░░░░░░░░░░░░██████\n' +
//     '████████████████████████░░▒░░██████\n' +
//     '████████████████████████░░░░░░░░███\n' +
//     '███████████████████████████░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████░░▒░░███████░░▒░░███\n' +
//     '███████████████░░░░░███████░░░░░███\n' +
//     '███████████████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░███████████████████████████\n' +
//     '███░░░░░███████████████████████████\n' +
//     '███░░▒░░███████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░████░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░████░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░████░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░███████░░░░░███████░░░░░███\n' +
//     '███░░▒░░███████░░▒░░███████░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░████░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░████░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░████░░░░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░███████████████████████████\n' +
//     '███░░▒░░███████████████████████████\n' +
//     '███░░░░░███████████████████████████\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████████████████████████\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░███████████████████░░▒░░███\n' +
//     '███░░░░░███████████████████░░░░░███\n' +
//     '███░░▒░░███████████████████░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░███\n' +
//     '███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███\n' +
//     '███████████████████████████████████\n';


let s = 
' _       _   _    _   _                     __     ___   _  \n' + 
'|_  |   |_  | \\  |_  |_)  |\\/|   /\\   | |  (_       |   / \\ \n' + 
'|   |_  |_  |_/  |_  | \\  |  |  /--\\  |_|  __)  o  _|_  \\_/ \n';

console.log(s);