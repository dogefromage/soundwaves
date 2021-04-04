const Rect = require('./Rect');
const GameSettings = require('./GameSettings');
const { mapSize } = require('./GameSettings');
const generateMaze = require('./Maze');

class GameMap
{
    constructor(game, size)
    {
        this.game = game;
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
                // take two mazes and merge them using the 'and' operation. this opens up new walkways
                this.pixels[j][i] = !(maze1[j][i] || maze2[j][i]); 
                this.pixels[j][i] = this.pixels[j][i] ? '1':'0';
            }
        }
        
        // compress data for sending to clients
        this.pixelString = "";
        for (let j = 0; j < this.height; j++)
        {
            for (let i = 0; i < this.width; i++)
            {
                this.pixelString += this.pixels[j][i];
            }
        }
    }

    findEmptySpawningSpace(margins = 0)
    {
        let x, y;
        do
        {
            x = Math.floor(Math.random() * this.width);
            y = Math.floor(Math.random() * this.height);
        }
        while(this.pixels[y][x] == '1') // repeat if map square isn't empty

        x += margins + Math.random() * (1 - 2 * margins);
        y += margins + Math.random() * (1 - 2 * margins);

        return { x, y };
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

    getData()
    {

        return {
            w: this.width,
            h: this.height,
            data: this.pixelString,
        };
    }
}

module.exports = GameMap;
