

class Vec2
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }

    copy()
    {
        return new Vec2(this.x, this.y)
    }

    add(v)
    {
        return new Vec2(
            this.x + v.x,
            this.y + v.y
        )
    }

    sub(v)
    {
        return new Vec2(
            this.x - v.x,
            this.y - v.y
        )
    }

    mult(v)
    {
        if (typeof(v) == 'number')
        {
            return new Vec2(
                this.x * v,
                this.y * v
            )
        }
        else
        {
            return new Vec2(
                this.x * v.x,
                this.y * v.y
            )
        }
    }

    dot(v)
    {
        return this.x * v.x + this.y * v.y;
    }

    sqrMagnitude()
    {
        return this.dot(this);
    }

    magnitude()
    {
        return Math.sqrt(this.sqrMagnitude());
    }

    normalize(length = 1)
    {
        let m = this.magnitude();
        if (m == 0)
            return new Vec2(0, 0);
        else
            return this.mult(length / m)
    }

    rotate(a)
    {
        const cos = Math.cos(a);
        const sin = Math.sin(a);

        return new Vec2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        )
    }

    lerp(target, t)
    {
        let delta = target.sub(this);
        return this.add(delta.mult(t))
    }

    heading()
    {
        return Math.atan2(this.y, this.x);
    }
}

module.exports = { Vec2 }