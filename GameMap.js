const Rect = require('./Rect');
const GameSettings = require('./GameSettings');

class GameMap
{
    constructor(w, h)
    {
        this.width = w;
        this.height = h;
        this.pixels = [];
        this.borderRect = new Rect(this.width, this.height, -this.width, -this.height);

        for (let j = 0; j < this.height; j++)
        {
            this.pixels[j] = [];
            for (let i = 0; i < this.width; i++)
            {
                this.pixels[j][i] = Math.random() > 0.8;
            }
        }
    }

    foreachWall(action, alsoUseBorder = false)
    {
        for (let j = 0; j < this.height; j++)
        {
            for (let i = 0; i < this.width; i++)
            {
                if (this.pixels[j][i])
                {
                    const rect = new Rect(i, j, 1, 1);
                    action(rect);
                }
            }
        }

        if (alsoUseBorder)
        {
            action(this.borderRect);
        }
    }

    foreachWallWithMargin(action, margin)
    {
        for (let j = 0; j < this.height; j++)
        {
            for (let i = 0; i < this.width; i++)
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

    // draw(ctx, camera)
    // {
    //     ctx.fillStyle = GameSettings.canvasBlack;

    //     if (GameSettings.debug)
    //     {
    //         ctx.fillStyle = "#222";
    //     }
        
    //     this.foreachWall((rect) =>
    //     {
    //         const canRect = camera.WorldToCanvasRect(rect);
    //         ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);   
    //     });

    //     if (GameSettings.debug)
    //     {
    //         ctx.fillStyle = "#ff000066";
    //         this.foreachWallWithMargin((rect) =>
    //         {
    //             const canRect = camera.WorldToCanvasRect(rect);
    //             ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);   
    //         }, GameSettings.soundwaveBleed);
    //     }
    // }
}

module.exports = GameMap;