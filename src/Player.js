"use strict";
const Rect = require('./Rect');
const Entity = require('./Entity');
const Soundwave = require('./Soundwave');
const SoundwaveSettings = require('./SoundwaveSettings');
const { Vec2 } = require('./Vector.js');
const { clamp } = require('./GameMath');
const Glow = require('./Glow');
const Bug = require('./Bug');

class Player extends Entity
{
	constructor(game, x, y, id, name, color) 
	{
		const size = game.settings.playerSize;
		super(game, x, y, size, size, color, 1);

		// player name
		this.name = name;
		this.id = id;

		// for soundwave spawning
		this.lastStep = new Vec2(this.x, this.y);
		
		// character control
		this.velocity = new Vec2();
		this.input = new Vec2();
		this.sneaking = false;

		// shooting
		this.charging = false;
		this.charge = 0;
		this.shooting = false;
		this.angle = 0;

		this.glow = new Glow(0.1); // replace old glow with snappier one
	}

	setInput(inputs)
	{
		for (const input of inputs)
		{
			///////////////////// MOVEMENT /////////////////////
			if (input.hasOwnProperty('x'))
			{
				let x = parseFloat(input.x);
				if (!isNaN(x))
				{
					this.input.x = x;
				}
			}
			if (input.hasOwnProperty('y'))
			{
				let y = parseFloat(input.y);
				if (!isNaN(y))
				{
					this.input.y = y;
				}
			}

			let m = Math.hypot(this.input.x, this.input.y); // error and cheat prevention
			if (m > 1)
			{
				this.input.x /= m;
				this.input.y /= m;
			}

			/////////////////// SHOOTING /////////////////////
			if (input.hasOwnProperty('charge'))
			{
				if (Boolean(input.charge))
				{
					this.charging = true;
					this.charge = 0;
				}
				else
				{
					if (this.charging)
					{
						this.shooting = true;
						if (!isNaN(input.angle))
						{
							this.shootAngle = input.angle;
						}
					}
				}
			}
		}
	}

	shoot(waves)
	{
		if (this.charge > 0.05)
		{
			let settings = SoundwaveSettings.Attack(this.shootAngle, this.charge);
			const newWave = this.createSoundwave(settings);
			waves.push(newWave);
		}

		this.charging = false;
		this.charge = 0;
	}

	update(dt, map)
	{
		let newSoundWaves = [];

        //////////////////////////// CHARACTER MOVEMENT //////////////////////////////////
		let speed = this.game.settings.playerSpeed;
		let targetVel = this.input.copy();
		targetVel = targetVel.mult(speed);

		let k = Math.min(1, dt * this.game.settings.walkSmoothness); // make lerp time relative
		this.velocity = this.velocity.lerp(targetVel, k)
		this.x += this.velocity.x * dt; // integrate
		this.y += this.velocity.y * dt;
		
		//////////////////////////// GENERAL ENTITY UPDATES ////////////////////////////
		super.update(dt, map); // collisions, color ...

		if (this.shooting)
		{
			this.shoot(newSoundWaves);
			this.shooting = false;
		}

		if (this.charging)
		{
			this.charge += this.game.settings.chargeSpeed * this.velocity.sqrMagnitude() * dt;
			this.charge -= this.game.settings.dischargeSpeed * dt;
			this.charge = clamp(this.charge, 0, 1);
		}

		// SPAWN SOUNDWAVE ON STEP
		let distanceWalkedSqr = this.lastStep.sub(new Vec2(this.x, this.y)).sqrMagnitude();
		const playerStepD = this.game.settings.playerStepDistance;
		if (distanceWalkedSqr > playerStepD * playerStepD)
		{
			this.lastStep = new Vec2(this.x, this.y);

			let waveSettings;
			let sqrMaxSneakVel = 0.33 * this.game.settings.playerSpeed * this.game.settings.playerSpeed;
			if (this.velocity.sqrMagnitude() < sqrMaxSneakVel) // FOR FUTURE: MAKE WAVE SIZE DEPENDENT ON SPEED
			{
				waveSettings = SoundwaveSettings.sneak();
			}
			else
			{
				waveSettings = SoundwaveSettings.walk();
			}
			const newWave = this.createSoundwave(waveSettings);
			newSoundWaves.push(newWave);
		}
		
		return newSoundWaves;
	}

	getType()
	{
		return 'p';
	}

	onDeath()
	{
		// take log of level to determine amount of bugs spawned
		let nBugs = Math.log1p(2 * this.xp.logarithmicValue);
		nBugs = clamp(nBugs, 1, 7);

		let bugs = []; 
		for (let i = 0; i < nBugs; i++)
		{
			let xpVal = this.xp.value / nBugs;
			xpVal *= Math.random() * 0.4 + 0.6; // between 60% and 100%
			let radius = Math.random() * 0.005 + 0.01;
			let b = new Bug(this.game, this.getCenterX(), this.getCenterY(), xpVal, this.color.copy(), radius);
			b.glow.brightness = 1;
			bugs.push(b);
		}

		return bugs;
	}

	hurt(damage, offender)
	{
		super.hurt(damage, offender);
		if (this.health < 0)
		{
			const newWave = this.createSoundwave(SoundwaveSettings.death());
			return [newWave] // one wave
		}

		return [];
	}

	createSoundwave(settings)
	{
		return new Soundwave(this.game, this.getCenterX(), this.getCenterY(), 
			this.id, 
			settings, 
			this.color.copy());
	}

	getDataNew(mainPlayer = true)
	{
		return {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			na: this.name,
			co: this.color,
			br: this.glow.brightness,
			he: this.health,
		};
	}

	getDataUpdate(mainPlayer = true)
	{
		let data = {
			x: this.x,
			y: this.y,
			br: this.glow.brightness,
		}

		// only sent to mainplayer
		if (mainPlayer)
		{
			data.he = this.health;
			data.ch = this.charge;
			data.xp = this.xp.getLogarithmic();
		}

        if (this.dead)
        {
            data.dead = true;
        }

		if (this.isHurt)
		{
			data.hurt = true;
		}

		return data;
	}
}

module.exports = Player;