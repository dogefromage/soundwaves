const path = require('path');

module.exports = 
{
    mode: 'production',
    entry: './public/src/client.js',
    output:
    {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'main.js',
    },
}
