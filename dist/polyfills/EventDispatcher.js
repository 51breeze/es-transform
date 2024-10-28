/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<references from='Event' />

var __KEY__ = Symbol('EventDispatcher');
function EventDispatcher( target ){
    if( !(this instanceof EventDispatcher) ){
        return new EventDispatcher( target );
    }

    if( !Object.prototype.hasOwnProperty.call(this,__KEY__) ){
        Object.defineProperty(this,__KEY__,{value:{events:{},isEvent:false,proxy:null}});
    }

    if( target ){
        if( typeof target !== 'object'){
            throw new Error('target is not object');
        }
        const data = this[__KEY__];
        data.isEvent = target instanceof EventDispatcher;
        data.proxy = target;
    }
}

EventDispatcher.prototype.constructor = EventDispatcher;

/**
 * 判断是否有指定类型的侦听器
 * @param type
 * @param listener
 * @returns {boolean}
 */
EventDispatcher.prototype.hasEventListener=function hasEventListener( type , listener ){
    var target =  this[ __KEY__ ];
    if( target.isEvent ){
        return target.proxy.hasEventListener(type, listener);
    }
    var events = target.events[type];
    if( !events )return false;
    var len = events && events.length >> 0;
    if( len > 0 && listener === void 0 )return true;
    while(len>0 && events[--len] ){
        if( events[len].callback === listener ){
            return true;
        }  
    }
    return false;
};

/**
 * 添加侦听器
 * @param type
 * @param listener
 * @param priority
 * @returns {EventDispatcher}
 */
EventDispatcher.prototype.addEventListener=function addEventListener(type,callback,useCapture,priority,reference){
    if( typeof type !== 'string' )throw new TypeError('Invalid event type');
    if( typeof callback !== 'function' )throw new TypeError('Invalid callback function');
    var target =  this[ __KEY__ ];
    if( target.isEvent ){
        target.proxy.addEventListener(type,callback,useCapture,priority,reference||this);
        return this;
    }
    var listener = new Listener(type,callback,useCapture,priority,reference,this);
    var events = target.events[ type ] || ( target.events[ type ]=[] );
    if( events.length < 1 && target.proxy ){
        listener.proxyHandle = $dispatchEvent;
        listener.proxyTarget = target.proxy;
        listener.proxyType = [type];
        try {
            if(target.proxy.addEventListener){
                target.proxy.addEventListener(type, listener.proxyHandle, listener.useCapture);
            }else{
                listener.proxyHandle=function (e) {
                    $dispatchEvent(e, target.proxy);
                }
                target.proxy.attachEvent(type, listener.proxyHandle);
            }
        }catch (e) {}
    }
    events.push( listener );
    if( events.length > 1 ) events.sort(function(a,b){
        return a.priority=== b.priority ? 0 : (a.priority < b.priority ? 1 : -1);
    });
    return this;
};

/**
 * 移除指定类型的侦听器
 * @param type
 * @param listener
 * @returns {boolean}
 */
EventDispatcher.prototype.removeEventListener=function removeEventListener(type,listener){
    var target =  this[ __KEY__ ];
    if(target.isEvent){
        return target.proxy.removeEventListener(type,listener);
    }
    var events = target.events[ type ];
    if(!events)return;
    var len = events && events.length >> 0;
    var ret = len;
    if( len<1 ){
        return false;
    }
    while (len > 0){
        --len;
        if ( !listener || events[len].callback === listener ){
            var result = events.splice(len, 1);
            if( result[0] && target.proxyHandle ){
                var types = result[0].proxyType;
                var num = types.length;
                while ( num > 0 ){
                    $removeListener(result[0].proxyTarget, types[ --num ], result[0].proxyHandle);
                }
            }
        }
    }
    return events.length !== ret;
};

/**
 * 调度指定事件
 * @param event
 * @returns {boolean}
 */
EventDispatcher.prototype.dispatchEvent=function dispatchEvent( event ){
    if( !(event instanceof Event) )throw new TypeError('Invalid event');
    var target =  this[ __KEY__ ];
    if( target.isEvent ){
        return target.proxy.dispatchEvent(event);
    }
    event.target = event.currentTarget=this;
    return $dispatchEvent( event );
};


function $removeListener(target, type , handle ){
    var eventType= type;
    if( target.removeEventListener ){
        target.removeEventListener(eventType,handle,false);
        target.removeEventListener(eventType,handle,true);
    }else if( target.detachEvent ){
        target.detachEvent(eventType,handle);
    }
}

/**
 * 调度指定侦听项
 * @param event
 * @param listeners
 * @returns {boolean}
 */
function $dispatchEvent(e){
    if( !e || !e.currentTarget )throw new Error('Invalid event target');
    var target = e.currentTarget;
    var events = target[ __KEY__ ] && target[ __KEY__ ].events[ e.type ];
    if( !events || events.length < 1 )return true;
    events = events.slice(0);
    var length= 0,listener,thisArg,count=events.length;
    while( length < count ){
        listener = events[ length++ ];
        thisArg = listener.reference || listener.dispatcher;
        listener.callback.call( thisArg , e );
        if( e.immediatePropagationStopped===true ){
           return false;
        }
    }
    return true;
}

/**
 * 事件侦听器
 * @param type
 * @param callback
 * @param priority
 * @param capture
 * @param currentTarget
 * @param target
 * @constructor
 */
function Listener(type,callback,useCapture,priority,reference,dispatcher){
    this.type=type;
    this.callback=callback;
    this.useCapture=!!useCapture;
    this.priority=priority>>0;
    this.reference=reference || null;
    this.dispatcher=dispatcher;
}

Object.defineProperty(Listener.prototype,"constructor",{value:Listener});
Listener.prototype.useCapture=false;
Listener.prototype.dispatcher=null;
Listener.prototype.reference=null;
Listener.prototype.priority=0;
Listener.prototype.callback=null;
Listener.prototype.type=null;
Listener.prototype.proxyHandle = null;
Listener.prototype.proxyTarget = null;
Listener.prototype.proxyType = null;