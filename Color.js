
class Color
{
    constructor(r, g, b, a = 255)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toHex()
    {
        this.r = Math.floor(this.r);
        this.g = Math.floor(this.g);
        this.b = Math.floor(this.b);
        this.a = Math.floor(this.a);
        const r = ("0" + this.r.toString(16)).substr(-2,2);
        const g = ("0" + this.g.toString(16)).substr(-2,2);
        const b = ("0" + this.b.toString(16)).substr(-2,2);
        const a = ("0" + this.a.toString(16)).substr(-2,2);
        return "#" + r + g + b + a;
    }

    toHexNoAlpha()
    {
        this.r = Math.floor(this.r);
        this.g = Math.floor(this.g);
        this.b = Math.floor(this.b);
        const r = ("0" + this.r.toString(16)).substr(-2,2);
        const g = ("0" + this.g.toString(16)).substr(-2,2);
        const b = ("0" + this.b.toString(16)).substr(-2,2);
        return "#" + r + g + b;
    }

    copy()
    {
        return new Color(this.r, this.g, this.b, this.a);
    }
}

module.exports = Color;