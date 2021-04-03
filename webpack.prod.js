const path = require('path');

module.exports = 
{
    mode: 'production',
    entry: './src/clientside/client.js',
    output:
    {
        path: path.resolve(__dirname, 'src/clientside/static'),
        filename: 'main.js',
    },
}
