import { Vec2 } from "../Vector";
import Rect from "../Rect";
import Color from "../Color";
import { lerp } from '../GameMath';
import Glow from '../Glow';
import { ShardParticle } from './ClientParticle';
import roundRect from './roundRect';

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

		this.dead = false;
		this.isHurt = false;

        // for interpolating non-mainplayers
		this.lastServerPos = new Vec2(x, y);
		this.newServerPos = new Vec2(x, y);
		this.serverTimeStep = null;
		this.timeSinceLastData = 0;

		// rough estimate of velocity using serverdata
		this.v = new Vec2();
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

			// v = ds/dt
			this.v = this.newServerPos.sub(this.lastServerPos).mult(1 / this.serverTimeStep);
		}

		if (serverObj.hasOwnProperty('br'))
			this.glow.brightness = serverObj.br;

		if (serverObj.hasOwnProperty('dead'))
		{
			this.dead = serverObj.dead;
		}

		if (serverObj.hasOwnProperty('hurt'))
		{
			this.isHurt = serverObj.hurt;
		}
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

	onHurt()
	{
		for (let n = 0; n < 2; n++)
		{
			// create random shard
			let vertices = [];
			for (let i = 0; i < 3; i++)
			{
				const pos = new Vec2(0.5, 0.5).add(
					new Vec2(0.1 + Math.random() * 0.1, 0)
						.rotate(Math.PI * i / 2 + Math.random()));
				vertices.push(this.uvToCoordinates(pos));
			}
			const speed = 0.2 + Math.random() * 0.2;
			const vel = new Vec2(speed, 0).rotate(2 * Math.PI * Math.random()).add(this.v);
	
			const particle = new ShardParticle(
				this.game, vertices, vel, this.color.copy(), 0.5);
			this.game.addGameObject(particle);
		}
	}

    onDeath()
    {
		for (let n = 0; n < 8; n++)
		{
			// create random shard
			let vertices = [];
			for (let i = 0; i < 3; i++)
			{
				const pos = new Vec2(0.5, 0.5).add(
					new Vec2(0.1 + Math.random() * 0.1, 0)
						.rotate(Math.PI * i / 2 + Math.random()));
				vertices.push(this.uvToCoordinates(pos));
			}
			const speed = 0.1 + Math.random() * 0.05;
			const vel = new Vec2(speed, 0).rotate(2 * Math.PI * Math.random()).add(this.v);
	
			const particle = new ShardParticle(
				this.game, vertices, vel, this.color.copy(), .9);
			this.game.addGameObject(particle);
		}


        // /**
		//  * Split rectangle into four pieces 
        //  */
        // let center = 
        // [
        //     0.1 + 0.8 * Math.random(),
        //     0.1 + 0.8 * Math.random()
		// ];
		// let left = 0.1 + 0.8 * Math.random();
		// let top = 0.1 + 0.8 * Math.random();
		// let right = 0.1 + 0.8 * Math.random();
		// let bottom = 0.1 + 0.8 * Math.random();

        // let pieces = 
        // [
        //     [ [0,0], [top, 0], center, [0, left] ],
        //     [ [top, 0], [1, 0], [1, right], center ],
        //     [ center, [1, right], [1, 1], [bottom, 1] ],
        //     [ [0, left], center, [bottom, 1], [0, 1] ],
        // ];

        // for (const piece of pieces)
        // {
		// 	let vertices = [];
		// 	let vel = new Vec2();
		// 	for (let [ x, y ] of piece)
		// 	{
		// 		vertices.push(this.uvToCoordinates({ x, y }));
		// 	}

		// 	/**
		// 	 * evaluate velocity as average of all directions 
		// 	 * from center of player to shard vertices
		// 	 */
		// 	for (const v of vertices)
		// 	{
		// 		vel.x += v.x;
		// 		vel.y += v.y;
		// 	}
		// 	vel.x -= this.getCenterX() * vertices.length;
		// 	vel.y -= this.getCenterY() * vertices.length;
			
		// 	let speed = 2 + Math.random() * 1;
		// 	vel = vel.mult(speed);
		// 	vel = vel.add(this.v); // conservation of momentum

        //     const particle = new ShardParticle(
		// 		this.game, vertices, vel, this.color.copy(), 0.7);
        //     this.game.addGameObject(particle);
        // }
    }

	draw(ctx, camera)
	{
        this.color.a = Math.floor(255 * this.glow.brightness);
		ctx.fillStyle = this.color.toHex();

		// rect
		const canRect = camera.WorldToCanvasRect(this);
		// ctx.fillRect(canRect.x, canRect.y, canRect.w, canRect.h);
		
		ctx.beginPath();
		roundRect(ctx, canRect.x, canRect.y, canRect.w, canRect.h, canRect.w * 0.13);
		ctx.fill();
	}
}
