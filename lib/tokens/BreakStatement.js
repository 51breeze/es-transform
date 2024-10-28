export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.label = stack.label && ctx.createIdentifier(stack.label.value(), stack.label);
    return node;
}