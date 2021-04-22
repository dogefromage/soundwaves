

class AudioController
{
    constructor()
    {
        this.sounds = new Map();
        this.audioContainer;    
    }

    addSound(name, path)
    {
        if (!this.audioContainer)
        {
            this.audioContainer = document.getElementById('audio-container');
        }

        let audioClip = document.createElement('audio');
        audioClip.src = path;
        this.sounds.set(name, audioClip);
        
    }
}