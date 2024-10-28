import Utils from 'easescript/lib/core/Utils';
import { createStaticReferenceNode } from '../core/Common';
export default function(ctx,stack){
   const operator = stack.operator;
   const prefix   = stack.prefix;
   if( operator==='delete' && stack.argument.isMemberExpression ){
      const desc = stack.argument.description();
      if( desc && desc.isAnyType ){
         const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
         if( !hasDynamic && !Utils.isLiteralObjectType(stack.argument.object.type()) ){
            const property =  stack.argument.computed ? 
                              ctx.createToken(stack.argument.property) : 
                              ctx.createLiteral(
                                 stack.argument.property.value(), 
                                 void 0, 
                                 stack.argument.property
                              );
                              
            return ctx.createCallExpression(
               createStaticReferenceNode(ctx, stack, 'Reflect', 'deleteProperty'),
               [
                  ctx.createToken(stack.argument.object),
                  property
               ]
            );
         }
      }
   }
   const node = ctx.createNode(stack);
   node.argument = ctx.createToken(stack.argument);
   node.operator = operator;
   node.prefix = prefix;
   return node;
}