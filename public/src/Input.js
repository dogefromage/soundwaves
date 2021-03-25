import { Vec2 } from "../../Vector";

export class Input
{
    constructor(camera, game)
    {
        this.keys = new Map(); // stores keys
        this.history = []; // records changes in input to be sent to server
        
        ////////////////////// MOVEMENT ////////////////////////
        this.axes = new Vec2(); // for saving last state
        let updateAxes = () =>
        {
            let u = this.getKey('ArrowUp') || this.getKey('KeyW');
            let d = this.getKey('ArrowDown') || this.getKey('KeyS');
            let l = this.getKey('ArrowLeft') || this.getKey('KeyA');
            let r = this.getKey('ArrowRight') || this.getKey('KeyD');
            let x = (r ? 1 : 0) - (l ? 1 : 0);
            let y = (d ? 1 : 0) - (u ? 1 : 0);

            // push history ONLY if axis has changed
            if (this.axes.x != x)
            {
                this.axes.x = x;
                this.history.push({x});
            }
            if (this.axes.y != y)
            {
                this.axes.y = y;
                this.history.push({y});
            }
        }
        // attach function to a eventlistener for every key
        for (const key of [ 'KeyA', 'KeyD', 'ArrowRight', 'ArrowLeft', 'KeyW', 'KeyS', 'ArrowUp', 'ArrowDown' ])
        {
            this.onKey(key, updateAxes, updateAxes); // call both if pressed and released
        }

        ////////////////////// SHIFT and SPACE ////////////////////////
        this.lastSpace = false;
        let spaceCallback = () =>
        {
            let space = this.getKey('Space');
            if (space != this.lastSpace)
            {
                this.lastSpace = space;
                this.history.push({ space })
            }
        }
        this.onKey('Space', spaceCallback, spaceCallback); // also when pressed and released

        this.lastShift = false;
        let shiftCallback = () =>
        {
            let shift = this.getKey('ShiftLeft');
            if (shift != this.lastShift)
            {
                this.lastShift = shift;
                this.history.push({ shift })
            }
        }
        this.onKey('ShiftLeft', shiftCallback, shiftCallback); // also when pressed and released
    
        ////////////////////// MOUSE ////////////////////////
        document.addEventListener('mousedown', (e) =>
        {
            this.history.push({ mouse: true });
        });

        document.addEventListener('mouseup', (e) =>
        {
            if (game.mainPlayer)
            {
                let mousePos = camera.CanvasToWorld(new Vec2(e.offsetX, e.offsetY));
                let playerCenter = new Vec2(game.mainPlayer.getCenterX(), game.mainPlayer.getCenterY());
                let deltaPos = playerCenter.sub(mousePos).mult(-1); // flip dir bc. sub function can only be called on vector
                let angle = Number(deltaPos.heading().toFixed(3));
                this.history.push({ mouse: false, angle })
            }
        });
    }

    getKey(key)
    {
        return this.keys.get(key) || false;
    }

    // ADD EVENTS TO KEY
    onKey(key , down = () => {}, up = () => {})
    {
        document.addEventListener("keydown", (event) =>
        {
            if (event.code == key)
            {
                this.keys.set(key, true);
                down(this);
            }
        });

        document.addEventListener("keyup", (event) =>
        {
            if (event.code == key)
            {
                this.keys.set(key, false);
                up(this);
            }
        });
    }

    getChanges()
    {
        return [ this.history, this.history = [] ][0]; // swap 'n' clear
    }
}



export class TouchInput
{
    constructor(camera, game)
    {
        this.axisX = 0;
        this.axisY = 0;

        // JOYSTICK
        const joystick = document.getElementById('joystick-handler');
        const thumb = document.getElementById('joystick-thumb');

        const setThumbPosition = (x, y) =>
        {
            const joystickRect = joystick.getBoundingClientRect();
            const thumbRect = thumb.getBoundingClientRect();
            const marginFactor = (joystickRect.width - thumbRect.width) / joystickRect.width;

            thumb.style.left = 0.5 * (marginFactor * x + 1) * joystickRect.width - 0.5 * thumbRect.width + "px";
            thumb.style.top = 0.5 * (marginFactor * y + 1) * joystickRect.height - 0.5 * thumbRect.height + "px";
        }

        const joystickClicked = (touch) => 
        {
            const joystickRect = joystick.getBoundingClientRect();
            const thumbRect = thumb.getBoundingClientRect();
            const marginFactor = (joystickRect.width - thumbRect.width) / joystickRect.width;
            
            let x = (touch.clientX - joystickRect.x) / joystickRect.width;
            let y = (touch.clientY - joystickRect.y) / joystickRect.height;
            x = (2 * x - 1) / marginFactor;
            y = (2 * y - 1) / marginFactor;

            let m = Math.hypot(x, y);
            if (m > 1)
            {
                // conserve angle when limiting length
                let angle = Math.atan2(y, x);
                x = Math.cos(angle);
                y = Math.sin(angle);
            }
        
            this.axisX = x;
            this.axisY = y;

            // console.log(this.axisX, this.axisY);
            
            setThumbPosition(x, y);
        };

        joystick.addEventListener('touchstart', (e) => 
        {
            let touch = e.changedTouches[0];
            if (touch)
            {
                joystickClicked(touch);
            }
        });

        joystick.addEventListener('touchmove', (e) => 
        {
            let touch = e.changedTouches[0];
            if (touch)
            {
                joystickClicked(touch);
            }
        });

        joystick.addEventListener('touchend', (e) => 
        {
            setThumbPosition(0, 0);
            this.axisX = this.axisY = 0;

            // console.log(this.axisX, this.axisY);
        });

        joystick.addEventListener('touchcancel', (e) => 
        {
            setThumbPosition(0, 0);
            this.axisX = this.axisY = 0;
        });
    }

    getChanges()
    {
        return [];
    }
}