import Compilation from 'easescript/lib/core/Compilation'
import path from "path";
import {createBuildContext} from "./Builder";
import {getAllBuilder} from "./TableBuilder";
import {createPolyfillModule} from './Polyfill';

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

const plugins = new Set();

class Plugin{
    static is(value){
        return value ? value instanceof Plugin : false
    }

    #name = null;
    #version = '0.0.0';
    #records = null;
    #options = null;
    #initialized = false;
    #context = null;
    #complier = null;

    constructor(name, version, options={}){
        plugins.add(this);
        this.#name = name;
        this.#version = version;
        this.#options = options;
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

    get complier(){
        return this.#complier;
    }

    get context(){
        return this.#context;
    }

    init(complier){
        if(this.#initialized)return;
        this.#initialized = true;
        this.#complier = complier;
        this.#records = new Map();
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
        let context = createBuildContext(this, this.#records)
        this.#context = context;
        createPolyfillModule(
            path.join(__dirname, "./polyfills"),
            context.virtuals.createVModule
        );
    }

    done(){
        //当任务处理完成后，销毁资源
    }

    async build(compilation, moduleId){
        if(!Compilation.is(compilation)){
            throw new Error('compilation is invalid')
        }
        if(!this.#initialized){
            this.init(compilation.complier)
        }
        if(moduleId){
            compilation = this.#context.virtuals.getVModule(moduleId);
            if(!compilation){
                throw new Error(`The '${moduleId}' virtual module does not exists.`)
            }
        }
        return await this.#context.builder(compilation)
    }
}

function getAllPlugin(){
    return plugins
}

export {getAllPlugin, Plugin}

export default Plugin