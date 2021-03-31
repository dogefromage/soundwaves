const GameMap = require('./GameMap');
const Player = require('./Player');
const Entity = require('./Entity');
const Soundwave = require('./Soundwave');
const GameSettings = require('./GameSettings');
const Rect = require('./Rect');
const Color = require('./Color');
const { Vec2 } = require('./Vector');
const QuadTree = require('./QuadTree');
const RandomID = require('./RandomID');
const BugPopulation = require('./BugPopulation');
const Bug = require('./Bug');

class Game
{
    constructor(mapSize)
    {
        this.map = new GameMap(mapSize);
        const mapArea = this.map.width * this.map.height;
        this.bugPopulation = new BugPopulation(mapArea, mapArea / 2, 0.3);
        this.gameObjects = new Map();
        this.quadTree = new QuadTree(new Rect(0, 0, this.map.width, this.map.width));
        this.usedNames = new Set();
        this.lastScoreboard = [];
    }

    *gameObjectsOfType(T)
    {
        for (const [id, go] of this.gameObjects)
        {
            if (go instanceof T)
            {
                yield [id, go];
            }
        }
    }

    getGameObjectByID(id)
    {
        return this.gameObjects.get(id);
    }
    
    createUniqueID()
    {
        let id;
        do
        {
            id = RandomID();
        }
        while (this.gameObjects.has(id));

        return id;
    }

    addNewGOsFromArray(arr)
    {
        if (arr)
        {
            for (let el of arr)
            {
                this.addGameObject(el);
            }
        }
    }

    addGameObject(go, id = this.createUniqueID())
    {
        // create unique ID for new entity and add to map
        this.gameObjects.set(id, go);
    }

    addPlayer(id, name, hue)
    {
        const { x, y } = this.map.findEmptySpawningSpace(0.4);

        // color, 60% saturated seems good
        let color = Color.FromHSV(360 - hue * 3.6, .6, 1);

        const p = new Player(x, y, id, name, color);
        this.addGameObject(p, id);
        this.usedNames.add(name);
    }

    deleteGameObject(id, go = undefined)
    {
        if (go == undefined)
        {
            go = this.gameObjects.get(id)
        }

        if (go instanceof Bug)
        {
            this.bugPopulation.population--;
        }

        if (go instanceof Player)
        {
            this.usedNames.delete(go.name);
        }
        
        this.gameObjects.delete(id);
    }

    update(deltaTime)
    {
        /////////////////////////// SPAWN BUGS //////////////////////////
        let newBugs = this.bugPopulation.update(deltaTime, this.map);
        this.addNewGOsFromArray(newBugs);

        ////////////////////////// ENTITIES ///////////////////////
        for (const [id, go] of this.gameObjects)
        {
            let updateGOs = go.update(deltaTime, this.map);
            this.addNewGOsFromArray(updateGOs);

            // IS DEAD?
            if (go.dead)
            {
                let deathGOs = go.onDeath(this);
                this.addNewGOsFromArray(deathGOs);

                this.deleteGameObject(id, go);
            }
        }
 
        ////////////////////////// BUILD QUADTREE /////////////////////////
        this.quadTree.clear(); // clear last

        for (const [id, go] of this.gameObjects)
        {
            this.quadTree.insert(go.getBounds(), [id, go]);
        }

        ////////////////// SOUNDWAVE collides with ENTITIES /////////////////
        for (const [wID, wave] of this.gameObjectsOfType(Soundwave)) // get all waves
        {
            if (wave.settings.damage != 0)
            {
                // get all objects inside waves range using quadtree
                let wBounds = wave.getBounds();
    
                for (const el of this.quadTree.inRange(wBounds))
                {
                    // only entities can be hurt
                    if (el[1] instanceof Entity)
                    {
                        const [ id, entity ] = el;

                        // player can't shoot itself
                        if (id != wave.sender)
                        {
                            let hit = false;
                            for (const vertex of wave.vertices)
                            {
                                if (vertex.oldActive)
                                {
                                    let A = new Vec2(vertex.oldX, vertex.oldY);
                                    let B = new Vec2(vertex.x, vertex.y);
                                    if (Rect.intersectLine(entity.getBounds(), A, B))
                                    {
                                        hit = true;
                                        break;
                                    }
                                }
                            }

                            if (hit)
                            {
                                let hurtGOs = entity.hurt(wave.settings.damage * wave.power, wave.sender);
                                this.addNewGOsFromArray(hurtGOs);
                            }
                        }
                    }
                }
            }
        }
    }

    getBlankKnowledge()
    {
        return {
            map: false,
            settings: false,
            go: new Set(),
        };
    }

    getData(socketID, clientsKnowledge)
    {
        let viewRange; // range rectangle to limit view and data sent
        let viewDist = 2.5;
        const pos = this.gameObjects.get(socketID);
        if (pos)
        {
            // client is playing
            viewRange = new Rect(pos.x, pos.y, 0, 0).extend(viewDist);
        }
        else
        {
            // client still in menu, set to center of map
            viewRange = new Rect(0.5 * this.map.width, 0.5 * this.map.height, 0, 0).extend(viewDist);
        }

        // data to be sent
        const data = 
        {
            go: new Map()
        };

        ////////////////// Map ////////////////////
        if (!clientsKnowledge.map)
        {
            data.map = this.map.getData();
            clientsKnowledge.map = true;
        }

        ////////////////// Settings ////////////////////
        if (!clientsKnowledge.settings)
        {
            data.settings = GameSettings;
            clientsKnowledge.settings = true;
        }
        
        ////////////////// GAME OBJECTS ////////////////////
        // temp variable for old tree
        const oldGOKnowledge = clientsKnowledge.go;
        clientsKnowledge.go = new Set();
        
        for (const [id, go] of this.quadTree.inRange(viewRange))
        {
            const isClientsPlayer = (id == socketID);

            if (oldGOKnowledge.has(id))
            {
                // update go
                const updateData = go.getDataUpdate(isClientsPlayer);

                if (Object.entries(updateData).length > 0) // check if object isn't empty
                {
                    data.go.set(id, ['upd', updateData])
                }
                oldGOKnowledge.delete(id);
            }
            else
            {
                // new go
                const newData = go.getDataNew(isClientsPlayer);
                
                if (Object.entries(newData).length > 0) // check if object isn't empty
                {
                    data.go.set(id, ['new', newData, go.getType()])
                }
            }
            clientsKnowledge.go.add(id);
        }

        for (const id of oldGOKnowledge) // loop over the remains of this set
        {
            // del
            data.go.set(id, ['del']);
        }
        
        return data;
    }

    getTopPlayers(N)
    {
        let playerScores = [];
        for (let [ id, p ] of this.gameObjectsOfType(Player))
        {
            playerScores.push([ p.name, p.xp.logarithmicValue ]);
        }

        playerScores.sort((a, b) => b[1] - a[1]); // sort descending

        let topPlayers = playerScores.slice(0, N); // return largest 10 values
        
        // snip off decimal places to reduce updates
        for (let i = 0; i < topPlayers.length; i++)
        {
            topPlayers[i][1] = Math.floor(topPlayers[i][1]);
        }

        return topPlayers;
    }

    getNewScoreboard(N)
    {
        let scoreboard = this.getTopPlayers(N);

        // compare this with old scoreboard
        let same = false;
        if (scoreboard.length == this.lastScoreboard.length)
        {
            same = true;
            Outerloop:
            for (let i = 0; i < scoreboard.length; i++)
            {
                for (let j = 0; j < 2; j++)
                {
                    if (scoreboard[i][j] != this.lastScoreboard[i][j])
                    {
                        same = false;
                        break Outerloop;
                    }
                }
            }
        }

        if (!same)
        {
            this.lastScoreboard = scoreboard;
            return scoreboard;
        }
    }
}

module.exports = Game;