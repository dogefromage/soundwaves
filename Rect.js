const { lerp }  = require('./GameMath');

class Rect
{
    constructor(x, y, w, h, remembers=false)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        if (remembers)
        {
            this.oldX = x;
            this.oldY = y;
        }
    }

    getRange()
    {
        return this;
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

    copy()
    {
        return new Rect(this.x, this.y, this.w, this.h);
    }

    extend(m)
    {
        return new Rect(this.x - m, this.y - m, this.w + 2 * m, this.h + 2 * m);
    }

    roundUp()
    {
        let newX = Math.floor(this.x);
        let newY = Math.floor(this.y);
        return new Rect(
            newX, newY,
            Math.ceil(this.w + this.x - newX),
            Math.ceil(this.h + this.y - newY),
        );
    }

    static detectCollision(fixed, movable, margin = 0)
    {
        return  - margin + fixed.getLeft()    <= movable.getRight() && 
                + margin + fixed.getRight()   >= movable.getLeft() && 
                - margin + fixed.getTop()     <= movable.getBottom() && 
                + margin + fixed.getBottom()  >= movable.getTop();
    }

    static detectIntersection(rect, point, margin = 0)
    {
        return - margin + rect.getLeft() < point.x && margin + rect.getRight() > point.x
            && - margin + rect.getTop() < point.y && margin + rect.getBottom() > point.y;
    }

    static collide(fixed, movable, iterations = 1, offsetMargin = 0.001)
    {
        // fix collision of 'movable' in relation to 'fixed'

        for (let i = 0; i < iterations; i++)
        {
            // interpolate movement of 'movable' between its position from last frame and now 
            const t = (i + 1) / iterations;
            let interpolated = new Rect(
                lerp(movable.oldX, movable.x, t),
                lerp(movable.oldY, movable.y, t),
                movable.w, movable.h);

            const collision = Rect.detectCollision(fixed, interpolated); 
            if (collision)
            {
                // COLLISION IN X DIRECTION
                if (interpolated.getRight() >= fixed.getLeft() &&
                    movable.getOldRight() < fixed.getLeft())
                {
                    // movable has fixed to its right
                    movable.setRight(fixed.getLeft() - offsetMargin);
                    movable.oldX = movable.x;
                }
                else if (interpolated.getLeft() <= fixed.getRight() &&
                    movable.getOldLeft() > fixed.getRight())
                {
                    // movable has fixed to its left
                    movable.setLeft(fixed.getRight() + offsetMargin);
                    movable.oldX = movable.x;
                }
                
                // COLLISION IN Y DIRECTION
                if (interpolated.getBottom() >= fixed.getTop() &&
                    movable.getOldBottom() < fixed.getTop())
                {
                    // movable has fixed to its bottom
                    movable.setBottom(fixed.getTop() - offsetMargin);
                    movable.oldY = movable.y;
                }
                else if (interpolated.getTop() <= fixed.getBottom() &&
                    movable.getOldTop() > fixed.getBottom())
                {
                    // movable has fixed to its top
                    movable.setTop(fixed.getBottom() + offsetMargin);
                    movable.oldY = movable.y;
                }
                return true;
            }
        }
        return false;
    }
}

module.exports = Rect;