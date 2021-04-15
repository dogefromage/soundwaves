const express = require('express');
const app = express();
const port = process.env.PORT || 6969;
const socket = require('socket.io');
const path = require('path');
const RoomManager = require('./src/RoomManager');

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

// lowest class controlling everything
const roomManager = new RoomManager(io);

app.use(express.static('src/clientside/static'));

app.get('/', (req, res) =>
{
    // select some room
    let roomId = roomManager.getAvailableRoom();
    if (roomId)
    {
        res.redirect('/' + roomId);
    }
    else
    {
        res.redirect('/error'); // 404
    }

});

app.get('/error', (req, res) =>
{
    res.status(404).sendFile(path.join(__dirname, 'src/clientside/404.html'));
});

app.get('/:id', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'src/clientside/index.html'));
});

// is called if nothing else has worked
app.use((req, res, next) =>
{
    res.status(404).sendFile(path.join(__dirname, 'src/clientside/404.html'));
});