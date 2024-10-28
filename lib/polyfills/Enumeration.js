/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<references from='Reflect' />

function Enumeration(name, value){
    Object.defineProperty(this, 'name',{
        value:name,
        writable:false
    });
    Object.defineProperty(this, 'value',{
        value:value,
        writable:false
    })
}

Object.defineProperty(Enumeration.prototype, 'constructor',{
    value:Enumeration
})

Object.defineProperty(Enumeration.prototype, 'label',{
    value:function(){
        return this.name;
    }
})

Object.defineProperty(Enumeration, 'keys',{
    value:function(){
        const properties = getProperties(this)
        return properties.keys();
    }
})

Object.defineProperty(Enumeration, 'values',{
    value:function(){
        const properties = getProperties(this)
        return Array.from(properties).map( ([key, value])=>{
            return getInstance(this, key, value)
        })
    }
})

Object.defineProperty(Enumeration, 'has',{
    value:function(key){
        return getProperties(this).has(key);
    }
})

Object.defineProperty(Enumeration, 'valueOf',{
    value:function(value){
        const properties = getProperties(this)
        const key = this.keyOf(value);
        if(key){
            return getInstance(this, key, properties.get(key))
        }
        if(properties.has(value)){
            return getInstance(this, value, properties.get(value))
        }
        return null;
    }
})

Object.defineProperty(Enumeration, 'keyOf',{
    value:function(value){
        const properties = getProperties(this)
        for(let [key, _value] of properties){
            if(value == _value){
                return key;
            }
        }
        return null
    }
})

Object.defineProperty(Enumeration, 'labelOf',{
    value:function(value){
        const obj =  this.valueOf(value)
        if(obj){
            return obj.label()
        }
        return null;
    }
})

const records = new Map();
function getProperties(classObject){
    if(records.has(classObject)){
        return records.get(classObject)
    }
    const map = new Map();
    records.set(classObject, map)
    while(classObject && classObject !== Enumeration){
        let descriptor = Reflect.getDescriptors(classObject, Reflect.KIND_ENUM_PROPERTY | Reflect.MODIFIER_PUBLIC | Reflect.MODIFIER_STATIC)
        if(descriptor){
            descriptor.members.forEach(desc=>{
                if(desc.isEnumProperty()){
                    map.set(desc.key, desc.value)
                }
            });
            classObject = descriptor.inherit;
        }else{
            break;
        }
    }
    return map;
}

const instances = new Map();
function getCache(classObject){
    let cache = instances.get(classObject);
    if(cache)return cache;
    instances.set(classObject, cache=new Map())
    return cache;
}

function getInstance(classObject, key, value=null){
    const cache = getCache(classObject)
    if(value != null && !cache.has(key)){
        cache.set(key, new classObject(key, value))
    }
    return cache.get(key) || null;
}