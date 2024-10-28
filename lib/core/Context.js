import path from 'path';
import fs from 'fs';
import Token from './Token';
import * as tokens from '../tokens';
import * as Common from './Common';
import * as Cache from './Cache';
import {ImportManage} from './ImportSource';
import {ExportManage} from './ExportSource';
import {createBuildGraph, hasBuildGraph} from './BuildGraph';
import {createAsset, createStyleAsset} from './Asset';
import {getVModule, hasVModule, isVModule} from './VirtualModule';
import {genGlobalRefs, genLocalRefs, getGlobalRefs, getLocalRefs, getVariableManage, hasRefs} from './Variable';
import Utils from 'easescript/lib/core/Utils'
import Range from 'easescript/lib/core/Range'
import {createHash} from 'crypto';

class Context extends Token{

    static is(value){
        return value ? value instanceof Context : false;
    }

    #createToken = null;
    #tokens = null;
    #target = null;
    #dependencies = new Map();
    #plugin = null;
    #nodes = new Map();
    #imports = new ImportManage();
    #exports = new ExportManage();
    #afterBody = [];
    #beforeBody = [];
    #buildOptions = {};
    #fragments = null;

    constructor(plugin, compiOrVModule=null){
        super()
        this.#plugin = plugin;
        this.#target = compiOrVModule;
        const _createToken = this.options.transform.createToken;
        const _tokens = this.options.transform.tokens;
        if(_tokens && typeof _tokens ==='object' && Object.keys(_tokens).length>0){
            this.#tokens = (type)=>{
                if(Object.prototype.hasOwnProperty.call(_tokens, type)){
                    return _tokens[type]
                }
                return tokens[type];
            }
        }else{
            this.#tokens = (type)=>{
                return tokens[type];
            }
        }

        if(_createToken && typeof _createToken ==='function' ){
            this.#createToken = (token, stack, type)=>{
                try{
                    return _createToken(this, token, stack, type)
                }catch(e){
                    console.error(e)
                }
            }
        }else{
            this.#createToken = (token, stack, type)=>{
                if(!token){
                    throw new Error(`Token '${type}' is not exists.`);
                }
                try{
                    return token(this, stack, type)
                }catch(e){
                    console.error(e)
                }
            }
        }
    }

    get plugin(){
        return this.#plugin;
    }

    get compiler(){
        return this.#plugin.getComplier();
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

    setBuildOptions(options={}){
        this.#buildOptions = options;
    }

    getBuildOptions(){
        return this.#buildOptions;
    }

    createToken(stack){
        if(!stack)return null;
        const type = stack.toString();
        if( type ==='TypeStatement')return null;
        if( type ==='NewDefinition')return null;
        if( type ==='CallDefinition')return null;
        if( type ==='TypeDefinition')return null;
        if( type ==='TypeGenericDefinition')return null;
        const token = this.#tokens(type);
        return this.#createToken(token, stack, type)
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

    addFragment(compilation){
        let fragments = this.#fragments || (this.#fragments=new Set());
        fragments.add(compilation)
    }

    getFragments(){
        return this.#fragments;
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
        if(isVModule(module))return true;
        return module.compilation === this.target;
    }

    isVModule(module){
        if(module){
            if(module.isDeclaratorModule){
                return hasVModule(module.getName());
            }else if(isVModule(module)){
                return module
            }
        }
        return false
    }

    isActiveModule(depModule,context=null){
        if(!depModule)return false;
        context = context || this.target;
        if(!this.isUsed(depModule, context))return false;
        if(depModule.isDeclaratorModule){
            if(hasVModule(depModule.getName())){
                return true;
            }
            if(this.isDeclaratorModuleDependency(depModule)){
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
        if(Cache.has(module,'isNeedBuild')){
            return Cache.has(module,'isNeedBuild');
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
        Cache.has(module,'isNeedBuild',result)
        return result;
    }

    hasDeclareModule(module){
        if(Utils.isCompilation(this.target)){
            if(this.target.modules.has(module.getName())){
                return true;
            }
            return this.target.importModuleNameds.has(module)
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

    getModuleReferenceName(module,context=null){
        let name = null;
        if(isVModule(module)){
            name = module.getName('_')
        }else{
            if(!Utils.isModule(module))return null;
            if(!context)context = this.target;
            if(Utils.isModule(context)){
                if(context.isDeclaratorModule){
                    const vm = getVModule(context.getName());
                    if(vm){
                        const references = vm.getReferences();
                        if(references){
                            const className = module.getName();
                            if(references.has(className)){
                                name = references.get(className);
                            }
                        }
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
        }
        return this.getGlobalRefName(null, name)
    }

    isDeclaratorModuleDependency(module){
        if(!Utils.isClassType(module))return false
        if(module.required && module.isAnnotationCreated){
            return true;
        }else if(module.isDeclaratorModule){
            return module.getStacks().some(stack=>{
                if(!Array.isArray(stack.imports))return false;
                return stack.imports.some( item=>{
                    if(item.isImportDeclaration && item.source.isLiteral){
                        return item.specifiers.some(spec=>spec.value() === module.id)
                    }
                    return false;
                });
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
        if(!graph && context){
            graph = this.getBuildGraph(context)
        }
        this.createRequires(module, graph)
        this.createModuleImportReferences(module, graph)
    }

    createModuleImportReferences(module, graph=null){
        if(!Utils.isModule(module))return;
        if(!graph){
            graph = this.getBuildGraph(module)
        }
        module.getStacks().forEach(stack=>{
            if(!stack || !stack.imports || !stack.imports.length)return;
            stack.imports.forEach( item=>{
                if(item.source.isLiteral){
                    Common.parseImportDeclaration(this, item, module, graph)
                }
            })
        })
    }

    createAssets(context, graph){
        const assets = context.assets;
        if(assets && assets.size>0){
            assets.forEach( asset=>{
                if(asset.file){
                    if(!Common.isExternalDependency(this.options.dependences.externals, asset.resolve, context)){
                        let asset = createAsset(asset.resolve)
                        asset.local = asset.assign;
                        if(this.isLoadAssetsRawCode(asset.stack, asset.resolve)){
                            const {id,index,type:ext} = asset;
                            asset.sourceId = this.getModuleResourceId(context, {id, index, ext, type:'embedAssets'})
                        }else{
                            asset.sourceId = this.getModuleImportSource(asset.resolve, context , asset.file);
                        }
                        let importSource = this.addImport(asset.sourceId, asset.local);
                        importSource.setSourceTarget(asset);
                        importSource.setSourceContext(context);
                        if(graph){
                            graph.addAsset(asset);
                            graph.addImport(importSource)
                        }
                    }
                }else if(asset.type ==="style" && context){
                    const {index,type,attrs={}} = asset;
                    const lang = attrs.lang || attrs.type || 'css';
                    const suffix = 'file.'+lang;
                    const file = this.getModuleResourceId(context, {...attrs, index, type, lang, [suffix]:''})
                    let source = file
                    if(this.options.webpack){
                        source = (this.options.styleLoader || []).concat( file ).join('!');
                    }
                    let asset = createStyleAsset(Utils.normalizePath(context.file), index)
                    let importSource = this.addImport(source)
                    importSource.setSourceTarget(asset);
                    importSource.setSourceContext(context);
                    asset.sourceId = source;
                    if(asset.content){
                        asset.code = asset.content
                    }
                    if(graph){
                        graph.addAsset(asset)
                        graph.addImport(importSource)
                    }
                }
            });
        }
    }

    createRequires(context, graph){
        const requires = context.requires;
        if(requires && requires.size > 0){
            requires.forEach( item=>{
                this.createRequire(
                    context,
                    graph,
                    item.from,
                    item.name,
                    item.namespaced ? '*' : item.key
                )
            });
        }
    }

    createRequire(context, graph, source,  local, imported=null){
        if(source && !Common.isExternalDependency(this.options.dependences.externals, source, context)){
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
                    importSource.setSourceContext(context);
                }
                if(importSource && graph){
                    graph.addImport(importSource)
                }
            }
        }
    }

    crateModuleAssets(module){
        if(!Utils.isModule(module))return;
        const graph = this.getBuildGraph(module)
        this.createAssets(module, graph)
        this.createRequires(module, graph)
    }

    crateRootAssets(){
        const compilation = this.target;
        if(compilation){
            const graph = this.getBuildGraph(compilation)
            this.createAssets(compilation, graph)
            this.createRequires(compilation, graph)
        }
    }

    createAllDependencies(){
        const target = this.target;
        const compilation = Utils.isCompilation(target) ? target : null;
        this.#dependencies.forEach((deps, moduleOrCompi)=>{
            const graph = this.getBuildGraph(moduleOrCompi)
            deps.forEach(depModule =>{
                if(depModule === target || compilation && compilation.modules.has(depModule.getName())){
                    return;
                }
                if(moduleOrCompi !== depModule && this.isNeedBuild(depModule)){
                    graph.addDepend(depModule);
                    if(!depModule.isDeclaratorModule || this.isVModule(depModule)){
                        const name = this.getModuleReferenceName(depModule, moduleOrCompi);
                        const source = this.getModuleImportSource(depModule, moduleOrCompi);
                        const importSource = this.addImport(source, name)
                        importSource.setSourceTarget(depModule);
                        importSource.setSourceContext(moduleOrCompi);
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
                    importSource.setSourceContext(module);
                    graph.addImport(importSource)
                }else if(depModule.isDeclaratorModule){
                    this.createDeclaratorModuleImportReferences(depModule, module, graph)
                }
            }
        });
    }

    hasBuildGraph(module){
        return hasBuildGraph(module||this.target)
    }

    getBuildGraph(module=null){
        let compilation = this.target;
        if(!module || compilation === module){
            return createBuildGraph(compilation)
        }
        if(Utils.isModule(module)){
            let mainModule = compilation.mainModule;
            if(module === mainModule){
                return createBuildGraph(compilation, module);
            }
            if(module.isDeclaratorModule){
                const vm = getVModule(module.getName())
                if(vm){
                    return createBuildGraph(vm);
                }
            }
            let graph = createBuildGraph(module, module)
            if(mainModule){
                let parent = createBuildGraph(compilation, mainModule)
                parent.addChild(graph)
            }
            return graph;
        }else{
            if(isVModule(module)){
                return createBuildGraph(module, module)
            }else{
                throw new Error('Exception module params')
            }
        }
    }

    getGlobalRefName(stack, name, group = null){
        if(!stack){
            stack = Utils.isCompilation(this.target) ? this.target.stack : this
        }
        if(group){
            let key = 'getGlobalRefName:'+name;
            if(Cache.has(group, key)){
                return Cache.get(group, key)
            }else{
                let value = hasRefs(stack, name, true) ? genGlobalRefs(stack, name) : getGlobalRefs(stack, name)
                Cache.set(group, key, value)
                return value;
            }
        }
        return getGlobalRefs(stack, name)
    }

    getLocalRefName(stack, name, group = null){
        if(!stack){
            stack = Utils.isCompilation(this.target) ? this.target.stack : this
        }
        if(group){
            let key = 'getLocalRefName:'+name;
            if(Cache.has(group, key)){
                return Cache.get(group, key)
            }else{
                let value = hasRefs(stack, name) ? genLocalRefs(stack, name) : getLocalRefs(stack, name)
                Cache.set(group, key, value)
                return value;
            }
        }
        return getLocalRefs(stack, name)
    }

    getImportAssetsMapping(file, options={}){
        if(!options.group){
            options.group = 'imports'
        }
        if(!options.delimiter){
            options.delimiter = '/'
        }
        return this.plugin.resolveImportSource(file, options);
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

    getModuleImportSource(source, context, sourceId=null){
        const config = this.options;
        const isString = typeof source === 'string';
        if(isString && source.includes('${__filename}')){
            const owner = Utils.isModule(context) ? context.compilation : context;
            source = source.replace('${__filename}', Utils.isCompilation(owner) ? owner.file : this.target.file);
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

    getModuleResourceId(module, query={}){
        return this.compiler.parseResourceId(module, query)
    }

    resolveSourceFileMappingPath(file, group, delimiter='/'){
        return this.plugin.resolveSourceId(file, group, delimiter)
    }

    genUniFileName(source){
        source = String(source);
        if(path.isAbsolute(source) || source.includes('?')){
            let ext = path.extname(source);
            return path.basename(source, ext)+'-'+createHash("sha256").update(source).digest("hex").substring(0, 8) + ext;
        }
        return source;
    }

    getOutputDir(){
        return this.options.output || '.output';
    }

    getOutputExtName(){
        return this.options.outext || '.js';
    }

    getOutputAbsolutePath(source, context){
        const isStr = typeof source === "string";
        const output = this.getOutputDir();
        const suffix = this.getOutputExtName();
        if(!source)return output;

        if(Cache.has(source, 'Context.getOutputAbsolutePath')){
            return Cache.get(source, 'Context.getOutputAbsolutePath')
        }

        let folder = isStr ? this.getSourceFileMappingFolder(source) : this.getModuleMappingFolder(source);
        let filename = null
        if(isStr){
            filename = folder ? path.basename(source) : this.compiler.getRelativeWorkspacePath(source, true) || this.genUniFileName(source);
        }else{
            if(Utils.isModule(source)){
                if(source.isDeclaratorModule){
                    const vm = getVModule(source.getName()) || source;
                    filename = folder ? vm.id : vm.getName('/');
                }else{
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
        Cache.set(source, 'Context.getOutputAbsolutePath', result)
        return result;
    }

    getOutputRelativePath(source,context){
        if(typeof source ==="string" && Common.isExternalDependency(this.options.dependences.externals, source, context)){
            return source;
        }
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

    emit(buildGraph){
        let outfile = buildGraph.outfile;
        fs.mkdirSync(path.dirname(outfile),{recursive: true});
        fs.writeFileSync(outfile, buildGraph.code);
        let sourcemap = buildGraph.sourcemap;
        if(sourcemap){
            fs.writeFileSync(outfile+'.map', JSON.stringify(sourcemap.toJSON()));
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