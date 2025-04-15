import Utils from 'easescript/lib/core/Utils'
import { createStaticReferenceNode } from '../core/Common';
export default function(ctx,stack){
     let operator = stack.operator;
     let node = ctx.createNode(stack);
     let right = ctx.createToken(stack.right);
     if( operator ==="is" || operator==="instanceof" ){
          let type = stack.right.type();
          if(operator === "is"){
               if(type.id==="string" || type.id==="number" || type.id==="object" || type.id==="function"){
                    node.left =  ctx.createUnaryExpression(ctx.createToken(stack.left), 'typeof', true);
                    node.right = ctx.createLiteral(String(type.id).toLowerCase());
                    node.operator = '===';
                    return node;
               }
               if(Utils.isModule(type)){
                    if(type.isDeclaratorModule && !ctx.isVModule(type) && !ctx.isDeclaratorModuleDependency(type)){
                        return ctx.createLiteral(true);
                    }
               }else{
                    return ctx.createLiteral(true);
               }
          }
          if(!stack.right.hasLocalDefined()){
               let origin = !Utils.isModule(type) ? Utils.getOriginType(type) : type;
               ctx.addDepend(origin, stack.module);
               right = ctx.createIdentifier(
                    ctx.getGlobalRefName(
                         stack,
                         ctx.getModuleReferenceName(origin, stack.module)
                    )
               )
          }
          if(operator === "is"){
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