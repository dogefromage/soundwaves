
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
                slider.addEventListener('change', (e) =>
                {
                    onchange(Number(e.srcElement.value)); // calls callback with new value
                });
            }
            el.appendChild(slider);

            return el;
        }
    }
}

class RadioSetting extends Setting
{
    constructor(propertyName, defaultVal, displayName, radioElements)
    {
        super(propertyName, defaultVal, displayName);
        
        this.radioElements = radioElements; // array
    }

    createElement(value, onchange = undefined)
    {
        // only works on client
        if (document)
        {
            // <div class="setting">
            //     <span>Graphics</span>
            //     <div class="radio-setting">
            //         <input type="radio" name="graphics" id="low-graphics" value="low">
            //         <label for="low-graphics">Low</label>
            //         <input type="radio" name="graphics" id="high-graphics" value="high" checked="checked">
            //         <label for="high-graphics">High</label>
            //         <input type="radio" name="graphics" id="ultra-graphics" value="ultra">
            //         <label for="ultra-graphics">Ultra</label>
            //     </div>
            // </div>

            const el = document.createElement('div');
            el.classList.add('setting');

            const span = document.createElement('span');
            span.innerHTML = this.name;
            el.appendChild(span);

            const radioSetting = document.createElement('div');
            radioSetting.classList.add('radio-setting');
            el.appendChild(radioSetting);

            for (const [ elementID, elementName ] of this.radioElements)
            {
                // INPUT ELEMENT
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = this.propertyName;
                const fullId = this.propertyName + '-' + elementID
                radioInput.id = fullId;
                radioInput.value = elementID;
                if (value == elementID)
                {
                    radioInput.checked = 'checked';
                }
                radioSetting.appendChild(radioInput);

                // LABEL ELEMENT
                const radioLabel = document.createElement('label');
                radioLabel.setAttribute('for', fullId);
                radioLabel.innerText = elementName;
                radioLabel.addEventListener('click', () =>
                {
                    // wait for html to update to new value, otherwise old gets chosen
                    setTimeout(() =>
                    {
                        const query = `input[type=radio][name=${this.propertyName}]:checked`;
                        let el = document.querySelector(query);
                        onchange(el.value);
                    }, 2);
                });
                radioSetting.appendChild(radioLabel);
            }

            return el;
        }
    }
}

class Description extends Setting
{
    constructor(text)
    {
        // propertyName = null ==> no property on settingsObject
        super(null, "", "");
        this.text = text;
    }

    createElement()
    {
        if (document)
        {
            const el = document.createElement('p');
            el.classList.add('description');
            el.innerText = this.text;

            return el;
        }
    }
}

module.exports = 
{
    HiddenSetting, SliderSetting, RadioSetting, Description
}