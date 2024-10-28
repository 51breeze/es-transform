
function getExportType(exported, local){
    let type = local && typeof local ==='string' ? 'specifier' : 'named'
    if(exported==='default')type = 'default'
    if(local==='*' || !exported){
        type = 'namespace'
    }
    return type;
}

class ExportManage{
    #records = new Map();
    #exporteds = new Map();
    createExportSource(exported, local=null, importSource=null, stack=null){
        
        let key = exported;
        if(!key){
            key = importSource;
        }

        let old = this.#exporteds.get(key);
        if(old){
            if(old.getSpecifier(exported).local !== local || importSource != old.importSource){
                throw new Error(`Multiple exports with the same name "${exported}"`)
            }
        }

        let exportSource = null
        if(importSource){
            exportSource = this.#records.get(importSource)
            if(!exportSource){
                this.#records.set(importSource, exportSource = new ExportSource(importSource, this))
            }
            this.#exporteds.set(key, exportSource)
        }else{
            exportSource = this.#exporteds.get(key)
            if(!exportSource){
                this.#exporteds.set(key, exportSource=new ExportSource(null, this))
            }
        }
        exportSource.addSpecifier(exported, local, stack)
        return exportSource;
    }

    bindSource(exported, exportSource){
        this.#exporteds.set(exported, exportSource)
    }

    hasExportSource(exported){
        return this.#exporteds.has(exported);
    }

    getExportSource(exported){
        return this.#exporteds.get(exported)
    }

    getAllExportSource(){
        return Array.from(this.#exporteds.values())
    }
}

class ExportSource{
    #importSource = null
    #specifiers = []
    #fields = null
    #stack = null
    #exportManage = null
    constructor(importSource, exportManage){
        this.#importSource = importSource;
        this.#fields = Object.create(null);
        this.#exportManage = exportManage
    }

    get importSource(){
        return this.#importSource
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

    bindExport(exporteds){
        if( Array.isArray(exporteds) ){
            exporteds.forEach(exported=>{
                this.#exportManage.bindSource(exported, this)
            })
        }else if(typeof exporteds ==='string'){
            this.#exportManage.bindSource(exporteds, this)
        }
    }

    getSpecifier(exported){
        return this.#fields[exported]
    }

    addSpecifier(exported, local=null, stack=null){
        let type = getExportType(exported, local)
        let old = this.#fields[exported];
        if(old){
            if(old.type !== type){
                console.error('export specifier has inconsistent definitions')
            }
            old.type = type;
            return true
        }
        let spec = {
            type,
            local,
            exported,
            stack
        }
        this.#fields[exported] = spec;
        this.#specifiers.push(spec)
        return true;
    }
}

export {
    ExportSource,
    ExportManage,
}