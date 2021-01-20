const Rect = require('./Rect');
const GameSettings = require('./GameSettings');
const { Soundwave, SoundwaveSettings } = require('./SoundWave');
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
		
		this.input = { x: 0, y: 0, jump: false, sneak: false }

		this.health = 0.77;

		this.slingshot;

		this.brightness = 0;
		this.hurtCooldown = 0;
	}

	setInput(input)
	{
		// validate input
		if (isNaN(input.x))
			input.x = 0;
		if (isNaN(input.y)) 
			input.y = 0;
			
		input.shoot = Boolean(input.shoot);
		input.sneak = Boolean(input.sneak);
		input.x = Math.sign(input.x);
		input.y = Math.sign(input.y);

		if (input.x != 0 && input.y != 0)
		{
			input.x *= 0.707
			input.y *= 0.707
		}
		
		// smoothen walk
		this.input.x = lerp(this.input.x, input.x, 0.4);
		this.input.y = lerp(this.input.y, input.y, 0.4);

		if (input.shoot && !this.input.shoot)
		{
			this.slingshot = { x: this.x, y: this.y, shoot: false };
		}
		else if (!input.shoot && this.input.shoot)
		{
			this.slingshot.shoot = true;
		}

		this.input.shoot = input.shoot;
		this.input.sneak = input.sneak;
	}

	update(deltaTime)
	{
		let newSoundWaves = [];
		this.oldX = this.x;
		this.oldY = this.y;

		// MOVE
		let speed = GameSettings.playerSpeed;
		if (this.input.sneak)
		{
			speed *= GameSettings.sneakFactor;
		}

		this.x += this.input.x * speed * deltaTime;
		this.y += this.input.y * speed * deltaTime;

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

		// STEP
		if ((this.lastStep.x - this.x)**2 + (this.lastStep.y - this.y)**2 > GameSettings.sqrPlayerStepDist)
		{
			this.lastStep = { x: this.x, y: this.y };

			if (this.input.sneak)
			{
				newSoundWaves.push(this.createSoundwave(SoundwaveSettings.sneak));
			}
			else
			{
				newSoundWaves.push(this.createSoundwave(SoundwaveSettings.walk));
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

		this.health -=  damage;

		// glow for short moment
		this.brightness += this.health;
		
		if (this.health < 0)
		{
			this.killer = offender;
			newSoundwaves.push(this.createSoundwave(SoundwaveSettings.death));
		}
		else
		{
			if (this.hurtCooldown == 0)
			{
				newSoundwaves.push(this.createSoundwave(SoundwaveSettings.hurt));
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

	getData()
	{
		return {
			id: this.id,
			name: this.name,
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			colorSelf: this.color.toHexNoAlpha(),
			colorOthers: this.color.toHex(),
			health: this.health,
		};
	}
}

module.exports = Player;
