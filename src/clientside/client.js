import { ClientGame } from './ClientGame';
import { Statusbar, XPBar } from './Bars';

window.socket = io.connect(location.host, { roomId: location.pathname });

const ctx = document.getElementById('canvas').getContext('2d');
let w, h;
let lastTime = new Date().getTime();

const game = new ClientGame();
// disable rightclick
document.addEventListener('contextmenu', event => event.preventDefault());

let isJoinCardVisible = true;

window.debuggerRects = [];

let healthBar = new Statusbar('health-bar');
let chargeBar = new Statusbar('charge-bar');
let xpBar = new XPBar('xp-bar');

/////////// FULLSCREEN /////////// 
const fullscreenButton = document.getElementById('fullscreen-button');
fullscreenButton.addEventListener('click', () =>
{
    let fullScreenMode = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen; // This will return true or false depending on if it's full screen or not.

    if (fullScreenMode)
    {
        fullscreenButton.classList.remove('fa-compress');
        fullscreenButton.classList.add('fa-expand');


        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
    else
    {
        fullscreenButton.classList.remove('fa-expand');
        fullscreenButton.classList.add('fa-compress');
        const docElement = document.documentElement;

        if (docElement.requestFullscreen) {
            docElement.requestFullscreen();
        } else if (docElement.webkitRequestFullscreen) { /* Safari */
            docElement.webkitRequestFullscreen();
        } else if (docElement.msRequestFullscreen) { /* IE11 */
            docElement.msRequestFullscreen();
        }
    }
});

// const evaluatePercentileHeight = (element, percentage) =>
// {
//     const rect = element.parentElement.getBoundingClientRect();
//     return rect.height * percentage;
// }

// ////////////////// ALL SQUARE CONTAINERS :( ///////////////////////
// const updateSquares = () =>
// {
//     const makeSquare = (element) =>
//     {
//         const styles = window.getComputedStyle(element, null)
//         let width = styles.getPropertyValue('width');
//         if (/%/.test(width))
//             width = evaluatePercentileHeight(element, parseFloat(width) * 0.01);
//         else
//             width = parseFloat(width);
//         let maxHeight = styles.getPropertyValue('max-height');
//         if (/%/.test(maxHeight))
//             maxHeight = evaluatePercentileHeight(element, parseFloat(maxHeight) * 0.01);
//         else
//             maxHeight = parseFloat(maxHeight);

//         if (isNaN(width))
//         {
//             return;
//         }

//         if (!isNaN(maxHeight) && maxHeight < width)
//         {
//             element.style.width = maxHeight + "px";
//             element.style.height = maxHeight + "px";
//         }
//         else
//         {
//             element.style.height = width + "px";
//         }
//     }

//     const squares = document.getElementsByClassName('square');
    
//     for (let square of squares)
//     {
//         makeSquare(square);
//     }
// };
// updateSquares();

// window.addEventListener('resize', () =>
// {
//     updateSquares();
// });

// set data
socket.on('server-data', (dataJSON) => 
{
    window.debuggerRects = [];
    const serverData = JSON.parse(dataJSON, (key, value) =>
    {
        if (key == 'go')
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
        let changes = game.input.getChanges();
        if (Object.keys(changes).length > 0) // reduce data sent if no new input
        {
            clientData.input = changes;
        }

        // UI
        healthBar.set(game.mainPlayer.health);
        chargeBar.set(game.mainPlayer.charge);
        xpBar.set(game.mainPlayer.xp);

        changeJoinCardVisibility(false);
    }
    else
    {
        game.input.getChanges(); // clears the history

        changeJoinCardVisibility(true);
    }

    if (Object.keys(clientData).length > 0) // only emit if data even exists
    {
        socket.emit('client-data', clientData);
    }
});

socket.on('room-not-found', () => alert("room not found"));

socket.on('room-closed', () => alert("room closed"));

socket.on('scoreboard', (topPlayers) =>
{
    const scoreboard = document.getElementById('scoreboard');

    // delete last entries
    while (scoreboard.lastChild) 
    {
        scoreboard.removeChild(scoreboard.lastChild);
    }

    for (let i = 0; i < topPlayers.length; i++)
    {
        const [ name, score ] = topPlayers[i];
        const msg = (i + 1) + ". " + name + "  -  Level " + Math.floor(score);
        const para = document.createElement('p');
        para.innerHTML = msg;

        if (game.mainPlayer)
        {
            if (game.mainPlayer.name == name)
            {
                para.style.color = "#ffffff";
            }
        }

        scoreboard.appendChild(para);
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
    game.draw(ctx, w, h);
    healthBar.update(dt);
    chargeBar.update(dt);
    xpBar.update(dt);

    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);

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
}

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

window.joinGame = joinGame;

/////////////////////// JOIN CARD ////////////////////////////

function changeJoinCardVisibility(turnJoinCardOn)
{
    if (turnJoinCardOn == isJoinCardVisible)
    {
        return; // no need to be update if already in right state
    }

    let joinCard = document.getElementById('join-card');
    let uiCurtain = document.getElementById('ui-curtain');

    if (turnJoinCardOn)
    {
        // display join card
        joinCard.classList.remove('disabled');
        setTimeout(() => 
        {
            joinCard.classList.remove('opacity-zero');
        }, 20);

        // add dark curtain
        uiCurtain.classList.add('darkened');

        isJoinCardVisible = true;
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
        
        isJoinCardVisible = false;
    }
}

/////////////////////// TOGGLE MOBILE ////////////////////////////
let isMobile = false;

let touchInput = document.getElementById('mobile-input');
let modeIcon = document.getElementById('input-type-button');
modeIcon.addEventListener('click', () =>
{
    switchMobileMode(!isMobile);
});

function switchMobileMode(turnMobileOn)
{
    isMobile = turnMobileOn;
    
    if (turnMobileOn)
    {
        touchInput.classList.remove('disabled');
        
        modeIcon.classList.remove('fa-mobile-alt');
        modeIcon.classList.add('fa-mouse');
    }
    else
    {
        touchInput.classList.add('disabled');
        
        modeIcon.classList.remove('fa-mouse');
        modeIcon.classList.add('fa-mobile-alt');
    }
}
//https://stackoverflow.com/questions/6666907/how-to-detect-a-mobile-device-with-javascript
if (/Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) 
{
    switchMobileMode(true);
}


//////////////// RESIZE CANVAS /////////////////////
function resizeCanvas()
{
    const can = document.getElementById('canvas');
    w = can.width = window.innerWidth;
    h = can.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/////////////////// SETTINGS ////////////////////

const settingsPanel = document.getElementById('settings-panel');
const settingsButton = document.getElementById('settings-button');
let isSettingsPanelOn = false;
function switchSettingsPanel(turnOn)
{
    if (turnOn)
    {
        settingsPanel.classList.remove('disabled');
        isSettingsPanelOn = true;
    }
    else
    {
        settingsPanel.classList.add('disabled');
        isSettingsPanelOn = false;
    }
}
settingsButton.addEventListener('click', () =>
{
    switchSettingsPanel(!isSettingsPanelOn);
});




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