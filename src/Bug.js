const Entity = require('./Entity');
const Color = require('./Color');
const { Vec2 } = require('./Vector')

class Bug extends Entity
{
    constructor(game, x, y, xp, color = undefined, r = 0.01)
    {
        super(game, x - r, y - r, 2 * r, 2 * r, color || new Color(255, 255, 255, 255), 0.0001);
        this.radius = r;
        this.xp = xp; // xp is only number because it never changes

		this.velocity = new Vec2(0.3, 0).rotate(Math.random() * 6.283);

        this.isWhite = color == undefined;
    }
	
	getType()
	{
		return 'b';
	}

    update(dt, map)
    {
        this.velocity = this.velocity.rotate(0.5 * (Math.random() - 0.5))
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

		super.update(dt, map); // collisions, color ...

        return [];
    }

    onDeath()
    {
        const attacker = this.game.getGameObjectByID(this.lastAttacker);
        
        if (attacker)
        {
            if (attacker.giveXP)
            {
                attacker.giveXP(this.xp);
            }
        }
    }

    getDataNew()
    {
        let data = 
        {
            x: this.x,
            y: this.y,
            r: this.radius,
            br: this.glow.brightness,
        };
        if (!this.isWhite)
        {
            data.co = this.color;
        }

        return data;
    }

    getDataUpdate()
    {
        let data = 
        {
            x: this.x,
            y: this.y,
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


module.exports = Bug;