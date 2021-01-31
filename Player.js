const Rect = require('./Rect');
const GameSettings = require('./GameSettings');
const { Soundwave, SoundwaveSettings } = require('./Soundwave');
const Color = require('./Color');
const { Vec2 } = require('./Vector.js');
const { clamp } = require('./GameMath');

class Player extends Rect
{
	constructor(x, y, id, name, color = new Color(255,0,255)) 
	{
		const size = GameSettings.playerSize;
		super(x, y, size, size, true);
		this.id = id;
		this.name = name;
		this.color = color;
		this.health = 1;

		// for soundwave spawning
		this.lastStep = new Vec2(this.x, this.y);
		
		// walking
		this.velocity = new Vec2();
		this.input = new Vec2();
		this.sneaking = false;

		// shooting
		this.charging = false;
		this.shoot = false;
		this.charge = 0;
		this.lastAngle = 0;

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
			if (Boolean(input.shoot))
			{
				this.charging = true;
				this.charge = 0;
			}
			else
			{
				if (this.charging)
				{
					this.shoot = true;
				}
			}
		}

		if (input.hasOwnProperty("sneak"))
		{
			this.sneaking = Boolean(input.sneak);
		}
	}

	update(dt, map)
	{
		let newSoundWaves = new Map();

        //////////////////////////// LOCOMOTION /////////////////////////////////////
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

        //////////////////////////// COLLISION WALLS /////////////////////////////////////
		// optimise collision search by only checking in a specified range
		const margin = GameSettings.rangeRectMargin;
		const rangeRect = this.extend(margin);
		// check collision
		map.foreachWall((wall) =>
		{
			Rect.collide(wall, this, GameSettings.collisionIterations);
		}, rangeRect);
		this.oldX = this.x;
		this.oldY = this.y;

		////////////////////////// SPAWNING WAVES & SHOOTING ////////////////////////////
		if (this.velocity.sqrMagnitude() > 0)
		{
			this.lastAngle = Math.atan2(this.velocity.y, this.velocity.x);
		}

		if (this.charging)
		{
			// CHARGE SHOT
			let m = this.velocity.sqrMagnitude();
			const dCharge = (m * GameSettings.chargeSpeed - GameSettings.dischargeSpeed) * dt;
			this.charge = clamp(this.charge + dCharge);
		}

		// SHOOT
		if (this.shoot)
		{
			if (this.charge > 0.07)
			{
				let settings = SoundwaveSettings.Attack(this.lastAngle, this.charge);
				const newWave = this.createSoundwave(settings);
				newSoundWaves.set(newWave.id, newWave);
			}

			this.shoot = this.charging = false;
			this.charge = 0;

		}

		// SPAWN SOUNDWAVE ON STEP
		let distanceWalkedSqr = this.lastStep.sub(new Vec2(this.x, this.y)).sqrMagnitude();
		if (distanceWalkedSqr > GameSettings.sqrPlayerStepDist)
		{
			this.lastStep = new Vec2(this.x, this.y);

			if (this.sneaking)
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
		const newSoundwavesHurt = new Map();

		this.health -= damage;

		// glow for short moment
		this.brightness += this.health;
		
		if (this.health < 0)
		{
			this.killer = offender;
			const newWave = this.createSoundwave(SoundwaveSettings.death());
			newSoundwavesHurt.set(newWave.id, newWave);
		}
		else
		{
			if (this.hurtCooldown == 0)
			{
				const newWave = this.createSoundwave(SoundwaveSettings.hurt());
				newSoundwavesHurt.set(newWave.id, newWave);
				this.hurtCooldown += 0.1;
			}
		}

		return newSoundwavesHurt;
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
			x: this.x,
			y: this.y,
			v: this.velocity,
			cOther: this.color.toHex(),
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