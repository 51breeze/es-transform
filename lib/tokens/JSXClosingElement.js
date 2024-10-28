export default function(ctx, stack){
    const node = ctx.createNode(stack);
    node.name = ctx.createToken(stack.name);
    return node;
}