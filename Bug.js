const Entity = require('./Entity');
const Color = require('./Color');

class Bug extends Entity
{
    constructor(x, y, r = 0.01)
    {
        super(x - r, y - r, 2 * r, 2 * r, new Color(255, 255, 255, 255), 0.1, 1.5);
        this.radius = r;
    }
	
	getType()
	{
		return 'b';
	}

    getDataNew()
    {
        return {
            x: this.x,
            y: this.y,
            r: this.radius,
            br: this.brightness
        };
    }

    getDataUpdate()
    {
        return {
            // x: this.x,
            // y: this.y,
            // br: this.brightness,
        }
    }
}

module.exports = Bug;