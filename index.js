const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const socket = require('socket.io');

//static
// app.use(express.static('public'));
app.use(express.static('public/dist'));

//server
const server = app.listen(port, () =>
{
    console.log(`app listening on port ${port}`);
});

//socket setup
const io = socket(server);

//GAME
const Game = require('./Game');
const GameSettings = require('./GameSettings');
const game = new Game(GameSettings.mapSize);

const sockets = [];

//connect to client socket
io.on('connection', (socket) => 
{
    console.log("Socket connected", socket.id);
    sockets.push(socket);

    socket.on('request-join', (name, color) =>
    {
        // restrict names???
        // const regex = /^[\w-]+$/;
        // if (regex.test(name))
        if (name.length > 0)
        {
            let unique = !game.players.find(p => p.name == name);
            if (unique)
            {
                // NAME IS VALID
                socket.emit('answer-join', { answer: true });
                game.addPlayer(socket.id, name, color);
                console.log(`Player ${name} joined the game (id=${socket.id})`);
            }
            else
            {
                // NAME IS ALREADY IN USE
                socket.emit('answer-join', { answer: false, reasoning: 'This name is already taken!' });
            }
        }
        else
        {
            // NAME DOES NOT SATISFY REGEX
            socket.emit('answer-join', { answer: false, reasoning: "Please enter a name!" });
        }
    });

    socket.on('client-data', (clientData) =>
    {
        if (clientData.input)
        {
            const player = game.players.find(p => p.id == socket.id);
            if (player)
            {
                player.setInput(clientData.input);
            }
        }

        socket.clientTree = clientData.tree;
    });

    socket.on('disconnect', () => 
    {
        console.log("disconnected", socket.id);
        game.removePlayer(socket.id);
        sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('die-test', () =>
    {
        let victim = game.players.find(p => p.id == socket.id);
        if (victim)
        {
            victim.health = 0;
        }
    });
});

//      MAIN LOOP      //
// loop time control
const loopTimeGoal = 15; //ms
let lastLoopTime = process.hrtime();

// for loops per second measurement
let loopCount = 0;
let passedTime = 0;

setTimeout(loop, loopTimeGoal);
function loop()
{
    // note start time of loop execution
    const executionStart = process.hrtime();

    // time since last frame in seconds (for physics and movement)
    const deltaTime = process.hrtime(lastLoopTime)[1] / 1000000000;
    lastLoopTime = process.hrtime();

    // UPDATE GAME
    game.update(deltaTime);

    // SEND GAME TO CLIENTS
    for (let socket of sockets)
    {
        const gameData = game.getData(socket.id, socket.clientTree);
        gameData.dt = deltaTime;
        
        const reducedJSON = JSON.stringify(gameData, function(key, value) {
            // limit precision of floats
            if (typeof value === 'number') {
                return parseFloat(value.toFixed(4)); // adequate, lower looks like shit
            }
            return value;
        });

        // console.log(reducedJSON); // show data
        // console.log(reducedJSON.length); // show data size in characters

        socket.emit('loop', reducedJSON);
    }

    // time the loop execution took (in ms)
    const executionTime = process.hrtime(executionStart)[1] / 1000000;
    let timeoutTime = loopTimeGoal - executionTime;
    if (timeoutTime < 0)
    {
        timeoutTime = 0;
        console.log("Cant keep up! Last deltaTime: ", deltaTime, "s - (expected: ", loopTimeGoal / 1000,"s)");
    }

    loopCount++;
    passedTime += deltaTime;

    setTimeout(loop, timeoutTime);
}

// setInterval(() => 
// {
//     console.log(`Loops per second: ${ Math.floor(loopCount / passedTime) }`);
//     loopCount = 0;
//     passedTime = 0;
// }, 10000);
