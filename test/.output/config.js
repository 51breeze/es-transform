const Class = require("./Class.js");
const System = require("./System.js");
const Conf1 = require("./config2.js");
const Person = require("./com/Person.js");
const TestInterface = Class.getExportDefault(require("./com/TestInterface.js"));
const {TestInterface2:com_TestInterface2} = require("./com/TestInterface.js");
const {name:child_name} = require("./config_child.js");
System.setConfig('ssss',222);
const config = {}
config.env='prod';
new Person();
console.log(TestInterface,com_TestInterface2);
module.exports={
    ...(require("./config_child.js") || {}),
    imgHost:'http://127.0.0.1:8090/img',
    name:'php',
    default:config,
    child_name,
    child_config:require("./config_child.js")
}