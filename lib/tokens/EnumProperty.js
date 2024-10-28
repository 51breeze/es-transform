export default function(ctx,stack){
    const node = ctx.createNode(stack, 'PropertyDefinition');
    node.static = true;
    node.key =  ctx.createToken(stack.key);
    node.init = ctx.createToken(stack.init);
    node.modifier = 'public';
    node.kind = 'enumProperty';
    return node;
}