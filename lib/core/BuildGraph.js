class BuildGraph{
    #code = ''
    #sourcemap = null
    #module = null
    #dependencies = null
    #fileDependencies = null
    #imports = null
    #assets = null
    #exports = null
    #children = null;
    #parent = null;
    #outfile = null;
    #building = false;
    #done = false;
    constructor(module){
        this.#module = module
    }

    start(){
        this.#building = true;
        this.#done = false;
    }

    done(){
        this.#building = false;
        this.#done = true;
    }

    get building(){
        return this.#building;
    }

    get buildDone(){
        return this.#done;
    }

    get module(){
        return this.#module
    }

    get code(){
        return this.#code
    }

    set code(value){
        this.#code = value;
    }

    get sourcemap(){
        return this.#sourcemap
    }

    set sourcemap(value){
        this.#sourcemap = value;
    }

    get dependencies(){
        return this.#dependencies;
    }

    get imports(){
        return this.#imports
    }

    get exports(){
        return this.#exports
    }

    get assets(){
        return this.#assets
    }

    get children(){
        return this.#children;
    }

    get parent(){
        return this.#parent;
    }

    get outfile(){
        return this.#outfile
    }

    set outfile(value){
        this.#outfile = value;
    }

    addChild(child){
        if(child.#parent)return;
        let children = this.#children;
        if(!children){
            this.#children = children = new Set()
        }
        children.add(child)
        child.#parent = this;
    }

    addImport(importSource){
        let imports = this.#imports;
        if(!imports){
            this.#imports = imports = new Set()
        }
        imports.add(importSource)
    }

    addExport(exportSource){
        let exports = this.#exports;
        if(!exports){
            this.#exports = exports = new Set()
        }
        exports.add(exportSource)
    }

    addDepend(module){
        let deps = this.#dependencies;
        if(!deps){
            this.#dependencies = deps = new Set()
        }
        deps.add(module)
    }

    addDependOnFile(dependFile){
        if(dependFile){
            const deps = this.#fileDependencies || (this.#fileDependencies = new Set());
            deps.add(dependFile);
        }
    }

    getDependFiles(){
        const deps =this.#fileDependencies;
        const items = deps ? [...deps] : [];
        const children = this.children;
        if(children){
            items.push(...[...children].map(graph=>graph.getDependFiles()).flat());
        }
        return items;
    }

    getDependencies(){
        const deps = this.#dependencies;
        const items = deps ? [...deps] : [];
        const children = this.children;
        if(children){
            items.push(...[...children].map(graph=>graph.getDependencies()).flat());
        }
        return items;
    }

    addAsset(asset){
        let assets = this.#assets;
        if(!assets){
            this.#assets = assets = new Set()
        }
        assets.add(asset)
    }

    findAsset(filter){
        let assets = this.#assets
        if(assets){
            for(let asset of assets){
                if(filter(asset)){
                    return asset;
                }
            }
        }
        return null
    }
}

function getBuildGraphManager(){
    const records = new Map()
    function createBuildGraph(moduleOrCompilation, module=null){
        let old = records.get(moduleOrCompilation)
        if(old)return old;
        let graph = new BuildGraph(module);
        records.set(moduleOrCompilation, graph)
        return graph;
    }

    function getBuildGraph(moduleOrCompilation){
        return records.get(moduleOrCompilation)
    }

    function setBuildGraph(moduleOrCompilation, graph){
        return records.set(moduleOrCompilation, graph)
    }

    function hasBuildGraph(moduleOrCompilation){
        return records.has(moduleOrCompilation)
    }

    function clear(compilation){
        keys.forEach(([value, key])=>{
            if(key===compilation || key.compilation === compilation){
                records.delete(key)
            }
        })
    }

    function clearAll(){
        records.clear();
        mainGraphs.clear();
    }

    return {
        clear,
        clearAll,
        setBuildGraph,
        getBuildGraph,
        createBuildGraph,
        hasBuildGraph
    }

}

export {
    BuildGraph,
    getBuildGraphManager
}