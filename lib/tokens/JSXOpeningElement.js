export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.attributes = stack.attributes.map( attr=>ctx.createToken( attr ) );
    node.selfClosing = !!stack.selfClosing;
    if( stack.parentStack.isComponent ){
        const desc = stack.parentStack.description();
        if( desc ){
            if( stack.hasNamespaced && desc.isFragment){
                node.name = ctx.createIdentifier(desc.id, stack.name);  
            }else{
                node.name = ctx.createIdentifier( ctx.getModuleReferenceName(desc, stack.module), stack.name);
            }
        }else{
            node.name = ctx.createIdentifier( stack.name.value(), stack.name);
        }
    }else{
        node.name = ctx.createLiteral( stack.name.value() , void 0,  stack.name);
    }
    return node;
}