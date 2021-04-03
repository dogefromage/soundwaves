const fs = require('fs');
const path = require('path');

let gameData =
{
    connects: 0,
    joins: 0,
};

function resetGameData()
{
    gameData.connects = 0;
    gameData.joins = 0;
}

module.exports = () =>
{
    return gameData;
};

function runEveryNthHour(callback, n)
{
    const t = 60 * 60 * 1000 * n;
    setInterval(callback, t);
}

function getDate(andTime)
{
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let str = `${year}-${month}-${date}`;

    if (andTime)
    {
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
    
        str += `_${hours}-${minutes}-${seconds}`;
    }

    return str;
}

/**
 * LOG GAME ACTIVITY
 */
runEveryNthHour(() =>
{
    const folderPath = path.join(__dirname, '../logs');
    
    // make directory if doesn't exist
    fs.mkdir(folderPath, 0777, function(err) 
    {
        if (err)
        {
            if (err.code != 'EEXIST')
            {
                console.log("Error while trying to create logs folder");
                console.log(err);
            }
        }
    });

    const data = JSON.stringify(gameData);
    resetGameData();

    let fileName = "gamestats_" + getDate(false) + ".log";
    const filePath = path.join(folderPath, fileName);
    fs.writeFile(filePath, data, function (err) 
    {
        if (err)
        {
            console.log(err);   
        }
    });
}, 24);