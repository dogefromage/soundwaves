import { Vec2 } from "../Vector";
import Rect from "../Rect";
import { ClientEntity } from "./ClientEntity";
import SoundwaveSettings from "../SoundwaveSettings";
import { lerp } from "../GameMath";

export class ClientPlayer extends ClientEntity
{
	constructor(game, { x, y, w, h, na, co, br })
	{
		super(game, { x, y, w, h, co, br });
		this.name = na;
        this.v = new Vec2();
	}

	draw(ctx, camera)
	{
		super.draw(ctx, camera);

		// DRAW NAME
        this.color.a = Math.floor(255 * this.glow.brightness);
		ctx.fillStyle = this.color.toHex();
		ctx.font = "bold 14px Trebuchet MS";
		ctx.textAlign = 'center';
		let textPos = camera.WorldToCanvas({ x: this.getCenterX(), y: this.getBottom() });
		ctx.fillText(this.name, Math.floor(textPos.x), Math.floor(textPos.y) + 18);
	}
}

export class ClientMainPlayer extends ClientPlayer
{
	constructor(game, { x, y, w, h, na, co, br, he, dead = false })
    {
        super(game, { x, y, w, h, na, co, br, dead })
        this.health = he;
		this.charge = 0;
		this.xp = 0;

        // AIMING ASSIST
        this.isCharging = false;
        this.angle = 0;
        this.game.input.addEventListener('chargestart', () =>
        {
            this.isCharging = true;
        });
        this.game.input.addEventListener('chargemove', (e) =>
        {
            this.angle = e.angle;
        });
        this.game.input.addEventListener('chargestop', (e) =>
        {
            this.isCharging = false;
        });

        // document.addEventListener('keydown', (e) =>
        // {
        //     if (e.keyCode == 32)
        //     {
        //         this.onHurt();
        //     }
        // })
    }
    
	setData(serverObj, deltaTimeServer)
	{
		super.setData(serverObj, deltaTimeServer);
		
        if (serverObj.hasOwnProperty('ch'))
            this.charge = serverObj.ch;
        if (serverObj.hasOwnProperty('he'))
            this.health = serverObj.he;
        if (serverObj.hasOwnProperty('xp'))
            this.xp = serverObj.xp;
	}

    /**
     * ClientMainPlayer.update() completely overrides the normal ClientPlayer.update(),
     * since basically everything is different. The user input controlls this
     * player and not the servers data. Therefore, the normal interpolation of 
     * server data must not be made.
     */
	update(dt, map)
	{
		/////////////////////////////////// MOVEMENT /////////////////////////////////////
        // walking
        let speed = this.game.settings.playerSpeed;
        let targetVel = new Vec2(this.game.input.axisX, this.game.input.axisY);
        targetVel = targetVel.mult(speed);
        // apply
        let k = Math.min(1, dt * this.game.settings.walkSmoothness); // make lerp time relative
        this.v = this.v.lerp(targetVel, k)
        // correction using last server pos
        let correction = this.newServerPos.sub(this);
        let q = this.game.settings.clientCorrection * dt;
        /**
         * FOR FUTURE:
         * smoothly limit correction vector to a certain magnitude, so that
         * the player can still move if large lagspike and doesn't get held back 
         */
        this.v = this.v.add(correction.mult(q));

        this.x += this.v.x * dt; // integrate
        this.y += this.v.y * dt;

        ///////////////////////////////////// COLLISION WALLS /////////////////////////////////////
		// optimise collision search by only checking in a specified range
		const margin = this.game.settings.colDetectionRange;
		const rangeRect = this.extend(margin);
		// check collision
		map.foreachWall((wall) =>
		{
			Rect.collide(wall, this);
		}, rangeRect);
		this.oldX = this.x;
		this.oldY = this.y;

        if (isNaN(this.x) || isNaN(this.y))
        {
            throw new Error('Mainplayer pos NaN');
        }
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