const path = require('path');
const ip = require('ip');

module.exports = {
    paths: {
        /* Path to source files directory */
        source: path.resolve(__dirname, '../src/'),

        /* Path to built files directory */
        output: path.resolve(__dirname, '../dist/'),

        /* Assets */
        images: path.resolve(__dirname, '../src/images/'),
        fonts: path.resolve(__dirname, '../src/fonts/'),
    },
    server: {
        host: ip.address(),
        port: 8000,
    },
    limits: {
        /* Image files size in bytes. Below this value the image file will be served as DataURL (inline base64). */
        images: 8192,

        /* Font files size in bytes. Below this value the font file will be served as DataURL (inline base64). */
        fonts: 8192,
    },
};
