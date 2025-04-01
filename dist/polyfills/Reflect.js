/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<export name='_Reflect' />
class ClassDescriptor{
    static create(classModule, descriptor, members){
        return new ClassDescriptor(classModule, descriptor, members)
    }

    _classModule = null;
    _descriptor = null;
    _members = null;
    _label = 'unknown';

    constructor(classModule, descriptor, members=[]){
        this._classModule = classModule;
        this._descriptor = descriptor;
        this._description = descriptor || {};
        this._members = members;
        let mode = this._description.m || 0;
        if((mode & _Reflect.KIND_CLASS) === _Reflect.KIND_CLASS){
            this._label = 'class';
        }else if((mode & _Reflect.KIND_INTERFACE) === _Reflect.KIND_INTERFACE){
            this._label = 'interface';
        }else if((mode & _Reflect.KIND_ENUM) === _Reflect.KIND_ENUM){
            this._label = 'enum';
        }
    }

    get isClassDescriptor(){
        return true;
    }

    get mode(){
        return this._description.m || 0;
    }

    get descriptor(){
        return this._descriptor;
    }

    get classModule(){
        return this._classModule;
    }

    get label(){
        return this._label;
    }

    get className(){
        return this._description.name||'';
    }

    get namespace(){
        return this._description.namespace||'';
    }

    get implements(){
        return this._description.imps || [];
    }

    get inherit(){
        return this._description.inherit || null;
    }

    get members(){
        return this._members;
    }

    get permission(){
        let mode = this._description.m || 0;
        if((mode & _Reflect.MODIFIER_PRIVATE) === _Reflect.MODIFIER_PRIVATE){
            return 'private';
        }else if((mode & _Reflect.MODIFIER_PROTECTED) === _Reflect.MODIFIER_PROTECTED){
            return 'protected';
        }
        return 'public';
    }

    getMemberDescriptor(name, isStatic){
        isStatic = !!isStatic;
        return this.members.find( item=>item.key === name && item.isStatic() === isStatic)
    }

    isPrivatePropertyKey(key){
        return this._descriptor.private===key;
    }

    isPrivate(){
        return 'private' === this.permission
    }

    isProtected(){
        return 'protected' === this.permission
    }

    isPublic(){
        return 'public' === this.permission
    }

    isStatic(){
        let mode = this._description.m || 0;
        return (mode & _Reflect.MODIFIER_STATIC) === _Reflect.MODIFIER_STATIC;
    }

    isFinal(){
        let mode = this._description.m || 0;
        return (mode & _Reflect.MODIFIER_FINAL) === _Reflect.MODIFIER_FINAL;
    }

    isAbsract(){
        let mode = this._description.m || 0;
        return (mode & _Reflect.MODIFIER_ABSTRACT) === _Reflect.MODIFIER_ABSTRACT;
    }

    isDynamic(){
        return !!this._description.dynamic;
    }

    isClass(){
        return this._label === 'class'
    }

    isInterface(){
        return this._label === 'interface'
    }

    isEnum(){
        return this._label === 'enum'
    }
}

class MemberDescriptor{

    static create(key, descriptor, target, owner=null, privateKey=null){
        return new MemberDescriptor(key, descriptor, target, owner, privateKey)
    }

    _key = null;
    _descriptor = null;
    _owner = null;
    _dataset = null
    _privateKey = null
    constructor(key, descriptor, target, owner, privateKey=null){
        this._key = key;
        this._descriptor = descriptor;
        this._owner = owner;
        this._privateKey = privateKey;
        const mode = descriptor.m || 0;
        const value = descriptor.value;
        const dataset = this._dataset = {
            enumerable:false,
            writable:false,
            configurable:false
        };
        if((mode & _Reflect.KIND_ACCESSOR) === _Reflect.KIND_ACCESSOR){
            dataset.label = 'accessor';
            dataset.set = null;
            dataset.get = null;
            if(descriptor.set){
                dataset.writable = true;
                dataset.set = descriptor.set;
            }
            if(descriptor.get){
                dataset.enumerable = true;
                dataset.get = descriptor.get;
            }
        }else if((mode & _Reflect.KIND_METHOD) === _Reflect.KIND_METHOD){
            dataset.label = 'method';
            dataset.value = value;
        }else if((mode & _Reflect.KIND_ENUM_PROPERTY) === _Reflect.KIND_ENUM_PROPERTY){
            dataset.label = 'enumProperty';
            dataset.enumerable = true;
            dataset.value = value;
        }else{
            dataset.label = 'property';
            dataset.writable = (mode & _Reflect.KIND_READONLY) !== _Reflect.KIND_READONLY
            dataset.enumerable = true;
            dataset.value = value;
            if(target){
                dataset.resource = target;
                if((mode & _Reflect.MODIFIER_STATIC) === _Reflect.MODIFIER_STATIC){
                    if(key in target)dataset.value = target[key];
                }else{
                    if((mode & _Reflect.MODIFIER_PRIVATE) === _Reflect.MODIFIER_PRIVATE){
                        const privateChain = target[privateKey];
                        if(privateChain && key in privateChain){
                            dataset.resource = privateChain;
                        }
                    }else if(key in target){
                        dataset.value = target[key];
                    }
                }
            }
        }
    }

    get isMemberDescriptor(){
        return true;
    }

    get mode(){
        return this._descriptor.m || 0;
    }

    get descriptor(){
        return this._descriptor;
    }

    get key(){
        return this._key
    }

    get owner(){
        return this._owner;
    }

    get label(){
        return this._dataset.label;
    }

    get getter(){
       return this._dataset.get;
    }

    get setter(){
        return this._dataset.set;
    }

    get value(){
        return this._dataset.value;
    }

    get writable(){
        return !!this._dataset.writable;
    }

    get configurable(){
        return !!this._dataset.configurable;
    }

    get enumerable(){
        return !!this._dataset.enumerable;
    }

    get permission(){
        let mode = this._descriptor.m || 0;
        if((mode & _Reflect.MODIFIER_PRIVATE) === _Reflect.MODIFIER_PRIVATE){
            return 'private';
        }else if((mode & _Reflect.MODIFIER_PROTECTED) === _Reflect.MODIFIER_PROTECTED){
            return 'protected';
        }
        return 'public';
    }

    get privateKey(){
        return this._privateKey;
    }

    isPrivate(){
        return 'private' === this.permission
    }

    isProtected(){
        return 'protected' === this.permission
    }

    isPublic(){
        return 'public' === this.permission
    }

    isStatic(){
        let mode = this._descriptor.m || 0;
        return (mode & _Reflect.MODIFIER_STATIC) === _Reflect.MODIFIER_STATIC;
    }

    isFinal(){
        let mode = this._descriptor.m || 0;
        return (mode & _Reflect.MODIFIER_FINAL) === _Reflect.MODIFIER_FINAL;
    }

    isAbsract(){
        let mode = this._descriptor.m || 0;
        return (mode & _Reflect.MODIFIER_ABSTRACT) === _Reflect.MODIFIER_ABSTRACT;
    }

    isMethod(){
        return this.label ==='method'
    }

    isAccessor(){
        return this.label ==='accessor'
    }

    isProperty(){
        return this.label ==='property'
    }

    isEnumProperty(){
        return this.label ==='enumProperty'
    }

    isClassMember(){
        let owner = this._owner;
        if(owner){
            return !!Class.getClassDescriptor(owner);
        }
        return false;
    }

    invokeMethod(thisArg, ...args){
        let fn = this._dataset.get;
        if(typeof fn ==='function'){
            fn.call(thisArg, ...args);
        }else{
            throw new ReferenceError(`Invoke method is not exists on the key '${this.key}'.`)
        }
    }

    invokeGetter(thisArg){
        let fn = this._dataset.get;
        if(typeof fn ==='function'){
            return fn.call(thisArg);
        }else{
            throw new ReferenceError(`Invoke getter is not exists on the key '${this.key}'.`)
        }
    }

    invokeSetter(thisArg, value){
        let fn = this._dataset.set;
        if(typeof fn ==='function'){
            fn.call(thisArg, value);
        }else{
            throw new ReferenceError(`Invoke setter is not exists on the key '${this.key}'.`)
        }
    }

    setPropertyValue(value){
        if(this._dataset.resource){
            this._dataset.resource[this.key] = value;
        }else{
            throw new Error(`Set property value failed on the key '${this.key}'.`)
        }
    }

    getPropertyValue(){
        let target = this._dataset.resource;
        if(target){
            return target[this.key];
        }
        return null;
    }
}

const _Reflect = (function(_Reflect){
    const _construct = _Reflect ? _Reflect.construct : function construct(theClass, args, newTarget){
        if( !isFun(theClass) ){
            throw new TypeError('is not class or function');
        }
        switch ( args.length ){
            case 0 :
                return new theClass();
            case 1 :
                return new theClass(args[0]);
            case 2 :
                return new theClass(args[0], args[1]);
            case 3 :
                return new theClass(args[0], args[1], args[2]);
            case 4 :
                return new theClass(args[0], args[1], args[2],args[3]);
            case 5 :
                return new theClass(args[0], args[1], args[2],args[3],args[4]);
            case 6 :
                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5]);
            case 7 :
                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6]);
            case 8 :
                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6],args[7]);
            default :
                var items = [];
                for(var i=0;i<args.length;i++)items.push(i);
                return Function('f,a', 'return new f(a[' + items.join('],a[') + ']);')(theClass, args);
        }
    };

    const _apply = _Reflect ? _Reflect.apply : function apply(target, thisArgument, argumentsList){
        if( typeof target !== "function" ){
            throw new TypeError('is not function');
        }
        thisArgument = thisArgument === target ? undefined : thisArgument;
        if (argumentsList != null) {
            return target.apply(thisArgument === target ? undefined : thisArgument, argumentsList);
        }
        if (thisArgument != null) {
            return target.call(thisArgument);
        }
        return target();
    };

    const hasOwn = Object.prototype.hasOwnProperty;
    function isFun(target){
        return target && target.constructor === Function
    }

    function isClass(objClass){
        if( !objClass || !objClass.constructor)return false;
        var desc = Class.getClassDescriptor(objClass);
        if( !desc )return isFun(objClass);
        return desc && (desc.m & Reflect.KIND_CLASS) === Reflect.KIND_CLASS;
    }

    function inContext(context,objClass){
        if(!context)return false;
        if(context===objClass)return true;
        const obj = Class.getClassDescriptor(context);
        return obj ? inContext(obj.inherit, objClass) : false;
    }

    function getObjectDescriptor(target, name, rawClass=null, mode=0){
        try{
            if(!target)return null;
            let descriptor = Class.getObjectDescriptor(target, name);
            if(!descriptor && name in target){
                descriptor = {
                    value:target[name],
                    writable:true,
                    configurable:true,
                    enumerable:Object.prototype.propertyIsEnumerable.call(target, name)
                }
                if(typeof descriptor.value ==='function'){
                    descriptor.enumerable = false;
                    descriptor.writable = false;
                }
            }
            if( descriptor ){
                descriptor.m = mode | Reflect.MODIFIER_PUBLIC;
                if(descriptor.get || descriptor.set){
                    descriptor.m |= Reflect.KIND_ACCESSOR;
                }else if(typeof descriptor.value ==='function' && !descriptor.writable){
                    descriptor.m |= Reflect.KIND_METHOD;
                }else{
                    if(descriptor.writable){
                        descriptor.m |= Reflect.KIND_PROPERTY;
                    }else{
                        descriptor.m |= Reflect.KIND_READONLY;
                    }
                }
                return MemberDescriptor.create(name, descriptor, target, rawClass);
            }
        }catch(e){}
        return null;
    }

    function getClassDescriptor(target){
        target = Object(target);
        let objClass = target;
        let isStatic = true;
        let descriptor = Class.getClassDescriptor(target);
        if(!descriptor && target.constructor){
            isStatic = false;
            objClass = target.constructor;
            descriptor = Class.getClassDescriptor(target.constructor)
        }
        return {objClass,descriptor,isStatic,target};
    }

    function getModes(mode){
        return Object.keys(Class.constant).map(key=>Class.constant[key]).filter(val=>(mode & val) === val)
    }

    function Reflect(){ 
        throw new SyntaxError('Reflect is not constructor.');
    }

    Reflect.MODIFIER_PUBLIC = Class.constant.MODIFIER_PUBLIC;
    Reflect.MODIFIER_PROTECTED = Class.constant.MODIFIER_PROTECTED;
    Reflect.MODIFIER_PRIVATE = Class.constant.MODIFIER_PRIVATE;
    Reflect.MODIFIER_STATIC = Class.constant.MODIFIER_STATIC;
    Reflect.MODIFIER_FINAL = Class.constant.MODIFIER_FINAL;
    Reflect.MODIFIER_ABSTRACT = Class.constant.MODIFIER_ABSTRACT;
    Reflect.KIND_ACCESSOR = Class.constant.KIND_ACCESSOR;
    Reflect.KIND_PROPERTY = Class.constant.KIND_VAR;
    Reflect.KIND_READONLY = Class.constant.KIND_CONST;
    Reflect.KIND_METHOD = Class.constant.KIND_METHOD;
    Reflect.KIND_ENUM_PROPERTY = Class.constant.KIND_ENUM_PROPERTY;
    Reflect.KIND_CLASS = Class.constant.KIND_CLASS;
    Reflect.KIND_INTERFACE = Class.constant.KIND_INTERFACE;
    Reflect.KIND_ENUM = Class.constant.KIND_ENUM;

    Reflect.apply=function apply(target, thisArgument, argumentsList ){
        if( !isFun(target) ){
            throw new TypeError('target is not function');
        }
        if( !Array.isArray(argumentsList) ){
            argumentsList = argumentsList !== void 0 ? [argumentsList] : [];
        }
        return _apply(target, thisArgument, argumentsList);
    };

    Reflect.call=function call(scope,target,propertyKey,argumentsList,thisArgument){
        if( target == null )throw new ReferenceError('target is null or undefined');
        if( propertyKey==null ){
            return Reflect.apply(target, thisArgument, argumentsList);
        }
        return Reflect.apply( Reflect.get(scope,target,propertyKey), thisArgument||target, argumentsList);    
    };

    Reflect.construct=function construct(target, args, newTarget){
        if( !isClass(target) )throw new TypeError('target is not instantiable object.');
        return _construct(target, args || [], newTarget);
    };

    Reflect.deleteProperty=function deleteProperty(target, propertyKey){
        if( !target || propertyKey==null )return false;
        if( propertyKey==="__proto__")return false;
        if( isClass(target) || isClass(target.constructor) ){
            return false;
        }
        if( propertyKey in target ){
            return (delete target[propertyKey]);
        }
        return false;
    };

    Reflect.has=function has(target, propertyKey){
        if( propertyKey==null || target == null )return false;
        if( propertyKey==="__proto__")return false;
        if( isClass(target) || isClass(target.constructor) ) {
            return false;
        }
        return propertyKey in target;
    };


    Reflect.get=function get(scope,target,propertyKey,receiver){
        if( propertyKey===null ||  propertyKey === void 0)return target;
        if( propertyKey === '__proto__' )return null;
        if( target == null )throw new ReferenceError('target is null or undefined');

        const desc = Reflect.getDescriptor(target, propertyKey);
        if(!desc){
            let {descriptor} = getClassDescriptor(target)
            if(descriptor){
                if(descriptor.dynamic){
                    return target[propertyKey];
                }else{
                    throw new ReferenceError(`target.${propertyKey} is not exists.`);
                }
            }else{
                return target[propertyKey];
            }
        }

        receiver = !receiver && typeof target ==="object" ? target : null;
        if(typeof receiver !=="object" ){
            throw new ReferenceError(`Assignment receiver can only is an object.`);
        }

        let result = null;
        if(!desc.isClassMember()){
            if(desc.getter){
                result = desc.getter.call(receiver);
            }else{
                result = desc.value;
            }
        }else if( (desc.isPrivate() && desc.owner !== scope) || (desc.isProtected() && !inContext(scope, desc.owner)) ){
            throw new ReferenceError(`target.${propertyKey} inaccessible`);
        }else{
            if(desc.isAccessor()){
                if( !desc.getter ){
                    throw new ReferenceError(`target.${propertyKey} getter is not exists.`);
                }else{
                    result = desc.getter.call(receiver);
                }
            }else{
                if(desc.isProperty()){
                    result = desc.getPropertyValue();
                }else{
                    result = desc.value;
                }
            }
        }
        return result === void 0 ? null : result;
    };

    Reflect.set=function(scope,target,propertyKey,value,receiver){
        if( target == null || propertyKey===null ||  propertyKey === void 0 ){
            throw new ReferenceError('target or propertyKey is null or undefined');
        }

        if( propertyKey === '__proto__' )return null;
        const desc = Reflect.getDescriptor(target, propertyKey);

        if(!desc){
            let {descriptor} = getClassDescriptor(target)
            if(descriptor){
                if(descriptor.dynamic){
                    return target[propertyKey] = value; 
                }else{
                    throw new ReferenceError(`target.${propertyKey} is not exists.`);
                }
            }else{
                return target[propertyKey] = value;
            }
        }

        receiver = !receiver && typeof target ==="object" ? target : null;
        if(typeof receiver !=="object" ){
            throw new ReferenceError(`Assignment receiver can only is an object.`);
        }

        if( !desc.isClassMember() ){
            if(!desc.isProperty() && !(desc.setter || desc.writable)){
                throw new ReferenceError(`target.${propertyKey} is readonly.`);
            }else if(desc.setter){
                desc.setter.call(receiver,value);
            }else{
                target[propertyKey] = value;
            }
        }else if( (desc.isPrivate() && desc.owner !== scope) || (desc.isProtected() && !inContext(scope, desc.owner))){
            throw new ReferenceError(`target.${propertyKey} inaccessible`);
        }else{
            if(desc.isAccessor()){
                desc.invokeSetter(receiver, value);
            }else if(desc.isMethod() || !desc.writable){
                throw new ReferenceError(`target.${propertyKey} is readonly.`);
            }else if(desc.isProperty()){
                desc.setPropertyValue(value);
            }
        }
        return value;
    };

    Reflect.incre=function incre(scope,target,propertyKey,flag){
        const val = Reflect.get(scope,target,propertyKey);
        const result = val+1;
        Reflect.set(scope,target, propertyKey, result);
        return flag === true ? val : result;
    }

    Reflect.decre= function decre(scope,target, propertyKey,flag){
        const val = Reflect.get(scope,target, propertyKey);
        const result = val-1;
        Reflect.set(scope,target, propertyKey,result);
        return flag === true ? val : result;
    }

    Reflect.getDescriptor=function getDescriptor(source, name=null, mode=null){
        if(source===null||source === void 0)return false;
        let {target, objClass, descriptor, isStatic} = getClassDescriptor(source)
        if(!descriptor){
            if(name == null){
                const members = [];
                Object.getOwnPropertyNames(target).forEach( key=>{
                    if(key==='prototype'||key==='__proto__'||key==='constructor')return;
                    if(target.hasOwnProperty(key)){
                        members.push(getObjectDescriptor(target, key));
                    }
                });
                let inherit = typeof target === 'function' ? null : Object.getPrototypeOf(target);
                if(inherit){
                    if(inherit === Object.prototype || inherit===Object || inherit===Function){
                        inherit = null;
                    }
                }
                return ClassDescriptor.create(
                    null,
                    {
                        m:0,
                        name:'nonClass',
                        namespace:'',
                        dynamic:true,
                        inherit
                    },
                    members
                )
            }else{
                return getObjectDescriptor(target, name);
            }
        }

        const rawClass = objClass;
        const privateScope = objClass;
        if(name == null){
            let members = [];
            let modes = mode > 0 ? getModes(mode) : null;
            let filter = modes && modes.length>0 ? (val)=>modes.every(mode=>(mode & val)===mode) : null;
            let modeStatic = mode > 0 && (mode & Reflect.MODIFIER_STATIC) === Reflect.MODIFIER_STATIC;
            if(!modeStatic){
                if(descriptor.members){
                    Object.keys(descriptor.members).map( key=>{
                        let desc = descriptor.members[key];
                        if(!filter || !desc.m || filter(desc.m)){
                            members.push(
                                MemberDescriptor.create(key, desc, target, objClass, descriptor.private)
                            );
                        }
                    });
                }else{
                    let obj = typeof target === 'function' ? target.prototype : target;
                    Object.getOwnPropertyNames(obj).forEach( key=>{
                        if(key==='prototype'||key==='__proto__'||key==='constructor')return;
                        if(hasOwn.call(target,key)){
                            members.push(getObjectDescriptor(target, key));
                        }
                    });
                }
            }

            if(isStatic || modeStatic){
                if(descriptor.methods){
                    Object.keys(descriptor.methods).map( key=>{
                        let desc = descriptor.methods[key];
                        if(!filter || !desc.m || filter(desc.m)){
                            members.push(
                                MemberDescriptor.create(key, desc, target, objClass, descriptor.private)
                            );
                        }
                    });
                }else{
                    Object.getOwnPropertyNames(objClass).forEach( key=>{
                        if(key==='prototype'||key==='__proto__'||key==='constructor')return;
                        if(hasOwn.call(target,key)){
                            members.push(getObjectDescriptor(objClass, key, null, Reflect.MODIFIER_STATIC));
                        }
                    });
                }
            }
            return ClassDescriptor.create(rawClass, descriptor, members);
        }
       
        while(objClass && descriptor){
            let dataset = isStatic ? descriptor.methods : descriptor.members;
            if( dataset && hasOwn.call(dataset,name) ){
                const desc = dataset[name];
                const item = MemberDescriptor.create(name, desc, target, objClass, descriptor.private);
                if(item.isPrivate()){
                    if(privateScope === objClass){
                        return item;
                    }
                }else{
                    return item;
                }
            }
            const inheritClass= Class.getClassConstructor(descriptor.inherit);
            if(inheritClass && inheritClass !== objClass){
                objClass = inheritClass;
                descriptor = Class.getClassDescriptor(objClass)
            }else{
                break;
            }
        }
        if(objClass && !descriptor){
            return getObjectDescriptor(
                typeof objClass ==='function' ? objClass.prototype : objClass,
                name
            );
        }
        return null;
    };

    Reflect.getDescriptors=function getDescriptors(target, mode=null){
       return Reflect.getDescriptor(target, null, mode);
    }

    Reflect.decorate=function decorate(decorators, target, propertyKey, descriptor){
        if(!decorators || !Array.isArray(decorators)){
            throw new Error('decorators must is an array')
        }
        const len = arguments.length;
        let result = void 0;
        if(len>2){
            if(!descriptor || propertyKey == null){
                throw new Error('decorators missing descriptor or propertyKey')
            }
        }
        const context = {
            decorators,
            target,
            result
        }
        for(let i=decorators.length-1;i>=0;i--){
            const decorator = decorators[i];
            context.currentIndex = i;
            context.currentDecorator = decorator;
            if(len>2){
                decorator(descriptor, propertyKey, context);
            }else{
                result = decorator(result||target, 'constructor', context);
                if(result){
                    if(typeof result ==='function'){
                        context.result = result;
                    }else{
                        throw new Error('Decorator returned result must is function')
                    }
                }
            }
        }
        return context.result || (len>2 ? descriptor : target);
    };

    Reflect.decorateParam=function decorateParam(index, decorator){
        return (target, key, context)=>decorator(target, key, index, context);
    }

    return Reflect;

}(Reflect));