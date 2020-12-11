

class GameSettings
{
    // DEV
    static debug = false;

    // RENDERING
    static canvasBlack = "#030303";
    static fadeClearColor = "#00000022"; 
    
    // SOUNDWAVE
    static soundWaveResolution = 100;
    static speedOfSound = 2.5;
    static waveLineWidth = 5;
    static soundwaveBleed = 0.05;
    
    // GAMEPLAY
    static playerSize = 0.2;
    static playerSpeed = 0.03;
    static sqrPlayerStepDist = 0.2;
    static waveLowestPower = 0.05;

    // PROJECTILES
    static projectileSpeed = 0.08;
    static projectileSize = 0.05;
}

module.exports = GameSettings;