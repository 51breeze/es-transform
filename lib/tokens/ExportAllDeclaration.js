export default function(ctx,stack){
    if(stack.getResolveJSModule() || !stack.source){
        return null
    }
    let source = stack.source.value()
    const compilation = stack.getResolveCompilation();
    if(compilation && compilation.stack){
        ctx.addFragment(compilation)
        source = ctx.getModuleImportSource(stack.getResolveFile(), stack.compilation.file);
    }else{
        source = ctx.getModuleImportSource(source, stack.compilation.file)
    }
    let importSource = ctx.getImport(source, true)
    if(!importSource){
        importSource = ctx.addImport(source, null, '*');
        importSource.setExportSource()
    }
    ctx.addExport(stack.exported ? stack.exported.value() : null, '*', importSource, stack)
}