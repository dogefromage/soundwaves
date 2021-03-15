
class SoundwaveSettings
{
    constructor(speed, lifetime, damage, rotation, spread, resolutionServer, resolutionClient)
    {
        this.speed = speed;
        this.lifetime = lifetime;
        this.damage = damage;
        this.rotation = rotation;
        this.spread = spread;
        this.full = spread == Math.PI * 2;
        this.resolutionServer = resolutionServer;
        this.resolutionClient = resolutionClient;
    }
    
    getData()
    {
        return [
            this.speed, 
            this.lifetime, 
            this.damage, 
            this.rotation, 
            this.spread, 
            this.full, 
            this.resolutionServer,
            this.resolutionClient
        ];
    }

    static walk()
    {
        return new SoundwaveSettings(0.6, 2, 0, 0, 2 * Math.PI, 5, 300);
    }

    static sneak()
    {
        return new SoundwaveSettings(0.6, 0.5, 0, 0, 2 * Math.PI, 5, 150);
    }

    static hurt()
    {
        return new SoundwaveSettings(0.3, 0.8, 0, 0, 2 * Math.PI, 5, 100);
    }

    static death()
    {
        return new SoundwaveSettings(0.1, 3, 0, 0, 2 * Math.PI, 5, 100);
    }

    static Attack(rotation, power)
    {
        // logarithm limits speed if magnitude is very large
        let speed = Math.log1p(15 * power) * 0.5;
        // seems reasonable
        let lifetime = 2;
        // damage rises exponentially to eliminate spamming
        let damage = 0.3 * Math.expm1(power);
        // spread similar to 1/x but offset so f(0)=PI
        let spread = 3.1415 / (30 * power + 0.1);

        return new SoundwaveSettings(speed, lifetime, damage, rotation, spread, 50, 100);
    }
}

module.exports = SoundwaveSettings;
