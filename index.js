const express = require('express');
const app = express();
const port = process.env.PORT || 6969;
const socket = require('socket.io');
const Logger = require('./Logger');
const path = require('path');

// // PROFILE CPU
// const NodeProfiler = require('./NodeProfiler');
// setTimeout(() =>
// {
//     NodeProfiler(1000);
// }, 10000);

const server = app.listen(port, () =>
{
    console.log(`fledermaus.io listening on port ${port}`);
});

const io = socket(server);

app.use(express.static('public/dist/static'));

app.get('/', (req, res) =>
{
    // select some room
    // NOT OPTIMAL O(n) CHANGE IN FUTURE
    let randomRoom = [...gameRooms.keys()][Math.floor(Math.random() * gameRooms.size)];
    res.redirect('/' + randomRoom);
});

app.get('/:id', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'public/dist/index.html'));
});

const GameRoom = require('./GameRoom');
const gameRooms = new Map();

for (let id of [ '1234', 'abcd', 'xyz' ])
{
    gameRooms.set(id, new GameRoom(io, id));
}

setTimeout(() =>
{
    gameRooms.get('1234').close();
    gameRooms.delete('1234');
}, 10000);

io.on('connection', (socket) => 
{
    Logger().connects++;

    let url = socket.handshake.headers.referer;
    let urlArr = url.split('/');
    let id;
    do
    {
        id = urlArr.pop();
    }
    while (id == "")

    const gameRoom = gameRooms.get(id);
    if (gameRoom)
    {
        gameRoom.join(socket);
    }
    else
    {
        socket.emit('room-not-found', [ id ]);
    }

    socket.on('disconnect', () => 
    {
        if (socket.leaveGameRoom)
        {
            socket.leaveGameRoom();
            delete socket.leaveGameRoom;
        }
    });
});





// const sockets = [];

// //connect to client socket
// io.on('connection', (socket) => 
// {
//     sockets.push(socket);

//     Logger().connects++;

//     socket.gameKnowledge = game.getBlankKnowledge();

//     socket.on('request-join', (name, color) =>
//     {
//         if (name.length == 0)
//         {
//             socket.emit('answer-join', [ false ]);
//         }
//         else if (name.length > 30)
//         {
//             socket.emit('answer-join', [ false, "Your name must be under 30 characters long!" ]);
//         }
//         else
//         {
//             let unique = !game.usedNames.has(name);

//             if (unique)
//             {
//                 // NAME IS VALID
//                 socket.emit('answer-join', [ true ]);
//                 game.addPlayer(socket.id, name, color);
                
//                 Logger().joins++;
//             }
//             else
//             {
//                 // NAME IS ALREADY IN USE
//                 socket.emit('answer-join', [ false, 'This name is already taken!' ]);
//             }
//         }
//     });

//     socket.on('client-data', (clientData) =>
//     {
//         if (clientData.input)
//         {
//             const player = game.gameObjects.get(socket.id);
//             if (player)
//             {
//                 player.setInput(clientData.input);
//             }
//         }
//     });

//     socket.on('disconnect', () => 
//     {
//         // console.log("disconnected", socket.id);
//         game.deleteGameObject(socket.id);
//         sockets.splice(sockets.indexOf(socket), 1);
//     });
// });

// //      MAIN LOOP      //
// // loop time control
// const loopTimeGoal = 50; //ms
// let lastLoopTime = process.hrtime();

// setTimeout(loop, loopTimeGoal);
// function loop()
// {
//     // note start time of loop execution
//     const executionStart = process.hrtime();

//     // time since last frame in seconds (for physics and movement)
//     const deltaTime = process.hrtime(lastLoopTime)[1] / 1000000000;
//     lastLoopTime = process.hrtime();

//     // UPDATE GAME
//     game.update(deltaTime);

//     // SEND GAME TO CLIENTS
//     for (let socket of sockets)
//     {
//         const gameData = game.getData(socket.id, socket.gameKnowledge);
//         gameData.dt = deltaTime; // is needed for interpolation
        
//         const reducedJSON = JSON.stringify(gameData, function(key, value) {
//             // limit precision of floats
//             if (typeof value === 'number') {
//                 return parseFloat(value.toFixed(3)); // adequate, any lower looks like shit
//             }
//             // convert all maps to arrays with key-value sub arrays and all sets to arrays
//             else if (value instanceof Map || value instanceof Set) {
//                 return [...value];
//             }
//             return value
//         });
    
//         // console.log(reducedJSON); // show data
//         // console.log(reducedJSON.length); // show data size in characters

//         socket.emit('server-data', reducedJSON);
//     }

//     let newScoreboard = game.getNewScoreboard(10);
//     // has new scoreboard?
//     if (newScoreboard)
//     {
//         io.emit('scoreboard', newScoreboard);
//     }

//     // time the loop execution took (in ms)
//     const executionTime = process.hrtime(executionStart)[1] / 1000000;
//     let timeoutTime = loopTimeGoal - executionTime;
//     if (timeoutTime < 0)
//     {
//         timeoutTime = 0;
//         console.log("Cant keep up! Last deltaTime: ", deltaTime, "s - (expected: ", loopTimeGoal / 1000,"s)");
//     }

//     setTimeout(loop, timeoutTime);
// }