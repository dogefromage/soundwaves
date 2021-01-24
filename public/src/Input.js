

export class Input
{
    constructor()
    {
        this.axisX = 0;
        this.axisY = 0;
        this.angle = 0;
        this.keys = [];
    }

    getKey(key)
    {
        return this.keys[key] || false;
    }

    // ADD EVENTS TO KEY
    onKey(key , down = () => {}, up = () => {})
    {
        document.addEventListener("keydown", (event) =>
        {
            if (event.code == key)
            {
                this.keys[key] = true;
                down(this);
            }
        });

        document.addEventListener("keyup", (event) =>
        {
            if (event.code == key)
            {
                this.keys[key] = false;
                up(this);
            }
        });
    }

    // ADD UDPATEAXIS() TO WASD AND ARROWS
    recordMovement(wasd = true, arrows = true)
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
            this.onKey(key, this.updateAxis, this.updateAxis);
        }
    }

    updateAxis(sender)
    {
        let u = sender.keys['ArrowUp'] || sender.keys['KeyW'] || false;
        let l = sender.keys['ArrowLeft'] || sender.keys['KeyA'] || false;
        let d = sender.keys['ArrowDown'] || sender.keys['KeyS'] || false;
        let r = sender.keys['ArrowRight'] || sender.keys['KeyD'] || false;

        sender.axisX = (r ? 1 : 0) - (l ? 1 : 0);
        sender.axisY = (d ? 1 : 0) - (u ? 1 : 0);
        
        if (sender.axisX != 0 || sender.axisY != 0)
        {
            sender.angle = Math.atan2(sender.axisY, sender.axisX);
        }
    }
}
