export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.label  = ctx.createIdentifier(stack.label.value(),stack.label);
    node.body  = ctx.createToken(stack.body);
    return node;
}