import { ClientRect } from "./ClientRect";

export class ClientPlayer extends ClientRect
{
	constructor({ id, x, y, w, h, name, cSelf, cOther, health })
	{
		super(x, y, w, h);
		this.id = id;
		this.cSelf = cSelf;
		this.cOther = cOther;
		this.health = health;
		this.name = name;
	}

	draw(ctx, camera, self)
	{
		if (self)
		{
			ctx.fillStyle = this.cSelf;
		}
		else
		{
			ctx.fillStyle = this.cOther;
		}

		// rect
		const canRect = camera.WorldToCanvasRect(this);
		ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);

		// name
		ctx.font = "bold 10px Verdana";
		ctx.textAlign = 'center';
		let textPos = camera.WorldToCanvas({ x: this.getCenterX(), y: this.getBottom() });
		ctx.fillText(this.name, textPos.x, textPos.y + 14);
	}
}
