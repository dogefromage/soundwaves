import { ClientGamemap } from './ClientGamemap';
import { ClientSoundwave } from './ClientSoundwave';
import { ClientPlayer } from './ClientPlayer';
import Rect from '../../Rect';

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
            let isMainPlayer = window.socket.id == pID;
            p.update(dt, this.map, isMainPlayer);
        }
    }

    setData(serverData)
    {
        ////////////////////// Map ///////////////////////
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
                    const clientP = this.players.get(pID);
                    const serverP = pData[1];
                    clientP.setData(serverP, serverData.dt);
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
        ////////////////////////////////// CLEAR //////////////////////////////////
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        ////////////////////////////////// DRAW GRID //////////////////////////////////
        let range = camera.CanvasToWorldRect(new Rect(0, 0, w, h));
        range = range.roundUp();
        ctx.strokeStyle = "#050505";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let j = range.getTop(); j < range.getBottom(); j += 0.05)
        {
            let y = camera.WorldToCanvas({x:0, y:j}).y; // only y
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        for (let i = range.getLeft(); i < range.getRight(); i += 0.05)
        {
            let x = camera.WorldToCanvas({x:i, y:0}).x; // only y
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        ctx.stroke();

        ////////////////////////////////// DRAW WAVES //////////////////////////////////
        for (const [wID, w] of this.soundwaves)
        {
            w.draw(ctx, camera);
        }

        ////////////////////////////////// DRAW MAP //////////////////////////////////
        if (this.map)
        {
            this.map.draw(ctx, camera, range);
        }

        ////////////////////////////////// DRAW PLAYERS //////////////////////////////////
        for (const [pID, p] of this.players)
        {
            let isMainPlayer = pID == socket.id
            p.draw(ctx, camera, isMainPlayer);
        }

        ////////////////////////////////// DEBUG //////////////////////////////////
        for (const r of window.debuggerRects)
        {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ff0000";
            let camRect = camera.WorldToCanvasRect(r);
            ctx.strokeRect(camRect.x, camRect.y, camRect.w, camRect.h);
        }
    }
}
