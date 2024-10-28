export default function(ctx,stack){
    const node = ctx.createNode( stack );
    node.properties = stack.properties.map( item=> ctx.createToken(item) );
    return node;
}