package com;

class Decorator implements com.IDecorator{

    @Callable
    constructor(key, name, age){
        let des = Array.from(arguments).slice(1);
        return function(target){
            return function Con(){
                let _args = Array.from(arguments);
                for(let i=0;i<des.length;i++){
                    if(_args[i]==null){
                        _args[i] = `Decorator(${des[i]}) 注入的默认参数`
                    }else{
                        _args[i] = `Decorator(${des[i]}) 拦截的参数(${_args[i]})`
                    }
                }
                Reflect.apply(target, this, _args)
            }
        }
    }
   
}