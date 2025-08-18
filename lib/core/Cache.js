import Utils from "easescript/lib/core/Utils"

function createCache(){
    const records = new Map()
    function set(key, name, value){
        let dataset = records.get(key)
        if(!dataset){
            records.set(key, dataset=new Map())
        }
        dataset.set(name, value)
        return value
    }

    function get(key, name){
        let dataset = records.get(key)
        return dataset ? dataset.get(name) : null
    }

    function has(key, name){
        let dataset = records.get(key)
        return dataset ? dataset.has(name) : false
    }

    function del(key, name){
        let dataset = records.get(key)
        if(dataset){
            dataset.delete(name)
            return true
        }
        return false;
    }

    function clear(key){
        if(Utils.isCompilation(key)){
            key.modules.forEach(module=>{
                records.delete(module)
            });
            records.forEach((v,stack)=>{
                if(stack && stack.compilation === key){
                    records.delete(stack)
                }
            })
        }
        let dataset = records.get(key)
        records.delete(key)
        if(dataset){
            dataset.clear(key)
            return true
        }
        return false;
    }

    function clearAll(){
        records.clear();
    }

    return {
        set,
        get,
        has,
        del,
        clear,
        clearAll,
        records
    }
}

const records = new Map()
function getCacheManager(scope=null){
    if(scope){
        let exists = records.get(scope)
        if(!exists){
            records.set(scope, exists=createCache())
        }
        return exists;
    }
    return createCache();
}

export {
    getCacheManager
}