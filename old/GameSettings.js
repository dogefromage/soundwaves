
class Setting
{
    constructor(name, value)
    {
        this.name = name;
        this.value = value;
    }
}

const settingsList = 
[
    // propertyname,        default,    display
    [ 'mapSize',            3,      new Setting('Map Size') ],
    [ 'playerSize',         0.04,   new Setting('Player Size') ],
    [ 'playerSpeed',        0.4,    new Setting('Player Speed') ],
    [ 'playerStepDistance', 0.24,   new Setting('Player Step Distance') ],
    [ 'sneakFactor',        0.5,    new Setting('Player Sneak Factor') ],
    [ 'chargeSpeed',        3,      new Setting('Player Charge Speed') ],
    [ 'dischargeSpeed',     0.06,      new Setting('Player Discharge Speed') ],
    
    // static settings
    [ 'walkSmoothness',     5 ],
    [ 'spawnCooldown',      0.5 ],
    [ 'hitCooldown',        0.3 ],
    [ 'colDetectionRange',  0.5 ],
    [ 'clientCorrection',   10 ],
];

class GameSettings
{

    constructor()
    {
        for (let [ key, defaultVal ] of settingsList)
        {
            this[key] = defaultVal;
        }
    }

    toArray()
    {
        let arr = [];
        for (let [ key ] of settingsList)
        {
            arr.push(this[key]);
        }
        return arr;
    }

    static FromArray(arr)
    {
        let settings = new GameSettings();

        for (let [ key, defaultval ] of settingsList)
        {
            settings[key] = arr.shift() || defaultval;
        }

        return settings;
    }
}

module.exports = { GameSettings, settingsList };
