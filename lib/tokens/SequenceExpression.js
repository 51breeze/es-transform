export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.expressions = stack.expressions.map( item=>ctx.createToken(item) );
    return node;
}