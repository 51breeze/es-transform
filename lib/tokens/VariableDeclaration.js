export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.inFor = stack.flag;
    node.kind = stack.kind;
    node.declarations = [];
    stack.declarations.forEach( item=>{
        const variable = ctx.createToken(item);
        if( variable ){
            node.declarations.push( variable );
        }
    });
    if( !node.declarations.length ){
        return null;
    }
    return node;
}