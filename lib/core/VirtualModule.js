import Namespace from "easescript/lib/core/Namespace";
import {createCJSImports,createESMImports,createCJSExports,createESMExports, createStaticReferenceNode} from './Common.js';
import Generator from "./Generator";
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
    #after = false;
    #sourcemap = false;
    #disableCreateClass = false;

    constructor(id, ns){
        this.#id = id;
        this.#ns = Array.isArray(ns) ? ns : String(ns).split('.');
    }

    set after(value){
        this.#after = !!value;
    }

    get after(){
        return this.#after;
    }

    get ns(){
        return this.#ns
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

    get imports(){
        return this.#imports
    }

    get exports(){
        return this.#exports
    }


    get changed(){
        return this.#changed;
    }

    set changed(value){
        this.#changed = value;
    }

    disableCreateClass(){
        this.#disableCreateClass = true;
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

    getReferenceName(className){
        return this.#references.get(className);
    }

    getReferences(){
        return this.#references
    }

    getName(seg='.'){
        return this.#ns.concat(this.#id).join(seg)
    }

    getSourcemap(){
        return this.#sourcemap;
    }

    setSourcemap(map){
        this.#sourcemap = map;
    }

    getContent(){
        return this.#content;
    }

    setContent(content){
        this.#content = content;
        this.#changed = true
    }

    createImports(ctx, graph){
        this.#imports.forEach(args=>{
            let [source, local, imported] = args;
            ctx.createRequire(ctx.target, graph, source, local, imported)
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

    createReferences(ctx){
        let context = this.bindModule || this;
        this.getReferences().forEach((local, classname)=>{
            let module = Namespace.globals.get(classname);
            if(!module){
                module = ctx.getVModule(classname)
            }
            if(module){
                ctx.addDepend(module, context)
            }else{
                ctx.error(`[ES-TRANSFORM] References "${classname}" not found.`)
            }
        });
    }

    gen(ctx, graph, body=[]){
        let imports = [];
        let exports = [];
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
        const generator = new Generator(ctx, true)
        const layout = [
            ...imports,
            ctx.createChunkExpression(this.getContent()),
            ...body,
            ...exports
        ];
        layout.forEach(item=>generator.make(item));
        return generator;
    }

    async build(ctx, graph){
        if(!this.#changed && graph.code)return graph;
        
        this.#changed = false;
        this.createImports(ctx, graph)
        this.createReferences(ctx)

        let module = this.bindModule;
        let emitFile = ctx.options.emitFile;
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
        }else if(!this.#disableCreateClass){
            body.push(
                this.createClassDescriptors(ctx, exportName, this.id)
            );
        }

        if(module){
            ctx.createDeclaratorModuleImportReferences(module, module, graph);
        }
        
        ctx.createAllDependencies();
        let generator = this.gen(ctx,graph, body);
        graph.code = generator.code;
        graph.sourcemap = generator.sourceMap ? generator.sourceMap.toJSON() : null;
        this.setSourcemap(graph.sourcemap);
        if(emitFile){
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

function isVModule(value){
    return value ? value instanceof VirtualModule : false;
}

function getVirtualModuleManager(VirtualModuleFactory){
    const virtualization = new Map()
    function createVModule(sourceId, factory=VirtualModuleFactory){
        let isSymbol = typeof sourceId === "symbol";
        if(!isSymbol){
            sourceId = Array.isArray(sourceId) ? sourceId.join('.') : String(sourceId)
        }
        let old = virtualization.get(sourceId)
        if(old)return old;
        if(isSymbol){
            let vm = new factory(sourceId, [])
            virtualization.set(sourceId,vm);
            return vm;
        }else{
            let segs = sourceId.split('.')
            let vm = new factory(segs.pop(), segs)
            virtualization.set(sourceId,vm);
            return vm;
        }
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
    function setVModule(sourceId, vm){
        return virtualization.set(sourceId, vm)
    }
    return {
        createVModule,
        isVModule,
        hasVModule,
        setVModule,
        getVModules,
        getVModule
    }
}

export {
    getVirtualModuleManager,
    isVModule,
    VirtualModule,
}