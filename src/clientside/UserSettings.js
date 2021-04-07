
const Settings = require('../Settings');
const { SliderSetting, RadioSetting, Description } = require('../SettingsComponents');

const userSettingsTemplate = 
[
    // new SliderSetting('volume',           0,      'Volume',         0,      1,      0.01),
    new RadioSetting('graphics', 'high', 'Graphics', [['low', 'Low'], ['high', 'High'], ['ultra', 'Ultra']]),
    new Description('The graphics setting mainly controls the resolution of the waves. Higher looks better, but is slower.'),
    new SliderSetting('joystickSize',     1,      'Joystick Size',  0.5,    1.5,    0.01),
];

class UserSettings extends Settings
{
    constructor(isMobile)
    {
        super(userSettingsTemplate);

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
        else
        {
            if (isMobile)
            {
                this['graphics'] = 'low';
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

    createUI()
    {
        super.createUI('Settings');
    }
}

module.exports = { UserSettings, userSettingsTemplate };