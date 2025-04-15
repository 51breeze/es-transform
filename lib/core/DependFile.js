import Utils from "easescript/lib/core/Utils";
const dataset = new Map()
class DependFile{
    static create(dir, files=[]){
        dir = Utils.normalizePath(dir);
        let key = String(dir).toLowerCase();
        let instance = dataset.get(key);
        if(!instance){
            instance = new DependFile(dir);
            dataset.set(key, instance);
        }
        instance.addFiles(files);
        return instance;
    }

    #dir = null;
    #files = null;
    #disabled = false;
    constructor(dir){
        this.#dir = dir;
    }

    get dir(){
        return this.#dir;
    }

    get files(){
        return [...(this.#files||[])];
    }

    get disabled(){
        return this.#disabled;
    }

    setDisabled(){
        this.#disabled = true;
    }

    addFiles(files){
        if(files){
            if(!Array.isArray(files)){
                files = [files];
            }
            const dataset = this.#files || (this.#files = new Set());
            files.forEach(file=>{
                dataset.add(Utils.normalizePath(file));
            });
        }
    }
}

export default DependFile;
