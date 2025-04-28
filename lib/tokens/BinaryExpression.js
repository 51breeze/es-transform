import Utils from 'easescript/lib/core/Utils'
import { createStaticReferenceNode } from '../core/Common';
import Namespace from 'easescript/lib/core/Namespace';
export default function(ctx,stack){
     let operator = stack.operator;
     let node = ctx.createNode(stack);
     let right = ctx.createToken(stack.right);
     if( operator ==="is" || operator==="instanceof" ){
          let type = stack.right.type();
          let origin = type;
          let objectType = null;
          if(operator === "is"){
               if(type.id==="string" || type.id==="number" || type.id==="object" || type.id==="function" || type.id==="boolean" || type.id==="symbol"){
                    node.left =  ctx.createUnaryExpression(ctx.createToken(stack.left), 'typeof', true);
                    node.right = ctx.createLiteral(String(type.id).toLowerCase());
                    node.operator = '===';
                    return node;
               }

               if(Namespace.globals.get("Function")===type){
                    objectType = ctx.createIdentifier("Function");
               }else if(type.isClassGenericType && type.isClassType || Namespace.globals.get('Class')===type){
                    return ctx.createCallExpression(
                         createStaticReferenceNode(ctx, stack, 'System', 'isClass'),
                         [
                              ctx.createToken(stack.left),
                         ],
                         stack
                    );
               }else if(Utils.isModule(type)){
                    if(type.isDeclaratorModule && !ctx.isVModule(type) && !ctx.isDeclaratorModuleDependency(type)){
                         objectType = ctx.createIdentifier("Object");
                    }
               }else{
                    origin = Utils.getOriginType(type)
               }
          }
          if(objectType){
               right = objectType;
          }else if(origin && !stack.right.hasLocalDefined()){
               ctx.addDepend(origin, stack.module);
               right = ctx.createIdentifier(
                    ctx.getModuleReferenceName(origin, stack.module, stack)
               )
          }
          if(!right){
               right = ctx.createIdentifier("Object");
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