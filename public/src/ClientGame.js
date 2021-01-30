import { ClientGamemap } from './ClientGamemap';
import { ClientSoundwave } from './ClientSoundwave';
import { ClientPlayer } from './ClientPlayer';

export class ClientGame
{
    constructor()
    {
        this.map;
        this.settings;
        this.mainPlayer;
        this.players = new Map();
        this.soundwaves = new Map();
    }

    update(dt)
    {
        // update soundwaves
        for (const [wID, w] of this.soundwaves)
        {
            w.update(dt, this.map);
            if (!w.alive)
            {
                this.soundwaves.delete(wID);
            }
        }

        for (const [pID, p] of this.players)
        {
            p.update(dt);
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
        /////////////////// Map ///////////////////////
        if (serverData.map)
        {
            this.map = new ClientGamemap(serverData.map);
        }

        /////////////////// Settings ///////////////////////
        if (serverData.settings)
        {
            window.gameSettings = serverData.settings; // set globally
        }

        /////////////////// Waves ///////////////////////
        if (serverData.w)
        {
            for (const [wID, wData] of serverData.w)
            {
                this.soundwaves.set(wID, new ClientSoundwave(wData));
            }
        }

        /////////////////// Players ///////////////////////
        if (serverData.p)
        {
            for (const [pID, pData] of serverData.p)
            {
                if (pData[0] == 'del')
                {
                    this.players.delete(pID);
                }
                else if (pData[0] == 'upd')
                {
                    const clientObj = this.players.get(pID);
                    const serverObj = pData[1];
                    // loop over and set all properties
                    for (let i in serverObj)
                    {
                        clientObj[i] = serverObj[i];
                    }
                }
                else if (pData[0] == 'new')
                {
                    this.players.set(pID, new ClientPlayer(pData[1]));
                }
            }
        }

        // mainplayer - if set to undefined, join card shows up
        this.mainPlayer = this.players.get(socket.id);
    }

    // /**
    //  * updates clients array with server data.
    //  * info displays the kind of action for every object.
    //  * 
    //  * if element does not exist on client -> "new"
    //  *  - create new Element of type T
    //  *  - arguments must be compatible with constructor
    //  * 
    //  * if element must be updated -> "upd"
    //  *  - item is searched by "id"
    //  *  - for every component sent by server, set on clientObj
    //  * 
    //  * if element must be deleted -> "del"
    //  *  - delete element from array using id
    //  */
    // merge(clientSide, serverSide, T)
    // {
    //     if (!serverSide)
    //     {
    //         // no data sent
    //         return;
    //     }

    //     for (let serverObj of serverSide)
    //     {
    //         if (serverObj.info == 'new')
    //         {
    //             if (clientSide.find(c => c.id == serverObj.id))
    //             {
    //                 console.log("object was tried to create but id already existed!");
    //             }
    //             else
    //             {
    //                 clientSide.push(new T(serverObj));
    //             }
    //         }
    //         else if (serverObj.info == 'upd')
    //         {
    //             let clientObj = clientSide.find(c => c.id == serverObj.id);
    //             if (clientObj)
    //             {
    //                 for (let i in serverObj)
    //                 {
    //                     clientObj[i] = serverObj[i];
    //                 }
    //             }
    //             else
    //             {
    //                 console.log("update called on non existing array object!");
    //             }
    //         }
    //         else if (serverObj.info == 'del')
    //         {
                
    //             let index = clientSide.indexOf(clientSide.find(c => c.id == serverObj.id));
    //             if (index >= 0)
    //             {
    //                 clientSide.splice(index, 1);
    //             }
    //             else
    //             {
    //                 console.log("delete called on non existing array object!");
    //             }
    //         }
    //     }
    // }

    // /**
    //  * send tree which gives server information about what is stored on client.
    //  * short variable names to reduce data sent
    //  */
    // getTree()
    // {
    //     let tree = {
    //         m: (typeof this.map !== 'undefined'), // if map is defined
    //         p: [], // players
    //         w: [], // soundwaves
    //     };

    //     for (let p of this.players)
    //     {
    //         tree.p.push(p.id);
    //     }
    //     for (let w of this.soundwaves)
    //     {
    //         tree.w.push(w.id);
    //     }
        
    //     return tree;
    // }

    draw(ctx, camera, w, h)
    {
        // clear
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        for (const [wID, w] of this.soundwaves)
        {
            w.draw(ctx, camera);
        }

        if (this.map)
        {
            this.map.draw(ctx, camera);
        }

        for (const [pID, p] of this.players)
        {
            p.draw(ctx, camera, pID == socket.id);
        }
    }
}
