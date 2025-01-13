import Utils from "easescript/lib/core/Utils";
import Context from "./Context";
import Generator from "./Generator";
import {isVModule,getVirtualModuleManager, VirtualModule} from "./VirtualModule";
import {createCJSExports, createCJSImports, createESMExports, createESMImports, callAsyncSequence } from "./Common"
import {getVariableManager} from './Variable';
import {getBuildGraphManager} from './BuildGraph';
import {getAssetsManager, Asset, isAsset} from "./Asset";
import {getCacheManager} from "./Cache";
import {getTableManager, MySql} from "./TableBuilder";
import * as tokens from '../tokens';
import Glob from "glob-path";

async function buildProgram(ctx, compilation, graph){
    let root = compilation.stack;
    if(!root){
        throw new Error('Build program failed')
    }
    let body = [];
    let externals = [];
    let imports = [];
    let exports = [];
    let emitFile = ctx.options.emitFile;

    ctx.setNode(root, body);

    root.body.forEach( item=>{
        if( item.isClassDeclaration || 
            item.isEnumDeclaration || 
            item.isInterfaceDeclaration || 
            item.isStructTableDeclaration || 
            item.isPackageDeclaration )
        {
            const child = ctx.createToken(item);
            if(child){
                body.push(child);
            }
        }
    });

    if(root.imports && root.imports.length > 0){
        root.imports.forEach( item=>{
            if(item.isImportDeclaration){
                ctx.createToken(item)
            }
        });
    }

    if( root.externals.length > 0 ){
        root.externals.forEach( item=>{
            if(item.isImportDeclaration){
                ctx.createToken(item)
            }else{
                const node = ctx.createToken(item);
                if(node){
                    externals.push(node);
                }
            }
        });
    }

    ctx.removeNode(root);

    if( root.exports.length > 0 ){
        root.exports.forEach( item=>{
            ctx.createToken(item);
        });
    }

    ctx.crateRootAssets();
    ctx.createAllDependencies();

    let exportNodes = null
    let importNodes = null
    if(ctx.options.module==='cjs'){
        importNodes = createCJSImports(ctx, ctx.imports)
        exportNodes = createCJSExports(ctx, ctx.exports, graph)
    }else{
        importNodes = createESMImports(ctx, ctx.imports)
        exportNodes = createESMExports(ctx, ctx.exports, graph)
    }
    
    imports.push(...importNodes, ...exportNodes.imports);
    body.push(...exportNodes.declares)
    exports.push(...exportNodes.exports)

    let layout = [
        ...imports,
        ...ctx.beforeBody,
        ...body,
        ...ctx.afterBody,
        ...externals,
        ...exports,
    ];

    if(layout.length>0){
        let generator = new Generator(ctx);
        layout.forEach(item=>generator.make(item));
        graph.code =  generator.code;
        graph.sourcemap = generator.sourceMap ? generator.sourceMap.toJSON() : null;
        if(emitFile){
            graph.outfile = ctx.getOutputAbsolutePath(compilation.mainModule || compilation)
        }
    }
}

function getTokenManager(options){
    let _createToken = options.transform.createToken;
    let _tokens = options.transform.tokens;
    let getToken = (type)=>{
        return tokens[type];
    }
    let createToken = (ctx, stack, type)=>{
        const token = getToken(type);
        if(!token){
            throw new Error(`Token '${type}' is not exists.`);
        }
        try{
            return token(ctx, stack, type)
        }catch(e){
            console.error(e)
        }
    }

    if(_tokens && typeof _tokens ==='object' && Object.keys(_tokens).length>0){
        getToken = (type)=>{
            if(Object.prototype.hasOwnProperty.call(_tokens, type)){
                return _tokens[type]
            }
            return tokens[type];
        }
    }
    if(_createToken && typeof _createToken ==='function' ){
        createToken = (ctx, stack, type)=>{
            try{
                return _createToken(ctx, stack, type)
            }catch(e){
                console.error(e)
            }
        }
    }
    return {
        get:getToken,
        create:createToken
    }
}

function createBuildContext(plugin, records=new Map()){

    let assets = getAssetsManager(Asset)
    let virtuals = getVirtualModuleManager(VirtualModule)
    let variables = getVariableManager();
    let graphs = getBuildGraphManager();
    let token = getTokenManager(plugin.options);
    let cache = getCacheManager();
    let table = getTableManager();
    let buildAfterDeps = new Set();
    let glob = null;
    let resolve = plugin.options.resolve || {}
    let imports = resolve?.imports || {};
    
    //目前仅实现了mysql
    table.addBuilder(new MySql(plugin));

    Object.keys(imports).forEach( key=>{
        glob = glob || (glob = new Glob());
        glob.addRuleGroup(key, imports[key], 'imports')
    });

    let folders = resolve?.folders || {};
    Object.keys(folders).forEach( key=>{
        glob = glob || (glob = new Glob());
        glob.addRuleGroup(key, folders[key],'folders');
    });

    function makeContext(compiOrVModule){
        return new Context(
            compiOrVModule,
            plugin,
            variables,
            graphs,
            assets,
            virtuals,
            glob,
            cache,
            token,
            table
        );
    }

    async function build(compiOrVModule){
        
        if(records.has(compiOrVModule)){
            return records.get(compiOrVModule);
        }

        let ctx = makeContext(compiOrVModule);
        let buildGraph = ctx.getBuildGraph(compiOrVModule);
        records.set(compiOrVModule, buildGraph);

        if(isVModule(compiOrVModule)){
            await compiOrVModule.build(ctx, buildGraph);
        }else{
            if(!compiOrVModule.parserDoneFlag){
                await compiOrVModule.ready();
            }
            await buildProgram(ctx, compiOrVModule, buildGraph);
        }

        if(ctx.options.emitFile){
            await buildAssets(ctx, buildGraph);
            await ctx.emit(buildGraph);
        }

        invokeAfterTask();
        return buildGraph;
    }

    async function buildDeps(compiOrVModule){

        if(records.has(compiOrVModule)){
            return records.get(compiOrVModule);
        }

        let ctx = makeContext(compiOrVModule);
        let buildGraph = ctx.getBuildGraph(compiOrVModule);
        records.set(compiOrVModule, buildGraph);

        if(isVModule(compiOrVModule)){
            await compiOrVModule.build(ctx, buildGraph);
        }else{
            if(!compiOrVModule.parserDoneFlag){
                await compiOrVModule.ready();
            }
            await buildProgram(ctx, compiOrVModule, buildGraph);
        }

        if(ctx.options.emitFile){
            await buildAssets(ctx, buildGraph);
            await ctx.emit(buildGraph);
        }

        await callAsyncSequence(getBuildDeps(ctx), async(dep)=>{
            if(isVModule(dep) && dep.after){
                addBuildAfterDep(dep)
            }else{
                await buildDeps(dep)
            }
        });

        invokeAfterTask();
        return buildGraph;
    }

    async function buildAssets(ctx, buildGraph){
        let assets = buildGraph.assets;
        if(!assets)return;
        let items = Array.from(assets.values()).map( asset=>{
            if(asset.after){
                addBuildAfterDep(asset)
                return null;
            }else{
                return asset;
            }
        }).filter(Boolean);
        await Promise.all(items.map(asset=>asset.build(ctx)));
    }

    function getBuildDeps(ctx){
        const deps = new Set()
        ctx.dependencies.forEach(dataset=>{
            dataset.forEach(dep=>{
                if(Utils.isModule(dep)){
                    if(!dep.isStructTable && dep.isDeclaratorModule){
                        dep = ctx.getVModule(dep.getName())
                        if(dep){
                            deps.add(dep)
                        }
                    }else if(dep.compilation){
                        deps.add(dep.compilation)
                    }
                }else if(isVModule(dep)){
                    deps.add(dep)
                }else if(Utils.isCompilation(dep)){
                    deps.add(dep)
                }
            })
        });
        return Array.from(deps.values());
    }

    function addBuildAfterDep(dep){
        buildAfterDeps.add(dep)
    }

    let waitingBuildAfterDeps = new Set();
    function invokeAfterTask(){
        if(buildAfterDeps.size<1)return;
        buildAfterDeps.forEach(dep=>{
            waitingBuildAfterDeps.add(dep)
        });
        buildAfterDeps.clear();
        setImmediate(async ()=>{
            if(waitingBuildAfterDeps.size>0){
                let deps = Array.from(waitingBuildAfterDeps.values());
                waitingBuildAfterDeps.clear();
                await callAsyncSequence(deps, async(dep)=>{
                    if(isAsset(dep)){
                        await dep.build(makeContext(dep))
                    }else{
                        records.delete(dep);
                        await buildDeps(dep);
                    }
                });
            }
        })
    }
    
    return {
        build,
        buildDeps,
        buildAssets,
        buildAfterDeps,
        getBuildDeps,
        addBuildAfterDep,
        assets,
        virtuals,
        variables,
        graphs,
        glob,
        cache,
        table,
        token,
        makeContext
    }
}

export {
    buildProgram,
    getTokenManager,
    createBuildContext
}