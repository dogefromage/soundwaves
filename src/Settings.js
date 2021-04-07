
const { EventHandler } = require('./EventHandler');
const Panel = require('./clientside/Panel');

class Settings extends EventHandler
{
    constructor(settingsList, title)
    {
        super();

        this.settingsList = settingsList;
        this.panel = new Panel(title);

        for (let { propertyName, defaultVal } of this.settingsList)
        {
            if (propertyName) // sometimes is null because descriptions
            {
                this[propertyName] = defaultVal;
            }
        }
    }

    toArray(settingsList)
    {
        let arr = [];
        for (let { propertyName } of this.settingsList)
        {
            if (propertyName)
            {
                arr.push(this[propertyName]);
            }
        }
        return arr;
    }

    static FromArray(settingsList, Type, arr)
    {
        let settings = new Type();

        if (!(arr instanceof Array))
        {
            return;
        }

        let arrCopy = arr.slice();

        for (let { propertyName, defaultVal } of settingsList)
        {
            if (propertyName)
            {
                if (arrCopy.length > 0)
                {
                    settings[propertyName] = arrCopy.shift() || defaultVal;
                }
                else
                {
                    return undefined;
                }
            }
        }
        return settings;
    }

    generateUI()
    {
        let items = [];

        // display
        for (let setting of this.settingsList)
        {
            const currValue = this[setting.propertyName];
            const onchange = (value) =>
            {
                this[setting.propertyName] = value;
                this.call(setting.propertyName); // calls event
            }

            const settingElement = setting.createElement(currValue, onchange);

            if (settingElement)
            {
                items.push(settingElement)
            }
        }

        this.panel.generate(items);
    }

    destroyUI()
    {
        this.panel.destroy();
    }
}

module.exports = Settings;