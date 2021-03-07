import Color from "../../Color";
import { ClientEntity } from "./ClientEntity";

export class ClientBug extends ClientEntity
{
    constructor({ x, y, r, br })
    {
        super({ x, y, w: r*2, h: r*2, co: new Color(255, 255, 255, 255), br });
        this.radius = r;
    }

    draw(ctx, camera)
    {
        this.brightness = 1;
        this.color.a = Math.floor(255 * this.brightness);
		ctx.fillStyle = this.color.toHex();

        const center = camera.WorldToCanvas({ x: this.getCenterX(), y: this.getCenterY() })
		const radius = camera.WorldToCanvasScale(this.radius);
        ctx.beginPath();
		ctx.ellipse(center.x, center.y, radius, radius, 0, 0, 6.283);
        ctx.fill();
    }
}