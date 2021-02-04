import Rect from '../../Rect';

export class ClientGamemap
{
    constructor({w: width, h: height, data})
    {
        this.width = width;
        this.height = height;
        this.pixels = [];
        for (let j = 0; j < this.height; j++)
        {
            this.pixels[j] = [];
            for (let i = 0; i < this.width; i++)
            {
                this.pixels[j][i] = data[ j * this.width + i ];
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

    draw(ctx, camera)
    {
        ctx.fillStyle = "#000000";
        for (let j = 0; j < this.pixels.length; j++)
        {
            for (let i = 0; i < this.pixels[j].length; i++)
            {
                if (this.pixels[j][i] == '1')
                {
                    const canRect = camera.WorldToCanvasRect(new Rect(i, j, 1, 1));
                    ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);   
                }
            }
        }
    }
}

