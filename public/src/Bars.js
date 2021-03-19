import { lerp } from '../../GameMath';

export class Statusbar
{
    constructor(id, startVal = 0)
    {
        this.element = document.getElementById(id);
        this.bar = this.element.getElementsByTagName('span')[0];
        this.text = this.element.getElementsByTagName('div')[0];
        this.currentValue = startVal;
        this.targetValue = -1;

        this.animationFactor = 10;
    }

    set(value)
    {
        this.targetValue = value;
    }

    update(dt)
    {
        const k = this.animationFactor * dt;
        if (this.targetValue >= 0)
        {
            // set width
            this.currentValue = lerp(this.currentValue, this.targetValue, k);
            let val = this.currentValue % 1; // some bars loop
            let width = Math.max(Math.min(val * 100, 100), 0);
            this.bar.style.width = width + '%';

            let compStyle = window.getComputedStyle(this.bar, null);
            let barWidth = parseFloat(compStyle.getPropertyValue("width"));
            let barHeight = parseFloat(compStyle.getPropertyValue("height"));

            if (barHeight >= barWidth)
            {
                let newHeight = Math.max(3, Math.round(barWidth)) + "px";
                this.bar.style.height = newHeight;
            }
            else
            {
                this.bar.style.height = "100%";
            }
        }
    }
}

export class XPBar extends Statusbar
{
    constructor(id, startVal)
    {
        super(id, startVal);

        this.animationFactor = 3;
    }

    update(dt)
    {
        super.update(dt);

        let lvl = Math.floor(this.currentValue);
        this.text.innerHTML = "XP - Level " + lvl;
    }
}