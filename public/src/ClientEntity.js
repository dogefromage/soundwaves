import { Vec2 } from "../../Vector";
import Rect from "../../Rect";
import Color from "../../Color";
import { lerp } from '../../GameMath';

export class ClientEntity extends Rect
{
    constructor({ x, y, w, h, co, br })
    {
        super(x, y, w, h);
		this.oldX = this.x; this.oldY = this.y;
		this.color = new Color(co.r, co.g, co.b, co.a);
        this.brightness = br;

        // for interpolating non-mainplayers
		this.lastServerPos = new Vec2(x, y);
		this.newServerPos = new Vec2(x, y);
		this.serverTimeStep = 0;
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
			// rolling average of timestep
			this.serverTimeStep = lerp(this.serverTimeStep, deltaTimeServer, 0.2);
			this.timeSinceLastData = 0;
		}

		if (serverObj.hasOwnProperty('br'))
			this.brightness = serverObj.br;
	}
    
	update(dt, map)
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

	draw(ctx, camera)
	{
        this.color.a = Math.floor(255 * this.brightness);
		ctx.fillStyle = this.color.toHex();

		// rect
		const canRect = camera.WorldToCanvasRect(this);
		ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);
	}
}
