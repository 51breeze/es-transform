export default function(ctx, stack){
   const node = ctx.createNode(stack);
   node.exported = ctx.createToken(stack.exported);
   node.local = ctx.createToken(stack.local);
   return node;
}