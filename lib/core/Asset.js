import path from 'path';
class Asset{
    #code = ''
    #type = ''
    #file = null
    #sourcemap = null
    #local = null
    #imported = null
    #sourceId=null;
    #id = null;
    #changed = true;
    constructor(sourceFile, type, id=null){
        this.type = type;
        this.#file = sourceFile
        this.#sourceId = sourceFile
        this.#id = id;
    }

    get code(){
        return this.#code
    }

    set code(value){
        this.#code = value;
        this.#changed = true;
    }

    get id(){
        return this.#id
    }

    set id(value){
        this.#id = value;
    }

    get local(){
        return this.#local
    }

    set local(value){
        this.#local = value;
    }

    get imported(){
        return this.#imported
    }

    set imported(value){
        this.#imported = value;
    }

    get file(){
        return this.#file
    }

    set file(value){
        this.#file = value;
    }

    get sourceId(){
        return this.#sourceId
    }

    set sourceId(value){
        this.#sourceId = value;
    }

    get type(){
        return this.#type
    }

    get sourcemap(){
        return this.#sourcemap
    }

    set sourcemap(value){
        this.#sourcemap = value;
    }

    async build(ctx){
        this.#changed = false;
    }
}

const records = new Map()
function createAsset(sourceFile, id=null, type=null){
    if(!type){
        type = path.extname(sourceFile);
        if(type.startsWith('.')){
            type = type.substring(1)
        }
    }else{
        type = String(type)
    }
    let key = sourceFile +':'+ type;
    if(id != null){
        key =  sourceFile + ':' + id +':'+ type;
    }
    let asset = records.get(key)
    if(!asset){
        records.set(sourceFile, asset = new Asset(sourceFile, type, id))
    }
    return asset;
}

function createStyleAsset(sourceFile, id=null){
   return createAsset(sourceFile, id, 'style')
}

function getAsset(sourceFile, id=null, type=''){
    let key = sourceFile+':'+ type;
    if(id){
        key =  sourceFile + ':' + id +':'+ type;
    }
    return records.get(key)
}

function getStyleAsset(sourceFile, id=null){
   return getAsset(sourceFile, id, 'style')
}

export {
    createAsset,
    createStyleAsset,
    getStyleAsset,
    getAsset
}