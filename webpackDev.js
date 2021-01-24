const path = require('path');

module.exports = 
{
    mode: 'development',
    devtool: 'inline-nosources-source-map',
    entry: './public/src/client.js',
    output:
    {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'main.js',
    },
}
