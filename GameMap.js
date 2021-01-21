const Rect = require('./Rect');
const GameSettings = require('./GameSettings');
const { mapSize } = require('./GameSettings');
const generateMaze = require('./Maze');

class GameMap
{
    constructor(size)
    {
        this.width = 2 * size + 1;
        this.height = 2 * size + 1;
        this.pixels = [];

        let maze1 = generateMaze(size, size);
        let maze2 = generateMaze(size, size);

        for (let j = 0; j < this.height; j++)
        {
            this.pixels[j] = [];
            for (let i = 0; i < this.height; i++)
            {
                this.pixels[j][i] = !(maze1[j][i] || maze2[j][i]);
                this.pixels[j][i] = this.pixels[j][i] ? '1':'0';
            }
        }
    }

    foreachWall(action, rangeRect = null)
    {
        let X = 0, Y = 0, R = this.width, B = this.height;
        if (rangeRect)
        {
            X = Math.max(X, Math.floor(rangeRect.x));
            Y = Math.max(Y, Math.floor(rangeRect.y));
            R = Math.min(R, Math.ceil(rangeRect.getRight()));
            B = Math.min(B, Math.ceil(rangeRect.getBottom()));
        }
        
        for (let j = Y; j < B; j++)
        {
            for (let i = X; i < R; i++)
            {
                if (this.pixels[j][i] == '1')
                {
                    const rect = new Rect(i, j, 1, 1);
                    action(rect);
                }
            }
        }
    }

    getData(rangeRect)
    {
        return {
            width: this.width,
            height: this.height,
            pixels: this.pixels,
        };
    }
}

module.exports = GameMap;