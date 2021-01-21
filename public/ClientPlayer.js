

class ClientPlayer extends ClientRect
{
	constructor({ id, x, y, w, h, cSelf, cOther, health })
	{
		super(x, y, w, h);
		this.id = id;
		this.colorSelf = cSelf;
		this.colorOthers = cOther;
		this.health = health;
	}

	draw(ctx, camera, self)
	{
		if (self)
		{
			ctx.fillStyle = this.colorSelf;
		}
		else
		{
			ctx.fillStyle = this.colorOthers;
		}
		const canRect = camera.WorldToCanvasRect(this);
		ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);
	}
}
