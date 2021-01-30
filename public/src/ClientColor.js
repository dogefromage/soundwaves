
export class ClientColor
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
        let s = "#";
        for (let c of [this.r, this.g, this.b, this.a])
        {
            s += ("0" + Math.floor(c).toString(16)).substr(-2,2);
        }
        return s;
    }

    toHexNoAlpha()
    {
        let s = "#";
        for (let c of [this.r, this.g, this.b])
        {
            s += ("0" + Math.floor(c).toString(16)).substr(-2,2);
        }
        return s;
    }

    copy()
    {
        return new ClientColor(this.r, this.g, this.b, this.a);
    }
}
