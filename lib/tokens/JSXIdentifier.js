import{toCamelCase} from '../core/Common';
export default function(ctx,stack){
   var name = stack.value();
   if( stack.parentStack.parentStack.isJSXAttribute ){
      if(name.includes('-')){
         return ctx.createIdentifier(toCamelCase(name), stack);
      }
   }
   const node = ctx.createNode( stack , 'Identifier');
   node.value = name;
   node.raw = name;
   return node;
}