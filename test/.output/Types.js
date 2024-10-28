const Class = require("./Class.js");
const Enumeration = require("./Enumeration.js");
const _private = Class.getKeySymbols("17d2e995");
function Types(){
    Enumeration.apply(this,arguments);
    Object.defineProperty(this,_private,{
        value:{
            age:30
        }
    });
}
Class.creator(Types,{
    m:513,
    name:"Types",
    private:_private,
    inherit:Enumeration,
    methods:{
        ADDRESS:{
            m:896,
            value:0
        },
        NAME:{
            m:896,
            value:1
        },
        disable:{
            m:896,
            value:'禁用'
        },
        enable:{
            m:896,
            value:'启用'
        },
        Ser1:{
            m:896,
            value:'A'
        },
        Ser2:{
            m:896,
            value:"B"
        },
        Ser3:{
            m:896,
            value:"C"
        },
        pe:{
            m:776,
            writable:true,
            value:'s'
        }
    },
    members:{
        age:{
            m:2056,
            writable:true
        },
        label:{
            m:544,
            value:function label(){
                switch(this.value){
                    case Types.ADDRESS :
                        return '地址';
                    case Types.NAME :
                        return '名称';
                }
                return this.name;
            }
        }
    }
});
module.exports=Types;