

class ClientGameMap
{
    constructor({width, height, walls})
    {
        this.width = width;
        this.height = height;
        this.walls = walls;
    }

    setData({width, height, walls})
    {
        this.width = width;
        this.height = height;
        this.walls = walls;
    }

    draw(ctx, camera)
    {
        ctx.fillStyle = "#000000";
        for (let w of this.walls)
        {
            const canRect = camera.WorldToCanvasRect(w);
            ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);   
        }
    }
}

