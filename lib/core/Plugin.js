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

    //插件名
    get name(){
        return this.#name;
    }

    //插件选项
    get options(){
        return this.#options;
    }

    //插件版本
    get version(){
        return this.#version
    }

    //编译器对象
    get complier(){
        return this.#complier;
    }

    //用于构建的上下文对象
    get context(){
        return this.#context;
    }

    //构建前调用
    async init(complier){
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

    //当任务处理完成后调用
    async done(){
        
    }

    //构建所有依赖文件
    async run(compilation){
        if(!Compilation.is(compilation)){
            throw new Error('compilation is invalid')
        }
        if(!this.#initialized){
            this.init(compilation.complier)
        }
        return await this.#context.buildDeps(compilation)
    }

    //构建单个文件
    async build(compilation, vmId=null){
        if(!Compilation.is(compilation)){
            throw new Error('compilation is invalid')
        }
        if(!this.#initialized){
            this.init(compilation.complier)
        }
        if(vmId){
            let vm = this.#context.virtuals.getVModule(vmId);
            if(vm){
                return await this.#context.builder(vm)
            }else{
                throw new Error(`The '${vmId}' virtual module does not exists.`)
            }
        }
        return await this.#context.build(compilation)
    }
}

function getAllPlugin(){
    return plugins
}

export {getAllPlugin, Plugin}

export default Plugin