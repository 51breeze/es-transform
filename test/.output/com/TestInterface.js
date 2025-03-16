const Class = require("./../Class.js");
const _private = Class.getKeySymbols("ef719651");
function TestInterface(){
    this.key=null;
    Object.defineProperty(this,_private,{
        value:{}
    });
}
Class.creator(TestInterface,{
    m:514,
    ns:"com",
    name:"TestInterface",
    dynamic:true,
    private:_private,
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