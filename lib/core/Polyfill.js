import fs from 'fs'
import path from 'path'
import {createVModule} from './VirtualModule.js';
const TAGS_REGEXP = /(?:[\r\n]+|^)\/\/\/(?:\s+)?<(references|namespaces|export|import)\s+(.*?)\/>/g;
const ATTRS_REGEXP = /(\w+)(?:[\s+]?=[\s+]?([\'\"])([^\2]*?)\2)?/g;
let _createVModule = createVModule;

function parsePolyfillModule(file, createVModule){
    let content = fs.readFileSync(file).toString();
    let references  = [];
    let namespace = '';
    let requires = [];
    let exportName = null;
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
                        imported:!!attr['imported']
                    });
                }
                break;
        }
        return ''
    });

    const info = path.parse(file);
    let id = namespace ? `${namespace}.${info.name}` : info.name;
    let vm = createVModule(id)
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

    vm.setContent(content)
}

function createPolyfillModule(dirname) {
    if(!path.isAbsolute(dirname)){
        dirname = path.join(__dirname, dirname)
    }
    if(!fs.existsSync(dirname)){
        throw new Error(`Polyfills directory does not exists. on '${dirname}'`)
    }
    fs.readdirSync(dirname).forEach( (filename)=>{
        const filepath =  path.join(dirname,filename);
        if( fs.statSync(filepath).isFile() ){
            parsePolyfillModule(filepath, _createVModule)
        }else if( fs.statSync(filepath).isDirectory() ) {
            createPolyfillModule(filepath);
        }
    });
}

function setCreateVModuleFactory(factory){
    _createVModule = factory
}

export {
    setCreateVModuleFactory,
    parsePolyfillModule,
    createPolyfillModule
}