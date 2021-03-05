
class Rect
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    getRange()
    { return this; }

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

    // drawOutline(ctx, camera) 
    // {
    //     var margin = 2;
    //     ctx.strokeStyle = "#ffef42";
    //     ctx.lineWidth = 4;
    //     ctx.strokeRect(this.x - camera.x - margin,
    //         this.y - camera.y - margin,
    //         this.w + 2 * margin, this.h + 2 * margin);
    // }

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

    containsRect(rect)
    {
        if (this.x > rect.x) return false;
        if (this.y > rect.y) return false;
        if (this.getRight() < (rect.x + rect.w)) return false;
        if (this.getBottom() < (rect.y + rect.h)) return false;
        return true;
    }

    static intersectPoint(rect, point, margin = 0)
    {
        return - margin + rect.getLeft() < point.x && margin + rect.getRight() > point.x
            && - margin + rect.getTop() < point.y && margin + rect.getBottom() > point.y;
    }

    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    static intersectLine(rect, A, B)
    {
        let tmin = (rect.getLeft() - A.x) / (B.x - A.x); 
        let tmax = (rect.getRight() - A.x) / (B.x - A.x); 

        if (tmin > tmax)
            tmin = [tmax, tmax = tmin][0]; // 1 line swap of doom

        let tymin = (rect.getTop() - A.y) / (B.y - A.y); 
        let tymax = (rect.getBottom() - A.y) / (B.y - A.y); 

        if (tymin > tymax) 
            tymin = [tymax, tymax = tymin][0];

        if ((tmin > tymax) || (tymin > tmax)) 
            return false; 

        if (tymin > tmin) 
            tmin = tymin; 

        if (tymax < tmax) 
            tmax = tymax; 

        if (tmin > 1 || tmax < 0)
            return false; // not between A and B

        return true;
    }

    static intersectRect(fixed, movable, margin = 0)
    {
        return  - margin + fixed.getLeft()    <= movable.getRight() && 
                + margin + fixed.getRight()   >= movable.getLeft() && 
                - margin + fixed.getTop()     <= movable.getBottom() && 
                + margin + fixed.getBottom()  >= movable.getTop();
    }

    static collide(fixed, movable, iterations = 1, offsetMargin = 0.001)
    {
        // fix collision of 'movable' in relation to 'fixed'

        for (let i = 0; i < iterations; i++)
        {
            // interpolate movement of 'movable' between its position from last frame and now 
            const t = (i + 1) / iterations;
            let interpolated = new Rect(
                movable.oldX + (movable.x - movable.oldX) * t,
                movable.oldY + (movable.y - movable.oldY) * t,
                movable.w, movable.h);

            const collision = Rect.intersectRect(fixed, interpolated); 
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