
export class Input
{
    constructor()
    {
        this.axisX = 0;
        this.axisY = 0;
        this.angle = 0;
        this.keys = new Map();
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

    updateAxis(sender) // cannot use 'this' because anonymous so must use 'sender' :(
    {
        let u = sender.getKey('ArrowUp') || sender.getKey('KeyW');
        let l = sender.getKey('ArrowLeft') || sender.getKey('KeyA');
        let d = sender.getKey('ArrowDown') || sender.getKey('KeyS');
        let r = sender.getKey('ArrowRight') || sender.getKey('KeyD');

        sender.axisX = (r ? 1 : 0) - (l ? 1 : 0);
        sender.axisY = (d ? 1 : 0) - (u ? 1 : 0);
        
        if (sender.axisX != 0 || sender.axisY != 0)
        {
            sender.angle = Math.atan2(sender.axisY, sender.axisX);
        }
    }
}
