

let userSettings = new UserSettings();

let lastSettings = window.localStorage.getItem('usersettings');
if (lastSettings)
{
    userSettings = new UserSettings();
    for (let key in lastSettings)
    {
        userSettings[key] = lastSettings[key];
    }
    return userSettings;
}
else
{
    userSettings = new UserSettings(); // returns defaults
}

class UserSettings
{
    constructor()
    {
        this.joystickSize = 1;
        this.isMobile = false;
    }
}