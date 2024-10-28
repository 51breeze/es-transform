const Class = require("./../Class.js");
function TestInterface(){
    this.key=null;
}
Class.creator(TestInterface,{
    m:514,
    ns:"com",
    name:"TestInterface",
    dynamic:true,
    members:{
        name:{
            m:576,
            get:true,
            set:true
        },
        avg:{
            m:544
        },
        method:{
            m:544
        }
    }
});
module.exports=TestInterface;