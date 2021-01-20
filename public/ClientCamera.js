

// VERSION 3 (x and y is defined relative to world)

class ClientCamera 
{
    constructor(x = 0, y = 0, zoom = 1) 
    {
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
        const canSize = this.WorldToCanvasVector({x: worldRect.w, y: worldRect.h });

        return new ClientRect(canPos.x, canPos.y, canSize.x, canSize.y);
    }

    CanvasToWorldRect(canRect)
    {
        const worldPos = this.CanvasToWorld({ x: canRect.x, y: canRect.y });
        const worldSize = this.CanvasToWorldVector({x: canRect.w, y: canRect.h });

        return new ClientRect(worldPos.x, worldPos.y, worldSize.x, worldSize.y);
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
}



// class ClientCamera 
// {
//     constructor(x = 0, y = 0, zoom = 1) 
//     {
//         this.x = x; // camera offset in canvas coordinates
//         this.y = y;
//         this.zoom = zoom;
//     }

//     // translate world point to canvas point
//     WorldToCanvas(worldCoords)
//     {
//         let canCoords = 
//         {
//             x: worldCoords.x * this.zoom - this.x,
//             y: worldCoords.y * this.zoom - this.y
//         };
//         return canCoords;
//     }

//     // reverse
//     CanvasToWorld(canCoords)
//     {
//         let worldCoords = 
//         {
//             x: (canCoords.x + this.x) / this.zoom,
//             y: (canCoords.y + this.y) / this.zoom
//         };
//         return worldCoords;
//     }

//     WorldToCanvasRect(worldRect)
//     {
//         const canPos = this.WorldToCanvas({ x: worldRect.x, y: worldRect.y });
//         const canSize = this.WorldToCanvasVector({x: worldRect.w, y: worldRect.h });

//         return new ClientRect(canPos.x, canPos.y, canSize.x, canSize.y);
//     }

//     CanvasToWorldRect(canRect)
//     {
//         const worldPos = this.CanvasToWorld({ x: canRect.x, y: canRect.y });
//         const worldSize = this.CanvasToWorldVector({x: canRect.w, y: canRect.h });

//         return new ClientRect(worldPos.x, worldPos.y, worldSize.x, worldSize.y);
//     }

//     // same but no offset
//     WorldToCanvasVector(worldVector)
//     {
//         return { 
//             x: this.WorldToCanvasScale(worldVector.x), 
//             y: this.WorldToCanvasScale(worldVector.y)
//         };
//     }

//     CanvasToWorldVector(canvasVector)
//     {
//         return { 
//             x: this.CanvasToWorldScale(canvasVector.x), 
//             y: this.CanvasToWorldScale(canvasVector.y)
//         };
//     }

//     WorldToCanvasScale(worldScale)
//     {
//         return worldScale * this.zoom;
//     }

//     CanvasToWorldScale(canvasScale)
//     {
//         return canvasScale / this.zoom;
//     }
// }



// // class ClientCamera 
// // {
// //     constructor(x = 0, y = 0, zoom = 1) 
// //     {
// //         this.w = w; // canvas width and height
// //         this.h = h;
// //         this.x = x; // camera offset in canvas coordinates
// //         this.y = y;
// //         this.zoom = zoom;
// //     }

// //     // translate world point to canvas point
// //     WorldToCanvas(worldCoords)
// //     {
// //         let canCoords = 
// //         {
// //             x: worldCoords.x * this.zoom - this.x + 0.5 * this.w,
// //             y: worldCoords.y * this.zoom - this.y + 0.5 * this.h
// //         };
// //         return canCoords;
// //     }

// //     // reverse
// //     CanvasToWorld(canCoords)
// //     {
// //         let worldCoords = 
// //         {
// //             x: (canCoords.x + this.x - 0.5 * this.w) / this.zoom,
// //             y: (canCoords.y + this.y - 0.5 * this.h) / this.zoom
// //         };
// //         return worldCoords;
// //     }

// //     WorldToCanvasRect(worldRect)
// //     {
// //         const canPos = this.WorldToCanvas({ x: worldRect.x, y: worldRect.y });
// //         const canSize = this.WorldToCanvasVector({x: worldRect.w, y: worldRect.h });

// //         return new ClientRect(canPos.x, canPos.y, canSize.x, canSize.y);
// //     }

// //     CanvasToWorldRect(canRect)
// //     {
// //         const worldPos = this.CanvasToWorld({ x: canRect.x, y: canRect.y });
// //         const worldSize = this.CanvasToWorldVector({x: canRect.w, y: canRect.h });

// //         return new ClientRect(worldPos.x, worldPos.y, worldSize.x, worldSize.y);
// //     }

// //     // same but no offset
// //     WorldToCanvasVector(worldVector)
// //     {
// //         return { 
// //             x: this.WorldToCanvasScale(worldVector.x), 
// //             y: this.WorldToCanvasScale(worldVector.y)
// //         };
// //     }

// //     CanvasToWorldVector(canvasVector)
// //     {
// //         return { 
// //             x: this.CanvasToWorldScale(canvasVector.x), 
// //             y: this.CanvasToWorldScale(canvasVector.y)
// //         };
// //     }

// //     WorldToCanvasScale(worldScale)
// //     {
// //         return worldScale * this.zoom;
// //     }

// //     CanvasToWorldScale(canvasScale)
// //     {
// //         return canvasScale / this.zoom;
// //     }
// // }

