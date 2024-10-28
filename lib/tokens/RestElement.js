export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.value = stack.value();
    node.raw = node.value;
    return node;
}