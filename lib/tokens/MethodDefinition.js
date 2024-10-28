import Utils from 'easescript/lib/core/Utils';
import FunctionDeclaration from './FunctionDeclaration';
export default function(ctx,stack,type){
   const node = FunctionDeclaration(ctx,stack,type);
   node.async = stack.expression.async ? true : false;
   node.static = !!stack.static;
   node.modifier = Utils.getModifierValue(stack);
   node.kind = 'method';
   node.isAbstract = !!stack.isAbstract;
   node.isFinal = !!stack.isFinal;
   return node;
}