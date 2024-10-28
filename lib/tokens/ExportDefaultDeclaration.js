export default function(ctx,stack){
    let declaration = ctx.createToken(stack.declaration);
    if(declaration){
        ctx.addExport('default', declaration, null, stack)
    }
}