/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
///<references from='Reflect' />

const privateKey = Symbol('private-key')
function DataEntity(){
    Object.defineProperty(this, privateKey, {
        value:{
            members:[],
            data:null
        }
    })
}

Object.defineProperty(DataEntity.prototype, 'constructor',{
    value:DataEntity
})

const hasOwn = Object.prototype.hasOwnProperty;
Object.defineProperty(DataEntity.prototype, 'load',{
    value:function load(data, validate, convert){
        if(data==null || typeof data !=='object'){
            throw new TypeError('Invalid data')
        }
        const old = this[privateKey].data;
        const members = this[privateKey].members;
        this[privateKey].data =  data;
        if(old === null){
            let descriptor = Reflect.getDescriptor(this)
            let exists = {};
            while(descriptor && descriptor.isStruct()){
                members.push(...descriptor.members.filter(item=>{
                    if(item.isColumn()){
                        if(exists[item.key]){
                            return false;
                        }
                        exists[item.key] = true
                        return true;
                    }
                }))
                descriptor = Reflect.getDescriptor(descriptor.inherit)
            }
        }
        members.forEach(item=>{
            const key = item.key;
            if(hasOwn.call(data, key)){
                let value = data[key];
                const formal = this.getFormal(item) || ['varchar', 255];
                if(convert){
                    value = convert(value, ...formal);
                }else{
                    value = this.convert(value, ...formal);
                }
                if(value===null || value===false){
                    throw new Error("Assignment entity value cannot is null or false.");
                }
                if(validate){
                    if(validate(value, ...formal)){
                        this[key] = value;
                    }else{
                        throw new Error(`Validate failed the '${key}' value.`);
                    }
                }else{
                    if(this.validate(value, ...formal)){
                        this[key] = value;
                    }else{
                        throw new Error(`Validate failed the '${key}' value.`);
                    }
                } 
            }else if(!item.isOptional()){
                throw new ReferenceError(`Property the '${key}' is required.`)
            }
        })
    }
})

Object.defineProperty(DataEntity.prototype, 'validate',{
    value:function validate(value, formal, ...args){
        const type = typeof value;
        if(type ==='object' || Array.isArray(value)){
            return false;
        }
        switch(String(formal).toLowerCase()){
            case 'set' :
            case 'enum' :
                return args.includes(String(value));
            case 'varchar' :{
                const max = args[0] ?? 255;
                return String(value).length <= max;
            }
            case 'decimal' :{
                if(isNaN(value))return false;
                const max = args[0] ?? 11;
                const decimal = args[1] ?? 4;
                const [left, right=''] =String(value).split('.')
                return String(left).length <= max && String(right).length <= decimal;
            }
            case 'double' :
            case 'float' :
                return !isNaN(value);
            case 'tinyint' :
            case 'smallint' :
            case 'mediumint' :
            case 'int' :
            case 'bigint' :
            case 'time' :{
                if(isNaN(value))return false;
                const max = args[0] ?? 15;
                return String(value).length <= max;
            }
            case 'email' :
                return /^\S+@\S+\.\S+/.test(String(value));
            case 'range' :{
                const min = args[0] ?? 0;
                const max = args[1] ?? 255;
                const len = String(value).length;
                return min <= len && max >= len;
            }
            case 'char' :{
                const len = args[0] ?? 0;
                return len>0 ? String(value).length===len : true;
            }
        }
        return true;
    }
})

Object.defineProperty(DataEntity.prototype, 'convert',{
    value:function convert(value, formal, ...args){
        const type = typeof value;
        if(type ==='object'){
            return JSON.stringify(value);
        }else if(Array.isArray(value)){
            return value.join(',');
        }else if(type==="boolean"){
            return Number(value)
        }
        switch(String(formal).toLowerCase()){
            case 'tinyint' :
            case 'smallint' :
            case 'mediumint' :
            case 'int' :
            case 'bigint' :
            case 'numberic' :
            case 'time' :  
                return Number(value);
            case 'double' :
            case 'float' :
            case 'decimal' :
                return parseFloat(value);
            default :
                return String(value);
        }
    }
})

Object.defineProperty(DataEntity.prototype, 'getFormal',{
    value:function getFormal(member){
        const comments = member.parseComments();
        for(let i=comments.length;i>0;i--){
            let comment = String(comments[i-1]);
            if(comment.startsWith('@Formal')){
                comment = comment.substring(7).trim();
                let len = comment.length;
                if(len > 2 && comment.charCodeAt(0)===40 && comment.charCodeAt(len-1) === 41){
                    return comment.slice(1,-1).split(',').map((value)=>{
                        const code = value.trim().charCodeAt(0);
                        if(code===34 || code===39){
                            value = value.slice(1,-1);
                        }else if(!isNaN(value)){
                            value = Number(value);
                        }
                        return value;
                    })
                }
            }
        }
        return null;
    }
})

Object.defineProperty(DataEntity.prototype, 'toEntity',{
    value:function toEntity(excludes){
        if(excludes && !Array.isArray(excludes)){
            throw new TypeError('Invalid excludes')
        }
        const members = this[privateKey].members;
        const dataset = {};
        members.forEach(item=>{
            const key = item.key;
            if(excludes && excludes.includes(key)){
                return;
            }
            const value = this[key];
            if(value != null){
                dataset[key] = value;
            }
        })
        return dataset;
    }
})
