const Rect = require('./Rect');
const GameSettings = require('./GameSettings');
const { Soundwave, SoundwaveSettings } = require('./Soundwave');
const { lerp } = require('./GameMath');
const Color = require('./Color');

class Player extends Rect
{
	constructor(x, y, id, name, color = undefined) 
	{
		if (!color)
		{
			let angle = Math.random() * 6.283;
			color = new Color(
				220 + 30 * Math.sin(angle),
				220 + 30 * Math.sin(angle - 2.094),
				220 + 30 * Math.sin(angle + 2.094),
			)
		}

		const size = GameSettings.playerSize;
		super(x, y, size, size);
		this.id = id;
		this.name = name;
		this.color = color;

		// for collision detection
		this.oldX = x;
		this.oldY = y;

		// for soundwave spawning
		this.lastStep = { x: this.x, y: this.y };
		
		// for input
		this.input = { x:0, y:0 };
		this.walk = { x:0, y:0 };
		this.sneaking = false;
		this.slingshot;

		this.health = 1;

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

		if ( !(this.input.x == 0 && this.input.y == 0))
		{
			// normalize
			let t = 1. / Math.hypot(this.input.x, this.input.y);
			this.input.x *= t;
			this.input.y *= t;
		}
		
		// smoothen walk
		this.walk.x = lerp(this.walk.x, this.input.x, 0.4);
		this.walk.y = lerp(this.walk.y, this.input.y, 0.4);

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

	update(deltaTime)
	{
		let newSoundWaves = [];
		this.oldX = this.x;
		this.oldY = this.y;

		// LOCOMOTION
		let speed = GameSettings.playerSpeed;
		if (this.sneaking)
		{
			speed *= GameSettings.sneakFactor;
		}

		this.x += this.walk.x * speed * deltaTime;
		this.y += this.walk.y * speed * deltaTime;

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
					newSoundWaves.push(this.createSoundwave(settings));
				}
				this.slingshot = undefined;
			}
		}

		// SPAWN SOUNDWAVE ON STEP
		let distanceWalked = (this.lastStep.x - this.x)**2 + (this.lastStep.y - this.y)**2;
		if (distanceWalked > GameSettings.sqrPlayerStepDist)
		{
			this.lastStep = { x: this.x, y: this.y };

			if (this.input.sneak)
			{
				newSoundWaves.push(this.createSoundwave(SoundwaveSettings.sneak()));
			}
			else
			{
				newSoundWaves.push(this.createSoundwave(SoundwaveSettings.walk()));
			}
		}

		// color
		let a = Math.floor(Math.min(255, Math.max(0, this.brightness * 255)));
		this.color.a = a;
		this.brightness = Math.max(0, this.brightness - deltaTime);

		this.hurtCooldown = Math.max(0, this.hurtCooldown - deltaTime);

		return newSoundWaves;
	}

	hurt(damage, offender)
	{
		let newSoundwaves = [];

		this.health -= damage;

		// glow for short moment
		this.brightness += this.health;
		
		if (this.health < 0)
		{
			this.killer = offender;
			newSoundwaves.push(this.createSoundwave(SoundwaveSettings.death()));
		}
		else
		{
			if (this.hurtCooldown == 0)
			{
				newSoundwaves.push(this.createSoundwave(SoundwaveSettings.hurt()));
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
			id: this.id,
			name: this.name,
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			cSelf: this.color.toHexNoAlpha(),
			cOther: this.color.toHex(),
			health: this.health,
		};
	}

	getNewData(mainPlayer = true)
	{
		let data = {
			id: this.id,
			x: this.x,
			y: this.y,
			cOther: this.color.toHex(),
		}

		// only needed if mainplayer
		if (mainPlayer)
		{
			data.health = this.health;
		}

		return data;
	}
}

module.exports = Player;
