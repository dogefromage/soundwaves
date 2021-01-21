const RandomInteger = require('./RandomInteger');
const GameSettings = require('./GameSettings');
const Color = require('./Color');
const Rect = require('./Rect');

class Soundwave // version 4 or something???!
{
    constructor(x, y, sender, settings, color = new Color(255, 255, 255))
    {
        this.id = RandomInteger();
        this.sender = sender;
        this.color = color;
        this.settings = settings;
        
        this.alive = true;
        this.age = 0;
        this.r = 0;
        this.center = { x, y };
        this.vertices = [];
        for (let i = 0; i < this.settings.resolution; i++)
        {
            const angle = (i / this.settings.resolution - 0.5) * this.settings.spread + this.settings.rotation;
            this.vertices[i] = 
            {
                dir: // normalized dir for raycasting only needs to be calculated once
                {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                },
                active: true, // if ray has hit it doesn't have to be calculated again
                x, y, // vertex' last position stored here to be sent to client
            }
        }
        if (this.settings.spread < 2 * Math.PI)
        {
            // center vertex makes the circle segment into a circle sector (lol)
            this.vertices.push({
                x: this.center.x, 
                y: this.center.y, 
                active: false,
                center: true,
            });
        }
    }

    getRange()
    {
        return new Rect(this.center.x, this.center.y, 0, 0).extend(this.r);
    }

    update(deltaTime, map)
    {
        // soundwaves, which this soundwave may spawn
        let newSoundWaves = [];

        this.age += deltaTime;
        this.r = this.age * this.settings.speed;

        // LINEAR (because 2d no inverse square law!)
        this.power = 1 - this.age / this.settings.lifetime;
        
        if (this.age / this.settings.lifetime > 1)
        {
            this.alive = false;
        }
        
        this.color.a = Math.max(0, 255 * this.power * this.power);

        for (const vertex of this.vertices)
        {
            if (!vertex.active)
            {
                continue; // ...to next vertex
            }

            //////////////// RAYCAST ALGORITHM (MADE BY MYSELF) //////////////// 
            
            const d = vertex.dir; // direction of ray
            const o = this.center; // origin of ray
            
            let m = d.x > 0 ? Math.ceil(o.x) : Math.floor(o.x); // next vertical gridline m (either on left or right of o depending on d)
            let n = d.y > 0 ? Math.ceil(o.y) : Math.floor(o.y); // same for horizontal
            
            while (true)
            {
                let tx, ty; // distances to gridlines

                // prevent div by 0 if ray is parallel to grid
                tx = ty = Number.POSITIVE_INFINITY;
                if (d.x != 0) 
                {
                    tx = (m-o.x) / d.x; // calc distance
                }
                if (d.y != 0)
                {
                    ty = (n-o.y) / d.y;
                }

                // get shortest distance to gridlines
                let t = Math.min(tx, ty);

                // raycast has hit soundwave radius
                if (t > this.r)
                {
                    // vertex is still on soundwave radius
                    vertex.x = o.x + this.r * d.x;
                    vertex.y = o.y + this.r * d.y;
                    break;
                }

                // calc gridpoint
                let p = {
                    x: o.x + t * d.x,
                    y: o.y + t * d.y,
                };
                vertex.x = p.x;
                vertex.y = p.y;

                // hit with map pixel
                let hit = false;
                // indices of map grid
                let i, j;

                if (tx < ty) // determine which axis is hit by raycast, here x
                {
                    // calc grid indices of hit
                    i = Math.round(p.x); // for slight inaccuracies (float errors etc)
                    j = Math.floor(p.y);
                    
                    // move gridlines one step further
                    if (d.x > 0)
                    {
                        m++;
                    }
                    else
                    {
                        i--;
                        m--;
                    }
                }
                else // same for y
                {
                    i = Math.floor(p.x);
                    j = Math.round(p.y);

                    if (d.y > 0)
                    {
                        n++;

                    }
                    else
                    {
                        n--;
                        j--;
                    }
                }

                if (i < 0 || i >= map.width || j < 0 || j >= map.height) // outside map
                    hit = true; 
                else
                    hit = map.pixels[j][i]; // otherwise, hit is determined by map grid

                if (hit)
                {
                    vertex.active = false; // vertex doesn't have to be calculated again if hit
                    break;
                }
            }
        }

        return newSoundWaves;
    }

    getData()
    {
        let vertices = [];
        for (const v of this.vertices)
        {
            vertices.push({
                x: v.x,
                y: v.y,
                hit: !v.active && !v.center
            });
        }

        return {
            id: this.id,
            color: this.color.toHex(),
            center: this.center,
            radius: this.r,
            vertices,
        };
    }
}


class SoundwaveSettings
{
    constructor(speed, lifetime, damage, rotation, spread, resolution)
    {
        this.speed = speed;
        this.lifetime = lifetime;
        this.damage = damage;
        this.rotation = rotation;
        this.spread = spread;
        this.resolution = resolution;
    }

    static walk()
    {
        return new SoundwaveSettings(0.6, 2, 0, 0, 2 * Math.PI, 200);
    }

    static sneak()
    {
        return new SoundwaveSettings(0.6, 0.5, 0, 0, 2 * Math.PI, 100);
    }

    static hurt()
    {
        return new SoundwaveSettings(0.3, 0.8, 0, 0, 2 * Math.PI, 100);
    }

    static death()
    {
        return new SoundwaveSettings(0.1, 3, 0, 0, 2 * Math.PI, 150);
    }

    static Attack(rotation, magnitude)
    {
        // console.log(magnitude);

        // ln limits speed if magnitude is very large
        let speed = Math.log1p(15 * magnitude) * 0.6;
        // seems reasonable
        let lifetime = 2;
        // damage rises exponentially to stop spamming
        let damage = 0.5 * Math.expm1(magnitude);
        // spread similar to 1/x but offset so f(0)=PI
        let spread = 3.1415 / (30 * magnitude + 1);

        return new SoundwaveSettings(speed, lifetime, damage, rotation, spread, 100);
    }
}

module.exports = { Soundwave, SoundwaveSettings };
