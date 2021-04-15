

class XP
{
    constructor(startValue = 0)
    {
        // absolute xp value
        this.value = startValue;
        this.logarithmicValue = 0;
        this.calculateLogarithmic();
        this.levelUps = 0;
    }

    calculateLogarithmic()
    {
        this.logarithmicValue = 10 * Math.log1p(0.05 * this.value);
    }

    getLevel(logValue = this.logarithmicValue)
    {
        return Math.floor(logValue);
    }

    add(xp)
    {
        if (xp instanceof XP)
        {
            xp = xp.value;
        }

        this.value += xp;
        
        const lastLevel = this.getLevel();
        this.calculateLogarithmic();
        const currentLevel = this.getLevel();

        this.levelUps += currentLevel - lastLevel;
    }

    getLogarithmic()
    {
        return this.logarithmicValue;
    }

    hasLevelUps()
    {
        return this.levelUps > 0;
    }

    useLevelUp()
    {
        if (this.hasLevelUps())
        {
            this.levelUps--;
            return true;
        }
        else
        {
            return false;
        }
    }
}

module.exports = XP;