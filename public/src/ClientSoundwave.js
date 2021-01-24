import { ClientColor } from "./ClientColor";

export class ClientSoundwave
{
    constructor({ id, color, center, age, settings })
    {
        this.id = id;
        this.color = new ClientColor(color.r, color.g, color.b, color.a);
        this.settings = settings;
        
        this.alive = true;
        this.age = age;
        this.r; // has to be set using age in update
        this.center = center;
        this.vertices = [];
        for (let i = 0; i < this.settings.resolutionClient; i++)
        {
            const angle = (i / this.settings.resolutionClient - 0.5) * this.settings.spread + this.settings.rotation;
            this.vertices[i] = 
            {
                dir: // normalized dir for raycasting only needs to be calculated once
                {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                },
                active: true, // if ray has hit it doesn't have to be calculated again
                x: this.center.x, y: this.center.y, // vertex' last position stored here to be sent to client
            }
        }

        if (!this.settings.full)
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

    update(deltaTime, map)
    {
        this.age += deltaTime;
        this.r = this.age * this.settings.speed;
        
        if (this.age / this.settings.lifetime > 1)
        {
            this.alive = false;
        }
        
        this.power = 1 - this.age / this.settings.lifetime;
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
                    hit = map.pixels[j][i] == '1'; // otherwise, hit is determined by map grid

                if (hit)
                {
                    vertex.active = false; // vertex doesn't have to be calculated again if hit
                    break;
                }
            }
        }
    }

    draw(ctx, camera)
    {
        if (this.vertices.length > 0)
        {
            const center = camera.WorldToCanvas(this.center);
            const radius = camera.WorldToCanvasScale(this.r);
            // SOUNDWAVE
            const gradient = ctx.createRadialGradient(center.x,center.y,0, center.x,center.y,radius);
            gradient.addColorStop(0, "#00000000");
            gradient.addColorStop(1, this.color.toHex());
            ctx.fillStyle = gradient;

            ctx.beginPath();
            let p = camera.WorldToCanvas(this.vertices[0]);
            ctx.moveTo(p.x, p.y);
            for (let i = 0; i < this.vertices.length; i++)
            {
                let index = (i+1) % this.vertices.length;
                p = camera.WorldToCanvas(this.vertices[index]);
                ctx.lineTo(p.x, p.y);
            }
            ctx.fill();
            

            // EDGE GLOW
            var gradient2 = ctx.createRadialGradient(center.x,center.y,0, center.x,center.y,radius);
            gradient2.addColorStop(0, this.color.toHex());
            gradient2.addColorStop(1, this.color.toHex());
            ctx.strokeStyle = gradient2;
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';

            ctx.beginPath();
            for (let a = 0; a < this.vertices.length; a++)
            {
                let b = (a + 1) % this.vertices.length;

                let aWall = !this.vertices[a].active && !this.vertices[a].center;
                let bWall = !this.vertices[b].active && !this.vertices[b].center;

                if (aWall && bWall)
                {
                    let A = camera.WorldToCanvas(this.vertices[a]);
                    let B = camera.WorldToCanvas(this.vertices[b]);

                    ctx.moveTo(A.x, A.y);
                    ctx.lineTo(B.x, B.y);
                }
            }
            ctx.stroke();
        }
    }
}
