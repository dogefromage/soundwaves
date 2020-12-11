

class Input
{
    static axisX = 0;
    static axisY = 0;
    static angle = 0;

    static keys = [];

    static getKey(key)
    {
        return this.keys[key] || false;
    }

    // ADD EVENTS TO KEY
    static onKey(key , down = () => {}, up = () => {})
    {
        document.addEventListener("keydown", (event) =>
        {
            if (event.code == key)
            {
                Input.keys[key] = true;
                down();
            }
        });

        document.addEventListener("keyup", (event) =>
        {
            if (event.code == key)
            {
                Input.keys[key] = false;
                up();
            }
        });
    }

    // ADD UDPATEAXIS() TO WASD AND ARROWS
    static recordMovement(wasd = true, arrows = true)
    {
        let keyList = [];

        if (wasd)
        {
            keyList.push('KeyW', 'KeyA', 'KeyS', 'KeyD');
        }
        if (arrows)
        {
            keyList.push('ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft');
        }

        for (const key of keyList)
        {
            Input.onKey(key, Input.updateAxis, Input.updateAxis);
        }
    }

    static updateAxis()
    {
        let u = Input.keys['ArrowUp'] || Input.keys['KeyW'] || false;
        let l = Input.keys['ArrowLeft'] || Input.keys['KeyA'] || false;
        let d = Input.keys['ArrowDown'] || Input.keys['KeyS'] || false;
        let r = Input.keys['ArrowRight'] || Input.keys['KeyD'] || false;

        Input.axisX = (r ? 1 : 0) - (l ? 1 : 0);
        Input.axisY = (d ? 1 : 0) - (u ? 1 : 0);
        
        if (Input.axisX != 0 || Input.axisY != 0)
        {
            Input.angle = Math.atan2(Input.axisY, Input.axisX);
        }
    }
}
