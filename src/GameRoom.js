const Game = require('./Game');
const Logger = require('./Logger');

class GameRoom
{
    constructor(io, id, gameSettings = undefined, expirationTime = 30)
    {
        this.io = io;
        this.id = id;
        this.game = new Game(gameSettings);
        this.sockets = new Set();
        this.lastUpdateTime = process.hrtime();
        this.isRunning = true;

        this.expirationTime = expirationTime;
        this.gameRoomEmptyTime = 0; // counts up if room left empty

        setTimeout(() =>
        {
            this.update();
        }, 50);
    }

    join(socket)
    {
        this.sockets.add(socket);
        socket.join(this.id); // join room
        
        socket.leaveGameRoom = () =>
        {
            this.leave(socket);
        }

        socket.gameKnowledge = this.game.getBlankKnowledge();
        
        socket.on('request-join', (name, color) =>
        {
            if (name.length == 0) // name too short
            {
                socket.emit('answer-join', [ false ]);
            }
            else if (name.length > 30) // name too long
            {
                socket.emit('answer-join', [ false, "Your name must be under 30 characters long!" ]);
            }
            else if (this.game.hasName(name)) // name is in use
            {
                socket.emit('answer-join', [ false, 'This name is already in use!' ]);
            }
            else if (this.game.isFull()) // game is full
            {
                socket.emit('answer-join', [ false, 'This room is already full!' ]);
            }
            else // client can join
            {
                socket.emit('answer-join', [ true ]);
                this.game.addPlayer(socket.id, name, color);
                
                Logger().joins++;
            }
        });
        
        socket.on('client-data', (clientData) =>
        {
            if (clientData.input)
            {
                const player = this.game.gameObjects.get(socket.id);
                if (player)
                {
                    player.setInput(clientData.input);
                }
            }
        });
    }

    leave(socket)
    {
        this.game.removePlayer(socket.id);

        this.sockets.delete(socket);
        socket.leave(this.id); // leave socket.io room

        delete socket.gameKnowledge;

        socket.removeAllListeners('request-join');
        socket.removeAllListeners('client-data');
    }

    close()
    {
        this.io.to(this.id).emit('room-closed');
        
        for (let socket of this.sockets)
        {
            socket.leaveGameRoom();
            delete socket.leaveGameRoom;
        }

        this.isRunning = false;
    }

    update()
    {
        // note start time of loop execution
        const executionStart = process.hrtime();
    
        // time since last frame in seconds (for physics and movement)
        let deltaTime = process.hrtime(this.lastLoopTime)[1] / 1000000000;
        this.lastLoopTime = process.hrtime();
        
        if (deltaTime == 0)
        {
            deltaTime = 0.001; // prevent disaster 
        }
        
        if (this.sockets.size > 0)
        {
            // reset
            this.gameRoomEmptyTime = 0; // s

            // UPDATE GAME
            this.game.update(deltaTime);
        
            // SEND GAME TO CLIENTS
            for (let socket of this.sockets)
            {
                const gameData = this.game.getData(socket.id, socket.gameKnowledge);
                gameData.dt = deltaTime; // is needed for interpolation
                
                const reducedJSON = JSON.stringify(gameData, function(key, value) {
                    // limit precision of floats
                    if (typeof value === 'number') {
                        return parseFloat(value.toFixed(3)); // adequate, any lower looks like shit
                    }
                    // convert all maps to arrays with key-value sub arrays and all sets to arrays
                    else if (value instanceof Map || value instanceof Set) {
                        return [...value];
                    }
                    return value
                });
            
                // console.log(reducedJSON); // show data
                // console.log(reducedJSON.length); // show data size in characters
        
                socket.emit('server-data', reducedJSON);
            }
        }
        else
        {
            // server will close if empty time is too large

            this.gameRoomEmptyTime += deltaTime; // s
            
            if (this.gameRoomEmptyTime > this.expirationTime) // s
            {
                // room expired
                this.isRunning = false;    
            }
        }
    
        let newScoreboard = this.game.getNewScoreboard(10);
        // has new scoreboard?
        if (newScoreboard)
        {
            // emit scoreboard to room with this id
            this.io.to(this.id).emit('scoreboard', newScoreboard);
        }
    
        const loopTimeGoal = 50; //ms

        // time the loop execution took (in ms)
        const executionTime = process.hrtime(executionStart)[1] / 1000000;
        let timeoutTime = loopTimeGoal - executionTime;
        if (timeoutTime < 0)
        {
            timeoutTime = 0;
            console.log("Cant keep up! Last deltaTime: ", deltaTime, "s - (expected: ", loopTimeGoal / 1000,"s)");
        }

        if (this.isRunning)
        {
            setTimeout(() =>
            {
                if (this.update)
                {
                    this.update();
                }
            }, timeoutTime);
        }
    }
}

module.exports = GameRoom;