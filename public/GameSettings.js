

class GameSettings
{
    // DEBUG
    // static drawWallBleedMargin = true;
    // static drawRangeRect = true;
    // static drawRangeRectWithBleed = true;
    // static drawCollisionIterations = true;

    // PHYSICS
    static collisionIterations = 3;
    static rangeRectMargin = 0.5;

    // RENDERING
    static canvasBlack = "#000000";
    // static canvasBlack = "#030303";
    static fadeClearColor = "#00000044"; 
    
    // SOUNDWAVE TECHNICAL
    static soundWaveResolution = 100;
    static speedOfSound = 0.7;
    // static waveLineWidth = 2;
    static soundwaveBleed = 0.01;

    // SOUNDWAVE GAMEPLAY
    static waveTime_sneak = 0.3;
    static waveTime_walk = 1;
    
    // PLAYER
    static playerSize = 0.05;
    static playerSpeed = 0.5;
    static sqrPlayerStepDist = 0.06;
    static sneakFactor = 0.5;
}
