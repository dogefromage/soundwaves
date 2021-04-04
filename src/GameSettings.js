
const Settings = require('./Settings');
const { Setting, HiddenSetting, SliderSetting } = require('./SettingsComponents');

const gameSettingsTemplate = 
[
    //           propertyname,        default, name
    new Setting('mapSize',            3,      'Map Size'),
    new Setting('playerSize',         0.04,   'Player Size'),
    new Setting('playerSpeed',        0.4,    'Player Speed'),
    new Setting('playerStepDistance', 0.24,   'Player Step Distance'),
    new Setting('sneakFactor',        0.5,    'Player Sneak Factor'),
    new Setting('chargeSpeed',        3,      'Player Charge Speed'),
    new Setting('dischargeSpeed',     0.06,   'Player Discharge Speed'),

    new HiddenSetting('walkSmoothness',     5),
    new HiddenSetting('spawnCooldown',      0.5),
    new HiddenSetting('hitCooldown',        0.3),
    new HiddenSetting('colDetectionRange',  0.1),
    new HiddenSetting('clientCorrection',   10),
];

class GameSettings extends Settings
{
    constructor()
    {
        super(gameSettingsTemplate);
    }

    toArray()
    {
        return super.toArray(gameSettingsTemplate);
    }

    static FromArray(arr)
    {
        return super.FromArray(gameSettingsTemplate, GameSettings, arr);
    }
}

module.exports = { GameSettings, gameSettingsTemplate };
