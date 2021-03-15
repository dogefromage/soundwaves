const Rect = require('./Rect');
const Entity = require('./Entity');
const GameSettings = require('./GameSettings');
const Soundwave = require('./Soundwave');
const SoundwaveSettings = require('./SoundwaveSettings');
const { Vec2 } = require('./Vector.js');

class Player extends Entity
{
	constructor(x, y, id, name, color) 
	{
		const size = GameSettings.playerSize;
		super(x, y, size, size, color, 1);
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
			waves.push(newWave);
		}

		this.charging = false;
		this.charge = 0;
	}

	update(dt, map)
	{
		let newSoundWaves = [];

        //////////////////////////// CHARACTER MOVEMENT //////////////////////////////////
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

		if (this.charging)
		{
			this.charge += GameSettings.chargeSpeed * dt * this.velocity.sqrMagnitude();
			this.charge = Math.min(this.charge, 1);
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
		console.log(`Player ${this.name} has unfortunately died`);
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
		return new Soundwave(this.getCenterX(), this.getCenterY(), 
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
			br: this.brightness,
		}

		// only sent to mainplayer
		if (mainPlayer)
		{
			data.he = this.health;
			data.ch = this.charge;
		}

		return data;
	}
}

module.exports = Player;