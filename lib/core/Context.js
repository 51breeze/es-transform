import path from 'path';
import fs from 'fs';
import Token from './Token';
import * as Common from './Common';
import {ImportManage} from './ImportSource';
import {ExportManage} from './ExportSource';
import {isVModule} from './VirtualModule';
import Utils from 'easescript/lib/core/Utils'
import Range from 'easescript/lib/core/Range'
class Context extends Token{

    static is(value){
        return value ? value instanceof Context : false;
    }

    #target = null;
    #dependencies = new Map();
    #plugin = null;
    #nodes = new Map();
    #imports = new ImportManage();
    #exports = new ExportManage();
    #afterBody = [];
    #beforeBody = [];
    #variables = null;
    #graphs = null;
    #assets = null;
    #virtuals = null;
    #glob = null;
    #cache = null;
    #token = null;
    #table = null;
    #vnodeHandleNode = null;

    constructor(compiOrVModule, plugin, variables, graphs, assets, virtuals, glob, cache, token, table){
        super()
        this.#plugin = plugin;
        this.#target = compiOrVModule;
        this.#variables = variables;
        this.#graphs = graphs;
        this.#assets = assets;
        this.#virtuals = virtuals;
        this.#glob = glob;
        this.#cache = cache;
        this.#token = token;
        this.#table = table;
    }

    get plugin(){
        return this.#plugin;
    }

    get compiler(){
        return this.#plugin.complier;
    }

    get target(){
        return this.#target;
    }

    get options(){
        return this.#plugin.options;
    }

    get imports(){
        return this.#imports
    }

    get exports(){
        return this.#exports
    }

    get afterBody(){
        return this.#afterBody
    }

    get beforeBody(){
        return this.#beforeBody
    }

    get variables(){
        return this.#variables
    }

    get graphs(){
        return this.#graphs
    }

    get assets(){
        return this.#assets
    }
    
    get virtuals(){
        return this.#virtuals
    }

    get cache(){
        return this.#cache
    }

    get glob(){
        return this.#glob;
    }

    get token(){
        return this.#token;
    }

    get table(){
        return this.#table;
    }

    get dependencies(){
        return this.#dependencies;
    }
    
    #hooks = [];
    addHook(hook){
        this.#hooks.push(hook);
    }

    getHooks(){
        return this.#hooks;
    }

    getLayouts(imports, body, externals,  exports){
        return [
            ...imports,
            ...this.beforeBody,
            ...body,
            ...this.afterBody,
            ...externals,
            ...exports
        ];
    }

    addBuildAfterDep(dep){
        const ctx = this.plugin.context;
        ctx.addBuildAfterDep(dep);
    }

    createAsset(source){
        let asset = this.assets.createAsset(source)
        if(asset){
            asset.initialize(this);
        }
        return asset;
    }

    createStyleAsset(source, index){
        let asset = this.assets.createStyleAsset(source, index)
        if(asset){
            asset.initialize(this);
        }
        return asset;
    }

    getVModule(sourceId){
        return this.virtuals.getVModule(sourceId)
    }

    useClassConstructor(module){
        if(this.options.useClassConstructor && Utils.isModule(module)){
            return !(module.isDecorator() || module.isCallable());
        }
        return false;
    }

    hasVModule(sourceId){
        return this.virtuals.hasVModule(sourceId)
    }

    isVModule(module){
        if(module){
            if(module.isDeclaratorModule){
                return this.hasVModule(module.getName());
            }else if(this.virtuals.isVModule(module)){
                return true
            }
        }
        return false
    }

    addNodeToAfterBody(node){
        if(node){
            let afterBody = this.#afterBody || (this.#afterBody = [])
            afterBody.push(node)
        }
        return node
    }

    addNodeToBeforeBody(node){
        if(node){
            let beforeBody = this.#beforeBody || (this.#beforeBody = [])
            beforeBody.push(node)
        }
        return node
    }

    addImport(source, local=null, imported=null, stack=null){
        return this.#imports.createImportSource(source, local, imported, stack)
    }

    getImport(source, isNamespace=false){
        return this.#imports.getImportSource(source, isNamespace)
    }

    hasImport(source, local=null, isNamespace=false){
        return this.#imports.hasImportSource(source, local, isNamespace)
    }

    addExport(exported, local=null, importSource=null, stack=null){
        return this.#exports.createExportSource(exported, local, importSource, stack)
    }

    hasExport(exported){
        return this.#exports.hasExportSource(exported)
    }
    
    addDepend(dep, context=null){
        context = context || this.target;
        let deps = this.#dependencies.get(context)
        if(!deps){
            this.#dependencies.set(context, deps=new Set())
        }
        deps.add(dep);
    }

    getDependencies(context=null){
        context = context || this.target;
        return this.#dependencies.get(context);
    }

    getAllDependencies(){
        const deps = new Set();
        this.#dependencies.forEach(dataset=>{
            dataset.forEach(dep=>deps.add(dep))
        })
        return deps;
    }

    isUsed(module, context=null){
        if(!module)return false;
        context = context || this.target;
        let deps = this.#dependencies.get(context)
        if(deps && deps.has(module)){
            return true;
        }
        if(this.isVModule(module))return true;
        return module.compilation === this.target;
    }

    isActiveModule(depModule,context=null, isExtend = false){
        if(!depModule)return false;
        context = context || this.target;
        if(!isExtend && !this.isUsed(depModule, context))return false;
        if(depModule.isDeclaratorModule){
            if(this.hasVModule(depModule.getName())){
                return true;
            }
            if(this.isDeclaratorModuleDependency(depModule, isExtend)){
                return true
            }
            return false;
        }else{
            if(isVModule(depModule))return true;
            if(context){
                return !Utils.checkDepend(context, depModule);
            }
            return true;
        }
    }

    isNeedBuild(module){
        if(!module)return false;
        if(isVModule(module))return true;
        if(this.cache.has(module,'isNeedBuild')){
            return this.cache.has(module,'isNeedBuild');
        }
        let result = this.compiler.isPluginInContext(this.plugin, module);
        if(result){
            const annots = Common.getModuleAnnotations(module, ['runtime', 'syntax'])
            if(annots.length>0){
                result = annots.every(annot=>{
                    const data = Common.parseMacroAnnotation(annot)
                    if(!data){
                        throw new Error('Annotations parse data exception.')
                    }
                    const name = annot.getLowerCaseName()
                    switch(name){
                        case 'runtime' :
                            return Common.isRuntime(data.value, this.options.metadata||{}) === data.expect;
                        case "syntax" :
                            return Common.isSyntax(data.value, this.plugin.version) === data.expect;
                    }
                    return false;
                });
            }
        }
        this.cache.has(module,'isNeedBuild',result)
        return result;
    }

    hasDeclareModule(module){
        if(Utils.isCompilation(this.target)){
            if(this.target.modules.has(module.getName())){
                return true;
            }
            return this.target.importModuleNameds.has(module)
        }else if(Utils.isModule(this.target)){
            const vm = this.getVModule(this.target.getName());
            if(vm){
                return !!vm.getReferenceName(module.getName());
            }
        }
        return false;
    }
    
    setNode(stack, node){
        this.#nodes.set(stack, node)
    }

    getNode(stack){
        return this.#nodes.get(stack)
    }

    removeNode(stack){
        this.#nodes.delete(stack)
    }

    getHashId(len=8){
        let target = this.#target;
        if(Utils.isCompilation(target)){
            let file = target.file || Array.from(target.modules.values()).map(m=>m.getName()).join(',')
            return Common.createUniqueHashId(file, len)
        }else if(isVModule(target) || Utils.isModule(target)){
            return Common.createUniqueHashId(target.getName(), len)
        }else{
            throw new Error("Invalid target")
        }
    }

    getModuleReferenceName(module,context=null){
        let name = null;
        if(isVModule(module)){
            let m = module.bindModule;
            if(!m){
                name = module.getName('_')
                return this.getGlobalRefName(null, name);
            }else{
                module = m;
            }
        }else if(!Utils.isModule(module)){
            return null;
        }
        if(!context)context = this.target;
        if(Utils.isModule(context)){
            if(context.isDeclaratorModule){
                const vm = this.getVModule(context.getName());
                if(vm){
                    name = vm.getReferenceName(module.getName());
                }
            }
            if(!name){
                name = context.getReferenceNameByModule(module);
            }
        }else if(Utils.isCompilation(context)){
            name = context.getReferenceName(module)
        }
        if(this.hasDeclareModule(module)){
            return name;
        }
        if(!name){
            name = module.getName('_');
        }
        return this.getGlobalRefName(null, name)
    }

    isDeclaratorModuleDependency(module, isExtend=false){
        if(!Utils.isClassType(module))return false
        if(isExtend)return true;
        if(module.required && module.isAnnotationCreated){
            return true;
        }else if(module.isDeclaratorModule){
            return module.getImportDeclarations().some( item=>{
                if(item.isImportDeclaration && item.source.isLiteral){
                    return item.specifiers.some(spec=>spec.value() === module.id)
                }
                return false;
            });
        }
        return false;
    }

    isES6ClassModule(module){
        const annots = Common.getModuleAnnotations(module, ['define'], false)
        return annots.some(annot=>{
            const data = Common.parseDefineAnnotation(annot);
            return data.es6class
        });
    }

    isLoadAssetsRawCode(stack,resolveFile){
        if(!stack || !resolveFile)return false;
        if(!stack.isAnnotationDeclaration)return false;
        if(stack.getLowerCaseName() !== 'embed')return false;
        if(/\.[m|c]?js$/i.test(resolveFile) )return true;
        return this.compiler.isExtensionFile(resolveFile);
    }

    createDeclaratorModuleImportReferences(module, context, graph=null){
        if(!Utils.isModule(module))return;
        if(!graph && context){
            graph = this.getBuildGraph(context)
        }
        this.createRequires(module, context, graph)
        this.createModuleImportReferences(module, context, graph)
    }

    createModuleImportReferences(module, context=null, graph=null){
        if(!Utils.isModule(module))return;
        if(!graph){
            graph = this.getBuildGraph(module)
        }
        module.getImportDeclarations().forEach( item=>{
            if(item.source.isLiteral){
                Common.parseImportDeclaration(this, item, context||module, graph)
            }
        });
    }

    resolveAsset(rawAsset, context){
        if(rawAsset.file){
            let source = rawAsset.resolve;
            let specifiers = null;
            if(rawAsset.assign){
                specifiers = [
                    {
                        local:rawAsset.assign,
                        stack:rawAsset.stack
                    }
                ]
            }
            source = this.getImportAssetsMapping(source, {
                group:'imports', 
                source,
                specifiers,
                ctx:this,
                context
            });
            if(source){
                let asset = this.createAsset(source);
                asset.file = rawAsset.resolve;
                if(rawAsset.assign){
                    asset.local = rawAsset.assign;
                }
                return {asset, specifiers};
            }
        }else{
            let {index,type,attrs={}} = rawAsset;
            let lang = attrs.lang || attrs.type || 'css';
            let suffix = 'file.'+lang;
            let _attrs = {...attrs, index, type, lang, [suffix]:''};
            if(_attrs.scoped){
                _attrs.scoped = this.getHashId();
            }
            let source = this.getModuleResourceId(context, _attrs);
            let webpack = this.options.webpack || {};
            if(webpack.enable){
                source = [...(webpack.inlineStyleLoader||[]), source].join('!')
            }
            let asset = this.createStyleAsset(source, index)
            asset.code = rawAsset.content;
            asset.attrs = _attrs;
            return {asset:asset};
        }
        return null;
    }

    createAssets(context, graph){
        const assets = context.assets;
        if(assets && assets.size>0){
            assets.forEach( rawAsset=>{
                let {asset, specifiers} = this.resolveAsset(rawAsset, context); 
                if(asset){
                    if(graph)graph.addAsset(asset);
                    let source = this.getAssetsImportSource(asset, context)
                    if(source){
                        let importSource = null;
                        if(specifiers && specifiers.length>0){
                            specifiers.forEach(spec=>{
                                importSource = this.addImport(source, spec.local, spec.imported)
                            })
                        }else{
                            importSource = this.addImport(source)
                        }
                        importSource.setSourceTarget(asset);
                        if(graph){
                            graph.addImport(importSource)
                        }
                    }
                }
            });
        }
    }

    createRequires(module, context, graph){
        const requires = module.requires;
        if(requires && requires.size > 0){
            requires.forEach( item=>{
                let local = item.name;
                if(Utils.isStack(item.stack) && item.stack.parentStack && item.stack.parentStack.isAnnotationDeclaration){
                    let additional = item.stack.parentStack.additional;
                    if(additional && additional.isDeclaratorDeclaration && additional.module.id === local){
                        local = this.getModuleReferenceName(additional.module, context)
                    }
                }
                this.createRequire(
                    module,
                    graph,
                    item.from,
                    local,
                    item.namespaced ? '*' : item.key
                )
            });
        }
    }

    createRequire(context, graph, source,  local, imported=null){
        if(!source)return;
        let specifiers = [{
            local,
            imported
        }];
        let target = source;
        source = this.getImportAssetsMapping(source, {
            group:'imports', 
            source,
            specifiers,
            context:this,
            owner:context
        });
        if(source){
            let importSource = null;
            if(specifiers.length>0){
                specifiers.forEach(spec=>{
                    importSource = this.addImport(source, spec.local, spec.imported);
                })
            }else{
                importSource = this.addImport(source);
            }
            if(importSource){
                importSource.setSourceTarget(target);
            }
            if(importSource && graph){
                graph.addImport(importSource)
            }
        }
    }

    crateModuleAssets(module){
        if(!Utils.isModule(module))return;
        const graph = this.getBuildGraph(module)
        this.createAssets(module, graph)
        this.createRequires(module, null, graph)
    }

    crateRootAssets(){
        const compilation = this.target;
        if(compilation){
            const graph = this.getBuildGraph(compilation)
            this.createAssets(compilation, graph)
            this.createRequires(compilation, null, graph)
        }
    }

    createAllDependencies(cache=null){
        const target = this.target;
        const compilation = Utils.isCompilation(target) ? target : null;
        this.#dependencies.forEach((deps, moduleOrCompi)=>{
            const graph = this.getBuildGraph(moduleOrCompi)
            deps.forEach(depModule =>{
                if(cache && cache.has(depModule))return;
                let isMod = Utils.isModule(depModule);
                if(!(isMod || isVModule(depModule)))return;
                if(depModule === target || compilation && compilation.modules.has(depModule.getName())){
                    return;
                }
                if(moduleOrCompi !== depModule && this.isNeedBuild(depModule)){
                    graph.addDepend(depModule);
                    if(!depModule.isDeclaratorModule || this.isVModule(depModule)){
                        const name = this.getModuleReferenceName(depModule, moduleOrCompi);
                        const source = this.getModuleImportSource(depModule, moduleOrCompi);
                        let imported = void 0;
                        if(isMod && !depModule.isDeclaratorModule && depModule.compilation.mainModule !== depModule){
                            imported = depModule.id;
                        }
                        const importSource = this.addImport(source, name, imported);
                        importSource.setSourceTarget(depModule);
                        graph.addImport(importSource)
                    }else if(depModule.isDeclaratorModule){
                        this.createDeclaratorModuleImportReferences(depModule, moduleOrCompi, graph)
                    }
                }
            });
        })
    }

    createModuleDependencies(module){
        if(!Utils.isModule(module))return;
        let deps = this.getDependencies(module);
        if(!deps)return;
        const graph = this.getBuildGraph(module)
        const compilation = module.compilation;
        deps.forEach(depModule =>{
            if(!(Utils.isModule(depModule) || isVModule(depModule)))return;
            if(compilation && compilation.modules && compilation.modules.has(depModule.getName())){
                return;
            }
            if(module !== depModule && this.isNeedBuild(depModule)){
                graph.addDepend(depModule);
                if(!depModule.isDeclaratorModule || this.isVModule(depModule)){
                    const name = this.getModuleReferenceName(depModule, module);
                    const source = this.getModuleImportSource(depModule, module);
                    const importSource = this.addImport(source, name)
                    importSource.setSourceTarget(depModule);
                    graph.addImport(importSource)
                }else if(depModule.isDeclaratorModule){
                    this.createDeclaratorModuleImportReferences(depModule, module, graph)
                }
            }
        });
    }

    hasBuildGraph(module){
        return this.graphs.hasBuildGraph(module||this.target)
    }

    getBuildGraph(module=null){
        let compilation = this.target;
        let graphs = this.graphs
        if(!module || compilation === module){
            return graphs.createBuildGraph(compilation)
        }
        if(Utils.isModule(module)){
            if(module.isDeclaratorModule){
                const vm = this.getVModule(module.getName())
                if(vm){
                    return graphs.createBuildGraph(vm, vm);
                }
            }
            
            let mainModule = compilation.mainModule;
            if(module === mainModule){
                return graphs.createBuildGraph(compilation, module);
            }
           
            let graph = graphs.createBuildGraph(module, module)
            if(mainModule){
                let parent = graphs.createBuildGraph(compilation, mainModule)
                parent.addChild(graph)
            }
            return graph;
        }else{
            if(isVModule(module)){
                return graphs.createBuildGraph(module, module)
            }else{
                throw new Error('Exception module params')
            }
        }
    }

    getGlobalRefName(stack, name, objectKey = null){
        if(!stack){
            if(Utils.isModule(this.target)){
                stack = this.target.compilation.stack;
            }else{
                stack = this.target.stack;
            }
            stack = stack || this;
        }
        let variables = this.variables;
        if(objectKey){
            let key = 'getGlobalRefName:'+name;
            if(this.cache.has(objectKey, key)){
                return this.cache.get(objectKey, key)
            }else{
                let value = variables.hasRefs(stack, name, true) ? variables.genGlobalRefs(stack, name) : variables.getGlobalRefs(stack, name);
                this.cache.set(objectKey, key, value)
                return value;
            }
        }
        return variables.getGlobalRefs(stack, name)
    }

    getLocalRefName(stack, name, objectKey = null){
        if(!stack){
            if(Utils.isModule(this.target)){
                stack = this.target.compilation.stack;
            }else{
                stack = this.target.stack;
            }
            stack = stack || this;
        }
        let variables = this.variables;
        if(objectKey){
            let key = 'getLocalRefName:'+name;
            if(this.cache.has(objectKey, key)){
                return this.cache.get(objectKey, key)
            }else{
                let value = variables.hasRefs(stack, name) ? variables.genLocalRefs(stack, name) : variables.getLocalRefs(stack, name)
                this.cache.set(objectKey, key, value)
                return value;
            }
        }
        return variables.getLocalRefs(stack, name)
    }

    genLocalRefName(stack, name, objectKey = null){
        if(!stack){
            if(Utils.isModule(this.target)){
                stack = this.target.compilation.stack;
            }else{
                stack = this.target.stack;
            }
            stack = stack || this;
        }
        let variables = this.variables;
        if(objectKey){
            let key = 'genLocalRefName:'+name;
            if(this.cache.has(objectKey, key)){
                return this.cache.get(objectKey, key)
            }else{
                let value = variables.genLocalRefs(stack, name);
                this.cache.set(objectKey, key, value)
                return value;
            }
        }
        return variables.genLocalRefs(stack, name)
    }

    genGlobalRefName(stack, name, objectKey = null){
        if(!stack){
            if(Utils.isModule(this.target)){
                stack = this.target.compilation.stack;
            }else{
                stack = this.target.stack;
            }
            stack = stack || this;
        }
        let variables = this.variables;
        if(objectKey){
            let key = 'genGlobalRefName:'+name;
            if(this.cache.has(objectKey, key)){
                return this.cache.get(objectKey, key)
            }else{
                let value = variables.genGlobalRefs(stack, name);
                this.cache.set(objectKey, key, value)
                return value;
            }
        }
        return variables.genGlobalRefs(stack, name)
    }

    getWasLocalRefName(target, name, genFlag=false){
        let key =genFlag ? 'genLocalRefName:'+name : 'getLocalRefName:'+name;
        if(this.cache.has(target, key)){
            return this.cache.get(target, key)
        }
        return null;
    }

    getWasGlobalRefName(target, name, genFlag=false){
        let key =genFlag ? 'genGlobalRefName:'+name : 'getGlobalRefName:'+name;
        if(this.cache.has(target, key)){
            return this.cache.get(target, key)
        }
        return null;
    }

    getImportAssetsMapping(file, options={}){
        if(Common.isExcludeDependency(this.options.dependency.excludes, file, this.target)){
            return null;
        }
        if(!options.group){
            options.group = 'imports'
        }
        if(!options.delimiter){
            options.delimiter = '/'
        }
        if(typeof file ==="string"){
            file = this.replaceImportSource(file)
        }
        return this.resolveImportSource(file, options);
    }

    replaceImportSource(source){
        if(source.startsWith('${__filename}')){
            let target = this.target
            if(isVModule(target)){
                target = target.bindModule || target;
            }
            let owner = Utils.isModule(target) ? target.compilation : target;
            source = source.replace('${__filename}', Utils.normalizePath(owner.file));
        }
        return source;
    }

    getSourceFileMappingFolder(file, flag){
        const result = this.resolveSourceFileMappingPath(file, 'folders');
        return flag && !result ? file : result;
    }

    getModuleMappingFolder(module){
        if(Utils.isModule(module)){
            return this.resolveSourceFileMappingPath(module.getName('/') +'.module', 'folders');
        }else if(module && module.file){
            return this.resolveSourceFileMappingPath(module.file, 'folders');
        }
        return null;
    }

    getAssetsImportSource(asset, context){
        let source = asset.sourceId;
        if(this.options.emitFile){
            source = this.getRelativePath(
                asset.outfile,
                this.getOutputAbsolutePath(context)
            );
        }
        return source;
    }

    getModuleImportSource(source, context, sourceId=null){
        const config = this.options;
        const isString = typeof source === 'string';
        if(isString){
            source = this.replaceImportSource(source);
        }
        if(isString && Common.isExternalDependency(this.options.dependency.externals, source, context)){
            return source;
        }
        if( isString && source.includes('/node_modules/') ){
            if( path.isAbsolute(source) )return source;
            if(!sourceId){
                return this.resolveSourceFileMappingPath(source,'imports') || source;
            }
            return sourceId;
        }
        if(isString && !path.isAbsolute(source)){
            return source;
        }
        if(config.emitFile){
            return this.getOutputRelativePath(source, context);
        }
        return isString ? source : this.getModuleResourceId(source);
    }

    getModuleResourceId(module, query={}, extformat=null){
        return this.compiler.parseResourceId(module, query, extformat)
    }

    resolveSourceFileMappingPath(file, group, delimiter='/'){
        return this.resolveSourceId(file, group, delimiter)
    }

    resolveSourceId(id, group, delimiter='/'){
        let glob = this.#glob;
        if(!glob)return null;
        let data = {group, delimiter, failValue:null};
        if(typeof group ==='object'){
            data = group;
        }
        return glob.dest(id, data);
    }

    resolveImportSource(id, ctx={}){
        let glob = this.#glob;
        if(!glob)return id;
        const scheme = glob.scheme(id,ctx);
        let source = glob.parse(scheme, ctx);
        let rule = scheme.rule;
        if(!rule){
            source = id;
        }
        return source
    }

    genUniFileName(source, suffix=null){
        source = String(source);
        let query = source.includes('?');
        if(path.isAbsolute(source) || query){
            let file = source;
            if(query){
                file = source.split('?')[0];
            }
            let ext = path.extname(file);
            suffix = suffix || ext;
            return path.basename(file, ext)+'-' + Common.createUniqueHashId(source) + suffix;
        }
        return source;
    }

    getPublicDir(){
        return this.options.publicDir || 'assets';
    }

    getOutputDir(){
        return this.options.outDir || '.output';
    }

    getOutputExtName(){
        return this.options.outExt || '.js';
    }

    getOutputAbsolutePath(source, secondDir=null){
        const isStr = typeof source === "string";
        const suffix = this.getOutputExtName();
        let output = this.getOutputDir();
        if(!source)return output;
        let key = source;
        if(secondDir){
            output = path.join(output, secondDir);
            key =  source + secondDir;
        }

        if(this.cache.has(key, 'Context.getOutputAbsolutePath')){
            return this.cache.get(key, 'Context.getOutputAbsolutePath')
        }

        let folder = isStr ? this.getSourceFileMappingFolder(source) : this.getModuleMappingFolder(source);
        let filename = null
        if(isStr){
            filename = folder ? path.basename(source) : this.compiler.getRelativeWorkspacePath(source, true) || this.genUniFileName(source);
        }else{
            if(Utils.isModule(source)){
                if(source.isDeclaratorModule){
                    const vm = this.getVModule(source.getName()) || source;
                    filename = folder ? vm.id : vm.getName('/');
                }else{
                    if(source.compilation.mainModule !== source){
                        source = source.compilation.mainModule;
                    }
                    filename = folder ? source.id : source.getName("/");
                }
            }else if(isVModule(source)){
                filename = folder ? source.id : source.getName('/')
            }else if(source.file){
                filename = folder ? path.basename(source.file) : this.compiler.getRelativeWorkspacePath(source.file) || this.genUniFileName(source.file)
            }
        }

        if(!filename){
            throw new Error('File name not resolved correctly')
        }

        let info = path.parse(filename)
        if(!info.ext || this.compiler.isExtensionName(info.ext)){
            filename = path.join(info.dir, info.name+suffix);
        }

        let result = null;
        if(folder){
            result = Utils.normalizePath(
                path.resolve(
                    path.isAbsolute(folder) ? path.join(folder, filename) : path.join(output, folder, filename)
                )
            );
        }else{
            result = Utils.normalizePath(
                path.resolve(
                    path.join(output, filename)
                )
            );
        }
        if(result.includes('?')){
            result = path.join(path.dirname(result) , this.genUniFileName(result, path.extname(result)))
        }
        this.cache.set(key, 'Context.getOutputAbsolutePath', result)
        return result;
    }

    getOutputRelativePath(source,context){
        return this.getRelativePath(
            this.getOutputAbsolutePath(source), 
            this.getOutputAbsolutePath(context)
        );
    }

    getRelativePath(source, context){
        return './'+Utils.normalizePath(
            path.relative(
                path.dirname(context),
                source,
            )
        );
    }

    getVNodeApi(name){
        let local = this.getGlobalRefName(null, name);
        this.addImport('vue', local, name)
        return local;
    }

    createDefaultRoutePathNode(module){
        if(Utils.isModule(module)){
            return this.createLiteral( "/"+module.getName("/") );
        }
        return null;
    }

    isPermissibleRouteProvider(moduleOrMethodStack){
        return false;
    }

    createVNodeHandleNode(stack, ...args){
        let handle = this.#vnodeHandleNode;
        if(!handle){
            let esx = this.options.esx || {};
            let name = esx.handleName||'createVNode';
            if(esx.handleIsThis){
                handle = this.createMemberExpression([
                    this.createThisExpression(),
                    this.createIdentifier(name)
                ])
            }else{
                let local = this.getGlobalRefName(stack, name);
                this.addImport('vue', local, name)
                handle = this.createIdentifier(local);
            }
            this.#vnodeHandleNode = handle;
        }
        return this.createCallExpression(handle,args);
    }

    async emit(buildGraph){
        let outfile = buildGraph.outfile;
        if(outfile){
            fs.mkdirSync(path.dirname(outfile),{recursive: true});
            fs.writeFileSync(outfile, buildGraph.code);
            let sourcemap = buildGraph.sourcemap;
            if(sourcemap){
                fs.writeFileSync(outfile+'.map', JSON.stringify(sourcemap));
            }
        }
    }

    error(message, stack=null){
        if(this.target){
            let range = stack && stack instanceof Range ? stack : null;
            if(!range && Utils.isStack(stack)){
                range = this.target.getRangeByNode(stack.node)
            }
            const file  = this.target.file;
            if(range){
                message+= ` (${file}:${range.start.line}:${range.start.column})`;
            }else{
                message+= `(${file})`
            }
        }
        Utils.error(message);
    }

    warn(message, stack=null){
        if(this.target){
            let range = stack && stack instanceof Range ? stack : null;
            if(!range && Utils.isStack(stack)){
                range = this.target.getRangeByNode(stack.node)
            }

            const file  = this.target.file;
            if(range){
                message+= ` (${file}:${range.start.line}:${range.start.column})`;
            }else{
                message+= `(${file})`
            }
        }
        Utils.warn(message);
    }

}

export default Context;