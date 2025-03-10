import Compilation from 'easescript/lib/core/Compilation'
import Diagnostic from 'easescript/lib/core/Diagnostic';
import path from "path";
import {createBuildContext} from "./Builder";
import {createPolyfillModule} from './Polyfill';
import EventEmitter from "events";

Diagnostic.register("transform", (definer)=>{
    definer(
        10000,
        '绑定的属性(%s)必须是一个可赋值的成员属性',
        "Binding the '%s' property must be an assignable members property"
    );
    definer(
        10101,
        '路由参数(%s)的默认值只能是一个标量',
        "Route params the '%s' defalut value can only is a literal type."
    );
});

const plugins = new Set();
const processing = new Map();
async function execute(compilation, asyncBuildHook){
    if(processing.has(compilation)){
        return await new Promise((resolve)=>{
            processing.get(compilation).push(resolve);
        })
    }else{
        let queues = [];
        processing.set(compilation, queues);
        let result = await asyncBuildHook(compilation);
        while(queues.length>0){
            let resolve = queues.shift();
            resolve(result);
        }
        processing.delete(compilation);
        return result;
    }
}

class Plugin extends EventEmitter{
    static is(value){
        return value ? value instanceof Plugin : false
    }

    #name = null;
    #options = null;
    #initialized = false;
    #context = null;
    #complier = null;
    #version = '0.0.0';
    #records = new Map();

    constructor(name, version, options={}){
        super();
        plugins.add(this);
        this.#name = name;
        this.#version = version;
        this.#options = options;
        if(options.mode){
            options.metadata.env.NODE_ENV = options.mode;
        }
    }

    get initialized(){
        return this.#initialized;
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

    //构建缓存，存在缓存中的不会构建
    get records(){
        return this.#records;
    }

    //编译器对象
    get complier(){
        return this.#complier;
    }

    //用于构建的上下文对象
    get context(){
        return this.#context;
    }

    //开发模式下调用，用来监听文件变化时删除缓存
    watch(){
        this.complier.on('onChanged', (compilation)=>{
            this.records.delete(compilation)
            let cache = this.context.cache;
            if(cache){
                compilation.modules.forEach(module=>cache.clear(module));
                cache.clear(compilation);
            }
            this.emit("compilation:changed", compilation); 
        });
    }

    async init(){
        //创建一个用来构建的上下文对象。每个插件都应该实现自己的上下文对象
        this.#context = createBuildContext(this, this.records);
        //初始化需要的虚拟模块。 每个插件都应该实现自己的虚拟模块
        createPolyfillModule(
            path.join(__dirname, "./polyfills"),
            this.#context.virtuals.createVModule
        );
    }

    //构建前调用。
    async beforeStart(complier){
        if(this.#initialized)return;
        this.#initialized = true;
        this.#complier = complier;
        await this.init();
        if(this.options.mode==='development'){
            this.watch();
        }
    }

    //当任务处理完成后调用。在加载插件或者打包插件时会调用这个方法，用来释放一些资源
    async afterDone(){
        
    }

    //构建所有依赖文件
    async run(compilation){
        if(!Compilation.is(compilation)){
            throw new Error('compilation is invalid')
        }
        if(!this.initialized){
            await this.beforeStart(compilation.compiler);
        }
        if(compilation.isDescriptorDocument()){
            throw new Error(`Build entry file cannot is descriptor. on the "${compilation.file}"`)
        }
        return await execute(compilation, this.context.buildDeps);
    }

    //构建单个文件
    async build(compilation, vmId=null){
        if(!Compilation.is(compilation)){
            throw new Error('compilation is invalid')
        }
        if(!this.initialized){
            await this.beforeStart(compilation.compiler);
        }
        if(!vmId && compilation.isDescriptorDocument()){
            let mainModule = compilation.mainModule;
            if(mainModule){
                if(mainModule.isDeclaratorModule){
                    let vm = this.context.virtuals.getVModule(mainModule.getName());
                    if(vm){
                        compilation = vm;
                    }else{
                        throw new Error(`Not resolved virtual module, need to specify the virtual module-id. on the "${compilation.file}"`) 
                    }
                }
            }
        }else if(vmId){
            let vm = this.context.virtuals.getVModule(vmId);
            if(vm){
                compilation = vm;
            }else{
                throw new Error(`The '${vmId}' virtual module does not exists.`)
            }
        }
        return await execute(compilation, this.context.build);
    }
}

function getAllPlugin(){
    return plugins
}

export {getAllPlugin, Plugin, execute}

export default Plugin