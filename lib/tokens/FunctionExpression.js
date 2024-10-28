export default function(ctx,stack,type){
   const node = ctx.createNode(stack,type);
   node.async = stack.async ? true : false;
   node.params = stack.params.map( item=>ctx.createToken(item) );
   node.body = ctx.createToken( stack.body );
   return node;
};