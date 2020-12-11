

const socket = io.connect(location.url);

// set up input
Input.recordMovement();
Input.onKey('Space');

const background = document.getElementById('canvas-background').getContext('2d');
const foreground = document.getElementById('canvas-foreground').getContext('2d');
const w = background.canvas.clientWidth;
const h = background.canvas.clientHeight;

// MAIN LOOP (server controlled)
socket.on('loop', (data) => 
{
    background.fillStyle = "#000000";
    background.fillRect(0, 0, w, h);
    // console.log(data.test);
    
    const input = {
        x: Input.axisX,
        y: Input.axisY,
        shoot: Input.getKey('Space')
    };
    socket.emit('input', input);
});
