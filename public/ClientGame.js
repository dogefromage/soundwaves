

class ClientGame
{
    constructor()
    {
        this.map;
        this.mainPlayer;
        this.players = [];
        this.soundwaves = [];
    }

    setData({ map: mapData, players: playerDatas, soundwaves: soundwaveDatas })
    {
        /*      MAP     */
        // update map with data or create new
        if (this.map)
        {
            this.map.setData(mapData);
        }
        else
        {
            this.map = new ClientGamemap(mapData);
        }

        /*      PLAYERS     */
        this.alignArrays(this.players, playerDatas, ClientPlayer);

        /*    SOUNDWAVES    */
        this.alignArrays(this.soundwaves, soundwaveDatas, ClientSoundwave);

        this.mainPlayer = undefined;
        // find main player
        for (let p of this.players)
        {
            if (p.id == socket.id)
            {
                this.mainPlayer = p;
                break;
            }
        }
    }

    alignArrays(clientArray, serverData, T)
    {
        // update clientarray with serverData, which both are 
        // filled with objects (every object with "id" property which has to match).
        // !! every element needs to have a setData function to set the new data
        
        // loop through on client existing data
        for (let i = clientArray.length - 1; i >= 0; i--)
        {
            const client = clientArray[i];
            const data = serverData.find(data => data.id == client.id);
            // if server has data, update values on client
            if (data)
            {
                // this function must exist for every element
                client.setData(data);
                // remove used data
                serverData.splice(serverData.indexOf(data), 1);
            }
            // if no data sent, remove object from client array
            else
            {
                clientArray.splice(i, 1);
            }
        }

        // data array now only holds newly added objects, so add them to client
        for (let d of serverData)
        {
            clientArray.push(new T(d));
        }
    }

    draw(ctx, camera, w, h)
    {
        // clear
        ctx.fillStyle = "#000000";
        // ctx.fillStyle = "#333333";
        ctx.fillRect(0, 0, w, h);

        for (const w of this.soundwaves)
        {
            w.draw(ctx, camera);
        }

        this.map.draw(ctx, camera);

        for (let p of this.players)
        {
            p.draw(ctx, camera, p == this.mainPlayer);
        }

        // OLD
        // for (let i = 0; i < this.debug.rects.length; i++)
        // {
        //     ctx.strokeStyle = "#ff0000";
        //     ctx.lineWidth = 2;
        //     const canRect = camera.WorldToCanvasRect(this.debug.rects[i]);
        //     ctx.strokeRect(canRect.x, canRect.y, canRect.w, canRect.h);
        // }
    }
}
