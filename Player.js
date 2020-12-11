const Rect = require('./Rect');
const GameSettings = require('./GameSettings');

class Player extends Rect
{
	constructor(x, y, color = "#BB77aa") 
	{
		const size = GameSettings.playerSize;
		super(x, y, size, size);
		this.color = color;

		this.oldX = x;
		this.oldY = y;
	}

	update(deltaTime)
	{
		if (this.input)
		{
			this.x += this.input.x * GameSettings.playerSpeed * deltaTime;
			this.y += this.input.y * GameSettings.playerSpeed * deltaTime;
		}

		if ((this.oldX - this.x)**2 + (this.oldY - this.y)**2 > GameSettings.sqrPlayerStepDist)
		{
			this.oldX = this.x;
			this.oldY = this.y;

			if (this.onmove)
			{
				this.onmove();
			}
		}
	}

	// draw(ctx, camera)
	// {
	// 	ctx.fillStyle = this.color;
	// 	const canRect = camera.WorldToCanvasRect(this);
	// 	ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);
	// }
}

module.exports = Player;