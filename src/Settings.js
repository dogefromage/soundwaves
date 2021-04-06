
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

    generateUI()
    {
        let items = [];

        debugger

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

            items.push(settingElement)
        }

        this.panel.generate(items);
    }
}

module.exports = Settings;