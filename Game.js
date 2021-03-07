const GameMap = require('./GameMap');
const Player = require('./Player');
const Entity = require('./Entity');
const { Soundwave } = require('./Soundwave');
const GameSettings = require('./GameSettings');
const Rect = require('./Rect');
const Color = require('./Color');
const { Vec2 } = require('./Vector');
const QuadTree = require('./QuadTree');
const RandomID = require('./RandomID');
const Bug = require('./Bug');

class Game
{
    constructor(mapSize)
    {
        this.map = new GameMap(mapSize);
        this.gameObjects = new Map();
        this.quadTree = new QuadTree(new Rect(0, 0, this.map.width, this.map.width));
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

    findEmptySpawningSpace(margins = 0)
    {
        let x, y;
        do
        {
            x = Math.floor(Math.random() * this.map.width);
            y = Math.floor(Math.random() * this.map.height);
        }
        while(this.map.pixels[y][x] == '1') // repeat if map square isn't empty

        x += margins + Math.random() * (1 - 2 * margins);
        y += margins + Math.random() * (1 - 2 * margins);

        return { x, y };
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

    addGameObject(go, id = undefined)
    {
        if (!id)
        {
            id = this.createUniqueID();
        }

        // create unique ID for new entity and add to map
        this.gameObjects.set(id, go);
    }

    addPlayer(id, name, hue)
    {
        const { x, y } = this.findEmptySpawningSpace(0.4);

        // color, 60% saturated seems good
        let color = Color.FromHSV(360 - hue * 3.6, .6, 1);

        const p = new Player(x, y, id, name, color);
        this.addGameObject(p, id);
    }

    removePlayer(id)
    {
        this.gameObjects.delete(id);
    }

    update(deltaTime)
    {
        if (Math.random() > 0.9)
        {
            const spawningSpace = this.findEmptySpawningSpace(0.2);
            this.addGameObject(new Bug(spawningSpace.x, spawningSpace.y));
        }


        /////////////////// UPDATE ALL GAMEOBJECTS ////////////////////
        let newGameObjects = []; // array for new gos

        for (const [id, go] of this.gameObjects)
        {
            let newGOs = go.update(deltaTime, this.map);
            newGameObjects.push(...newGOs);

            // IS DEAD?
            if (go.dead)
            {
                go.onDeath();
                this.gameObjects.delete(id);
            }
        }
 
        ////////////////////////// BUILD QUADTREE /////////////////////////
        this.quadTree.clear(); // clear last

        for (const [id, go] of this.gameObjects)
        {
            this.quadTree.insert(go.getBounds(), [id, go]);
        }

        ////////////////// SOUNDWAVE collides with PLAYER /////////////////
        for (const [wID, wave] of this.gameObjectsOfType(Soundwave)) // get all waves
        {
            if (wave.settings.damage != 0)
            {
                // collide with border rectangle first to improve performance
                let wBorder = wave.getBounds();
    
                for (const el of this.quadTree.inRange(wBorder))
                {
                    // only entities can be hurt
                    if (el[1] instanceof Entity)
                    {
                        const [ id, entity ] = el;

                        if (id != wave.sender)
                        {
                            let hit = false;
                            for (const vertex of wave.vertices)
                            {
                                if (vertex.active)
                                {
                                    let A = new Vec2(vertex.oldX, vertex.oldY);
                                    let B = new Vec2(vertex.x, vertex.y);
                                    if (Rect.intersectLine(entity.getHitbox(), A, B))
                                    {
                                        hit = true;
                                        break;
                                    }
                                }
                            }
            
                            if (hit)
                            {
                                let hurtGOs = entity.hurt(wave.settings.damage * wave.power, wave.sender);
                                newGameObjects.push(...hurtGOs);
                            }
                        }
                    }
                }
            }
        }

        // add new gos
        for (const go of newGameObjects)
        {
            this.addGameObject(go);
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
}

module.exports = Game;