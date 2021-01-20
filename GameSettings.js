

class GameSettings
{
    // DEBUG
    static drawWallBleedMargin = true;
    // static drawRangeRect = true;
    // static drawRangeRectWithBleed = true;
    // static drawCollisionIterations = true;

    // PHYSICS
    static collisionIterations = 3;
    static rangeRectMargin = 0.5;

    // SOUNDWAVE TECHNICAL
    static soundWaveResolution = 20;

    // PLAYER
    static playerSize = 0.04;
    static playerSpeed = 0.4;
    static sqrPlayerStepDist = 0.06;
    static sneakFactor = 0.5;

    // MAP
    static mapSize = 3; // map width and height: 2 * mapSize + 1
}

module.exports = GameSettings;
