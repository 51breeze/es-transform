const Conf1 = require("./config2.js");
const System = require("./System.js");
const {name:child_name} = require("./config_child.js");
System.setConfig('ssss',222);
const config = {}
config.env='prod';
module.exports={
    ...(require("./config_child.js") || {}),
    name:'php',
    default:config,
    child_name,
    child_config:require("./config_child.js")
}