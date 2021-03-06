import Color from "../Color";
import { ClientEntity } from "./ClientEntity";
import { SphereParticle } from "./ClientParticle";
import { Vec2 } from "../Vector"

export class ClientBug extends ClientEntity
{
    constructor(game, { x, y, r, br = 0, co = new Color(255, 255, 255, 255) })
    {
        super(game, { x, y, w: r*2, h: r*2, co, br });
        this.radius = r;
    }

    update(dt, map)
    {
        super.update(dt, map);
    }

    hurt(damage, sender)
    {
        this.glow.agitate();
    }

    onHurt() {} // prevent super
    
    onDeath()
    {
        const particle = new SphereParticle(
            this.game, this.getCenterX(), this.getCenterY(), this.radius, this.v, this.color, 0.15);
        this.game.addGameObject(particle);
    }

    draw(ctx, camera)
    {
        this.color.a = Math.floor(255 * this.glow.brightness);
		ctx.fillStyle = this.color.toHex();

        const center = camera.WorldToCanvas({ x: this.getCenterX(), y: this.getCenterY() })
		const radius = camera.WorldToCanvasScale(this.radius);
        ctx.beginPath();
		ctx.ellipse(center.x, center.y, radius, radius, 0, 0, 6.283);
        ctx.fill();
    }
}