require("./Person-5fe9942f.css.js");
const Class = require("./Class.js");
const TestInterface = require("./com/TestInterface.js");
const _private0 = Class.getKeySymbols("23464b8f");
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