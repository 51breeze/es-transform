import path from 'path';
import fs from 'fs';
import {createIdentNode} from './Common.js';
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
        this.#plugin.on("compilation:changed",(compilation)=>{
            compilation.modules.forEach(module=>{
                if(module.isStructTable){
                    this.removeTable(module.id)
                }
            })
        });
    }

    createTable(ctx, stack){
        if(!stack.body.length)return false;
        const module = stack.module;
        if(this.hasTable(module.id))return false;
        const node = ctx.createNode(stack);
        node.id = ctx.createIdentifier( '`'+normalName(stack.id.value())+'`', stack.id);
        node.properties = [];
        node.body = [];
        stack.body.forEach( item=>{
            const token = createIdentNode(ctx,item);
            if(token){
                if( item.isStructTablePropertyDefinition ){
                    node.properties.push(token);
                }else{
                    node.body.push(token);
                }
            }
        });
        let gen = new Generator();
        gen.make(node);
        this.#records.set(module.id, gen.toString());
        this.#changed = true;
        this.build(ctx);
        return true;
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