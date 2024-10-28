export default function(ctx,stack){
     const node = ctx.createNode(stack);
     node.test = ctx.createToken( stack.test );
     node.consequent = ctx.createToken(stack.consequent);
     node.alternate = ctx.createToken(stack.alternate);
     return node;
}