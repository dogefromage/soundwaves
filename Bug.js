const Entity = require('./Entity');
const Color = require('./Color');
const { Vec2 } = require('./Vector')

class Bug extends Entity
{
    constructor(x, y, r = 0.01)
    {
        super(x - r, y - r, 2 * r, 2 * r, new Color(255, 255, 255, 255), 0.0001);
        this.radius = r;

		this.velocity = new Vec2(0.3, 0).rotate(Math.random() * 6.23);
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

    getDataNew()
    {
        return {
            x: this.x,
            y: this.y,
            r: this.radius
        };
    }

    getDataUpdate()
    {
        return {
            x: this.x,
            y: this.y,
            // br: this.brightness,
        }
    }
}


module.exports = Bug;