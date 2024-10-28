export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.raw = stack.raw();
    node.value = node.raw;
    node.tail = stack.tail;
    return node;
}