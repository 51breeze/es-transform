import Utils from 'easescript/lib/core/Utils'
import Scope from 'easescript/lib/core/Scope'
const REFS_All = 31;
const REFS_TOP = 16;
const REFS_UP_CLASS = 8;
const REFS_UP_FUN = 4;
const REFS_UP = 2;
const REFS_DOWN = 1;
class Manage{

    #ctxScope = null;
    #cache = new Map();
    constructor(ctxScope){
        this.#ctxScope = ctxScope;
    }

    get(name){
        return this.#cache.get(name)
    }

    has(name){
        return this.#cache.has(name)
    }

    get ctxScope(){
        return this.#ctxScope;
    }

    check(name, scope, flags=REFS_All){
        if(this.#cache.has(name) )return true;
        if(!Scope.is(scope)){
            return false;
        }

        if(flags === REFS_All ){
            return scope.checkDocumentDefineScope(name, ['class']);
        }

        if(scope.isDefine(name)){
            return true;
        }

        let index = 0;
        let flag = 0;
        while( flag < (flags & REFS_All) ){
            flag = Math.pow(2,index++);
            switch( flags & flag ){
                case REFS_DOWN :
                    if(scope.declarations.has(name) || scope.hasChildDeclared(name))return true;
                case REFS_UP :
                    if( scope.isDefine(name) )return true;
                case REFS_TOP :
                    if( scope.isDefine(name) || scope.hasChildDeclared(name) )return true;
                case REFS_UP_FUN :
                    if( scope.isDefine(name,'function') )return true;
                case REFS_UP_CLASS :
                    if( scope.isDefine(name,'class') )return true;
            }
        }
        return false;
    }

    gen(name, scope, flags=REFS_All, begin=0){
        let index = begin;
        let value = name;
        while(this.check(value=name+index, scope, flags)){
            index++;
        }
        this.#cache.set(name,value);
        this.#cache.set(value,value);
        return value;
    }

    getRefs(name, scope, flags=REFS_All){
        if(scope){
            if(this.check(name, scope, flags)){
                return this.gen(name, scope, flags);
            }else{
                this.#cache.set(name,name);
            }
        }else{
            this.#cache.set(name,name);
        }
        return name;
    }
}

function getVariableManager(){
    const records = new Map();
    function _getVariableManage(ctxScope){
        let manage = records.get(ctxScope);
        if(!manage){
            records.set(ctxScope, manage=new Manage(ctxScope));
        }
        return manage;
    }

    function hasScopeDefined(context, name, isTop=false, flags=REFS_All){
        let manage = getVariableManage(context, isTop);
        if(Utils.isStack(context)){
            return manage.check(name, context.scope, flags)
        }
        return false;
    }

    function hasGlobalScopeDefined(context, name){
        return hasScopeDefined(context, name, true, REFS_All);
    }

    function hasLocalScopeDefined(context, name){
        return hasScopeDefined(context, name, false, REFS_DOWN | REFS_UP_FUN);
    }

    function hasRefs(context, name, isTop=false){
        let manage = getVariableManage(context, isTop);
        return manage.has(name);
    }

    function getRefs(context, name, isTop =false, flags=REFS_All){
        let manage = getVariableManage(context, isTop);
        if(manage.has(name)){
            return manage.get(name);
        }
        return manage.getRefs(name, Utils.isStack(context) ? context.scope : null, flags);
    }

    function getVariableManage(context, isTop =false){
        if(Utils.isStack(context)){
            let scope = context.scope;
            if(!Scope.is(scope)){
                throw new Error('Variable.getRefs scope invalid')
            }
            return _getVariableManage(
                isTop ? 
                    scope.getScopeByType('top') : 
                        scope.getScopeByType('function') || scope.getScopeByType('top')
            );
        }else{
            return _getVariableManage(context);
        }
    }

    function getGlobalRefs(context, name){
        return getRefs(context, name, true, REFS_All)
    }

    function getLocalRefs(context, name){
        return getRefs(context, name, false, REFS_DOWN | REFS_UP_FUN)
    }

    function genRefs(context, name, isTop=false, flags=REFS_DOWN | REFS_UP_FUN){
        let manage = getVariableManage(context, isTop);
        if(Utils.isStack(context)){
            return manage.gen(name, context.scope, flags);
        }else{
            return manage.gen(name, null, flags);
        }
    }

    function genGlobalRefs(context, name){
        return genRefs(context, name, true, REFS_All)
    }

    function genLocalRefs(context, name){
        return genRefs(context, name, false, REFS_DOWN | REFS_UP_FUN)
    }

    function clearAll(){
        records.clear()
    }

    return {
        getVariableManage,
        getRefs,
        getLocalRefs,
        getGlobalRefs,
        hasRefs,
        hasGlobalScopeDefined,
        hasLocalScopeDefined,
        genGlobalRefs,
        genLocalRefs,
        clearAll
    }
}

export {
    REFS_All,
    REFS_TOP,
    REFS_UP_CLASS,
    REFS_UP_FUN,
    REFS_UP,
    REFS_DOWN,
    getVariableManager
}