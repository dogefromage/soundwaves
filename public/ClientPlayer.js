

class ClientPlayer extends ClientRect
{
	constructor({ id, x, y, w, h, colorSelf, colorOthers, health })
	{
		super(x, y, w, h);
		this.id = id;
		this.colorSelf = colorSelf;
		this.colorOthers = colorOthers;
		this.health = health;
	}

	setData({ x, y, w, h, colorSelf, colorOthers, health })
	{
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.colorSelf = colorSelf;
		this.colorOthers = colorOthers;
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
