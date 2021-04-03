import Rect from '../Rect'
import { lerp } from '../GameMath'; 

export class ClientCamera 
{
    constructor(game, x = 0, y = 0, zoom = 1) 
    {
        this.game = game;
        this.x = x; // camera offset in WORLD! coordinates
        this.y = y;
        this.zoom = zoom;
    }

    // translate world point to canvas point
    WorldToCanvas(worldCoords)
    {
        let canCoords = 
        {
            x: (worldCoords.x - this.x) * this.zoom,
            y: (worldCoords.y - this.y) * this.zoom
        };
        return canCoords;
    }

    // reverse
    CanvasToWorld(canCoords)
    {
        let worldCoords = 
        {
            x: canCoords.x / this.zoom + this.x,
            y: canCoords.y / this.zoom + this.y
        };
        return worldCoords;
    }

    WorldToCanvasRect(worldRect)
    {
        const canPos = this.WorldToCanvas({ x: worldRect.x, y: worldRect.y });
        const canSize = this.WorldToCanvasVector({ x: worldRect.w, y: worldRect.h });

        return new Rect(canPos.x, canPos.y, canSize.x, canSize.y);
    }

    CanvasToWorldRect(canRect)
    {
        const worldPos = this.CanvasToWorld({ x: canRect.x, y: canRect.y });
        const worldSize = this.CanvasToWorldVector({x: canRect.w, y: canRect.h });

        return new Rect(worldPos.x, worldPos.y, worldSize.x, worldSize.y);
    }

    // same but no offset
    WorldToCanvasVector(worldVector)
    {
        return { 
            x: this.WorldToCanvasScale(worldVector.x), 
            y: this.WorldToCanvasScale(worldVector.y)
        };
    }

    CanvasToWorldVector(canvasVector)
    {
        return { 
            x: this.CanvasToWorldScale(canvasVector.x), 
            y: this.CanvasToWorldScale(canvasVector.y)
        };
    }

    WorldToCanvasScale(worldScale)
    {
        return worldScale * this.zoom;
    }

    CanvasToWorldScale(canvasScale)
    {
        return canvasScale / this.zoom;
    }
    
    update(dt)
    {
        let d = Math.sqrt(window.innerWidth * window.innerHeight);
        this.zoom = Math.floor(0.5 * d);

        const screenCenter = 
        { 
            x: 0.5 * window.innerWidth, 
            y: 0.5 * window.innerHeight 
        };
        
        const worldScreenCenter = this.CanvasToWorldVector(screenCenter);
        
        let camTarget;

        if (this.game.mainPlayer)
        {
            camTarget = 
            {
                x: this.game.mainPlayer.x - worldScreenCenter.x,
                y: this.game.mainPlayer.y - worldScreenCenter.y,
            }
        }
        else if (this.game.map)
        {
            camTarget = 
            {
                x: this.game.map.width * 0.5 - worldScreenCenter.x,
                y: this.game.map.height * 0.5 - worldScreenCenter.y,
            }
        }

        if (camTarget)
        {
            let k = 1.5 * dt;
            this.x = lerp(this.x, camTarget.x, k);
            this.y = lerp(this.y, camTarget.y, k);
        }
    }
}
