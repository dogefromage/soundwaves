import { Vec2 } from "../../Vector";
import Rect from "../../Rect";

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
		this.oldX = x;
		this.oldY = y;
		this.correction = new Vec2();

		this.lastServerPos = new Vec2(x, y);
		this.newServerPos = new Vec2(x, y);
		this.serverTimeStep = 0;
		this.timeSinceLastData = 0;
	}

	setData(serverObj, deltaTimeServer)
	{
		// show server pos
		// window.debuggerRects.push(new Rect(serverObj.x, serverObj.y, 0.04, 0.04));
		
		this.lastServerPos = this.newServerPos;
		this.newServerPos = new Vec2(serverObj.x, serverObj.y);
		this.serverTimeStep = deltaTimeServer;
		this.timeSinceLastData = 0;

		// set remaining data
		for (let key of ['cOther', 'health', 'charge'])
		{
			if (serverObj.hasOwnProperty(key))
			{
				this[key] = serverObj[key];
			}
		}
	}

	update(dt, map, isMainPlayer)
	{
		this.timeSinceLastData += dt;

		/////////////////////////////////// LOCOMOTION /////////////////////////////////////
		if (isMainPlayer)
		{
			// walking
			let speed = window.gameSettings.playerSpeed;
			if (window.input.getKey('ShiftLeft'))
			{
				speed *= window.gameSettings.sneakFactor;
			}
			let targetVel = new Vec2(window.input.axes.x, window.input.axes.y);
			targetVel = targetVel.normalize(speed); // set mag to speed
			// apply
			let k = Math.min(1, dt * window.gameSettings.walkSmoothness); // make lerp time relative
			this.velocity = this.velocity.lerp(targetVel, k)
			// correction using last server pos
			let correction = this.newServerPos.sub(this);
			let q = window.gameSettings.clientCorrection * dt;
			/**
			 * FOR FUTURE:
			 * smoothly limit correction vector to a certain magnitude, so that
			 * the player can still move if large lagspike and doesn't get held back 
			 */
			this.velocity = this.velocity.add(correction.mult(q));

			this.x += this.velocity.x * dt; // newton
			this.y += this.velocity.y * dt;
		}
		else
		{
			// interpolate between last and new pos
			let interpolatedPosition = 
				this.lastServerPos.lerp(this.newServerPos, this.timeSinceLastData / this.serverTimeStep);
			this.x = interpolatedPosition.x;
			this.y = interpolatedPosition.y;
		}

        ///////////////////////////////////// COLLISION WALLS /////////////////////////////////////
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
