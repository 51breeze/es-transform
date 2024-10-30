import Compilation from 'easescript/lib/core/Compilation'
import Glob from "glob-path";
import {createBuilder} from "./Builder";
import {getAllBuilder} from "./TableBuilder";
function defineError(complier){
    if(defineError.loaded || !complier || !complier.diagnostic)return;
    defineError.loaded=true;
    let define = complier.diagnostic.defineError
    define(10000,'',[
        '绑定的属性(%s)必须是一个可赋值的成员属性',
        "Binding the '%s' property must be an assignable members property"
    ]);

    define(10101,'',[
        '路由参数(%s)的默认值只能是一个标量',
        "Route params the '%s' defalut value can only is a literal type."
    ]);
}

class Plugin{
    static is(value){
        return value ? value instanceof Plugin : false
    }

    #name = null;
    #version = '0.0.0';
    #records = new Map()
    #options = null;
    #initialized = false;
    #builder = null;
    #complier = null;
    #glob = new Glob();

    constructor(name, version, options={}){
        this.#name = name
        this.#version = version
        this.#options = options;
        this.resolveRules(); 
        this.#builder = createBuilder(this)
        if(options.mode){
            options.metadata.env.NODE_ENV = options.mode;
        }
    }

    get name(){
        return this.#name;
    }

    get options(){
        return this.#options;
    }

    get version(){
        return this.#version
    }

    getComplier(){
        return this.#complier;
    }

    resolveRules(){
        const resolve = this.options.resolve || {}
        const imports = resolve?.imports || {};
        Object.keys(imports).forEach( key=>{
            this.#glob.addRuleGroup(key, imports[key], 'imports')
        });

        const folders = resolve?.folders || {};
        Object.keys(folders).forEach( key=>{
            this.#glob.addRuleGroup(key, folders[key],'folders');
        })
    }

    resolveImportSource(id, ctx={}){
        const scheme = this.#glob.scheme(id,ctx);
        let source = this.#glob.parse(scheme, ctx);
        let rule = scheme.rule;
        if(!rule){
            source = id;
        }
        return source
    }

    resolveSourceId(id, group, delimiter='/'){
        let data = {group, delimiter, failValue:null};
        if(typeof group ==='object'){
            data = group;
        }
        return this.#glob.dest(id, data);
    }

    init(complier){
        if(!this.#initialized){
            this.#initialized = true;
            defineError(complier);
            if(this.options.mode==='development'){
                let tableBuilders = null;
                complier.on('onChanged', (compilation)=>{
                    this.#records.delete(compilation)
                    let mainModule = compilation.mainModule;
                    if(mainModule.isStructTable){
                        tableBuilders = tableBuilders || getAllBuilder();
                        compilation.modules.forEach(module=>{
                            if(module.isStructTable){
                                tableBuilders.forEach(builder=>{
                                    builder.removeTable(module.id)
                                })
                            }
                        })
                    }
                });
            }
            this.#complier = complier;
        }
    }

    done(){
        //当任务处理完成后，销毁资源
    }

    async build(compilation, options={}){
        if(!Compilation.is(compilation)){
            throw new Error('compilation is invalid')
        }
        if(!this.#initialized){
            this.init(compilation.complier)
        }
        const builder = this.#builder(this.#records, options)
        return await builder(compilation)
    }
}

export default Plugin