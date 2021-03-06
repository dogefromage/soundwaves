
const Settings = require('./Settings');
const { Setting, HiddenSetting, SliderSetting, RadioSetting, Description } = require('./SettingsComponents');

const gameSettingsTemplate = 
[
    new Description('Here you can create your own room. Your friends can join by entering the link in your searchbar. The room will automatically close after 30s if it is left empty.'),
    new SliderSetting('maxPlayers', 10, 'Number of Players', 2, 10, 1, false),
    new SliderSetting('mapSize', 3, 'Map Size', 1, 5, 1, false),
    
    new Description('<h3>Players</h3>'),
    new SliderSetting('playerSize', 0.04, 'Player Size', 0.02, 0.08, 0.0005),
    new SliderSetting('playerSpeed', 0.4, 'Player Speed', 0.1, 1, 0.01),
    new SliderSetting('playerStepDistance', 0.24,   'Soundwave Spawn Rate', 0.15, 0.6, 0.01),
    new SliderSetting('sneakFactor', 0.5, 'Sneak Speed Factor', 0.1, 1, 0.01),
    new SliderSetting('chargeSpeed', 3, 'Player Charge Speed', 1, 10, 0.01),
    new SliderSetting('dischargeSpeed', 0.06, 'Player Discharge Speed', 0, 0.1, 0.005),
    new SliderSetting('regenDelayTime',   10, 'Regeneration Delay', 0, 50, 0.1),
    new SliderSetting('regenRate',   0.03, 'Regeneration Rate', 0, 0.3, 0.01),

    new Description('<h3>Soundwaves</h3>'),
    new SliderSetting('waveSpeed',   1, 'Speed of sound', 0.6, 3, 0.01),
    new SliderSetting('waveDamage',   1, 'Wave Damage', 0.5, 3, 0.01),
    new SliderSetting('waveLifetime',   1, 'Wave Lifetime', 0.5, 1.5, 0.01),

    // hidden
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
