import { Vec2 } from "../../Vector";
import Rect from "../../Rect";
import { Socket } from "socket.io";

export class ClientPlayer extends Rect
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
		window.debuggerRects.push(new Rect(serverObj.x, serverObj.y, 0.04, 0.04));

		/**
		 * the players position is predicted by the client. 
		 * -> to avoid drifting between the two positions:
		 * - FOR MAINPLAYER
			* continuously substract difference between server and client pos from the clients velocity vector
			* this will over time let the two positions converge while still
			* ensuring stutter-free gameplay!
		 */
		const deltaPos = new Vec2(serverObj.x - this.x, serverObj.y - this.y);
		this.correction = deltaPos;

		for (let key of ['cOther', 'health', 'charge'])
		{
			if (serverObj.hasOwnProperty(key))
			{
				this[key] = serverObj[key];
			}
		}
	}

	update(dt, map)
	{
		//////////////////////////// LOCOMOTION /////////////////////////////////////
		if (window.socket.id == this.id) // is mainplayer?
		{
			let speed = window.gameSettings.playerSpeed;
			if (window.input.getKey('ShiftLeft'))
			{
				speed *= window.gameSettings.sneakFactor;
			}
			let targetVel = new Vec2(window.input.axes.x, window.input.axes.y);
			targetVel = targetVel.normalize(speed); // set mag to speed
	
			let k = Math.min(1, dt * window.gameSettings.walkSmoothness); // make lerp time relative
			this.velocity = this.velocity.lerp(targetVel, k)
			this.velocity = this.velocity.add(this.correction.mult(window.gameSettings.clientCorrection * dt));
		}
		// else
		// {
		// 	// interpolate ???	
		// }

		this.x += this.velocity.x * dt; // newton
		this.y += this.velocity.y * dt;

        //////////////////////////// COLLISION WALLS /////////////////////////////////////
		// optimise collision search by only checking in a specified range
		const margin = window.gameSettings.rangeRectMargin;
		const rangeRect = this.extend(margin);
		// check collision
		map.foreachWall((wall) =>
		{
			Rect.collide(wall, this, window.gameSettings.collisionIterations);
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
