
const GameMap = require('./GameMap');
const GameSettings = require('./GameSettings');
const Rect = require('./Rect');

class Game
{
    constructor(mapSize)
    {
        this.map = new GameMap(mapSize, mapSize);
        this.players = [];
        this.soundWaves = [];
        this.projectiles = [];
    }

    update(deltaTime)
    {
        // PLAYERS
        for (const p of this.players)
        {
            // COLLISION PLAYER - WALL
            this.map.foreachWall((wall) =>
            {
                Rect.collide(wall, p);
            }, true);

            p.update(deltaTime);
        }

        // SOUNDWAVES
        for (let i = 0; i < this.soundWaves.length; i++)
        {
            const w = this.soundWaves[i];

            w.update(deltaTime);
            // FADE OUT
            if (w.power < GameSettings.waveLowestPower)
            {
                this.soundWaves.splice(i, 1);
                i--;
            }

            // COLLIDE WITH WALL
            this.map.foreachWallWithMargin((wall) =>
            {
                w.collideWith(wall);
            }, GameSettings.soundwaveBleed);

            for (const p of this.players)
            {
                if (p !== w.sender)
                {
                    w.collideWith(p);
                }
            }
        }

        // PROJECTILES
        for (const b of this.projectiles)
        {
            b.update(deltaTime);
        }
    }

    // draw(ctxForground, ctxWaves, camera)
    // {
    //     // WAVE CANVAS (fade out)
    //     ctxWaves.fillStyle = GameSettings.fadeClearColor;
    //     ctxWaves.fillRect(0, 0, w, h);

    //     for (const b of this.projectiles)
    //     {
    //         b.draw(ctxWaves, camera);
    //     }

    //     for (const w of this.soundWaves)
    //     {
    //         w.draw(ctxWaves, camera);
    //     }

    //     // FORGROUND CANVAS
    //     ctxForground.clearRect(0, 0, w, h);

    //     this.map.draw(ctxForground, camera);

    //     for (const p of this.players)
    //     {
    //         p.draw(ctxForground, camera);
    //     }
    // }
}

module.exports = Game;