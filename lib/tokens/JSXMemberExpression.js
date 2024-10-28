export default function(ctx,stack){
    const node = ctx.createNode( stack );
    node.object = ctx.createToken(stack.object);
    node.property = ctx.createToken(stack.property);
    return node;
 }