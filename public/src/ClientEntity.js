import { Vec2 } from "../../Vector";
import Rect from "../../Rect";
import Color from "../../Color";
import { lerp } from '../../GameMath';
import Glow from '../../Glow';

export class ClientEntity extends Rect
{
    constructor(game, { x, y, w, h, co, br })
    {
		super(x, y, w, h);
		this.game = game;
		this.oldX = this.x; this.oldY = this.y;
		this.color = new Color(co.r, co.g, co.b, co.a);
        this.glow = new Glow();
		this.glow.brightness = br;

        // for interpolating non-mainplayers
		this.lastServerPos = new Vec2(x, y);
		this.newServerPos = new Vec2(x, y);
		this.serverTimeStep = null;
		this.timeSinceLastData = 0;
    }

    setData(serverObj, deltaTimeServer)
	{
		// show server pos
		// window.debuggerRects.push(new Rect(serverObj.x, serverObj.y, 0.04, 0.04));
		
		if (serverObj.hasOwnProperty('x') && serverObj.hasOwnProperty('y'))
		{
			this.lastServerPos = this.newServerPos;
			this.newServerPos = new Vec2(serverObj.x, serverObj.y);

			if (this.serverTimeStep)
			{
				// rolling average of timestep
				this.serverTimeStep = lerp(this.serverTimeStep, deltaTimeServer, 0.2);
			}
			else
			{
				this.serverTimeStep = deltaTimeServer;
			}

			this.timeSinceLastData = 0;
		}

		if (serverObj.hasOwnProperty('br'))
			this.glow.brightness = serverObj.br;
	}

	getBounds()
	{
		return new Rect(this.x, this.y, this.w, this.h);
	}
    
	update(dt, map)
	{
		// quick and easy way to make update run only 
		// after two server data sends, so that 
		// the interpolation code works right away
		if (this.serverTimeStep)
		{
			this.timeSinceLastData += dt;

			// interpolate between last and new pos
			const t = this.timeSinceLastData / this.serverTimeStep;
			// LINEAR INTERPOLATION (change to quadratic in future for smoother results)
			const interpolatedPosition = this.lastServerPos.lerp(this.newServerPos, t);
			this.x = interpolatedPosition.x;
			this.y = interpolatedPosition.y;

			///////////////////////////////////// COLLISION WALLS /////////////////////////////////////
			// optimise collision search by only checking in a specified range
			const rangeRect = this.extend(this.game.settings.colDetectionRange);
			// check collision
			map.foreachWall((wall) =>
			{
				Rect.collide(wall, this);
			}, rangeRect);
			this.oldX = this.x;
			this.oldY = this.y;

			this.glow.update(dt);

			if (isNaN(this.x) || isNaN(this.y))
			{
				throw new Error('Entities pos NaN');
			}
		}
	}

	draw(ctx, camera)
	{
        this.color.a = Math.floor(255 * this.glow.brightness);
		ctx.fillStyle = this.color.toHex();

		// rect
		const canRect = camera.WorldToCanvasRect(this);
		ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);
	}
}
