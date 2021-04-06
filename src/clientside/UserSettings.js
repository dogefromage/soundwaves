
const Settings = require('../Settings');
const { Setting, HiddenSetting, SliderSetting, RadioSetting } = require('../SettingsComponents');

const userSettingsTemplate = 
[
    // new SliderSetting('volume',           0,      'Volume',         0,      1,      0.01),
    new SliderSetting('joystickSize',     1,      'Joystick Size',  0.5,    1.5,    0.01),
    new RadioSetting('graphics', 'high', 'Graphics', [['low', 'Low'], ['high', 'High'], ['ultra', 'Ultra']]),
];

class UserSettings extends Settings
{
    constructor()
    {
        super(userSettingsTemplate, 'Settings');

        let lastSettingsJSON = window.localStorage.getItem('fl-usersettings');
        if (lastSettingsJSON)
        {
            let lastSettings = JSON.parse(lastSettingsJSON);
            if (lastSettings)
            {
                for (let { propertyName } of userSettingsTemplate)
                {
                    if (lastSettings.hasOwnProperty(propertyName))
                    {
                        this[propertyName] = lastSettings[propertyName];
                    }
                }
            }
        }

        // add save() to all events
        for (let { propertyName } of userSettingsTemplate)
        {
            this.addEventListener(propertyName, () => 
            {
                this.save();   
            });
        }
    }

    toArray()
    {
        return super.toArray(userSettingsTemplate);
    }

    static FromArray(arr)
    {
        return super.FromArray(userSettingsTemplate, UserSettings, arr);
    }

    save()
    {
        let settingsObj = {};

        // add save() to all events
        for (let { propertyName } of userSettingsTemplate)
        {
            settingsObj[propertyName] = this[propertyName];
        }

        let json = JSON.stringify(settingsObj);
        window.localStorage.setItem('fl-usersettings', json);
    }
}

module.exports = { UserSettings, userSettingsTemplate };