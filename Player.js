const Rect = require('./Rect');
const Entity = require('./Entity');
const GameSettings = require('./GameSettings');
const { Soundwave, SoundwaveSettings } = require('./Soundwave');
const { Vec2 } = require('./Vector.js');
const { clamp } = require('./GameMath');

class Player extends Entity
{
	constructor(x, y, id, name, color) 
	{
		const size = GameSettings.playerSize;
		super(x, y, size, size, id, color, 1, 1.5);
		// player name
		this.name = name;

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
	}

	setInput(inputs)
	{
		for (const input of inputs)
		{
			/////////////////// MOVEMENT /////////////////////
			if (!isNaN(input.x))
				this.input.x = Math.sign(input.x); // stop cheating
			if (!isNaN(input.y)) 
				this.input.y = Math.sign(input.y);

			/////////////////// SNEAK /////////////////////
			if (input.hasOwnProperty("shift"))
				this.sneaking = Boolean(input.shift);
	
			/////////////////// SHOOTING /////////////////////
			if (input.hasOwnProperty('mouse'))
			{
				if (Boolean(input.mouse))
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
							this.shootAngle = input.angle;
					}
				}
			}
		}
	}

	shoot(waves)
	{
		if (this.charge > 0.07)
		{
			let settings = SoundwaveSettings.Attack(this.shootAngle, this.charge);
			const newWave = this.createSoundwave(settings);
			waves.set(newWave.id, newWave);
		}

		this.charging = false;
		this.charge = 0;
	}

	update(dt, map)
	{
		let newSoundWaves = new Map();

        //////////////////////////// CHARACTER MOVEMENT /////////////////////////////////////
		let speed = GameSettings.playerSpeed;
		if (this.sneaking)
		{
			speed *= GameSettings.sneakFactor;
		}
		let targetVel = this.input.copy();
		targetVel = targetVel.normalize(speed); // set mag to speed

		let k = Math.min(1, dt * GameSettings.walkSmoothness); // make lerp time relative
		this.velocity = this.velocity.lerp(targetVel, k)
		this.x += this.velocity.x * dt; // newton
		this.y += this.velocity.y * dt;
		
		//////////////////////////// GENERAL ENTITY UPDATES ////////////////////////////
		super.update(dt, map); // collisions, color ...

		if (this.shooting)
		{
			this.shoot(newSoundWaves);
			this.shooting = false;
		}

		// SPAWN SOUNDWAVE ON STEP
		let distanceWalkedSqr = this.lastStep.sub(new Vec2(this.x, this.y)).sqrMagnitude();
		if (distanceWalkedSqr > GameSettings.sqrPlayerStepDist)
		{
			this.lastStep = new Vec2(this.x, this.y);

			let waveSettings;
			if (this.sneaking)
				waveSettings = SoundwaveSettings.sneak();
			else
				waveSettings = SoundwaveSettings.walk();
			const newWave = this.createSoundwave(waveSettings);
			newSoundWaves.set(newWave.id, newWave);
		}

		return newSoundWaves;
	}

	hurt(damage, offender)
	{
		super.hurt(damage, offender);

		if (this.health < 0)
		{
			const newWave = this.createSoundwave(SoundwaveSettings.death());
			return new Map([[newWave.id, newWave]]); // map with one wave
		}
	}

	createSoundwave(settings)
	{
		return new Soundwave(this.getCenterX(), this.getCenterY(), 
			this.id, 
			settings, 
			this.color.copy());
	}

	getAllData(mainPlayer = true)
	{
		return {
			name: this.name,
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			v: this.velocity,
			color: this.color,
			b: mainPlayer ? this.brightness : 0,
			health: this.health,
		};
	}

	getNewData(mainPlayer = true)
	{
		let data = {
			x: this.x,
			y: this.y,
			b: this.brightness,
		}

		// only sent to mainplayer
		if (mainPlayer)
		{
			data.health = this.health;
			data.charge = this.charge;
		}

		return data;
	}
}

module.exports = Player;