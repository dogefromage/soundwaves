

class ClientGamemap
{
    constructor({width, height, pixels})
    {
        this.width = width;
        this.height = height;
        this.pixels = pixels;
    }

    setData({width, height, pixels})
    {
        this.width = width;
        this.height = height;
        this.pixels = pixels;
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
                    const canRect = camera.WorldToCanvasRect(new ClientRect(i, j, 1, 1));
                    ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);   
                }
            }
        }
    }
}

