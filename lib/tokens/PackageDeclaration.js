export default function(ctx,stack){
    const node = ctx.createNode( stack );
    node.body = [];
    ctx.setNode(stack, node)
    stack.body.forEach( item=>{
        if( item.isClassDeclaration || item.isDeclaratorDeclaration || item.isEnumDeclaration || item.isInterfaceDeclaration || item.isStructTableDeclaration){
            let child = ctx.createToken(item)
            if(child){
                node.body.push(child);
            }
        }
    });
    ctx.removeNode(stack)
    return node;
}