const Rect = require('./Rect');
const GameSettings = require('./GameSettings');
const Glow = require("./Glow");

class Entity extends Rect
{
    constructor(x, y, w, h, color, health)
    {
        super(x, y, w, h);
		this.oldX = this.x; this.oldY = this.y;
		this.color = color;
        
		this.glow = new Glow(GameSettings.glowRiseTime, GameSettings.glowDecayTime, 0);
		this.hurtCooldown = 0;
		
		this.health = health;

		this.dead = false;
    }

    update(dt, map)
    {
        //////////////////////////// COLLISION WALLS /////////////////////////////////////
		// optimise collision search by only checking in a specified range
		const margin = GameSettings.rangeRectMargin;
		const rangeRect = this.extend(margin);
		// check collision
		map.foreachWall((wall) =>
		{
			Rect.collide(wall, this, GameSettings.collisionIterations);
		}, rangeRect);
		this.oldX = this.x; this.oldY = this.y;

		// color
		this.glow.update(dt);
		this.hurtCooldown = Math.max(0, this.hurtCooldown - dt);

		if (this.health < 0)
		{
			this.dead = true;
		}

		return [];
    }

	onDeath()
	{

	}

	hurt(damage, offender)
	{
        if (this.hurtCooldown <= 0)
        {
            this.health -= damage;
            this.lastOffender = offender;
            this.hurtCooldown += 0.2;
    
            // glow for short moment
			this.glow.agitate();
        }

		return [];
	}

	getBounds()
	{
		return new Rect(this.x, this.y, this.w, this.h);
	}
}

module.exports = Entity;