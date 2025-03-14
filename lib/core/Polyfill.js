import Utils from 'easescript/lib/core/Utils';
import fs from 'fs'
import path from 'path'
const TAGS_REGEXP = /(?:[\r\n]+|^)\/\/\/(?:\s+)?<(references|namespaces|export|import|createClass)\s+(.*?)\/>/g;
const ATTRS_REGEXP = /(\w+)(?:[\s+]?=[\s+]?([\'\"])([^\2]*?)\2)?/g;
function parsePolyfillModule(file, createVModule){
    let content = fs.readFileSync(file).toString();
    let references  = [];
    let namespace = '';
    let requires = [];
    let exportName = null;
    let disableCreateClass = false;
    content = content.replace(TAGS_REGEXP, function(a,b,c){
        const items = c.matchAll(ATTRS_REGEXP);
        const attr = {};
        if( items ){
            for(let item of items){
                let [,key,,value] = item;
                if(value)value=value.trim();
                attr[key] = value || true;
            }
        }
        switch( b ){
            case 'references' :
                if( attr['from'] ){
                    references.push({
                        from:attr['from'], 
                        local:attr['name'], 
                    });
                }
                break;
            case 'namespaces' :
                if( attr['name'] ){
                    namespace = attr['name'];
                }
                break;
            case 'export' :
                if( attr['name'] ){
                    exportName = attr['name'];
                }
                break;
            case 'import' :
                if(attr['from']){
                    requires.push({
                        local:attr['name'],
                        from:attr['from'], 
                        imported:attr['key'] || (attr['namespaced'] ? '*' : void 0)
                    });
                }
                break;
            case 'createClass' :
                if( attr['value'] == 'false' ){
                    disableCreateClass = true;
                }   
        }
        return ''
    });

    const info = path.parse(file);
    let id = namespace ? `${namespace}.${info.name}` : info.name;
    let vm = createVModule(id)

    if(disableCreateClass){
        vm.disableCreateClass();
    }

    requires.forEach(item=>{
        const local = item.local ? item.local : path.parse(item.from).name;
        vm.addImport(item.from, local, item.imported)
    })

    references.forEach(item=>{
        const from = String(item.from)
        const local = item.local ? item.local :  from.split('.').pop()
        vm.addReference(from, local)
    })

    if(exportName){
        vm.addExport('default', exportName)
    }else{
        vm.addExport('default', vm.id)
    }
    vm.file = Utils.normalizePath(file);
    vm.setContent(content)
}

function createPolyfillModule(dirname, createVModule) {
    if(!path.isAbsolute(dirname)){
        dirname = path.join(__dirname, dirname)
    }
    if(!fs.existsSync(dirname)){
        throw new Error(`Polyfills directory does not exists. on '${dirname}'`)
    }
    fs.readdirSync(dirname).forEach( (filename)=>{
        const filepath =  path.join(dirname,filename);
        if( fs.statSync(filepath).isFile() ){
            parsePolyfillModule(filepath, createVModule)
        }else if( fs.statSync(filepath).isDirectory() ) {
            createPolyfillModule(filepath, createVModule);
        }
    });
}

function createFoldersPolyfillModule(dirs=[], createVModule){
    const readfile = (dirname)=>{
        let files = []
        fs.readdirSync(dirname).forEach( (filename)=>{
            const filepath =  path.join(dirname,filename);
            if( fs.statSync(filepath).isFile() ){
                files.push(filepath)
            }else if( fs.statSync(filepath).isDirectory() ) {
                files.push(...readfile(filepath))
            }
        });
        return files;
    }
    let sets = new Map();
    const parse = (file)=>{
        let name = path.parse(file).name
        if(!sets.has(name)){
            sets.set(name, file)
        }
    }
    let based = readfile(dirs.shift());
    let files = dirs.map(readfile).flat();
    based.forEach(parse);
    files.forEach(parse);
    Array.from(sets.values()).forEach(file=>{
        parsePolyfillModule(file, createVModule)
    })
}

export {
    parsePolyfillModule,
    createPolyfillModule,
    createFoldersPolyfillModule
}