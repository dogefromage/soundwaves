const Rect = require('./Rect');

class Soundwave // version 4 or something???!
{
    constructor(game, x, y, sender, settings, color, isClientSoundwave = false)
    {
        this.game = game;
        this.sender = sender;
        this.color = color;
        this.settings = settings;
        this.isClientSoundwave = isClientSoundwave;
        this.resolution = this.isClientSoundwave ? this.settings.resolutionClient : this.settings.resolutionServer;
        
        this.dead = false;
        this.age = 0;
        this.r = 0;
        this.center = { x, y };
        this.vertices = [];
        
        if (this.settings.full)
        {
            this.bounds = 
            {
                left: -1,
                top: -1,
                right: 1,
                bottom: 1,
            }
        }
        else
        {
            this.bounds = 
            {
                left: -0,
                top: -0,
                right: 0,
                bottom: 0,
            }
        }

        for (let i = 0; i < this.resolution; i++)
        {
            const angle = (i / this.resolution - 0.5) * this.settings.spread + this.settings.rotation;
            this.vertices[i] = 
            {
                dir: // normalized dir for raycasting only needs to be calculated once
                {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                },
                active: true, // if ray has hit it doesn't have to be calculated again
                oldActive: true, // for col. detection
                x, y, // vertex' last position stored here to be sent to client
                oldX: this.center.x, oldY: this.center.y, // for collision with player
            }
        }
        if (!this.settings.full)
        {
            // calculate boundsw
            for (let v of this.vertices)
            {
                const dir = v.dir;
                this.bounds.left = Math.min(this.bounds.left, dir.x);
                this.bounds.right = Math.max(this.bounds.right, dir.x);
                this.bounds.top = Math.min(this.bounds.top, dir.y);
                this.bounds.bottom = Math.max(this.bounds.bottom, dir.y);
            }
            
            // adds another vertex in the center to make soundwave pie-shaped
            this.vertices.push({
                x: this.center.x, 
                y: this.center.y, 
                active: false,
                oldActive: false, // for col. detection
                center: true,
            });
        }
    }

    getBounds()
    {
        let left =   this.center.x + this.r * this.bounds.left;
        let right =  this.center.x + this.r * this.bounds.right;
        let top =    this.center.y + this.r * this.bounds.top;
        let bottom = this.center.y + this.r * this.bounds.bottom;

        return new Rect(left, top, right - left, bottom - top);
    }

    update(deltaTime, map)
    {
        this.age += deltaTime;
        this.r = this.age * this.settings.speed;

        // LINEAR (because 2d no inverse square law!)
        this.power = 1 - this.age / this.settings.lifetime;
        
        if (this.age / this.settings.lifetime > 1)
        {
            this.dead = true;
        }
        
        this.color.a = Math.max(0, 255 * this.power * this.power);

        for (const vertex of this.vertices)
        {
            vertex.oldX = vertex.x;
            vertex.oldY = vertex.y;

            if (!vertex.active)
            {
                vertex.oldActive = false;
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
                    hit = map.pixels[j][i] == '1'; // otherwise, hit is determined by map grid

                if (hit)
                {
                    vertex.active = false; // vertex doesn't have to be calculated again if hit
                    break;
                }
            }
        }

        return [];
    }
    
    onHurt() {}

    onDeath() {}

    getType()
    {
        return 'w';
    }

    getDataNew()
    {
        return {
            co: this.color,
            ce: this.center,
            ag: this.age,
            se: this.settings.getData()
        }
    }

    getDataUpdate()
    {
        return {};
    }
}

module.exports = Soundwave;