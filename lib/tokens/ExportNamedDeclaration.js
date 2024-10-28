export default function(ctx,stack){
    if(stack.getResolveJSModule()){
        return null
    }
    let exportSource = null;
    if(stack.declaration){
        const decl = stack.declaration;
        if(decl.isVariableDeclaration){
            let decls = decl.declarations.map(decl=>decl.id.value());
            exportSource = ctx.addExport(decls.shift(), ctx.createToken(decl), null, decl)
            exportSource.bindExport(decls);
        }else if(decl.isFunctionDeclaration){
            exportSource = ctx.addExport(decl.key.value(), ctx.createToken(decl), null, decl)
        }else{
            throw new Error(`Export declaration type only support 'var' or 'function'`)
        }
    }else if(stack.specifiers && stack.specifiers.length>0){
        let source = null
        if(stack.source){
            source = stack.source.value()
            let compilation = stack.getResolveCompilation();
            if(compilation && compilation.stack){
                ctx.addFragment(compilation)
                source = ctx.getModuleImportSource(stack.getResolveFile(), stack.compilation.file);
            }else{
                source = ctx.getModuleImportSource(source, stack.compilation.file)
            }
            let importSource = ctx.getImport(source)
            if(!importSource){
                importSource = ctx.addImport(source);
                importSource.setExportSource()
            }
            source = importSource
        }
        stack.specifiers.forEach(spec=>{
            let exported = spec.exported || spec.local;
            exportSource = ctx.addExport(exported.value(), spec.local.value(), source, spec)
        });
    }
    if(exportSource){
        exportSource.stack = stack;
    }
}