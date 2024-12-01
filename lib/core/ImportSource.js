import Utils from "easescript/lib/core/Utils";

class ImportManage{
    #records = new Map();
    #locals = new Map()
    createImportSource(sourceId, local=null, imported=null, stack=null){
        let key = sourceId;
        if(imported==='*'){
            key += ':*';
        }
        let importSource = this.#records.get(key)
        if(!importSource){
            this.#records.set(key, importSource=new ImportSource(sourceId))
        }
        if(local){
            const source = this.#locals.get(local)
            if(source){
                if(source !== importSource){
                    throw new Error(`declare '${local}' is not redefined`)
                }
            }else{
                this.#locals.set(local, importSource)
            }
            importSource.addSpecifier(local, imported, stack)
        }
        return importSource;
    }

    hasImportSource(sourceId, local=null, isNamespace=false){
        let key = sourceId;
        if(isNamespace){
            key += ':*';
        }
        let importSource = this.#records.get(key)
        if(!importSource)return false;
        if(local){
            const source = this.#locals.get(local)
            return importSource === source;
        }
        return true;
    }

    getImportSource(sourceId, isNamespace=false){
        let key = sourceId;
        if(isNamespace){
            key += ':*';
        }
        return this.#records.get(key)
    }

    getAllImportSource(){
        return Array.from(this.#records.values()).sort((a, b)=>{
            let m1 = a.getSourceTarget();
            let m2 = b.getSourceTarget();
            let a1 = Utils.isModule(m1) && m1.getName()==='Class' ? 0 : 1;
            let b1 = Utils.isModule(m2) && m2.getName()==='Class' ? 0 : 1;
            return a1 - b1;
        })
    }
}

class ImportSource{
    #sourceId = null
    #specifiers = []
    #fields = null
    #stack = null
    #isExportSource = false;
    #sourceTarget = null;
    #sourceContext = null;
    constructor(sourceId){
        this.#sourceId = sourceId;
        this.#fields = Object.create(null);
    }

    get sourceId(){
        return this.#sourceId
    }

    get specifiers(){
        return this.#specifiers;
    }

    get stack(){
        return this.#stack
    }

    set stack(value){
        this.#stack = value;
    }

    get isExportSource(){
        return this.#isExportSource
    }

    setSourceTarget(value){
        if(value){
            this.#sourceTarget = value;
        }
    }

    getSourceTarget(){
        return this.#sourceTarget;
    }

    setExportSource(){
        this.#isExportSource = true;
    }

    getSpecifier(imported){
        return this.#fields[imported]
    }

    addSpecifier(local, imported=null, stack=null){
        if(local){
            let type = imported ? 'specifier' : 'default'
            if(imported==='*'){
                type = 'namespace'
            }
            let key = local;
            let old = this.#fields[key];
            if(old){
                if(old.type !== type){
                    console.error('import specifier has inconsistent definitions')
                }
                old.type = type;
                return true
            }
            let spec = {
                type,
                local,
                imported,
                stack
            }
            this.#fields[key] = spec;
            this.#specifiers.push(spec)
            return true;
        }
    }
}

export {
    ImportSource,
    ImportManage
}