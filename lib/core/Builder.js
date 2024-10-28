import Utils from "easescript/lib/core/Utils";
import Context from "./Context";
import Generator from "./Generator";
import { getVModule, isVModule } from "./VirtualModule";
import { createCJSExports, createCJSImports, createESMExports, createESMImports } from "./Common"

async function buildProgram(ctx, compilation){
    let root = compilation.stack;
    if(!root){
        throw new Error('Build program failed')
    }

    let body = [];
    let externals = [];
    let imports = [];
    let exports = [];
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

    if( root.exports.length > 0 ){
        root.exports.forEach( item=>{
            ctx.createToken(item);
        });
    }

    ctx.createAllDependencies();

    let exportNodes = null
    let importNodes = null
    if(ctx.options.module==='cjs'){
        importNodes = createCJSImports(ctx, ctx.imports)
        exportNodes = createCJSExports(ctx, ctx.exports)
    }else{
        importNodes = createESMImports(ctx, ctx.imports)
        exportNodes = createESMExports(ctx, ctx.exports)
    }

    imports.push(...importNodes, ...exportNodes.imports);
    body.push(...exportNodes.declares)
    exports.push(...exportNodes.exports)

    let generator = new Generator(ctx);
    let graph = ctx.getBuildGraph(compilation)
    let layout = [
        ...imports,
        ...ctx.beforeBody,
        ...body,
        ...ctx.afterBody,
        ...externals,
        ...exports,
    ];

    if(layout.length>0){
        layout.forEach(item=>generator.make(item));
        graph.code =  generator.code;
        graph.sourcemap = generator.sourceMap;
        if(ctx.options.emitFile){
            graph.outfile = ctx.getOutputAbsolutePath(compilation.mainModule || compilation)
        }
    }
    return graph;
}

function createBuilder(plugin){
    const buildContext = (records=new Map(), options={})=>{
        
        const builder = async (compiOrVModule)=>{
            if(records.has(compiOrVModule)){
                return records.get(compiOrVModule);
            }

            let buildGraph = null;
            let ctx = new Context(plugin, compiOrVModule);
            ctx.setBuildOptions(options);
            if(isVModule(compiOrVModule)){
                buildGraph = await compiOrVModule.build(ctx);
            }else{
                if(!compiOrVModule.parserDoneFlag){
                    await compiOrVModule.ready();
                }
                buildGraph = await buildProgram(ctx, compiOrVModule);
            }
            
            records.set(compiOrVModule, buildGraph);

            if(ctx.options.emitFile){
                const deps = ctx.getAllDependencies();
                const vms = new Set()
                const compilations = new Set()
                deps.forEach(dep=>{
                    if(ctx.isVModule(dep)){
                        if(dep.isDeclaratorModule){
                            dep = getVModule(dep.getName())
                        }
                        if(dep){
                            buildGraph.addDepend(dep)
                            vms.add(dep)
                        }
                    }else if(Utils.isModule(dep)){
                        if(dep.isStructTable){
                            dep.getStacks().forEach(stack=>{
                                ctx.createToken(stack)
                            })
                        }else if(!dep.isDeclaratorModule){
                            buildGraph.addDepend(dep)
                            compilations.add(dep.compilation)
                        }
                    }
                });

                const fragments = ctx.getFragments();
                if(fragments){
                    fragments.forEach(compi=>compilations.add(compi))
                }

                await Promise.all(
                    Array.from(compilations.values()).map(compi=>builder(compi))
                );

                await Promise.all(
                    Array.from(vms.values()).map(vm=>builder(vm))
                );
                
                ctx.emit(buildGraph);

            }else{
                const deps = ctx.getAllDependencies();
                deps.forEach(dep=>{
                    if(ctx.isVModule(dep)){
                        if(dep.isDeclaratorModule){
                            dep = getVModule(dep.getName())
                        }
                        if(dep){
                            buildGraph.addDepend(dep)
                        }
                    }else if(Utils.isModule(dep)){
                        if(dep.isStructTable){
                            dep.getStacks().forEach(stack=>{
                                ctx.createToken(stack)
                            })
                        }else if(!dep.isDeclaratorModule){
                            buildGraph.addDepend(dep)
                        }
                    }
                })
                return buildGraph;
            }

        }
        return builder
    }

    return buildContext
}

export {
    buildProgram,
    createBuilder
}