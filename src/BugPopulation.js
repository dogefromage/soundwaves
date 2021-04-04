const Bug = require('./Bug');

class BugPopulation
{
    constructor(game, mapArea, maxPopulation, spawningProbability)
    {
        this.game = game;
        this.mapArea = mapArea;
        this.population = 0;
        this.maxPopulation = maxPopulation;
        this.spawningProbability = spawningProbability;
    }

    update(dt, map)
    {
        const newBugs = [];

        let probability = this.spawningProbability * this.mapArea * dt *
            (this.maxPopulation - this.population) / this.maxPopulation;

        if (Math.random() < probability)
        {
            const spawningSpace = map.findEmptySpawningSpace(0.2);
            
            let xp = Math.random() * 0.2 + 0.1;
            let r = 0.008;
            
            if (Math.random() > 0.8)
            {
                // fat
                xp += 0.15;
                r += 0.005;
            }

            newBugs.push(new Bug(this.game, spawningSpace.x, spawningSpace.y, xp, undefined, r));
            this.population++;
        }

        return newBugs;
    }
}

module.exports = BugPopulation;