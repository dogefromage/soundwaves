

class Powerup extends Rect
{
    constructor(x, y, color, action)
    {
        let size = 0.05;
        super(x - 0.5 * Powerup.size, y - 0.5 * Powerup.size, Powerup.size, Powerup.size);
        this.color = color;
        this.action = action;
    }
}

class HealthPowerup extends Powerup
{
    constructor(x, y)
    {
        super(x, y, "#ff3333", () =>
        {
            console.log("Health powerup collected");
        });
    }
}

module.exports = { Powerup, HealthPowerup };