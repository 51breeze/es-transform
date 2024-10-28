export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.condition  = ctx.createToken(stack.condition);
    node.consequent = ctx.createToken(stack.consequent);
    node.alternate  = ctx.createToken(stack.alternate);
    return node;
}