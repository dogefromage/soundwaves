import { Vec2 } from "../../Vector";
import Rect from "../../Rect";
import { ClientEntity } from "./ClientEntity";
import SoundwaveSettings from "../../SoundwaveSettings";

export class ClientPlayer extends ClientEntity
{
	constructor({ x, y, w, h, na, co, br })
	{
		super({ x, y, w, h, co, br });
		this.name = na;
        this.velocity = new Vec2();
	}

	draw(ctx, camera)
	{
		super.draw(ctx, camera);

		// DRAW NAME
        this.color.a = Math.floor(255 * this.glow.brightness);
		ctx.fillStyle = this.color.toHex();
		ctx.font = "bold 10px Verdana";
		ctx.textAlign = 'center';
		let textPos = camera.WorldToCanvas({ x: this.getCenterX(), y: this.getBottom() });
		ctx.fillText(this.name, textPos.x, textPos.y + 14);
	}
}

export class ClientMainPlayer extends ClientPlayer
{
	constructor({ x, y, w, h, na, co, br, he })
    {
        super({ x, y, w, h, na, co, br })
        this.health = he;
		this.charge = 0;

        // AIMING ASSIST
        this.isCharging = false;
        this.angle = 0;
        window.input.addEventListener('chargestart', () =>
        {
            this.isCharging = true;
        });
        window.input.addEventListener('chargemove', (e) =>
        {
            this.angle = e.angle;
        });
        window.input.addEventListener('chargestop', (e) =>
        {
            this.isCharging = false;
        });
    }
    
	setData(serverObj, deltaTimeServer)
	{
		super.setData(serverObj, deltaTimeServer);
		
        if (serverObj.hasOwnProperty('ch'))
            this.charge = serverObj.ch;
        if (serverObj.hasOwnProperty('he'))
            this.health = serverObj.he;
	}

    /**
     * ClientMainPlayer.update() completely overrides the normal ClientPlayer.update(),
     * since basically everything is different. The user input controlls this
     * player and not the servers data. Therefore, the normal interpolation of 
     * server data must not be made.
     */
	update(dt, map)
	{
		/////////////////////////////////// LOCOMOTION /////////////////////////////////////
        // walking
        let speed = window.gameSettings.playerSpeed;
        // if (window.input.getKey('ShiftLeft'))
        // {
        //     speed *= window.gameSettings.sneakFactor;
        // }
        let targetVel = new Vec2(window.input.axisX, window.input.axisY);
        targetVel = targetVel.mult(speed);
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

        this.x += this.velocity.x * dt; // integrate
        this.y += this.velocity.y * dt;

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
        this.glow.brightness = 1;

        // AIMINGASSIST
        if (this.isCharging)
        {
            const playerPos = camera.WorldToCanvas({ x: this.getCenterX(), y: this.getCenterY() });
            const settings = SoundwaveSettings.Attack(this.angle, this.charge);
            const radius = 40;

            this.color.a = Math.floor(255 * this.charge);
            ctx.strokeStyle = this.color.toHex();
            ctx.lineWidth = 7;

            ctx.beginPath();
            ctx.ellipse(playerPos.x, playerPos.y, radius, radius, 
                settings.rotation, -0.5 * settings.spread, 0.5 * settings.spread);
            ctx.stroke();
        }
        
		super.draw(ctx, camera);
    }
}