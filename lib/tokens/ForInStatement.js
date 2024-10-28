export default function(ctx,stack){
   const node = ctx.createNode(stack);
   node.left  = ctx.createToken(stack.left);
   node.right = ctx.createToken(stack.right);
   node.body  = ctx.createToken(stack.body);
   return node;
}