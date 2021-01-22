const GameMap = require('./GameMap');
const Player = require('./Player');
const GameSettings = require('./GameSettings');
const Rect = require('./Rect');
const { Soundwave, SoundwaveSettings } = require('./Soundwave')

class Game
{
    constructor(mapSize)
    {
        this.map = new GameMap(mapSize);
        this.players = [];
        this.soundwaves = [];
        // this.powerups = [];
    }

    addPlayer(id, name)
    {
        if (this.players.find(p => p.id == id)) 
        {
            return; 
        }

        // find empty spawning space for player
        let x, y;
        do
        {
            x = Math.floor(Math.random() * this.map.width);
            y = Math.floor(Math.random() * this.map.height);
        }
        while(this.map.pixels[y][x] == '1') // repeat if map square isn't empty

        const p = new Player(x + 0.5, y + 0.5, id, name);
        this.players.push(p);
    }

    removePlayer(id)
    {
        for (let i = this.players.length - 1; i >= 0; i--)
        {
            if (this.players[i].id == id)
            {
                this.players.splice(i, 1);
                return;
            }
        }
    }

    update(deltaTime)
    {
        // SOUNDWAVES
        for (let i = this.soundwaves.length - 1; i >= 0; i--)
        {
            const w = this.soundwaves[i];

            const waveWaves = w.update(deltaTime, this.map);
            this.soundwaves = this.soundwaves.concat(waveWaves);

            // IS DEAD?
            if (!w.alive)
            {
                this.soundwaves.splice(i, 1);
                i--;
            }
        }

        // PLAYERS
        for (const p of this.players)
        {
            let playerWaves = p.update(deltaTime);

            // COLLISION PLAYER - WALL
            // optimise collision search by only checking in a specified range
            const margin = GameSettings.rangeRectMargin;
            const rangeRect = p.extend(margin);
            // check collision
            this.map.foreachWall((wall) =>
            {
                Rect.collide(wall, p, GameSettings.collisionIterations);
            }, rangeRect);

            this.soundwaves = this.soundwaves.concat(playerWaves);

            // death
            if (p.health <= 0)
            {
                this.removePlayer(p.id);
                console.log(`Player ${p.id} has unfortunately died`);
            }
        }

        ////////////// SOUNDWAVE x PLAYER COLLISION /////////////////
        for (const w of this.soundwaves)
        {
            // collide with border rectangle first to improve collision performance
            let wBorder = new Rect(w.center.x, w.center.y, 0, 0).extend(w.r);

            for (let p of this.players)
            {
                if (!Rect.detectCollision(wBorder, p))
                {
                    continue; // player was not in range of soundwave
                }

                if (p.id != w.sender && w.settings.damage > 0)
                {
                    let hit = false;
                    for (let v of w.vertices)
                    {
                        if (Rect.detectIntersection(p, v))
                        {
                            hit = true;
                        }
                    }

                    if (hit)
                    {
                        let collisionWaves = p.hurt(w.settings.damage * w.power, w.sender);
                        this.soundwaves = this.soundwaves.concat(collisionWaves);
                    }
                }
            }
        }
    }

    getData(id, clientTree)
    {
        let range; // range rectangle to limit view and data sent
        let viewDist = 2;
        let pos = this.players.find(p => p.id == id);
        if (pos)
        {
            range = new Rect(pos.x, pos.y, 0, 0).extend(viewDist).roundUp();
        }
        else
        {
            range = new Rect(0.5 * this.map.width, 0.5 * this.map.height, 0, 0).extend(viewDist).roundUp();
        }

        // data to be sent
        const data = {};

        if (clientTree)
        {
            // send data not currently in tree, otherwise update if needed
            // console.log("has clienttree");
            if (!clientTree.m)
            {
                // resend map
                data.m = this.map.getData();
            }
            
            // players
            data.p = this.selectData(this.players, clientTree.p, range);

            // waves
            data.w = [];
            for (let w of this.soundwaves)
            {
                if (Rect.detectCollision(w.getRange(), range))
                {
                    let clientID = clientTree.w.find(id => id == w.id);
                    if (!clientID)
                    {
                        data.w.push(w.getData());
                    }
                }
            }
        }
        else
        {
            // send map
            data.m = this.map.getData();
        }

        return data;
    }

    /**
     * select the data which needs to be updated on every client
     * if client data is not on server, delete
     * an id must exist for every object 
     */
    selectData(serverArray, clientIDs, range)
    {
        let data = [];
        // make copy so it can be manipulated
        let idsCopy = clientIDs.slice();

        for (let serverObj of serverArray)
        {
            if (!Rect.detectCollision(range, serverObj.getRange()))
            {
                continue;
            }

            let IDIndex = idsCopy.indexOf(idsCopy.find(id => id == serverObj.id));
            if (IDIndex >= 0)
            {
                // update
                let objData = serverObj.getNewData();
                objData.info = "upd";
                data.push(objData);
            }
            else
            {
                // create new
                let objData = serverObj.getAllData();
                objData.info = "new";
                data.push(objData);
            }

            // remove id from copy
            idsCopy.splice(IDIndex, 1);
        }

        for (let id of idsCopy)
        {
            // deletes
            data.push({ info: "del", id });
        }

        return data;
    }
}

module.exports = Game;
