const fs = require("fs");
const path = require("path");
const dirname = path.join(__dirname,"tokens");
let imports = {}
fs.readdirSync( dirname ).forEach( (filename)=>{
    const info = path.parse( filename );
    if(info.name==='index')return;
    let filepath = path.join(dirname, filename)
    let code = fs.readFileSync(filepath).toString()
    code = code.replace(/(const|var|let)\s+(\w+)[\s+]?\=[\s+]?require[\s+]?\(([\'\"])([^\3]*?)\3\)/g, (all, _var, _name, _q, file)=>{
        return `import ${_name} from '${file}'`
    })
    code = code.replace(/module\.exports(\s+)?\=/, 'export default')
    fs.writeFileSync(filepath, code)
    imports[info.name] = `import ${info.name} from "./${filename}"`
});

let code = Object.values(imports).join('\n')
code += '\nexport {\n\t'+Object.keys(imports).join(',\n\t')+'\n}'

fs.writeFileSync( path.join(dirname, 'index.js'), code)






