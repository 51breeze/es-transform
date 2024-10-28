import Utils from 'easescript/lib/core/Utils'
import { createStaticReferenceNode } from '../core/Common';
const globals = ['Array', 'Object','RegExp','Number','String','Function']

export default function(ctx,stack){
     let operator = stack.operator;
     let node = ctx.createNode(stack);
     let right = ctx.createToken(stack.right);
     if( operator ==="is" || operator==="instanceof" ){
          let type = stack.right.type();
          let origin = !Utils.isModule(type) ? Utils.getOriginType(type) : type;
          if(!stack.right.hasLocalDefined()){
               ctx.addDepend(origin, stack.module);
               right = ctx.createIdentifier(
                    ctx.getGlobalRefName(
                         stack,
                         ctx.getModuleReferenceName(origin, stack.module)
                    )
               )
          }
          if(operator === "is" && !(origin && globals.includes(origin.id))){
               return ctx.createCallExpression(
                    createStaticReferenceNode(ctx, stack, 'System', 'is'),
                    [
                         ctx.createToken(stack.left),
                         right
                    ],
                    stack
               );
          }
          operator = 'instanceof';
     }
    
     node.left  = ctx.createToken(stack.left);
     node.right = right;
     node.operator = operator;
     return node;
}