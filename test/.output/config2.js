const System = require("./System.js");
function config(){
    System.setConfig('http.request.baseURL','/api');
}
module.exports=config;