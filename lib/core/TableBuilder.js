import path from 'path';
import fs from 'fs';
import {createIdentNode,parseDefineAnnotation, getModuleAnnotations} from './Common.js';
import Generator from './Generator.js';

function normalName( name ){
    return name.replace(/([A-Z])/g, (a,b,i)=>{
        return i > 0 ? '_'+b.toLowerCase() : b.toLowerCase();
    });
}

class TableBuilder{
    #plugin=null;
    #changed = true;
    #outfile = '';
    #records = new Map()
    constructor(plugin){
        this.#plugin = plugin;
        const rebuild = (compilation)=>{
            if(!compilation)return;
            let has = false;
            compilation.modules.forEach(module=>{
                if(module.isStructTable){
                    has = true;
                    this.removeTable(module.getName())
                }
            })
            if(has){
                plugin.clear(compilation)
                plugin.build(compilation)
            }
        }
        plugin.on("compilation:changed",(compilation)=>{
            if(compilation){
                compilation.once('onParseDone',()=>{
                    rebuild(compilation)
                })
            }
        });
        plugin.on("compilation:refresh",(compilations)=>{
            if(Array.isArray(compilations)){
                compilations.forEach(rebuild)
            }
        })
        
    }

    createTable(ctx, stack){
        const module = stack.module;
        const defineAnnotations = getModuleAnnotations(module, ['define'], false);
        for(let defineAnnotation of defineAnnotations){
            const data = parseDefineAnnotation(defineAnnotation)
            if(data.sql === false){
                return;
            }
        }
        const key = module.getName();
        if(this.hasTable(key))return false;
        const node = ctx.createNode(stack);
        node.id = ctx.createIdentifier( '`'+normalName(stack.id.value())+'`', stack.id);
        node.properties = [];
        node.body = [];
        const cacheColumn = {};
        const cacheOption = {};
        const keys = [];
        const make = (stack)=>{
            const module = stack.module;
            stack.body.forEach( item=>{
                const token = createIdentNode(ctx,item);
                if(item.isStructTableColumnDefinition){
                    const key = item.key.value();
                    if(cacheColumn[key]===true){
                        return;
                    }
                    cacheColumn[key] = true;
                }
                if(token){
                    if(item.isStructTableColumnDefinition){
                        const methodNode = token.properties[0];
                        if(methodNode && methodNode.type==="StructTableMethodDefinition"){
                            if(methodNode.key && methodNode.params){
                                const value = String(methodNode.key.value).toLowerCase();
                                if(value==="email" || value==="range"){
                                    methodNode.key.value = 'varchar';
                                    if(value === 'range'){
                                        const params = methodNode.params;
                                        if(params.length>1){
                                            methodNode.params = [params[params.length-1]];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(item.key && item.key.isIdentifier){
                        const key = String(item.raw()).replace(/\s\t\r\n/g,'').toLowerCase();
                        if(cacheOption[key]===true){
                            return;
                        }
                        cacheOption[key]=true;
                    }
                    if(item.isStructTablePropertyDefinition){
                        node.properties.push(token);
                    }else{
                        if(item.isStructTableKeyDefinition){
                            keys.push(token)
                        }else{
                            node.body.push(token);
                        }
                    }
                }
            });
            if(Array.isArray(module.extends)){
                module.extends.forEach(module=>{
                    module = module.type();
                    if(module.isStructTable){
                        module.getStacks().forEach(stack=>{
                            if(stack.isStructTableDeclaration){
                                make(stack)
                            }
                        })
                    }
                })
            }
        }
        make(stack);

        const minValue = -9999;
        const maxValue = 9999;
        const defaultValue = 999;
        const getOrder = (value)=>{
            if(value ==='first'){
                return minValue-1;
            }else if(value==='last'){
                return maxValue+1
            }
            value = parseInt(value)
            if(isNaN(value))return defaultValue;
            return Math.max(Math.min(value, maxValue), minValue)
        }

        const sroter = (a, b)=>{
            let a1 = getOrder(a.order || defaultValue);
            let b1 = getOrder(b.order || defaultValue);
            return a1-b1
        }

        node.body.sort(sroter);
        keys.sort(sroter);
        node.body.push(...keys);

        let gen = new Generator();
        gen.make(node);
        this.#records.set(key, gen.toString());
        this.#changed = true;
        this.build(ctx);
        return true;
    }

    get plugin(){
        return this.#plugin;
    }

    get type(){
        return "";
    }

    get outfile(){
        return this.#outfile;
    }

    set outfile(value){
        this.#outfile = value;
    }

    getTable(name){
        return this.#records.get(name)
    }
    
    hasTable(name){
        return this.#records.has(name)
    }

    removeTable(name){
        this.#records.delete(name)
    }
    
    getTables(){
        return Array.from(this.#records.values())
    }

    async build(ctx){
        if(!this.#changed)return;
        this.#changed = false;
        let file = this.type + '.sql';
        let code = this.getTables().join("\n");
        file = this.outfile || (this.outfile=ctx.getOutputAbsolutePath(file));
        fs.mkdirSync(path.dirname(file),{recursive: true});
        fs.writeFileSync(file, code);
    }
}

function getTableManager(){
    const records = new Map()
    function getBuilder(type){
        if(!records.has(type)){
            throw new Error(`The '${type}' table builder is not exists.`)
        }
        return records.get(type)
    }

    function addBuilder(builder){
        if(builder instanceof TableBuilder){
            records.set(builder.type,builder)
        }else{
            throw new Error('Table builder must is extends TableBuilder.')
        }
    }

    function getAllBuilder(){
        return records;
    }

    return {
        addBuilder,
        getBuilder,
        getAllBuilder
    }
}

class MySql extends TableBuilder{
    get type(){
        return 'mysql';
    }
}

export {
    normalName,
    getTableManager,
    TableBuilder,
    MySql,
}