

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

        // players
        if (serverData.players)
        {
            for (let playerData in serverData.players)
            {
                if (playerData.info == 'new')
                {
                    
                }
                else if (playerData.info == 'upd')
                {

                }
                else if (playerData.info == 'del')
                {

                }
            }
        }
    }

    // setData({ map: mapData, players: playerDatas, soundwaves: soundwaveDatas })
    // {
    //     /*      MAP     */
    //     if (mapData)
    //     {
    //         this.map = new ClientGamemap(mapData);
    //     }

    //     /*      PLAYERS     */
    //     this.alignArrays(this.players, playerDatas, ClientPlayer);

    //     /*    SOUNDWAVES    */
    //     this.alignArrays(this.soundwaves, soundwaveDatas, ClientSoundwave);

    //     this.mainPlayer = undefined;
    //     // find main player
    //     for (let p of this.players)
    //     {
    //         if (p.id == socket.id)
    //         {
    //             this.mainPlayer = p;
    //             break;
    //         }
    //     }
    // }

    // alignArrays(clientArray, serverData, T)
    // {
    //     // update clientarray with serverData, which both are 
    //     // filled with objects (every object with "id" property which has to match).
    //     // !! every element needs to have a setData function to set the new data
        
    //     // loop through on client existing data
    //     for (let i = clientArray.length - 1; i >= 0; i--)
    //     {
    //         const client = clientArray[i];
    //         const data = serverData.find(data => data.id == client.id);
    //         // if server has data, update values on client
    //         if (data)
    //         {
    //             // this function must exist for every element
    //             client.setData(data);
    //             // remove used data
    //             serverData.splice(serverData.indexOf(data), 1);
    //         }
    //         // if no data sent, remove object from client array
    //         else
    //         {
    //             clientArray.splice(i, 1);
    //         }
    //     }

    //     // data array now only holds newly added objects, so add them to client
    //     for (let d of serverData)
    //     {
    //         clientArray.push(new T(d));
    //     }
    // }

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

    getTree()
    {
        /**
         * send tree which gives server information about what is stored on client.
         * short variable names to reduce bandwidth
         */
        let tree = {
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
}
