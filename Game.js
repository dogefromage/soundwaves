const GameMap = require('./GameMap');
const Player = require('./Player');
const GameSettings = require('./GameSettings');
const Rect = require('./Rect');
const Color = require('./Color');
const { Vec2 } = require('./Vector');
const QuadTree = require('./QuadTree');

class Game
{
    constructor(mapSize)
    {
        this.map = new GameMap(mapSize);
        this.players = new Map();
        this.soundwaves = new Map();
        this.quadTree = new QuadTree(new Rect(0, 0, this.map.width, this.map.width));
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
        // clear quadtree
        this.quadTree.clear();


        /////////////////// UPDATE ALL ENTITIES ////////////////////

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
            let playerWaves = p.update(deltaTime, this.map);

            // add new waves
            for (const [_wID, _w] of playerWaves)
                this.soundwaves.set(_wID, _w);

            // death
            if (p.health <= 0)
            {
                this.removePlayer(id);
                console.log(`Player ${p.name} has unfortunately died`);
            }
        }

        ////////////////////////// BUILD QUADTREE /////////////////////////
        for (const [id, w] of this.soundwaves)
        {
            this.quadTree.insert(w.getBounds(), { id, type:'w' });
        }
        
        for (const [id, p] of this.players)
        {
            this.quadTree.insert(p.getBounds(), { id, type:'p' });
        }

        ////////////////// SOUNDWAVE collides with PLAYER /////////////////
        for (const [wID, w] of this.soundwaves)
        {
            if (w.settings.damage == 0)
                continue; // USELESS

            // collide with border rectangle first to improve performance
            let wBorder = w.getBounds();

            for (const { data: { id, type } }  of this.quadTree.inRange(wBorder))
            {
                if (type != 'p')
                    continue
                const pID = id;
                const p = this.players.get(pID);

                if (pID == w.sender)
                    continue;

                let hit = false;
                for (const v of w.vertices)
                {
                    if (!v.active)
                        continue;

                    let A = new Vec2(v.oldX, v.oldY);
                    let B = new Vec2(v.x, v.y);
                    if (Rect.intersectLine(p, A, B))
                    {
                        hit = true;
                        break;
                    }
                }

                if (hit)
                {
                    let hurtWaves = p.hurt(w.settings.damage * w.power, w.sender);
                    // add new waves
                    for (const [_wID, _w] of hurtWaves)
                        this.soundwaves.set(_wID, _w);
                }
            }
        }
    }

    getData(socketID, gameTree)
    {
        let range; // range rectangle to limit view and data sent
        let viewDist = 2.5;
        const pos = this.players.get(socketID);
        if (pos)
        {
            range = new Rect(pos.x, pos.y, 0, 0).extend(viewDist);
        }
        else
        {
            // otherwise center of map, if in menu
            range = new Rect(0.5 * this.map.width, 0.5 * this.map.height, 0, 0).extend(viewDist);
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

        // temp variable for old tree
        const oldTreePlayers = gameTree.players;
        gameTree.players = new Set();
        const oldTreeWaves = gameTree.waves;
        gameTree.waves = new Set();

        ////////////////// Players ////////////////////
        for (const { data: { id, type } } of this.quadTree.inRange(range))
        {
            if (type == 'p') // player
            {
                if (oldTreePlayers.has(id))
                {
                    // update
                    const serverP = this.players.get(id)
                    const isMainPlayer = id == socketID;
                    data.p.set(id, ['upd', serverP.getNewData(isMainPlayer)])
                    
                    oldTreePlayers.delete(id);
                }
                else
                {
                    // new
                    const serverP = this.players.get(id)
                    data.p.set(id, ['new', serverP.getAllData()])
                }
                gameTree.players.add(id);
            }
            else if (type == 'w') // wave
            {
                if (!oldTreeWaves.has(id))
                {
                    // new
                    const serverW = this.soundwaves.get(id)
                    data.w.set(id, serverW.getData());
                }
                gameTree.waves.add(id);
            }
        }

        for (const id of oldTreePlayers) // loop over the remains of this set
        {
            // del
            data.p.set(id, ['del'])
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
