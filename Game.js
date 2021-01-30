const GameMap = require('./GameMap');
const Player = require('./Player');
const GameSettings = require('./GameSettings');
const Rect = require('./Rect');
const Color = require('./Color')

class Game
{
    constructor(mapSize)
    {
        this.map = new GameMap(mapSize);
        this.players = new Map();
        this.soundwaves = new Map();
    }

    addPlayer(id, name, colorValue)
    {
        if (this.players.has(id))
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

        // color, 60% saturated seems good
        let color = Color.FromHSV(360 - colorValue * 3.6, .6, 1);

        const p = new Player(x + 0.5, y + 0.5, id, name, color);
        this.players.set(id, p);
    }

    removePlayer(id)
    {
        this.players.delete(id);
    }

    update(deltaTime)
    {
        // SOUNDWAVES
        for (const [id, w] of this.soundwaves)
        {
            w.update(deltaTime, this.map);

            // IS DEAD?
            if (!w.alive)
            {
                this.soundwaves.delete(id);
            }
        }
 
        // PLAYERS
        for (const [id, p] of this.players)
        {
            let playerWaves = p.update(deltaTime);

            if (playerWaves.size > 0)
            {
                this.soundwaves = new Map([...this.soundwaves, ...playerWaves])
            }

            // COLLISION PLAYER - WALL
            // optimise collision search by only checking in a specified range
            const margin = GameSettings.rangeRectMargin;
            const rangeRect = p.extend(margin);
            // check collision
            this.map.foreachWall((wall) =>
            {
                Rect.collide(wall, p, GameSettings.collisionIterations);
            }, rangeRect);

            // death
            if (p.health <= 0)
            {
                this.removePlayer(id);
                console.log(`Player ${p.name} has unfortunately died`);
            }
        }

        ////////////// SOUNDWAVE x PLAYER COLLISION /////////////////
        for (const [wID, w] of this.soundwaves)
        {
            // collide with border rectangle first to improve collision performance
            let wBorder = new Rect(w.center.x, w.center.y, 0, 0).extend(w.r);

            for (const [pID, p] of this.players)
            {
                if (!Rect.detectCollision(wBorder, p))
                {
                    continue; // player was not in range of soundwave
                }

                if (pID != w.sender && w.settings.damage > 0)
                {
                    let hit = false;
                    for (const v of w.vertices)
                    {
                        if (Rect.detectIntersection(p, v))
                        {
                            hit = true;
                        }
                    }

                    if (hit)
                    {
                        let hurtWaves = p.hurt(w.settings.damage * w.power, w.sender);
                        if (hurtWaves.size > 0)
                        {
                            this.soundwaves = new Map([...this.soundwaves, ...hurtWaves])
                        }
                    }
                }
            }
        }
    }

    getData(socketID, gameTree)
    {
        let range; // range rectangle to limit view and data sent
        let viewDist = 2;
        const pos = this.players.get(socketID);
        if (pos)
        {
            range = new Rect(pos.x, pos.y, 0, 0).extend(viewDist).roundUp();
        }
        else
        {
            // otherwise center of map, if in menu
            range = new Rect(0.5 * this.map.width, 0.5 * this.map.height, 0, 0).extend(viewDist).roundUp();
        }

        // data to be sent
        const data = 
        {
            p: new Map(),
            w: new Map()
        };

        ////////////////// Map ////////////////////
        if (!gameTree.map)
        {
            data.map = this.map.getData();
            gameTree.map = true;
        }

        ////////////////// Settings ////////////////////
        if (!gameTree.settings)
        {
            data.settings = GameSettings;
            gameTree.settings = true;
        }

        ////////////////// Players ////////////////////
        let playerKeys = Array.from(this.players.keys())
        
        // find all ids which are shared between tree and server
        let players_both = intersection(playerKeys, gameTree.players)
        for (const pID of players_both)
        {
            const serverP = this.players.get(pID)
            const isMainPlayer = pID == socketID;
            data.p.set(pID, ['upd', serverP.getNewData(isMainPlayer)])
        }
        // find all ids which are on server but not clients gametree set
        let players_only_server = difference(playerKeys, gameTree.players);
        for (const pID of players_only_server)
        {
            const serverP = this.players.get(pID)
            data.p.set(pID, ['new', serverP.getAllData()])
            gameTree.players.add(pID);
        }
        // find all ids which are still in tree but not anymore on the server
        let players_only_tree = difference(gameTree.players, playerKeys);
        for (const pID of players_only_tree)
        {
            data.p.set(pID, ['del'])
            gameTree.players.delete(pID);
        }

        ////////////////// Waves ////////////////////
        let waveKeys = Array.from(this.soundwaves.keys())
        
        // find all ids which are on server but not clients gametree set
        let waves_only_server = difference(waveKeys, gameTree.waves);
        for (const wID of waves_only_server)
        {
            const serverW = this.soundwaves.get(wID)
            data.w.set(wID, serverW.getData());
            gameTree.waves.add(wID);
        }
        // find all ids which are still in tree but not anymore on the server
        let waves_only_tree = difference(gameTree.waves, waveKeys);
        for (const wID of waves_only_tree)
        {
            gameTree.waves.delete(wID);
        }

        // if no changes occured map must not be sent
        if (data.p.size == 0)
            delete data.p
        if (data.w.size == 0)
            delete data.w;
        
        return data;
    }
}

module.exports = Game;

function intersection(a, b)
{
    const A = [...a];
    const B = new Set(b);
    return new Set(A.filter(id => B.has(id)));
}

function difference(a, b)
{
    const A = [...a];
    const B = new Set(b);
    return new Set(A.filter(id => !B.has(id)));
}