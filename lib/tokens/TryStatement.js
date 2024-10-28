export default function(ctx,stack){
   const node = ctx.createNode(stack);
   node.block = ctx.createToken(stack.block);
   node.param = ctx.createToken(stack.param);
   node.handler = ctx.createToken(stack.handler);
   node.finalizer = ctx.createToken(stack.finalizer);
   return node;
}