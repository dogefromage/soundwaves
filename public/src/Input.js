import { Vec2 } from "../../Vector";

class InputEvent
{
    constructor()
    {
        this.callbacks = new Set();
    }

    addListener(c)
    {
        this.callbacks.add(c);
        return c;
    }

    removeListener(c)
    {
        this.callbacks.delete(c);
        return c;
    }

    invoke(event)
    {
        for (const callback of this.callbacks)
        {
            callback(event);
        }
    }
}

export class Input
{
    constructor(camera, game)
    {
        this.camera = camera;
        this.game = game;

        /////////////////////// EVENTS ///////////////////////
        this.events = new Map([
            [ 'chargestart', new InputEvent() ],
            [ 'chargemove', new InputEvent() ],
            [ 'chargestop', new InputEvent() ],
        ]);
        
        /**
         * input events, which are sent to server - only start and end needed
         */
        this.addEventListener('chargestart', () =>
        {
            this.history.push({ charge: true });
        });
        this.addEventListener('chargestop', ({ angle }) =>
        {
            this.history.push({ charge: false, angle });
        });

        /////////////////////// MOVEMENT ///////////////////////
        this.keys = new Map(); // stores keys
        
        this.axisX = 0;
        this.axisY = 0;

        this.lastX = this.lastY = 0;

        this.isCharging = false;

        this.history = [];

        let updateAxes = () =>
        {
            let u = this.getKey('ArrowUp') || this.getKey('KeyW');
            let d = this.getKey('ArrowDown') || this.getKey('KeyS');
            let l = this.getKey('ArrowLeft') || this.getKey('KeyA');
            let r = this.getKey('ArrowRight') || this.getKey('KeyD');
            let x = (r ? 1 : 0) - (l ? 1 : 0);
            let y = (d ? 1 : 0) - (u ? 1 : 0);

            let m = Math.hypot(x, y);
            if (m > 1)
            {
                x /= m;
                y /= m;
            }

            if (this.getKey('ShiftLeft'))
            {
                x *= window.gameSettings.sneakFactor;
                y *= window.gameSettings.sneakFactor;
            }

            this.axisX = x;
            this.axisY = y;
        }
        // attach function to a eventlistener for every key
        for (const key of [ 'KeyA', 'KeyD', 'ArrowRight', 'ArrowLeft', 'KeyW', 'KeyS', 'ArrowUp', 'ArrowDown' ])
        {
            this.onKey(key, updateAxes, updateAxes); // call both if pressed and released
        }

        /////////////////////// JOYSTICK MOVEMENT ////////////////////////
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

            setThumbPosition(x, y);
        };

        const touchOptions = 
        {
            passive: false
        };

        this.leftTouchIdentifier;

        joystick.addEventListener('touchstart', (e) => 
        {
            e.preventDefault();

            let touch = e.changedTouches[0];
            if (touch)
            {
                this.leftTouchIdentifier = touch.identifier;
                joystickClicked(touch);
            }
        }, touchOptions);

        joystick.addEventListener('touchmove', (e) => 
        {
            e.preventDefault();

            // get the correct touch event
            let touch;
            for (let t of e.changedTouches)
            {
                if (t.identifier == this.leftTouchIdentifier)
                {
                    touch = t;
                    break;
                }
            }

            if (touch)
            {
                joystickClicked(touch);
            }
        }, touchOptions);

        joystick.addEventListener('touchend', (e) => 
        {
            e.preventDefault();

            setThumbPosition(0, 0);
            this.axisX = this.axisY = 0;
        }, touchOptions);

        joystick.addEventListener('touchcancel', (e) => 
        {
            e.preventDefault();
            
            setThumbPosition(0, 0);
            this.axisX = this.axisY = 0;
        }, touchOptions);

        /////////////////////// SHIFT ///////////////////////
        this.onKey('ShiftLeft'); // also when pressed and released
    
        /////////////////////// MOUSE ///////////////////////
        const calcAngle = (x, y) => // calcs angle of vector from player to cursor or finger
        {
            let mousePos = camera.CanvasToWorld({ x, y });
            let playerCenter = new Vec2(game.mainPlayer.getCenterX(), game.mainPlayer.getCenterY());
            let deltaPos = playerCenter.sub(mousePos).mult(-1); // flip dir bc. sub function can only be called on vector
            return Number(deltaPos.heading().toFixed(3));
        };

        document.addEventListener('mousedown', (e) =>
        {
            if (e.path[0].id == 'joystick-handler')
            {
                // when joystick is hit, charge should not be activated
                return;
            };

            if (game.mainPlayer)
            {
                this.isCharging = true;
                this.events.get('chargestart').invoke();
            }
        });

        document.addEventListener('mousemove', (e) =>
        {
            if (e.path[0].id == 'joystick-handler')
            {
                // when joystick is hit, charge should not be deactivated
                return;
            };

            if (game.mainPlayer && this.isCharging) // PROBABLY changes nothing
            {
                let angle = calcAngle(e.offsetX, e.offsetY);

                this.events.get('chargemove').invoke({ angle });
            }
        });

        document.addEventListener('mouseup', (e) =>
        {
            if (e.path[0].id == 'joystick-handler')
            {
                // when joystick is hit, charge should not be deactivated
                return;
            };

            if (game.mainPlayer) // PROBABLY changes nothing
            {
                let angle = calcAngle(e.offsetX, e.offsetY);

                this.isCharging = false;

                this.events.get('chargestop').invoke({ angle });
            }
        });

        /////////////////////// TOUCH AIMING ///////////////////////
        const aimArea = document.getElementById('aiming-handler');
        this.touchAimStartX = 0;
        this.lastTouchAngle = 0;
        this.rightTouchIdentifier;

        aimArea.addEventListener('touchstart', (e) =>
        {
            e.preventDefault();

            let touch = e.changedTouches[0];
            if (touch)
            {
                this.rightTouchIdentifier = touch.identifier;

                this.touchAimStartX = touch.clientX;

                this.events.get('chargestart').invoke();
            }
        }, touchOptions);

        const calcTouchAngle = (deltaX) =>
        {
            return 0.06 * deltaX; // add setting in menu for this
        };

        aimArea.addEventListener('touchmove', (e) =>
        {
            e.preventDefault();

            // get the correct touch event
            let touch;
            for (let t of e.changedTouches)
            {
                if (t.identifier == this.rightTouchIdentifier)
                {
                    touch = t;
                    break;
                }
            }

            if (touch)
            {
                let deltaX = touch.clientX - this.touchAimStartX;

                let angle = this.lastTouchAngle + calcTouchAngle(deltaX);

                this.events.get('chargemove').invoke({ angle });
            }
        }, touchOptions);

        aimArea.addEventListener('touchend', (e) =>
        {
            // get the correct touch event
            let touch;
            for (let t of e.changedTouches)
            {
                if (t.identifier == this.rightTouchIdentifier)
                {
                    touch = t;
                    break;
                }
            }

            if (touch)
            {
                let deltaX = touch.clientX - this.touchAimStartX;
                let angle = this.lastTouchAngle + calcTouchAngle(deltaX);
                this.lastTouchAngle = angle;

                this.events.get('chargestop').invoke({ angle });
            }
        }, touchOptions);
    }

    addEventListener(eventName, callback)
    {
        let event = this.events.get(eventName)
        if (event)
        {
            return event.addListener(callback);
        }
    }

    removeEventListener(eventName, callback)
    {
        let event = this.events.get(eventName);
        if (event)
        {
            return event.removeListener(callback);
        }
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
        if (this.lastX != this.axisX)
        {
            let x = Number(this.axisX.toFixed(3)); // reduce size
            this.history.push({ x });
        }
        if (this.lastY != this.axisY)
        {
            let y = Number(this.axisY.toFixed(3));
            this.history.push({ y });
        }

        this.lastX = this.axisX;
        this.lastY = this.axisY;

        return [ this.history, this.history = [] ][0]; // swap 'n' clear
    }
}
