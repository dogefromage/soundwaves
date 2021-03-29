const Bug = require('./Bug');

class BugPopulation
{
    constructor(mapArea, maxPopulation, spawningProbability)
    {
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
            let xp = Math.random() * 0.1 + 0.05;
            newBugs.push(new Bug(spawningSpace.x, spawningSpace.y, xp));
            this.population++;
        }

        return newBugs;
    }
}

module.exports = BugPopulation;