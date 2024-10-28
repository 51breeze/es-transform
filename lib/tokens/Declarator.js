export default function(ctx,stack){
    const node = ctx.createNode(stack, 'Identifier');
    node.value = node.raw = stack.value();
    return node;
};