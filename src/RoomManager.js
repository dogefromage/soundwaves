const Logger = require('./src/Logger');
const GameRoom = require('./src/GameRoom');
const { GameSettings } = require('./src/GameSettings'); 

class RoomManager
{
    constructor(io, maxRooms = 20)
    {
        this.maxRooms = maxRooms;
        this.io = io;
        
        this.gameRooms = new Map();
        this.roomList = [];

        /**
         * when user socket connects
         */
        this.io.on('connection', (socket) => 
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

            const gameRoom = this.gameRooms.get(id);
            if (gameRoom)
            {
                gameRoom.join(socket);
            }
            else
            {
                socket.emit('room-not-found', [ id ]);
            }

            socket.on('request-room-list', (callback) =>
            {
                // CHANGE!! THIS IS ONLY FOR TESTING
                let roomList = [];

                for (let [ id, room ] of this.gameRooms)
                {
                    const info = room.game.getInfo();
                    roomList.push( [ id, ...info ] );
                }

                callback(roomList);
            });

            socket.on('request-new-room', (settingsArr, callback) =>
            {
                let settingsObj = GameSettings.FromArray(settingsArr);
                if (!settingsObj)
                {
                    callback([ false, "This room couldn't be created. Sorry!" ]);
                }
                else if (this.gameRooms.size >= this.maxRooms) // too many rooms
                {
                    callback([ false, "There are currently too many rooms open. Try joining an already existing one!"]);
                }
                else
                {
                    // try to create room
                    const roomOrUndef = openRoom(settingsObj);
                    if (roomOrUndef)
                    {
                        callback([ true, roomOrUndef.id ]); // room created
                    }
                    else
                    {
                        callback([ false, 'A room with this name already exists! ']);
                    }
                }
            });

            socket.on('disconnect', () => 
            {
                if (socket.leaveGameRoom)
                {
                    socket.leaveGameRoom();
                    delete socket.leaveGameRoom;
                }
            });
        });

        setTimeout(this.update, 1000); 
    }

    update()
    {
        /////// add or remove rooms
        



        /////// update roomList
        this.roomList = [];
        for (let [ id, room ] of this.gameRooms)
        {
            const info = room.game.getInfo();
            info.unshift(id);
            // info := [ id, players, maxPlayers ]
        }
        this.roomList.sort((a, b) => (b[2] - b[1]) - (a[2] - a[1]) ); // descending by free space

        /////// recall function
        setTimeout(this.update, 1000);
    }

    createUniqueRoomID()
    {
        let id;
        do
        {
            const randNum = Math.floor(Math.random() * 10000);
            id = "0000" + randNum;
            id = id.substring(id.length - 4);
        }
        while (this.gameRooms.has(id));
        return id;
    }

    getAvailableRoom() // room for newly entering player
    {

    }

    openRoom(settings = undefined, id = createUniqueRoomID())
    {
        if (!this.gameRooms.has(id))
        {
            const room = new GameRoom(io, id, settings);
            this.gameRooms.set(id, room);
            return room;
        }

        return undefined;
    }

    closeRoom(id)
    {
        const room = this.gameRooms.get(id);
        if (room)
        {
            room.close();
            this.gameRooms.delete(id);
        }
    }

}

module.exports = RoomManager;