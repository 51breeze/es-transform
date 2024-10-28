/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<references from='EventDispatcher' />
const hasOwn = Object.prototype.hasOwnProperty;
function System(){
    throw new SyntaxError('System is not constructor.');
};
System.getIterator=function getIterator(object){
    if( !object )return null;
    if( object[Symbol.iterator] ){
        return object[Symbol.iterator]();
    }
    const type = typeof object;
    if( type==="object" || type ==="boolean" || type ==="number" || object.length === void 0 ){
        throw new TypeError("object is not iterator");
    }
    return (function(object){ 
        return{
            index:0,
            next:function next(){
                if (this.index < object.length) {
                    return {index:this.index,value:object[this.index++],done:false};
                }
                return {value:undefined,done:true};
            }
        };
    })(object);
}

System.is=function is(left,right){
    if(left==null || !right)return false;
    if(Object.getPrototypeOf(left) === right.prototype)return true;
    if(typeof left !== "object")return false;
    const mode = right[Class.key] ? right[Class.key].m : 0;
    const description =  left.constructor ? left.constructor[Class.key] : null;
    if(description && Class.isModifier('KIND_INTERFACE', mode)){
        return (function check(description){
            if( !description )return false;
            var imps = description.imps;
            var inherit = description.inherit;
            if( inherit === right )return true;
            if(imps){
                for(var i=0;i<imps.length;i++){
                    if(imps[i] === right || check(Class.getClassDescriptor(imps[i])))return true;
                }
            }
            return inherit ? check(Class.getClassDescriptor(inherit)) : false;
        })(description);
    }
    return left instanceof right;
}

System.isClass=function isClass(classObject){
    if(!classObject || !classObject.constructor)return false;
    const desc = Class.getClassDescriptor(classObject);
    return desc ? Class.isModifier('KIND_CLASS', desc.m) : false;
}

System.isInterface=function isInterface(classObject){
    const desc = Class.getClassDescriptor(classObject);
    return desc ? Class.isModifier('KIND_INTERFACE', desc.m) : false;
}

System.isFunction=function isFunction(target){
   return target && target.constructor === Function;
}

System.isArray=function isArray(object){
    return Array.isArray(object); 
}

System.isObject=function isObject(object){
    return typeof object === 'object';
}

System.toArray=function toArray(object){
    if( Array.isArray(object) ){
        return object;
    }
    if(object && typeof object ==='object' && object[Symbol.iterator] && System.isClass(object)){
        const iterable = object[Symbol.iterator]();
        iterable.rewind();
        let result = null;
        const arr = [];
        while( (result = iterable.next()) && !result.done ){
            arr.push( result.value );
        }
        return arr;
    }
    return Array.from( object );
}

System.forMap=function forMap(object, callback){
    const items = [];
    System.forEach(object,(value,index)=>{
        items.push(callback(value, index));
    });
    return items;
}

System.forEach=function forEach(object, callback){
    if( !object )return;
    const type = typeof object;
    if( type ==='number'){
        for(let i=0; i<object;i++){
            callback(i, i, object);
        }
    }else if( type ==='string'){
        for(let i=0; i<object.length;i++){
            callback(object[i], i, object);
        }
    }else if( Array.isArray(object) || object instanceof Map ){
        object.forEach( callback );
    }else if( type ==="object" ){
        if(object[Symbol.iterator] && System.isClass(object)){
            var iterable = object[Symbol.iterator]();
            iterable.rewind();
            var result = null;
            var index = 0;
            while( (result = iterable.next()) && !result.done ){
                callback(result.value, result.key || index, object);
                index++;
            }
        }else if( Object.prototype.toString.call(object) === '[object Object]' ){
            for(let name in object){
                callback(object[name], name, object);
            }
        }else{
            Array.from( object ).forEach( callback );
        }  
    }
}

var __EventDispatcher = null;
System.getEventDispatcher=function getEventDispatcher(){
    if( __EventDispatcher === null ){
        __EventDispatcher = new EventDispatcher(window);
    }
    return __EventDispatcher;
}

/**
 * 根据指定的类名获取类的对象
 * @param name
 * @returns {Object}
 */
 System.getDefinitionByName = function getDefinitionByName(name){
     const module = Class.getClassByName(name);
     if( module ){
         return module;
     }
     throw new TypeError('"' + name + '" is not defined.');
 };
 
 System.hasClass = function hasClass(name){
     return !!Class.getClassByName(name);
 };

 System.firstUpperCase=function firstUpperCase(value){
    if(!value)return value;
    value = String(value);
    return value.substring(0,1).toUpperCase()+value.substring(1);
 }

 System.firstLowerCase=function firstLowerCase(value){
    if(!value)return value;
    value = String(value);
    return value.substring(0,1).toLowerCase()+value.substring(1);
 }

 const globalConfig = Object.create(null);
 System.setConfig=function setConfig(key, value){
    key = String(key);
    const segments = key.split('.').map( seg=>seg.trim() ).filter( seg=>!!seg );
    if( !segments.length ){
        throw new Error(`The '${key}' key-name invalid. in System.setConfig`)
    }
    let name = null;
    let object = globalConfig;
    key = segments.pop();
    while( name = segments.shift() ){
        if( !hasOwn.call(object,name) ){
            object = object[name] = {};
        }else{
            object = object[name];
        }
    }
    object[key] = value;
 }

 System.getConfig=function getConfig(key){
    key = String(key);
    const segments = key.split('.').map( seg=>seg.trim() ).filter( seg=>!!seg );
    if( !segments.length ){
        throw new Error(`The '${key}' key-name invalid. in System.getConfig`)
    }
    let name = null;
    let object = globalConfig;
    key = segments.pop();
    while( name = segments.shift() ){
        if( !hasOwn.call(object,name) ){
           return null;
        }else{
            object = object[name];
        }
    }
    return hasOwn.call(object,key) ? object[key] : null;
 }

 System.createHttpRoute=function createHttpRoute(url, params={}, flag=false){
    let matching = [];
    params = params || {};
    url = String(url).trim();
    url = url.replace(/(^|\/)<([^\>\?]+)(\?)?>/g, function(a,b,c,d){
        let key = c;
        let lowerKey = c;
        let existsKey = hasOwn.call(params,key) ? key : hasOwn.call(params,lowerKey=key.toLowerCase()) ? lowerKey : null;
        let value = null;
        let prefix = b ? b : '';
        if(existsKey){
            value = params[existsKey]
            if(flag){
                params[existsKey]=null;
                delete params[existsKey];
            }else{
                matching.push(existsKey)
            }
        }

        if( d && d.charCodeAt(0) === 63 ){
            if( value !== null ){
                return prefix+value;
            }else{
                return '';
            }
        }
        if( value === null ){
            throw new Error(`Missing params '${key}' or the value of params cannot for null.`);
        }else{
            return prefix+value;
        }
    });
    if(!flag){
        const query = Object.keys(params).filter(name=>{
            return !matching.includes(name) && params[name] != null;
        }).map(name=>{
            return `${name}=${encodeURIComponent(params[name])}`
        });
        if(query.length>0){
            return url.replace(/\/$/,'') + '?' + query.join('&');
        }
    }
    return url.replace(/\/$/,'');
 }

 var HTTP_REQUEST = null;
 System.createHttpRequest=function(HttpFactor, route, rawConfig){
    rawConfig = rawConfig || {};
    let data  = rawConfig.data;
    let _params = route.param || route.params || rawConfig.param || rawConfig.params
    let params = _params && typeof _params ==='object' ? Object.assign({}, _params) : {};
    let url = route;
    let method = rawConfig.method || rawConfig.methods;
    if( typeof route ==='object' ){
        if(route.default && typeof route.default ==='object'){
            params = Object.assign(route.default, params);
        }
        url = System.createHttpRoute(route.url, params, true);
        if( route.allowMethod && route.allowMethod !== '*'){
            let allowMethod = route.allowMethod;
            if( !Array.isArray(allowMethod) ) {
                allowMethod = [allowMethod];
            }
            if( !allowMethod.includes('*') ){
                if( method ){
                    if(!allowMethod.includes(method) ){
                        throw new Error(`Http request is not allowed '${method}' methods. available methods for ${allowMethod.join(',')} on the '${url}' url`);
                    }
                }else if( !method ){
                    if( data && allowMethod.includes('post') ){
                        method = 'post';
                    }else{
                        method = allowMethod[0];
                    }
                }
            }
        }
    }

    if( !data && String(method).toLowerCase() ==='post' ){
        data = params;
        params = void 0;
    }

    let request = HTTP_REQUEST;
    let config = Object.create(null);
    if( rawConfig.options && typeof rawConfig.options ==='object' ){
        config = Object.assign(config, rawConfig.options);
    }

    config = Object.assign(config,{
        url:url,
        method:method,
        params:params,
        data:data
    });

    if( !request ){
        const initConfig = Object.assign(
            Object.create(null),
            System.getConfig('http.request')
        );
        request = HTTP_REQUEST = HttpFactor.create(initConfig);
        System.invokeHook('httpRequestCreated', request);
    }

    System.invokeHook('httpRequestSendBefore', request, config);
    return request.request(config);
}

const globalInvokes = Object.create(null);
const invokeRecords = {};
System.invokeHook=function invokeHook(type, ...args){
    const items = globalInvokes[type];
    const len = items && items.length;
    if( !hasOwn.call(invokeRecords, type) ){
        invokeRecords[type] = {type, items:[], called:new WeakSet()};
    }
    const records = invokeRecords[type];
    if( !records.items.some( arr=>{
        if(arr.length !== args.length)return false;
        return args.every( (item,index)=>arr[index]===item );
    })){
        records.items.push(args);
    }
    return len > 0 ? _invokeHook(items, args, records, true) : args[0] || null;
}

System.dispatchHook=function dispatchHook(type, ...args){
    const items = globalInvokes[type];
    return _invokeHook(items, args);
}

function _invokeHook(items, args, records=null, force=false){
    try{
        let len = items && items.length;
        let result = args[0];
        if( len > 0 ){
            let i = 0;
            let ctx = {
                stop:false,
                previous:null
            };
            args = args.slice(1);
            for(;i<len;i++){
                const [invoke,,once] = items[i];
                if(force || !records || !records.called.has(invoke)){
                    if(once){
                        items.splice(i,1);
                        len--;
                    }else if(records){
                        records.called.add(invoke);
                    }
                    result = invoke.call(ctx, result, ...args) || result;
                    if( ctx.stop ){
                        return result;
                    }
                    ctx.previous = result;
                }
            }
        }
        return result;
    }catch(e){
        console.error(e);
    }
}

System.registerHook=function registerHook(type, processer, priority, once=false){
    if( typeof processer !== 'function' ){
        throw new Error(`System.registerInvoke processer must is Function`);
    }else{

        if( typeof priority !== "number" || isNaN(priority) ){
            priority = 0;
        }

        if( !hasOwn.call(globalInvokes, type) ){
            globalInvokes[type] = [];
        }

        const items = globalInvokes[type];
        items.push( [processer,priority,once] );
        if( items.length > 1 ){
            items.sort( (a, b)=>{
                if( a[1] == b[1] )return 0;
                return a[1] > b[1] ? -1 : 1;
            });
        }

        if( hasOwn.call(invokeRecords, type) ){
            const records = invokeRecords[type];
            records.items.forEach( args=>{
                _invokeHook(items, args, records)
            });
        }
    }
}

System.registerOnceHook=function registerOnceHook(type, processer, priority){
    System.registerHook(type, processer, priority,true);
}

System.removeHook=function removeHook(type, processer){
    if( hasOwn.call(globalInvokes, type) ){
        const items = globalInvokes[type];
        if(processer){
            const index = items.findIndex(item=>item[0] === processer);
            items.splice(index,1);
            return index >= 0;
        }else{
            items.splice(0, items.length);
        }
        return true;
    }
    return false;
}

System.hasRegisterHook=function hasRegisterHook(type, processer){
    if( hasOwn.call(globalInvokes, type) ){
        const items = globalInvokes[type];
        if(processer){
            return items.some(item=>item[0] === processer);
        }
        return true;
    }
    return false;
}
 
 /**
  * 返回类的完全限定类名
  * @param value 需要完全限定类名称的对象。
  * 可以将任何类型、对象实例、原始类型和类对象
  * @returns {string}
  */
 System.getQualifiedClassName = function getQualifiedClassName( target ){
     if( target == null )throw new ReferenceError( 'target is null or undefined' );
     if( target===System )return 'System';
     if( typeof target === "function" && target.prototype){
        const desc = target && target[ Class.key ];
        if( desc ){
            return desc.ns ? desc.ns+'.'+desc.name : desc.name;
        }
        var str = target.toString();
        str = str.substr(0, str.indexOf('(') );
        return str.substr(str.lastIndexOf(' ')+1);
     }
     throw new ReferenceError( 'target is not Class' );
 };
 
 /**
  * 返回对象的完全限定类名
  * @param value 需要完全限定类名称的对象。
  * 可以将任何类型、对象实例、原始类型和类对象
  * @returns {string}
  */
 System.getQualifiedObjectName = function getQualifiedObjectName( target ){
     if( target == null || typeof target !== "object"){
         throw new ReferenceError( 'target is not object or is null' );
     }
     return System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
 };
 /**
  * 获取指定实例对象的超类名称
  * @param value
  * @returns {string}
  */
 System.getQualifiedSuperClassName =function getQualifiedSuperClassName(target){
     if( target == null )throw new ReferenceError( 'target is null or undefined' );
     const classname = System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
     const module = Class.getClassByName(classname);
     if( module ){
         return System.getQualifiedClassName( module.inherit || Object );
     }
     return null;
 };

 (function(System){
    const env = {
        'BROWSER_IE': 'IE',
        'BROWSER_FIREFOX': 'FIREFOX',
        'BROWSER_CHROME': 'CHROME',
        'BROWSER_OPERA': 'OPERA',
        'BROWSER_SAFARI': 'SAFARI',
        'BROWSER_MOZILLA': 'MOZILLA',
        'NODE_JS': 'NODE_JS',
        'IS_CLIENT': false,
    };
    var _platform = [];
    if (typeof navigator !== "undefined"){
        let ua = navigator.userAgent.toLowerCase();
        let s;
        (s = ua.match(/msie ([\d.]+)/)) ? _platform = [env.BROWSER_IE, parseFloat(s[1])] :
        (s = ua.match(/firefox\/([\d.]+)/)) ? _platform = [env.BROWSER_FIREFOX, parseFloat(s[1])] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? _platform = [env.BROWSER_CHROME, parseFloat(s[1])] :
        (s = ua.match(/opera.([\d.]+)/)) ? _platform = [env.BROWSER_OPERA, parseFloat(s[1])] :
        (s = ua.match(/version\/([\d.]+).*safari/)) ? _platform = [env.BROWSER_SAFARI, parseFloat(s[1])] :
        (s = ua.match(/^mozilla\/([\d.]+)/)) ? _platform = [env.BROWSER_MOZILLA, parseFloat(s[1])] : null;
        env.IS_CLIENT = true;

        const keywords = [
            'Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone', 'BlackBerry', 'Symbian', 'Opera Mobi', 
            'Maemo', 'Meego', 'Nintendo DS', 'Nintendo', 'PSP', 'Kindle', 'PlayStation', 'MicroMessenger'
        ];
        let is_mobile = null;
        env.isMobile=function(){
            if(is_mobile !== null)return is_mobile;
            for (let i = 0; i < keywords.length; i++) {
                const keyword = keywords[i];
                const regex = new RegExp(keyword, 'i');
                if (regex.test(ua)) {
                    return is_mobile = true;
                }
            }
            return is_mobile = false;
        }
        
        env.referrer=function(){
            const back = window.history.state.back;
            if(back){
                return location.origin + back;
            }
            return document.referrer;
        }

    }else{
        if(typeof process !== 'undefined' && process.versions){
            _platform = [env.NODE_JS, process.versions.node];
        }else{
            _platform = ['OTHER', 0];
        }
        env.isMobile=function(){
            return false;
        }
        env.referrer=function(){
            return ''
        }
    }

    /**
     * 获取当前运行平台
     * @returns {*}
     */
    env.platform = function platform(name, version){
        if ( typeof name === "string" ){
            name = name.toUpperCase();
            if( version > 0 )return name == _platform[0] && env.version( version );
            return name == _platform[0];
        }
        return _platform[0];
    };

    env.setPlatform=function setPlatform(name, version, isClient=false){
        _platform=[name,version];
        if(isClient){
            env.IS_CLIENT = true;
        }
    }

    env.isClient=function(){
        return env.IS_CLIENT;
    }

    /**
     * 判断是否为指定的浏览器
     * @param type
     * @returns {string|null}
     */
    env.version = function version(value, expr) {
        if(arguments.length===0)return _platform[0];
        var result = _platform[1];
        if (value == null)return false;
        value = parseFloat(value);
        switch (expr) {
            case '=' :
                return result == value;
            case '!=' :
                return result != value;
            case '>' :
                return result > value;
            case '>=' :
                return result >= value;
            case '<=' :
                return result <= value;
            case '<' :
                return result < value;
            default:
                return result <= value;
        }
    };
    System.env = env;
}(System));

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        System.setImmediate = global.setImmediate;
        System.clearImmediate = global.clearImmediate;
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    System.setImmediate = setImmediate;
    System.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));