const path = require('path');

module.exports = 
{
    mode: 'development',
    // devtool: 'inline-nosources-source-map',
    // devtool: 'inline-cheap-module-source-map',
    entry: './public/src/client.js',
    output:
    {
        path: path.resolve(__dirname, 'public/dist/static'),
        filename: 'main.js',
    },
    resolve: 
    {

    }
}
