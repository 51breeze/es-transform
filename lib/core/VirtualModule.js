import Namespace from "easescript/lib/core/Namespace";
import {createCJSImports,createESMImports,createCJSExports,createESMExports, createStaticReferenceNode} from './Common.js';
import Generator from "./Generator";
import { createBuildGraph } from "./BuildGraph";
import * as Constant from "./Constant";
class VirtualModule{
    #id = '';
    #ns = [];
    #file = null;
    #content = '';
    #ext = '.virtual';
    #exports = [];
    #imports = [];
    #changed = true;
    #references = new Map();
    constructor(id, ns, file){
        this.#id = id;
        this.#ns = Array.isArray(ns) ? ns : String(ns).split('.');
        this.#file = file;
    }

    get id(){
        return this.#id
    }

    get bindModule(){
        return Namespace.globals.get(this.getName());
    }

    get file(){
        return this.#file || this.getName('/') + this.#ext;
    }

    set file(value){
        this.#file = value;
    }

    get ext(){
        return this.#ext
    }

    set ext(value){
        this.#ext = value;
    }

    get changed(){
        return this.#changed;
    }

    addExport(exported, local=null, importSource=null, stack=null){
        let has = this.#exports.some(item=>item[0]===exported);
        if(!has){
            this.#exports.push([exported, local, importSource, stack])
        }
    }

    addImport(source, local=null, imported=null){
        let has = this.#imports.some(item=>item[0]===source && item[1]===local);
        if(!has){
            this.#imports.push([source, local, imported])
        }
    }

    addReference(className, local=null){
        local = local || String(className).split('.').pop()
        this.#references.set(className, local)
    }

    getReferences(){
        return this.#references
    }

    getName(seg='.'){
        return this.#ns.concat(this.#id).join(seg)
    }

    getSourcemap(){
        return null;
    }

    getContent(){
        return this.#content;
    }

    setContent(content){
        this.#content = content;
        this.#changed = true
    }

    createImports(ctx){
        this.#imports.forEach(args=>{
            ctx.addImport(...args)
        })
    }

    createExports(ctx){
        let exportName = this.id;
        this.#exports.forEach(([exported, local, importSource, stack])=>{
            if(exported ==='default'){
                if(typeof local ==='string'){
                    exportName = local;
                }else if(local.type==='Identifier'){
                    exportName = local.value;
                }
            }
            if(typeof local ==='string'){
                local = ctx.createIdentifier(local);
            }
            ctx.addExport(exported, local, importSource, stack)
        });
        return exportName;
    }

    createReferences(ctx, graph){
        this.getReferences().forEach((local, classname)=>{
            let module = Namespace.globals.get(classname)
            if(module){
                let dep = null
                if(module.isDeclaratorModule){
                    dep = getVModule(module.getName())
                }else{
                    dep = module
                }
                if(dep){
                    let importSource = ctx.addImport(
                        ctx.getModuleImportSource(dep, this),
                        local
                    )
                    importSource.setSourceTarget(dep);
                    importSource.setSourceContext(this);
                    graph.addImport(importSource)
                    graph.addDepend(dep);
                }
            }
        });
    }

    gen(ctx, body=[]){
        let imports = [];
        let exports = [];
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
        const generator = new Generator(ctx, false)
        const layout = [
            ...imports,
            ctx.createChunkExpression(this.getContent()),
            ...body,
            ...exports
        ];
        layout.forEach(item=>generator.make(item));
        return generator;
    }

    async build(ctx){
        const graph = createBuildGraph(this, this.bindModule)
        if(!this.#changed && graph.code)return graph;
        this.#changed = false;
        this.createImports(ctx)
        this.createReferences(ctx, graph)
        let body = [];
        let exportName = this.createExports(ctx)
        if(this.id==='Class' && this.#ns.length===0){
            let properties = Object.keys(Constant).map(key=>{
                if(key==='PRIVATE_NAME')return;
                return ctx.createProperty(
                    ctx.createIdentifier(key), 
                    ctx.createLiteral(Constant[key])
                )
            }).filter(Boolean);
            properties.sort((a,b)=>{
                return a.init.value - b.init.value;
            });
            body.push(
                ctx.createExpressionStatement(
                    ctx.createAssignmentExpression(
                        ctx.createMemberExpression([
                            ctx.createIdentifier('Class'),
                            ctx.createIdentifier('constant')
                        ]),
                        ctx.createObjectExpression(properties)
                    )
                )
            );
        }else{
            body.push(
               this.createClassDescriptors(ctx, exportName, this.id)
            );
        }
        ctx.createAllDependencies();
        graph.code = this.gen(ctx, body).code;
        graph.sourcemap = this.getSourcemap();
        if(ctx.options.emitFile){
            graph.outfile=ctx.getOutputAbsolutePath(this);
        }
        return graph;
    }

    createClassDescriptors(ctx, exportName, className){
        return ctx.createCallExpression(
            createStaticReferenceNode(ctx, null, 'Class', 'creator'),
            [
                ctx.createIdentifier(exportName),
                ctx.createObjectExpression([
                    ctx.createProperty(
                        ctx.createIdentifier('m'),
                        ctx.createLiteral(Constant.KIND_CLASS | Constant.MODIFIER_PUBLIC)
                    ),
                    ctx.createProperty(
                        ctx.createIdentifier('name'),
                        ctx.createLiteral(className)
                    )
                ])
            ]
        )
    }
}

const virtualization = new Map()
function createVModule(sourceId, file=null){
    sourceId = Array.isArray(sourceId) ? sourceId.join('.') : String(sourceId)
    let old = virtualization.get(sourceId)
    if(old)return old;
    let segs = sourceId.split('.')
    let vm = new VirtualModule(segs.pop(), segs, file)
    virtualization.set(sourceId,vm);
    return vm;
}

function getVModule(sourceId){
    return virtualization.get(sourceId)
}

function hasVModule(sourceId){
    return virtualization.has(sourceId)
}

function getVModules(){
    return Array.from(virtualization.values())
}

function isVModule(value){
    return value ? value instanceof VirtualModule : false;
}

export {
    createVModule,
    isVModule,
    hasVModule,
    getVModules,
    getVModule
}