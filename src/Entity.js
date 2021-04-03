const Rect = require('./Rect');
const Glow = require("./Glow");
const XP = require('./XP');

class Entity extends Rect
{
    constructor(game, x, y, w, h, color, health)
    {
        super(x, y, w, h);
		
        this.game = game;

		this.oldX = this.x; this.oldY = this.y;
		this.color = color;
        
		this.glow = new Glow();
		this.hurtCooldown = this.game.settings.spawnCooldown;
		
		this.health = health;

		this.dead = false;

		this.xp = new XP();
		this.lastAttacker = null;
    }

    update(dt, map)
    {
        //////////////////////////// COLLISION WALLS /////////////////////////////////////
		// optimise collision search by only checking in a specified range
		const rangeRect = this.extend(this.game.settings.colDetectionRange);
		// check collision
		map.foreachWall((wall) =>
		{
			Rect.collide(wall, this);
		}, rangeRect);
		this.oldX = this.x; this.oldY = this.y;

		// color
		this.glow.update(dt);
		this.hurtCooldown = Math.max(0, this.hurtCooldown - dt);

		if (this.health < 0)
		{
			this.dead = true;
		}

		if (isNaN(this.x) || isNaN(this.y))
		{
			throw new Error(`Entities position is NaN! id=${this.id}`);
		}

		return [];
    }

	onDeath(game)
	{

	}

	giveXP(xp)
	{
		this.xp.add(xp);
	}

	hurt(damage, attacker)
	{
        if (this.hurtCooldown <= 0)
        {
            this.health -= damage;
            this.lastAttacker = attacker;
            this.hurtCooldown += this.game.settings.hitCooldown;
    
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