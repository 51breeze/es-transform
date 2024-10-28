const Class = require("./../Class.js");
function Param(){}
Class.creator(Param,{
    m:513,
    ns:"unit",
    name:"Param",
    members:{
        start:{
            m:544,
            value:function start(){
                var en = (en={},en[en["name1000"]=6]="name1000",en[en["age"]=7]="age",en);
                var b = en.age;
                var result = this.getList(en,[en.name1000,5]);
                it("test getList",()=>{
                    expect(6).toBe(result);
                });
                this.ave(2.3660);
            }
        },
        getList:{
            m:544,
            value:function getList({name1000,age},[index,id=20]){
                var args = [index,id];
                it("test call",()=>{
                    var b = this.call(...args);
                    expect(5).toBe(b);
                });
                return name1000;
            }
        },
        call:{
            m:544,
            value:function call(index,id){
                return id;
            }
        },
        ave:{
            m:544,
            value:function ave(age){
                return age;
            }
        }
    }
});
module.exports=Param;