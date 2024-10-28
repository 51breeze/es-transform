export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.init  = ctx.createToken(stack.init);
    node.condition = ctx.createToken(stack.condition);
    node.update  = ctx.createToken(stack.update);
    node.body  = ctx.createToken(stack.body);
    return node;
}