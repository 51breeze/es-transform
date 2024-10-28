export default function(ctx,stack){
    const node = ctx.createNode( stack );
    node.expression = ctx.createToken( stack.expression );
    return node;
 };