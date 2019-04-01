switch (process.env.NODE_ENV) {
    case "production": {
        module.exports = require("./config_prod");
        break;
    }
    default: {
        module.exports = require("./config_dev");
    }
}
