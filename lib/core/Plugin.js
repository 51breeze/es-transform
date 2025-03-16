import Compilation from 'easescript/lib/core/Compilation'
import Diagnostic from 'easescript/lib/core/Diagnostic';
import path from "path";
import {createBuildContext} from "./Builder";
import {createPolyfillModule} from './Polyfill';
import EventEmitter from "events";

Diagnostic.register("transform", (definer)=>{
    definer(
        10000,
        '[es-transform] 绑定的属性(%s)必须是一个可赋值的成员属性',
        "[es-transform] Binding the '%s' property must be an assignable members property"
    );
    definer(
        10101,
        '[es-transform] 路由参数(%s)的默认值只能是一个标量',
        "[es-transform] Route params the '%s' defalut value can only is a literal type."
    );
    definer(
        10102,
        '[es-transform] "@Http"注解符中指定的请求路由服务(%s)没有找到',
        "[es-transform] Not found request route service (%s) in the @Http"
    );
    definer(
        10103,
        '[es-transform] "@Readfile"注解符中缺少目录路径(%s)参数',
        "[es-transform] `Missing the '%s' arguments in the @Readfile"
    );
    definer(
        10104,
        '[es-transform] "@Readfile"注解符中目录路径(%s)不存在',
        "[es-transform] Resolve the '%s' directory not found in the @Readfile"
    );
    definer(
        10105,
        '[es-transform] 指定的类模块(%s)不存在',
        "[es-transform] The class '%s' is not exists"
    );
    definer(
        10106,
        '[es-transform] 指定的类方法(%s)不存在',
        "[es-transform] The method '%s' is not exists."
    );
    definer(
        10107,
        '[es-transform] 动态路由的参数不能定义展开操作',
        "[es-transform] dynamic route parameters cannot define spread operations"
    );
    definer(
        10108,
        `[es-transform] "@Hook"注解符缺少'type'或者'version'参数`,
        "[es-transform] Missing the 'type' or 'version' arguments in the @Hook"
    );
    definer(
        10109,
        `[es-transform] "@Redirect"注解符中引用的类模块(%s)不存在`,
        `[es-transform] References class the "%s" is not exists in the @Redirect`
    );
    definer(
        10110,
        `[es-transform] "@Redirect"注解符缺少(path)参数`,
        `[es-transform] Missing the 'path' arguments in the @Redirect`
    );
    definer(
        10111,
        `[es-transform] "@Router"注解符中指定的路由提供者(%s)没有解析到路由`,
        `[es-transform] Resolve route not found the '%s' in the @Router`
    );
});

const plugins = new Set();
const processing = new Map();
async function execute(compilation, asyncHook){
    if(processing.has(compilation)){
        return await new Promise((resolve)=>{
            processing.get(compilation).push(resolve);
        })
    }else{
        let queues = [];
        processing.set(compilation, queues);
        let result = await asyncHook(compilation);
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
    #watched = false;
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
        if(this.#watched)return;
        this.#watched = true;
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
        if(this.#context)return;
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
        this.#complier = complier;
        await this.init();
        if(this.options.mode==='development'){
            this.watch();
        }
        this.#initialized = true;
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