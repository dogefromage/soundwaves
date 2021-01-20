const GameMap = require('./GameMap');
const Player = require('./Player');
const GameSettings = require('./GameSettings');
const Rect = require('./Rect');
const { Soundwave, SoundwaveSettings } = require('./Soundwave')
const GameDebugger = require('./GameDebugger');

class Game
{
    constructor(mapSize)
    {
        this.map = new GameMap(mapSize);
        this.players = [];
        this.soundwaves = [];
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
        while(this.map.pixels[y][x]) // repeat if map square isn't empty

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
        // DEBUG
        GameDebugger.reset();

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

    getData(id)
    {
        // PLAYERS
        const players = [];
        for (let p of this.players)
        {
            players.push(p.getData());
        }

        // SOUNDWAVES
        const waves = [];
        for (let w of this.soundwaves)
        {
            waves.push(w.getData());
        }

        const debug = 
        {
            rects: GameDebugger.rectangles
        };

        const data = 
        {
            map: this.map.getData(),
            players,
            soundwaves: waves,
            debug: debug,
        };

        return data;
    }
}

module.exports = Game;
