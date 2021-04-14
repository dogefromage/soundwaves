
const Settings = require('./Settings');
const { Setting, HiddenSetting, SliderSetting, RadioSetting, Description } = require('./SettingsComponents');

const gameSettingsTemplate = 
[
    new Description('Do not create a room please.'),
    new SliderSetting('maxPlayers', 10, 'Number of Players', 2, 10, 1),
    new SliderSetting('mapSize', 3, 'Map Size', 1, 5, 1),
    new SliderSetting('playerSize', 0.04, 'Player Size', 0.02, 0.08, 0.0005),
    new SliderSetting('playerSpeed', 0.4, 'Player Speed', 0.1, 1, 0.01),
    new SliderSetting('playerStepDistance', 0.24,   'Soundwave Spawn Rate', 0.15, 0.6, 0.01),
    new SliderSetting('sneakFactor', 0.5, 'Sneak Speed Factor', 0.1, 1, 0.01),
    new SliderSetting('chargeSpeed', 3, 'Player Charge Speed', 1, 10, 0.01),
    new SliderSetting('dischargeSpeed', 0.06, 'Player Discharge Speed', 0, 0.1, 0.005),
    new SliderSetting('regenDelayTime',   10, 'Regeneration Delay', 0, 50, 0.1),
    new SliderSetting('regenRate',   0.03, 'Regeneration Rate', 0, 0.3, 0.01),
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

    createUI()
    {
        super.createUI('Create Room');
    }
}

module.exports = { GameSettings, gameSettingsTemplate };
