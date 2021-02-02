import { Vec2 } from "./ClientVector";
import { ClientRect } from "./ClientRect";

export class ClientPlayer extends ClientRect
{
	constructor({ id, x, y, w, h, v, name, cSelf, cOther, health })
	{
		// all properties MUST have same name as in data, because use of hasProperty() etc.
		super(x, y, w, h);
		this.velocity = new Vec2(v.x, v.y);
		this.id = id;
		this.cSelf = cSelf;
		this.cOther = cOther;
		this.health = health;
		this.charge = 0;
		this.name = name;
		this.oldX = this.x;
		this.oldY = this.y;
		this.correction = new Vec2();
	}

	setData(serverObj)
	{
		window.debuggerRect.x = serverObj.x;
		window.debuggerRect.y = serverObj.y;

		const deltaPos = new Vec2(serverObj.x - this.x, serverObj.y - this.y);
		this.correction = deltaPos;

		if (serverObj.cOther)
			this.cOther = serverObj.cOther;
		if (serverObj.health)
			this.health = serverObj.health;
		if (serverObj.charge)
			this.charge = serverObj.charge;
	}

	update(dt, map)
	{
        //////////////////////////// LOCOMOTION /////////////////////////////////////
		let speed = window.gameSettings.playerSpeed;
		if (window.input.getKey('ShiftLeft'))
		{
			speed *= window.gameSettings.sneakFactor;
		}
		let targetVel = new Vec2(window.input.axisX, window.input.axisY);
		targetVel = targetVel.normalize(speed); // set mag to speed

		let k = Math.min(1, dt * window.gameSettings.walkSmoothness); // make lerp time relative
		this.velocity = this.velocity.lerp(targetVel, k)
		this.velocity = this.velocity.add(this.correction.mult(window.gameSettings.clientCorrection * dt));
		this.x += this.velocity.x * dt; // newton
		this.y += this.velocity.y * dt;

        //////////////////////////// COLLISION WALLS /////////////////////////////////////
		// optimise collision search by only checking in a specified range
		const margin = window.gameSettings.rangeRectMargin;
		const rangeRect = this.extend(margin);
		// check collision
		map.foreachWall((wall) =>
		{
			ClientRect.collide(wall, this, window.gameSettings.collisionIterations);
		}, rangeRect);
		this.oldX = this.x;
		this.oldY = this.y;
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
