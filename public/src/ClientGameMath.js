
export function lerp (a, b, t)
{
    return (1 - t) * a + t * b;
}

export function inverseLerp(a, b, x)
{
    return (x - a) / (b - a);
}

export function lerpVector(a, b, t)
{
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t)
    };
}

export function hexToRgb(hex)
{
    var result = /^#?([A-Fa-f\d]{2})([A-Fa-f\d]{2})([A-Fa-f\d]{2})$/i.exec(hex);
    return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
    } : null;
}

export function rgbToHex(c)
{
    const r = ("0" + c.r.toString(16)).substr(-2,2);
    const g = ("0" + c.g.toString(16)).substr(-2,2);
    const b = ("0" + c.b.toString(16)).substr(-2,2);

    return "#" + r + g + b;
}

export function lerpColorHex(a, b, t)
{
    let c = lerpColor(hexToRgb(a), hexToRgb(b), t);
    return rgbToHex(c);
}

export function lerpColor(a, b, t)
{
    if (a && b)
    {
        return {
            r: Math.round(lerp(a.r, b.r, t)),
            g: Math.round(lerp(a.g, b.g, t)),
            b: Math.round(lerp(a.b, b.b, t))
        };
    } else {
        return { r: 255, g: 0, b: 255 };
    }
}
