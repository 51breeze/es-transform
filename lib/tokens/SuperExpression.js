export default function(ctx,stack){
    const node = ctx.createNode(stack);
    const parent = stack.module.inherit;
    node.value = ctx.getModuleReferenceName(parent, stack.module);
    node.raw = node.value;
    return node;
}