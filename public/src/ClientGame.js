import { ClientGamemap } from './ClientGamemap';
import { ClientSoundwave } from './ClientSoundwave';
import { ClientPlayer } from './ClientPlayer';

export class ClientGame
{
    constructor()
    {
        this.map;
        this.mainPlayer;
        this.players = [];
        this.soundwaves = [];
    }

    update(dt)
    {
        // update soundwaves
        for (let i = this.soundwaves.length - 1; i >= 0; i--)
        {
            const w = this.soundwaves[i];
            w.update(dt, this.map);
            if (!w.alive)
            {
                this.soundwaves.splice(i, 1);
            }
        }

        // if (this.mainPlayer)
        // {
        //     this.map.foreachWall((wall) =>
        //     {
        //         Rect.collide(wall, p, GameSettings.collisionIterations);
        //     }, rangeRect);
        // }
    }

    setData(serverData)
    {
        // map
        if (serverData.m)
        {
            this.map = new ClientGamemap(serverData.m);
        }

        // new soundwaves
        if (serverData.w)
        {
            for (let newWave of serverData.w)
            {
                this.soundwaves.push(new ClientSoundwave(newWave));
            }
        }

        // players
        if (serverData.p)
        {
            this.merge(this.players, serverData.p, ClientPlayer);
        }

        // mainplayer - if set to undefined, join card shows up
        this.mainPlayer = this.players.find(p => p.id == socket.id);
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

        for (let p of this.players)
        {
            tree.p.push(p.id);
        }
        for (let w of this.soundwaves)
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
