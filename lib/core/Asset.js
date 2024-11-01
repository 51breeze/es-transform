import path from 'path';
import fs from 'fs';
class Asset{
    #code = ''
    #type = ''
    #file = null
    #sourcemap = null
    #local = null
    #imported = null
    #sourceId=null;
    #outfile=null;
    #id = null;
    #changed = true;
    constructor(sourceFile, type, id=null){
        this.#type = type;
        this.#file = sourceFile
        this.#sourceId = sourceFile
        this.#id = id;
    }

    get code(){
        let code = this.#code;
        if(code)return code;
        let file = this.file;
        if(file && fs.existsSync(file)){
            this.#code = fs.readFileSync(file).toString('utf8')
        }
        return this.#code;
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

    get outfile(){
        return this.#outfile;
    }

    getOutFile(ctx){
        if(this.#outfile)return this.#outfile;
        let source = ctx.getOutputAbsolutePath(this.sourceId);
        let ext = ctx.getOutputExtName();
        if(!source.endsWith(ext)){
            source += ext;
        }
        this.#outfile = source;
        return source;
    }

    async build(ctx){
        if(!this.#changed)return;
        if(ctx.options.emitFile){
            let code = this.code;
            if(ctx.options.module==='cjs'){
                code = `module.exports=${JSON.stringify(code)};`
            }else{
                code = `export default ${JSON.stringify(code)};`
            }
            this.code = code;
            this.#outfile = this.getOutFile(ctx);
            ctx.emit(this)
        }
        this.#changed = false;
    }
}

function getAssetsManager(AssetFactory){
    const records = new Map();
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
            records.set(sourceFile, asset = new AssetFactory(sourceFile, type, id))
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

    function getAssets(){
        return Array.from(records.values());
    }

    function setAsset(sourceFile, asset, id=null, type=null){
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
        records.set(key,asset)
    }

    return {
        createAsset,
        createStyleAsset,
        getStyleAsset,
        getAsset,
        setAsset,
        getAssets
    }
}

export {
    getAssetsManager,
    Asset
}