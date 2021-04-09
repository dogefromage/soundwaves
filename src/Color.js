
const { clamp } = require('./GameMath');

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
        let c = new Color(this.r, this.g, this.b, this.a); 
        return c;
    }

    /**
     * 
     * @param {number} h Hue from 0 to 360
     * @param {number} s Saturation from 0 to 1
     * @param {number} v Value form 0 to 1
     */
    static FromHSV(h, s, v)
    {
        //https://www.rapidtables.com/convert/color/hsv-to-rgb.html
        h = clamp(Math.floor(h), 0, 359);
        s = clamp(s, 0, 1);
        v = clamp(v, 0, 1);

        let c = v * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1)); //????
        let m = v - c;

        let col;
        if (h < 60) col = [c, x, 0];
        else if (h < 120) col = [x, c, 0];
        else if (h < 180) col = [0, c, x];
        else if (h < 240) col = [0, x, c];
        else if (h < 300) col = [x, 0, c];
        else if (h < 360) col = [c, 0, x];
        else return;

        return new Color(
            Math.floor((col[0] + m) * 255),
            Math.floor((col[1] + m) * 255),
            Math.floor((col[2] + m) * 255)
        );
    }
}

module.exports = Color;
