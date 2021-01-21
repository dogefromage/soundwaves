const socket = io.connect(location.url);

// set up input
const input = new Input();
input.recordMovement();
input.onKey('Space');
input.onKey('ShiftLeft');

const ctx = document.getElementById('canvas').getContext('2d');
let w, h;
let frameCount = 0;

//display
let displayStamina = 0, displayHealth = 0;

const game = new ClientGame();
const camera = new ClientCamera(0, 0, 100);
let lastPlayerInput = {};

// MAIN LOOP (server triggered)
socket.on('loop', (serverData) => 
{
    // update client game with server data
    game.update(serverData);
    
    //drawing
    updateCamera();
    game.draw(ctx, camera, w, h);
    drawBars();

    /**
     * This data is sent to the server.
     * It includes the changes in player input
     * and also the current tree of objects in the clients game.
     * This allows the server to selectively update objects and tell client to "forget" them
     * after they have left the frame.
     */
    const clientData = 
    {
        tree: game.getTree(),
    }
    
    let card = document.getElementById('join-window');
    if (game.mainPlayer)
    {
        // send new player input to server
        let playerInput = 
        {
            x: input.axisX,
            y: input.axisY,
            shoot: input.getKey('Space'),
            sneak: input.getKey('ShiftLeft'),
        };
        
        // put all inputs which have changed into new array
        let playerInputChanges = {};
        for (let i in playerInput)
        {
            if (playerInput[i] != lastPlayerInput[i])
            {
                lastPlayerInput[i] = playerInputChanges[i] = playerInput[i];
            }
        }
        clientData.input = playerInputChanges,

        // remove join card
        card.classList.add("hidden");
    }
    else
    {
        // display join card
        card.classList.remove("hidden");
    }

    socket.emit('client-data', clientData);

    frameCount++;
});

// if you press enter in input field instead of the button
document.getElementById("nameInput").addEventListener('keypress', (e) => {
    if (e.keyCode == 13) 
        joinGame();
});

function joinGame()
{
    let nameInput = document.getElementById("nameInput");
    let name = nameInput.value.trim();

    socket.emit('request-join', name);

    socket.on('answer-join', ({ answer, reasoning }) => 
    {
        let error = document.getElementById('nameError');
        if (answer)
        {
            error.classList.add("disabled");
        }
        else
        {
            error.innerHTML = reasoning || 'Something must have happened!';
            error.classList.remove("disabled");
        }
    });
}

function updateCamera()
{
    let d = Math.sqrt(window.innerWidth * window.innerHeight);
    camera.zoom = Math.floor(0.5 * d);
    
    let { x, y } = camera.CanvasToWorldVector({ x: 0.5 * window.innerWidth, y: 0.5 * window.innerHeight });

    if (game.mainPlayer)
    {
        // fixed increments
        // let viewSegments = 1;
        // let newX = viewSegments * Math.floor(game.mainPlayer.x / viewSegments) + 0.5 * viewSegments - x;
        // let newY = viewSegments * Math.floor(game.mainPlayer.y / viewSegments) + 0.5 * viewSegments - y;
        // camera.x += (newX - camera.x) * 0.4
        // camera.y += (newY - camera.y) * 0.4

        // central
        let smoothness = 0.05;
        camera.x += ( (game.mainPlayer.x - x) - camera.x) * smoothness;
        camera.y += ( (game.mainPlayer.y - y) - camera.y) * smoothness;

    }
    else
    {
        if (frameCount == 1)
        {
            camera.x = game.map.width * 0.5 - x;
            camera.y = game.map.height * 0.5 - y;
        }
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

function drawBars()
{
    if (game.mainPlayer)
    {
        
        let W = Math.min(200, w * 0.3);
        let H = 30;
        let X = 30;
        let Y = h - H - 30;

        let smoothness = 0.3;
        displayHealth += (game.mainPlayer.health - displayHealth) * smoothness;
        displayStamina += (0.34 - displayStamina) * smoothness;
        
        let bars = [
            { stat: displayHealth, color: "#ff2244", name: "HEALTH" },
            { stat: displayStamina, color: "#eeee11", name: "STAMINA" },
        ]

        for (let bar of bars)
        {
            ctx.fillStyle = "#ddd";
            roundRect(ctx, X, Y, W, H, 10, true, false);
    
            ctx.fillStyle = bar.color;
            let m = 4;
            let stat = Math.max(0, Math.min(1, bar.stat));
            roundRect(ctx, X + m, Y + m, stat * (W - 2 * m), H - 2 * m, 5, true, false);

            ctx.fillStyle = "#000000";
            ctx.font = "bold 16px Verdana";
            ctx.textAlign = 'center';
            ctx.fillText(bar.name, X + 0.5 * W, Y + H - 8.7);

            Y -= 20 + H;
        }
    }
}

// // instant join 
// setTimeout(() =>
// {
//     document.getElementById("nameInput").value = "gagi";
//     joinGame();
// }, 100);

// function dieTest()
// {
//     socket.emit('die-test');
// }



//https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
}


