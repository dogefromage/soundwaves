import Soundwave from "../Soundwave";
import SoundwaveSettings from "../SoundwaveSettings";
import Color from '../Color';

export class ClientSoundwave extends Soundwave
{
    constructor(game, {co, ce, ag, se})
    {
        const color = new Color(co.r, co.g, co.b, co.a);
        const settings = new SoundwaveSettings(...se);

        if (game.settings)
        {
            if (game.settings.waveQualityFactor)
            {
                settings.resolutionClient *= game.settings.waveQualityFactor;
            }
        }


        super(game, ce.x, ce.y, null, settings, color, true);
        this.age = ag;
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
            ctx.lineJoin = 'round';

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
