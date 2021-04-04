
class Setting
{
    constructor(propertyName, defaultVal, name)
    {
        this.propertyName = propertyName;
        this.name = name;
        this.defaultVal = defaultVal;
    }

    createElement()
    {
        // only works on client
        if (document)
        {
            // <div class="setting">
            //     <span>ASDASDASD</span>
            // </div>

            const el = document.createElement('div');
            el.classList.add('setting');
            el.innerHTML = '<span>' + this.name + '</span>'

            return el;
        }
    }
}

class HiddenSetting extends Setting
{
    constructor(propertyName, defaultVal)
    {
        super(propertyName, defaultVal, "");
    }

    createElement() {} // clears this function
}

class SliderSetting extends Setting
{
    constructor(propertyName, defaultVal, name, min, max, step)
    {
        super(propertyName, defaultVal, name);
        
        this.min = min;
        this.max = max;
        this.step = step;
    }

    createElement(value, onchange = undefined)
    {
        // only works on client
        if (document)
        {
            // <div class="setting">
            //     <span>ASDASDASD</span>
            //     <input class="slider-setting" type=range min=0 max=100 value=50>
            // </div>

            const el = document.createElement('div');
            el.classList.add('setting');

            const span = document.createElement('span');
            span.innerHTML = this.name;
            el.appendChild(span);

            const slider = document.createElement('input');
            slider.classList.add('slider-setting');
            slider.type = 'range';
            slider.min = this.min;
            slider.max = this.max;
            slider.step = this.step;
            slider.value = value;
            if (onchange)
            {
                slider.addEventListener('change', onchange);
            }
            el.appendChild(slider);

            return el;
        }
    }
}

module.exports = 
{
    	Setting, HiddenSetting, SliderSetting
}