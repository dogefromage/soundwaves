
class SoundwaveSettings
{
    constructor(speed, lifetime, damage, rotation, spread, resolutionServer, resolutionClient, gameSettings = undefined)
    {
        this.speed = speed;
        this.lifetime = lifetime;
        this.damage = damage;
        this.rotation = rotation;
        this.spread = spread;
        this.resolutionServer = resolutionServer;
        this.resolutionClient = resolutionClient;

        if (gameSettings)
        {
            this.speed *= gameSettings.waveSpeed;
            this.damage *= gameSettings.waveDamage;
            this.lifetime *= gameSettings.waveLifetime;
        }

        this.full = this.spread > 6.2; // approx. 2*pi
    }
    
    getData()
    {
        return [
            this.speed, 
            this.lifetime, 
            this.damage, 
            this.rotation, 
            this.spread, 
            this.resolutionServer,
            this.resolutionClient
        ];
    }

    static walk(gameSettings)
    {
        return new SoundwaveSettings(0.6, 2, 0, 0, 2 * Math.PI, 0, 100, gameSettings);
    }

    static sneak(gameSettings)
    {
        return new SoundwaveSettings(0.6, 0.5, 0, 0, 2 * Math.PI, 0, 50, gameSettings);
    }

    static hurt(gameSettings)
    {
        return new SoundwaveSettings(0.3, 0.8, 0, 0, 2 * Math.PI, 0, 60, gameSettings);
    }

    static death(gameSettings)
    {
        return new SoundwaveSettings(0.1, 3, 0, 0, 2 * Math.PI, 0, 50, gameSettings);
    }

    static Attack(rotation, power, gameSettings)
    {
        // logarithm limits speed if magnitude is very large
        let speed = Math.log1p(15 * power) * 0.5;
        // seems reasonable
        let lifetime = 2;
        // damage rises exponentially to eliminate spamming
        let damage = 0.5 * Math.expm1(power);
        // spread similar to 1/x but offset so f(0)=PI
        let spread = 3.1415 / (30 * power + 0.1);

        return new SoundwaveSettings(speed, lifetime, damage, rotation, spread, 30, 50, gameSettings);
    }
}

module.exports = SoundwaveSettings;
