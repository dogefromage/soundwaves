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
                if (this.pixels[j][i])
                {
                    const rect = new Rect(i, j, 1, 1);
                    action(rect);
                }
            }
        }
    }

    foreachWallWithMargin(action, margin, rangeRect = null)
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
                if (this.pixels[j][i])
                {
                    let left = true,
                        right = true,
                        top = true,
                        bottom = true;

                    if (i > 0) left = this.pixels[j][i - 1];
                    if (i < this.width - 1) right = this.pixels[j][i + 1];
                    if (j > 0) top = this.pixels[j - 1][i];
                    if (j < this.height - 1) bottom = this.pixels[j + 1][i];

                    const rect = new Rect(
                        i + (left ? 0 : margin),
                        j + (top ? 0 : margin),
                        1 - (right ? 0 : margin) - (left ? 0 : margin),
                        1 - (bottom ? 0 : margin) - (top ? 0 : margin)
                    );
                    
                    action(rect);
                }
            }
        }
    }

    getData(rangeRect)
    {
        const walls =  [];
        this.foreachWall((rect) => {
            walls.push(rect);
        }, rangeRect);
        
        return {
            width: this.width,
            height: this.height,
            walls: walls,
            color: GameSettings.canvasBlack,
        };
    }
}

module.exports = GameMap;