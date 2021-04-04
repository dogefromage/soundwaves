import Rect from '../Rect';

export class ClientGamemap
{
    constructor(game, { w: width, h: height, data })
    {
        this.game = game;
        
        this.width = width;
        this.height = height;
        this.pixels = [];
        this.rects = [];
        for (let j = 0; j < this.height; j++)
        {
            this.pixels[j] = [];
            this.rects[j] = [];
            for (let i = 0; i < this.width; i++)
            {
                let pixel = data[ j * this.width + i ];
                this.pixels[j][i] = pixel;
                if (pixel == '1')
                {
                    this.rects[j][i] = new Rect(i, j, 1, 1);
                }
                else
                {
                    this.rects[j][i] = null;
                }
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
                if (this.rects[j][i])
                {
                    action(this.rects[j][i]);
                }
            }
        }
    }

    draw(ctx, camera, range)
    {
        ctx.fillStyle = "#000000";
        this.foreachWall((rect) =>
        {
            const canRect = camera.WorldToCanvasRect(rect);
            ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);   
        }, range);
    }
}
