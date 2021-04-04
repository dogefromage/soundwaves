const express = require('express');
const app = express();
const port = process.env.PORT || 6969;
const socket = require('socket.io');
const path = require('path');
const Logger = require('./src/Logger');
const GameRoom = require('./src/GameRoom');

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

app.use(express.static('src/clientside/static'));

app.get('/', (req, res) =>
{
    // select some room
    // NOT OPTIMAL O(n) CHANGE IN FUTURE
    let randomRoom = [...gameRooms.keys()][Math.floor(Math.random() * gameRooms.size)];
    res.redirect('/' + randomRoom);
});

app.get('/:id', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'src/clientside/index.html'));
});

app.use((req, res, next) =>
{
    res.status(404).sendFile(path.join(__dirname, 'src/clientside/404.html'));
});

const gameRooms = new Map();

function createUniqueRoomID()
{
    throw new Error('FUNCTION NOT IMPLEMENTED');
}

function addRoom(id = createUniqueRoomID())
{
    const room = new GameRoom(io, id);
    if (!gameRooms.has(id))
    {
        gameRooms.set(id, room);
    }
}

function closeRoom(id)
{
    const room = gameRooms.get(id);
    if (room)
    {
        room.close();
        gameRooms.delete(id);
    }
}

for (let id of [ 'xyz' ])
{
    addRoom(id);
}

io.on('connection', (socket) => 
{
    Logger().connects++;

    // gets room id from url
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
