const Logger = require('./Logger');
const GameRoom = require('./GameRoom');
const { GameSettings } = require('./GameSettings'); 

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
                    const roomOrUndef = this.openRoom({ settings: settingsObj });
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

        this.openRoom({ expirationTime: Infinity });
        this.openRoom({ expirationTime: Infinity });
        this.openRoom({ expirationTime: Infinity });

        setTimeout(() => { this.update(); }, 10); 
    }

    update()
    {
        /////// add rooms


        /////// remove rooms
        for (let [ id, room ] of this.gameRooms)
        {
            if (!room.isRunning)
            {
                room.close(); // just double checking
                this.gameRooms.delete(id);
            }
        }

        /////// update roomList
        this.roomList = [];
        for (let [ id, room ] of this.gameRooms)
        {
            const info = room.game.getInfo();
            info.unshift(id);
            this.roomList.push(info);
            // info := [ id, players, maxPlayers ]
        }
        this.roomList.sort((a, b) => (b[2] - b[1]) - (a[2] - a[1]) ); // descending by free space

        /////// recall function
        setTimeout(() => { this.update(); }, 1000);
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
        let randomRoom = this.roomList[Math.floor(Math.random() * this.roomList.length)];
        return randomRoom[0];
    }

    openRoom({ id = this.createUniqueRoomID(), settings, expirationTime })
    {
        if (!this.gameRooms.has(id))
        {
            const room = new GameRoom(this.io, id, settings, expirationTime);
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