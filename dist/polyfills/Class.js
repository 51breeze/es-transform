/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
*/
const __MODULES__= Object.create(null);
const privateKey=Symbol("privateKey");
const bindClassKey=Symbol("bindClass");
const _proto = Object.prototype;
const hasOwn = Object.prototype.hasOwnProperty;
function merge(obj, target, isInstance=false, depth=false){
    if(!obj || !target || _proto===obj || obj===Object || obj===Function)return;
    const keys = Object.getOwnPropertyNames(obj);
    if( keys ){
        keys.forEach( key=>{
            if(key==='constructor' || key==='prototype' || key==='__proto__')return;
            if(!hasOwn.call(target,key) && target[key] !== obj[key]){
                try{
                    const desc = Reflect.getOwnPropertyDescriptor(obj, key);
                    if(desc){  
                        const newDesc = Object.create(desc)
                        newDesc.configurable = true;
                        if(!isInstance){
                            newDesc.enumerable = false;
                        }
                        Object.defineProperty(target,key,newDesc);
                    }
                }catch(e){
                    console.error(e)
                }
            }
        });
    }
    if(depth){
        merge(Reflect.getPrototypeOf(obj), target, isInstance, depth);
    }
}

function getDescriptor(obj, name){
    if( !obj )return null;
    const desc = Reflect.getOwnPropertyDescriptor(obj, name);
    if(desc)return desc;
    if(_proto===obj || obj===Object || obj===Function)return;
    return getDescriptor( Reflect.getPrototypeOf(obj), name);
}

const datasetSymbols = Object.create(null);
const Class={
    key:privateKey,
    bindClassKey,
    modules:__MODULES__,
    getExportDefault(value){
        if(typeof value === 'object'){
            return value.default || value;
        }
        return value;
    },
    getKeySymbols(id){
        return datasetSymbols[id] || (datasetSymbols[id] = Symbol('private'));
    },
    getObjectDescriptor(obj, name){
        return getDescriptor(obj, name);
    },
    callSuperMethod(moduleClass, thisArg, methodName, args){
        const method = this.getSuperMethod(moduleClass, methodName, 'method');
        if(method){
            return method.apply(thisArg, args);
        }else{
            throw new ReferenceError(`'super.${methodName}' method is not exists.`)
        }
    },
    callSuperSetter(moduleClass, thisArg, methodName, value){
        const method = this.getSuperMethod(moduleClass, methodName, 'setter');
        if(method){
            return method.call(thisArg, value);
        }else{
            throw new ReferenceError(`'super.${methodName}' setter is not exists.`)
        }
    },

    callSuperGetter(moduleClass, thisArg, methodName){
        const method = this.getSuperMethod(moduleClass, methodName, 'getter');
        if(method){
            return method.call(thisArg);
        }else{
            throw new ReferenceError(`'super.${methodName}' getter is not exists.`)
        }
    },

    isModifier(modifier, value){
        if(!(value > 0))return false;
        let mode = Class.constant[modifier];
        if(mode == null){
            throw new Error('Modifier invalid')
        }
        return (mode & value) === mode;
    },

    getSuperMethod(moduleClass, methodName, kind='method'){
        if(!moduleClass)return null;
        let descriptor = Class.getClassDescriptor(moduleClass);
        let parent = null;
        if(descriptor && descriptor.inherit){
            parent = descriptor.inherit;
            let has = false;
            while(parent){
                let parentDescriptor = Class.getClassDescriptor(parent);
                if(parentDescriptor){
                    let members = parentDescriptor.members;
                    let desc = members && hasOwn.call(members, methodName) ? members[methodName] : null;
                    if(desc){
                        has = true;
                        if(!Class.isModifier('MODIFIER_PRIVATE', desc.m)){
                            if(desc.set && kind==='setter'){
                                return desc.set
                            }else if(desc.get && kind==='getter'){
                                return desc.get
                            }else if(Class.isModifier('KIND_METHOD', desc.m) && kind==='method'){
                                return desc.value;
                            }
                        }
                    }
                    parent = parentDescriptor.inherit;
                }else{
                    break;
                }
            }
            if(has){
                return null;
            }
        }

        if(typeof moduleClass === "function"){
            let obj = Reflect.getPrototypeOf(moduleClass.prototype)
            let desc = getDescriptor(obj, methodName) || getDescriptor(_proto, methodName);
            if(desc){
                if(desc.set && kind==='setter'){
                    return desc.set
                }else if(desc.get && kind==='getter'){
                    return desc.get
                }else if(typeof desc.value ==='function'){
                    return desc.value
                }
            }
        }
        return null;
    },

    creator:function(moduleClass, descriptor){
        if(moduleClass && descriptor){
            if(!descriptor.name){
                throw new Error('Class module descriptor should have a name'); 
            }
            
            let name = descriptor.ns ? descriptor.ns+'.'+descriptor.name : descriptor.name;
            let isInterface = Class.isModifier('KIND_INTERFACE', descriptor.m);
            if(descriptor.inherit){
                let inherit = Class.getClassConstructor(descriptor.inherit);
                let isProto = typeof inherit === 'function' ? moduleClass.prototype instanceof inherit : true;
                if(!isProto){
                    Object.defineProperty(moduleClass,'prototype',{value:Object.create(descriptor.inherit.prototype)});
                }
                if(!isInterface){
                    merge(inherit, moduleClass);
                }
            }

            if( descriptor.methods && !isInterface){
                Object.defineProperties(moduleClass,descriptor.methods);
            }

            if( descriptor.members && !isInterface){
                Object.defineProperties(moduleClass.prototype, descriptor.members);
            }

            Object.defineProperty(moduleClass,privateKey,{value:descriptor});
            if(!Object.hasOwnProperty.call(moduleClass,'name')){
                Object.defineProperty(moduleClass,'name',{value:descriptor.name});
            }
            
            Object.defineProperty(moduleClass,'toString',{
                configurable:true,
                value:function toString(){
                    if(isInterface){
                        return '[Interface '+name+']';
                    }else if( Class.isModifier('KIND_ENUM', descriptor.m) ){
                        return '[Enum '+name+']';
                    }else{
                        return '[Class '+name+']';
                    }
                }
            });
            
            if(!Object.prototype.hasOwnProperty.call(moduleClass.prototype,'toString')){
                Object.defineProperty(moduleClass.prototype,'toString',{
                    configurable:true,
                    value:function toString(){
                        return '[object '+name+']';
                    }
                });
            }

            Object.defineProperty(moduleClass.prototype,'constructor',{value:moduleClass});
            __MODULES__[name] = moduleClass;
        }
        return moduleClass;
    },
    getClassConstructor(moduleClass){
        if(!moduleClass)return null;
        if(moduleClass[bindClassKey]){
            return moduleClass[bindClassKey];
        }
        return moduleClass;
    },
    getClassDescriptor(moduleClass){
        if(!moduleClass)return null;
        moduleClass = Class.getClassConstructor(moduleClass);
        return moduleClass[privateKey] || null;
    },
    getClassByName:function(name){
        return __MODULES__[name] || null;
    }
}