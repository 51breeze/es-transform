require("./asstes/Person-4c6b0d54.js");
const Class = require("./Class.js");
const TestInterface = Class.getExportDefault(require("./com/TestInterface.js"));
const System = require("./System.js");
const _private0 = Class.getKeySymbols("9a8cd9ba");
function Person(name){
    this.addressName=`the Person properyt "addressName"`;
    Object.defineProperty(this,_private0,{
        value:{
            _name:'',
            _type:null
        }
    });
    this[_private0]._name=name;
}
Class.creator(Person,{
    m:513,
    name:"Person",
    dynamic:true,
    private:_private0,
    imps:[TestInterface],
    members:{
        addressName:{
            m:520,
            writable:true,
            enumerable:true
        },
        _name:{
            m:2056,
            writable:true
        },
        _type:{
            m:2056,
            writable:true
        },
        asyncMethod:{
            m:544,
            value:async function asyncMethod(){
                let data = await System.createHttpRequest(net_Http,{
                    url:"/com/Person/list",
                    allowMethod:["post"],
                    param:{
                        tag:this[_private0]._name
                    }
                });
                const params = {}
                params.viewId=6;
                return System.createHttpRoute("/person/<viewId?>",Object.assign({
                    viewId:6
                },params));
            }
        },
        target:{
            m:576,
            enumerable:true,
            get:function target(){
                return this;
            }
        },
        setType:{
            m:544,
            value:function setType(a){
                this[_private0]._type=a;
                var _private = 1;
                return a;
            }
        },
        method:{
            m:544,
            value:function method(name,age){
                var str = ["a","1"];
                var b = ["",["1",1]];
                var cc = [1];
                var x = [1,1,'2222',[{}]];
                b.push('1');
                b.push(['1',1]);
                var c = -1968;
                var bs = 22.366;
                var bssd = -22.366;
                Person.prototype.address.call(this.target);
                return "sssss";
            }
        },
        name:{
            m:576,
            enumerable:true,
            get:function name(){
                return this[_private0]._name;
            },
            set:function name(val){
                this[_private0]._name=val;
            }
        },
        avg:{
            m:544,
            value:function avg(a,b){
                return a;
            }
        },
        address:{
            m:2080,
            value:function address(data){}
        },
        addressNamesss:{
            m:1056,
            value:function addressNamesss(){
                arguments.length;
            }
        },
        testWhen:{
            m:544,
            value:function testWhen(){
                return 1;
            }
        }
    }
});
module.exports=Person;