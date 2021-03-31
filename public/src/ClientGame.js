import Rect from '../../Rect';
import { ClientGamemap } from './ClientGamemap';
import { ClientSoundwave } from './ClientSoundwave';
import { ClientPlayer, ClientMainPlayer } from './ClientPlayers';
import { ClientEntity } from './ClientEntity';
import { ClientBug } from './ClientBug';
import { Vec2 } from '../../Vector';

export class ClientGame
{
    constructor()
    {
        this.map;
        this.settings;
        this.gameObjects = new Map();
        this.mainPlayer;
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

    update(dt)
    {
        // UPDATE ALL GOs
        for (const [ id, go ] of this.gameObjects)
        {
            go.update(dt, this.map);

            if (go.dead) // mainly used for soundwaves
            {
                this.gameObjects.delete(id);
            }
        }
        
        ////////////////// SOUNDWAVE & BUG /////////////////
        for (const [wID, wave] of this.gameObjectsOfType(ClientSoundwave)) // get all waves
        {
            const wBounds = wave.getBounds();
            for (const [ id, entity ] of this.gameObjectsOfType(ClientBug))
            {
                if (Rect.intersectRect(wBounds, entity))
                {
                    let hit = false;
                    for (const vertex of wave.vertices)
                    {
                        if (vertex.active)
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
                        entity.hurt(wave.settings.damage * wave.power, wave.sender);
                    }
                }
            }
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

        /////////////////// Gameobjects ///////////////////////
        if (serverData.go)
        {
            for (const [id, data] of serverData.go)
            {
                if (data[0] == 'del')
                {
                    this.gameObjects.delete(id);
                }
                else if (data[0] == 'upd')
                {
                    const clientObj = this.gameObjects.get(id);
                    clientObj.setData(data[1], serverData.dt);
                }
                else if (data[0] == 'new')
                {
                    // data: ['new', vars, type]

                    let T;
                    switch (data[2])
                    {
                        case 'w':
                            T = ClientSoundwave; break;
                        case 'b':
                            T = ClientBug; break;
                        case 'p':
                        {
                            if (id == window.socket.id)
                                T = ClientMainPlayer; // main player
                            else
                                T = ClientPlayer;
                            break;
                        }
                        default:
                        {
                            console.log("Unknown type: '" + data[2] + "'");
                            continue;
                        }
                    }

                    const newObj = new T(data[1]);
                    this.gameObjects.set(id, newObj);
                }
            }
        }

        // mainplayer - if set to undefined, menu shows up
        this.mainPlayer = this.gameObjects.get(socket.id);
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
        for (let j = range.getTop(); j < range.getBottom(); j += 0.10)
        {
            let y = camera.WorldToCanvas({x:0, y:j}).y; // only y
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        for (let i = range.getLeft(); i < range.getRight(); i += 0.10)
        {
            let x = camera.WorldToCanvas({x:i, y:0}).x; // only y
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        ctx.stroke();

        ////////////////////////////////// DRAW WAVES //////////////////////////////////
        for (const [id, go] of this.gameObjects)
        {
            if (go instanceof ClientSoundwave)
            {
                go.draw(ctx, camera);
            }
        }

        ////////////////////////////////// DRAW MAP //////////////////////////////////
        if (this.map)
        {
            this.map.draw(ctx, camera, range);
        }

        ////////////////////////////////// DRAW ENTITIES //////////////////////////////////
        for (const [id, go] of this.gameObjects)
        {
            if (go instanceof ClientEntity)
            {
                if (id != socket.id)
                {
                    go.draw(ctx, camera);
                }
            }
        }

        ////////////////////////////////// DRAW MAINPLAYER //////////////////////////////////
        if (this.mainPlayer)
        {
            this.mainPlayer.draw(ctx, camera);
        }

        ////////////////////////////////// DRAW DEBUG //////////////////////////////////
        for (const r of window.debuggerRects)
        {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ff0000";
            let camRect = camera.WorldToCanvasRect(r);
            ctx.strokeRect(camRect.x, camRect.y, camRect.w, camRect.h);
        }
    }
}
