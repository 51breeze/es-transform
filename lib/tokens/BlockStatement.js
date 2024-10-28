export default function(ctx,stack){
   const node = ctx.createNode(stack);
   node.body = [];
   ctx.setNode(stack, node)
   for(let child of stack.body){
      const token = ctx.createToken( child );
      if(token){
         node.body.push( token );
         if(child.isWhenStatement){
            const express = token.type ==='BlockStatement' ? token.body : [token];
            if( Array.isArray(express) ){
               const last = express[ express.length-1 ];
               if( last && last.type ==="ReturnStatement"){
                  break
               }
            }
         }else if(child.isReturnStatement || child.hasReturnStatement){
            break
         }
      }
   };
   ctx.removeNode(stack);
   return node;
};