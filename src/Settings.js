
const { EventHandler } = require('./EventHandler');

class Settings extends EventHandler
{
    constructor(settingsList, title)
    {
        super();

        this.settingsList = settingsList;
        this.title = title;

        for (let { propertyName, defaultVal } of this.settingsList)
        {
            this[propertyName] = defaultVal;
        }
    }

    toArray(settingsList)
    {
        let arr = [];
        for (let { propertyName } of this.settingsList)
        {
            arr.push(this[propertyName]);
        }
        return arr;
    }

    static FromArray(settingsList, Type, arr)
    {
        let settings = new Type();
        
        let arrCopy = arr.slice();

        for (let { propertyName, defaultVal } of settingsList)
        {
            settings[propertyName] = arrCopy.shift() || defaultVal;
        }

        return settings;
    }

    display(parent)
    {
        // clear parents html
        parent.textContent = '';

        // title
        const titleEl = document.createElement('h1');
        titleEl.textContent = this.title;
        parent.appendChild(titleEl);

        for (let setting of this.settingsList)
        {
            const currValue = this[setting.propertyName];
            const onchange = (e) =>
            {
                this[setting.propertyName] = e.srcElement.value;
                this.call(setting.propertyName); // calls event
            }

            const settingElement = setting.createElement(currValue, onchange);

            if (settingElement)
            {
                parent.appendChild(settingElement);
            }
        }
    }
}

module.exports = Settings;