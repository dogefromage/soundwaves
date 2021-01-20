

class ClientRect
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.oldX = x;
        this.oldY = y;
    }

    isInsideOut()
    {
        return this.w < 0 && this.h < 0;
    }

    getLeft()
    { return this.x; }

    getRight()
    { return this.x + this.w; }

    getTop()
    { return this.y; }

    getBottom()
    { return this.y + this.h; }

    getOldLeft()
    { return this.oldX; }

    getOldRight()
    { return this.oldX + this.w; }

    getOldTop()
    { return this.oldY; }

    getOldBottom()
    { return this.oldY + this.h; }

    getCenterX()
    { return this.x + 0.5 * this.w; }

    getCenterY()
    { return this.y + 0.5 * this.h; }

    setLeft(x) 
    { this.x = x; }

    setRight(x) 
    { this.x = x - this.w; }

    setTop(y) 
    { this.y = y; }

    setBottom(y) 
    { this.y = y - this.h; }

    drawOutline(ctx, camera) 
    {
        var margin = 2;
        ctx.strokeStyle = "#ffef42";
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x - camera.x - margin,
            this.y - camera.y - margin,
            this.w + 2 * margin, this.h + 2 * margin);
    }
}
