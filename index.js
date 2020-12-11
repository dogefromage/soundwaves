const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const socket = require('socket.io');

//static
app.use(express.static('public'));

//server
const server = app.listen(port, () =>
{
    console.log(`app listening on port ${port}`);
});

//socket setup
const io = socket(server);

//GAME
const Game = require('./Game');
const game = new Game(20);
const GameSettings = require('./GameSettings');

// player
const Player = require('./Player');

//connect to client socket
io.on('connection', (socket) => 
{
    console.log("socket connected", socket.id);

    socket.player = new Player(3, 3);
    game.players.push(socket.player);

    socket.on('input', (input) =>
    {
        socket.player.input = input;
    });

    socket.on('disconnect', () => 
    {
        console.log("disconnected", socket.id);

        const index = game.players.indexOf(socket.player);
        game.players.splice(index, 1);
    });
}); 

// MAIN LOOP
const intervalTime = 20; //ms
setInterval(loop, intervalTime);

function loop()
{
    // time since last frame in seconds (for physics and movement)
    const deltaTime = 1000 / intervalTime;

    game.update(deltaTime);

    if (game.players.length > 0)
    {
        io.emit('loop', { test: game.players[0] });
    }
}