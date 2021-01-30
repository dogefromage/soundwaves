const Rect = require('./Rect');
const GameSettings = require('./GameSettings');
const { Soundwave, SoundwaveSettings } = require('./Soundwave');
const Color = require('./Color');
const { Vec2 } = require('./Vector.js')

class Player extends Rect
{
	constructor(x, y, id, name, color = new Color(255,0,255)) 
	{
		const size = GameSettings.playerSize;
		super(x, y, size, size);
		this.id = id;
		this.name = name;
		this.color = color;
		this.health = 1;

		// for collision detection
		this.oldX = x;
		this.oldY = y;

		// for soundwave spawning
		this.lastStep = new Vec2(this.x, this.y);
		
		// for input
		this.velocity = new Vec2();
		this.input = new Vec2();
		this.sneaking = false;
		this.slingshot;

		// when hit
		this.brightness = 0;
		this.hurtCooldown = 0;
	}

	setInput(input)
	{
		// validate input
		if (!isNaN(input.x))
			this.input.x = Math.sign(input.x);
		if (!isNaN(input.y)) 
			this.input.y = Math.sign(input.y);

		if (input.hasOwnProperty("shoot"))
		{
			if (input.shoot)
			{
				this.slingshot = { x: this.x, y: this.y, shoot: false };
			}
			else
			{
				if (this.slingshot)
				{
					this.slingshot.shoot = true;
				}
			}
		}

		if (input.hasOwnProperty("sneak"))
		{
			this.sneaking = input.sneak;
		}
	}

	update(dt)
	{
		let newSoundWaves = new Map();
		this.oldX = this.x;
		this.oldY = this.y;

		// LOCOMOTION
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

		// SHOOT
		if (this.slingshot)
		{
			if (this.slingshot.shoot)
			{
				let d = 
				{
					x: this.slingshot.x - this.x,
					y: this.slingshot.y - this.y,
				}
				let m = Math.hypot(d.x, d.y);
				let alpha = Math.atan2(d.y, d.x);
				if (m > 0.02)
				{
					let settings = SoundwaveSettings.Attack(alpha, m);
					const newWave = this.createSoundwave(settings);
					newSoundWaves.set(newWave.id, newWave);
				}
				this.slingshot = undefined;
			}
		}

		// SPAWN SOUNDWAVE ON STEP
		let distanceWalkedSqr = this.lastStep.sub(new Vec2(this.x, this.y)).sqrMagnitude();
		if (distanceWalkedSqr > GameSettings.sqrPlayerStepDist)
		{
			this.lastStep = new Vec2(this.x, this.y);

			if (this.input.sneak)
			{
				const newWave = this.createSoundwave(SoundwaveSettings.sneak());
				newSoundWaves.set(newWave.id, newWave);
			}
			else
			{
				const newWave = this.createSoundwave(SoundwaveSettings.walk());
				newSoundWaves.set(newWave.id, newWave);
			}
		}

		// color
		let a = Math.floor(Math.min(255, Math.max(0, this.brightness * 255)));
		this.color.a = a;
		this.brightness = Math.max(0, this.brightness - dt);

		this.hurtCooldown = Math.max(0, this.hurtCooldown - dt);

		return newSoundWaves;
	}

	hurt(damage, offender)
	{
		let newSoundwaves = new Map();

		this.health -= damage;

		// glow for short moment
		this.brightness += this.health;
		
		if (this.health < 0)
		{
			this.killer = offender;
			const newWave = this.createSoundwave(SoundwaveSettings.death());
			newSoundWaves.set(newWave.id, newWave);
		}
		else
		{
			if (this.hurtCooldown == 0)
			{
				const newWave = this.createSoundwave(SoundwaveSettings.hurt());
				newSoundWaves.set(newWave.id, newWave);
				this.hurtCooldown += 0.1;
			}
		}

		return newSoundwaves;
	}

	createSoundwave(settings)
	{
		return new Soundwave(this.getCenterX(), this.getCenterY(), 
			this.id, 
			settings, 
			this.color.copy());
	}

	getAllData()
	{
		return {
			// id: this.id,
			name: this.name,
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			v: this.velocity,
			cSelf: this.color.toHexNoAlpha(),
			cOther: this.color.toHex(),
			health: this.health,
		};
	}

	getNewData(mainPlayer = true)
	{
		let data = {
			// id: this.id,
			x: this.x,
			y: this.y,
			v: this.velocity,
			cOther: this.color.toHex(),
		}

		// only sent to mainplayer
		if (mainPlayer)
		{
			data.health = this.health;
		}

		return data;
	}
}

module.exports = Player;
