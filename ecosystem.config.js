const dotenv = require('dotenv/config')
module.exports = {
    apps: [{
        "name": "credit",
        "script": "./dist/strest.service.js",
        "instances": "1",
        "exec_mode": "cluster",
        env: {
            "NODE_ENV": "production",
            "log_date_format": "YYYY-MM-DD HH:mm Z",
            "node_args": dotenv
        },

    }]
}