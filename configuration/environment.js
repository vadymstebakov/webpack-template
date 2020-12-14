const path = require('path');
const ip = require('ip');

module.exports = {
    paths: {
        source: path.resolve(__dirname, '../src/'),
        output: path.resolve(__dirname, '../dist/'),
        images: path.resolve(__dirname, '../src/images/'),
        fonts: path.resolve(__dirname, '../src/fonts/'),
    },
    server: {
        host: ip.address(),
        port: 8000,
    },
    limits: {
        images: 8192,
        fonts: 8192,
    },
};
