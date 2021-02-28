const Rect = require('./Rect');
const GameSettings = require('./GameSettings');

class Entity extends Rect
{
    constructor(x, y, w, h, id, color, health, glowTime)
    {
        super(x, y, w, h);
		this.oldX = this.x; this.oldY = this.y;
        this.id = id;
		this.color = color;
        
		this.brightness = 0;
		this.hurtCooldown = 0;

		this.health = health;
        this.glowTime = glowTime;
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
		this.brightness = Math.max(0, this.brightness - dt / this.glowTime);
		this.hurtCooldown = Math.max(0, this.hurtCooldown - dt);
    }

	hurt(damage, offender)
	{
        if (this.hurtCooldown <= 0)
        {
            this.health -= damage;
            this.lastOffender = offender;
            this.hurtCooldown += 0.2;
    
            // glow for short moment
            this.brightness = 1;
        }
	}
}

module.exports = Entity;
