export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.quasis = stack.quasis.map( item=>ctx.createToken(item) );
    node.expressions = stack.expressions.map( item=>ctx.createToken(item) );
    return node;
}