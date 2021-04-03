const path = require('path');

module.exports = 
{
    mode: 'development',
    entry: './src/clientside/client.js',
    output:
    {
        path: path.resolve(__dirname, 'src/clientside/static'),
        filename: 'main.js',
    },
}
