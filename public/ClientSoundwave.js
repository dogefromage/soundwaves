

class ClientSoundwave
{
    constructor({ id, color, center, radius, vertices })
    {
        this.id = id;
        this.color = color;
        this.center = center;
        this.radius = radius;
        this.vertices = vertices;
    }

    draw(ctx, camera)
    {
        if (this.vertices.length > 0)
        {
            const center = camera.WorldToCanvas(this.center);
            const radius = camera.WorldToCanvasScale(this.radius);
            
            // SOUNDWAVE
            var gradient = ctx.createRadialGradient(center.x,center.y,0, center.x,center.y,radius);
            gradient.addColorStop(0, "#00000000");
            gradient.addColorStop(1, this.color);
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
            gradient2.addColorStop(0, this.color);
            gradient2.addColorStop(1, this.color);
            ctx.strokeStyle = gradient2;
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';

            ctx.beginPath();
            for (let a = 0; a < this.vertices.length; a++)
            {
                let b = (a + 1) % this.vertices.length;
                if (this.vertices[a].hit && this.vertices[b].hit)
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