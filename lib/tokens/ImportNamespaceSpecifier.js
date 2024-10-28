export default function(ctx, stack){
   const node = ctx.createNode(stack);
   node.local = stack.local ?  ctx.createToken(stack.local) : ctx.createIdentifier(stack.value(), stack);
   return node;
}