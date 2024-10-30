import Utils from 'easescript/lib/core/Utils';
import path from 'path';
const sortedKey = Symbol('sorted')
const rules = [];
const extensions = ['.css', '.sass', '.scss'];
class Loader{
    #options = null
    constructor(options={}){
        this.#options = options;
    }

    resolveId(ctx, source, asset){
        let ext = path.extname(source);
        if(extensions.includes(ext)){
            let folder = ctx.getSourceFileMappingFolder(source + '.assets');
            if(folder){
                if(path.isAbsolute(folder)){
                    return Utils.normalizePath(path.join(folder, ctx.genUniFileName(source) + '.js'))
                }else{
                    return Utils.normalizePath('./' + path.join(folder, ctx.genUniFileName(source) + '.js'))
                }
            }
            return Utils.normalizePath('./' + ctx.genUniFileName(source) + '.js');
        }else{
            return source;
        }
    }

    async build(ctx, source, asset){
        let code = asset.code;
        let map = null;
        if(ctx.options.module==='cjs'){
            code = `module.exports=${JSON.stringify(code)};`
        }else{
            code = `export default ${JSON.stringify(code)};`
        }
        return {
            code,
            map
        }
    }
}

function createLoader(options={}){
    return new Loader(options)
}

function addRule(test, loader, order){
    if(Array.isArray(test)){
        return test.map(item=>addRule(item, loader, order))
    }
    if(!(loader instanceof Loader)){
        throw new Error(`Loaders 'rule.loader' must is Loader instances types.`)
    }
    let type = typeof test;
    let rule = Object.create(null);
    rule.test = test;
    rule.loader = loader;
    rule.order = order;
    if(order && !(order ==='post' || order === 'pre')){
        throw new Error(`Loaders 'rule.order' can only is 'post,pre' identifier.`)
    }
    if(type==='string'){
        rule.isExt=test.charCodeAt(0) === 46;
        if(!rule.isExt && !test.includes('/') && test.includes('.')){
            rule.isFileName = true;
        }
        rule.isString = true
    }else if(type==='function'){
        rule.isFun = true
    }else if(test instanceof RegExp){
        rule.isRegExp = true
    }else{
        throw new Error(`Loaders 'rule.test' can only is 'string,function,regexp' types.`)
    }
    rules.push(rule);
    rules[sortedKey] = false;
}

function getRules(){
    return rules;
}

function resolveLoaderSourceId(ctx, source, asset){
    let loaders = resolveLoaders(source);
    if(loaders.size>0){
        for(let loader of loaders){
            let id = loader.resolveId(ctx, source, asset);
            if(id){
                return {id, loader};
            }
        }
    }
}

async function resolveLoaderBuild(ctx, source, asset){
    let loaders = resolveLoaders(source);
    if(loaders.size>0){
        for(let loader of loaders){
            let result = await loader.build(ctx, source, asset);
            if(result){
                return result;
            }
        }
    }
}

const records = new Map();
function resolveLoaders(source){
    if(!source)return false;
    if(!rules[sortedKey]){
        rules[sortedKey] = true
        rules.sort((a,b)=>{
            let a1 = a.order === 'pre' ? 0 : a.order === 'post' ? 2 : 1;
            let b1 = b.order === 'pre' ? 0 : b.order === 'post' ? 2 : 1;
            return a1 - b1;
        })
    }
    let loaders = records.get(source)
    if(loaders){
        return loaders;
    }
    loaders = new Set();
    records.set(source, loaders);
    for(let rule of rules){
        let test = rule.test
        if(rule.isExt || rule.isFileName){
            if(source.endsWith(test)){
                loaders.add(rule.loader);
            }
        }else if(rule.isRegExp){
            if(test.test(source)){
                loaders.add(rule.loader);
            }
        }else if(rule.isFun){
            if(test(source)){
                loaders.add(rule.loader)
            }
        }else if(test === source){
            loaders.add(rule.loader)
        }
    }
    return loaders;
}

export {
    Loader,
    getRules,
    addRule,
    resolveLoaderSourceId,
    resolveLoaderBuild,
    resolveLoaders,
    createLoader
}

export default Loader;