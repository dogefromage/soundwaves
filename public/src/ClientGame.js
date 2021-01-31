import { ClientGamemap } from './ClientGamemap';
import { ClientSoundwave } from './ClientSoundwave';
import { ClientPlayer } from './ClientPlayer';
import { lerp } from './ClientGameMath';

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
            p.update(dt, this.map);
        }
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
                        if (i == 'x' || i == 'y')
                        {
                            clientObj[i] = lerp(clientObj[i], serverObj[i], 0.5); // choose center of both coordinates
                        }
                        else
                        {
                            clientObj[i] = serverObj[i];
                        }
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
