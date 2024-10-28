export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.argument = ctx.createToken(stack.argument);
    return node;
}