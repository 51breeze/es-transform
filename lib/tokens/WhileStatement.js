export default function(ctx,stack){
     const node = ctx.createNode(stack);
     node.condition = ctx.createToken(stack.condition);
     node.body = ctx.createToken(stack.body);
     return node;
}