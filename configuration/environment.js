const path = require('path');
const ip = require('ip');
const portFinderSync = require('portfinder-sync');

const port = portFinderSync.getPort(8000);

module.exports = {
    paths: {
        source: path.resolve(__dirname, '../src/'),
        output: path.resolve(__dirname, '../dist/'),
        images: path.resolve(__dirname, '../src/images/'),
        fonts: path.resolve(__dirname, '../src/fonts/'),
    },
    server: {
        host: ip.address(),
        port,
    },
};
