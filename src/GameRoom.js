const Game = require('./Game');
const Logger = require('./Logger');

class GameRoom
{
    constructor(io, id, gameSettings = undefined, maxSize = 10)
    {
        this.io = io;
        this.id = id;
        this.game = new Game(gameSettings);
        this.maxSize = maxSize;
        this.sockets = new Set();
        this.lastUpdateTime = process.hrtime();
        this.isRunning = true;

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
            if (name.length == 0)
            {
                socket.emit('answer-join', [ false ]);
            }
            else if (name.length > 30)
            {
                socket.emit('answer-join', [ false, "Your name must be under 30 characters long!" ]);
            }
            else
            {
                let unique = !this.game.usedNames.has(name);

                if (unique)
                {
                    // NAME IS VALID
                    socket.emit('answer-join', [ true ]);
                    this.game.addPlayer(socket.id, name, color);
                    
                    Logger().joins++;
                }
                else
                {
                    // NAME IS ALREADY IN USE
                    socket.emit('answer-join', [ false, 'This name is already taken!' ]);
                }
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
        this.game.deleteGameObject(socket.id);

        this.sockets.delete(socket);
        socket.leave(this.id);

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