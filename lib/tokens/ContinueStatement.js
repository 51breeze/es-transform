export default function(ctx,stack){
    const node = ctx.createNode( stack );
    node.label = ctx.createToken( stack.label );
    return node;
};