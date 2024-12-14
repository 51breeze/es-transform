const Compiler = require("easescript/lib/core/Compiler");
const Diagnostic = require("easescript/lib/core/Diagnostic");
const Compilation = require("easescript/lib/core/Compilation");
const path =require("path");
let plugin = require("../dist/index");
plugin = plugin.default || plugin
class Creator {
    constructor(options){
        const compiler = new Compiler(Object.assign({
            debug:false,
            diagnose:true,
            enableComments:true,
            autoLoadDescribeFile:true,
            workspace:path.join(__dirname,"./src"),
            parser:{
                locations:true
            }
        },options || {}));
        this._compiler = compiler;
        this.plugin = plugin({
            emitFile:true,
            //sourceMaps:true,
            outExt:'.js',
            outDir:'test/.output',
            mode:'development',
            comments:true,
            metadata:{
                env:{NODE_ENV:'development'},
                platform:'client',
                versions:{
                    vue:'3.0.12'
                }
            },
            module:"cjs",
        });
        //this.plugin.beforeStart(compiler)
    }

    get compiler(){
        return this._compiler;
    }

    factor(file){
        return new Promise( async(resolved,reject)=>{
            const compiler = this.compiler;
            await compiler.initialize();
            let compilation = null;
            try{
                compilation=file ? await compiler.createCompilation(file) : new Compilation( compiler );
                await compilation.parserAsync();
                if(compilation.stack){
                    resolved(compilation);
                }else{
                    reject({compilation,errors:compiler.errors});
                }
            }catch(error){
                console.log(error)
                reject({compilation,errors:[error]});
            }
        });
    }

    build(compilation){
        this.plugin.run(compilation);
    }
}

exports.Diagnostic = Diagnostic;
exports.Creator=Creator;