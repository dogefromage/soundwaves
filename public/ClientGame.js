

class ClientGame
{
    constructor()
    {
        this.map;
        this.mainPlayer;
        this.players = [];
        this.soundwaves = [];
    }

    update(serverData)
    {
        // map
        if (serverData.map)
        {
            this.map = new ClientGamemap(serverData.map);
        }

        // soundwaves
        this.merge(this.soundwaves, serverData.waves, ClientSoundwave);

        // players
        this.merge(this.players, serverData.players, ClientPlayer);

        for (let p of this.players)
        {
            if (p.id == socket.id)
            {
                this.mainPlayer = p;
                break;
            }
        }
    }

    /**
     * updates clients array with server data.
     * info displays the kind of action for every object.
     * 
     * if element does not exist on client -> "new"
     *  - create new Element of type T
     *  - arguments must be compatible with constructor
     * 
     * if element must be updated -> "upd"
     *  - item is searched by "id"
     *  - for every component sent by server, set on clientObj
     * 
     * if element must be deleted -> "del"
     *  - delete element from array using id
     */
    merge(clientSide, serverSide, T)
    {
        if (!serverSide)
        {
            // no data sent
            return;
        }

        for (let serverObj of serverSide)
        {
            if (serverObj.info == 'new')
            {
                if (clientSide.find(c => c.id == serverObj.id))
                {
                    console.log("object was tried to create but id already existed!");
                }
                else
                {
                    clientSide.push(new T(serverObj));
                }
            }
            else if (serverObj.info == 'upd')
            {
                let clientObj = clientSide.find(c => c.id == serverObj.id);
                if (clientObj)
                {
                    for (let i in serverObj)
                    {
                        clientObj[i] = serverObj[i];
                    }
                }
                else
                {
                    console.log("update called on non existing array object!");
                }
            }
            else if (serverObj.info == 'del')
            {
                
                let index = clientSide.indexOf(clientSide.find(c => c.id == serverObj.id));
                if (index >= 0)
                {
                    clientSide.splice(index, 1);
                }
                else
                {
                    console.log("delete called on non existing array object!");
                }
            }
        }
    }

    /**
     * send tree which gives server information about what is stored on client.
     * short variable names to reduce data sent
     */
    getTree()
    {
        let tree = {
            m: (typeof this.map !== 'undefined'), // if map is defined
            p: [], // players
            w: [], // soundwaves
        };

        for (let p in this.players)
        {
            tree.p.push(p.id);
        }
        for (let w in this.soundwaves)
        {
            tree.w.push(w.id);
        }
        
        return tree;
    }

    draw(ctx, camera, w, h)
    {
        // clear
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        for (const w of this.soundwaves)
        {
            w.draw(ctx, camera);
        }

        if (this.map)
        {
            this.map.draw(ctx, camera);
        }

        for (let p of this.players)
        {
            p.draw(ctx, camera, p == this.mainPlayer);
        }
    }
}
