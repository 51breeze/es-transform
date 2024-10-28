export default function(ctx,stack){
    const node = ctx.createNode( stack );
    node.elements = stack.elements.map( item=>ctx.createToken(item) );
    return node;
}