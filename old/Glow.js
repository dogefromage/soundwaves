
class Glow
{
    constructor(glowRiseTime = 0.3, glowDecayTime = 1.5, brightness = 0)
    {
        this.brightness = brightness;
        this.glowDecayTime = glowDecayTime;
        this.glowRiseTime = glowRiseTime;
        this.remainingGlowEnergy = 0;
    }

    /**
     * let's the carrier of the glow light up for a short moment.
     */
    agitate(energy = 1)
    {
        this.remainingGlowEnergy = Math.min(this.remainingGlowEnergy + energy, 1);
    }

    getBrightness()
    {
        return this.brightness;
    }

    update(dt)
    {
        if (this.remainingGlowEnergy > 0)
        {
            if (this.glowRiseTime > 0)
            {
                let addedGlow = dt / this.glowRiseTime;
                this.brightness = Math.min(this.brightness + addedGlow, 1);
                this.remainingGlowEnergy -= addedGlow;
                this.remainingGlowEnergy = Math.max(0, this.remainingGlowEnergy);
            }
            else
            {
                // instantaniously add all energy
                this.brightness = Math.min(this.brightness + this.remainingGlowEnergy, 1);
                this.remainingGlowEnergy = 0;
            }
        }

        this.brightness = Math.max(0, this.brightness - dt / this.glowDecayTime);
    }
}

module.exports = Glow;