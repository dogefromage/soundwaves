

class Powerup extends Rect
{
    static size = 0.05;

    constructor(x, y, color, action)
    {
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