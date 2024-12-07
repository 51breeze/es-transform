import Utils from 'easescript/lib/core/Utils';
import { createCommentsNode } from '../core/Common';
import FunctionDeclaration from './FunctionDeclaration';
export default function(ctx,stack,type){
   const node = FunctionDeclaration(ctx,stack,type);
   node.async = stack.expression.async ? true : false;
   node.static = !!stack.static;
   node.modifier = Utils.getModifierValue(stack);
   node.kind = 'method';
   node.isAbstract = !!stack.isAbstract;
   node.isFinal = !!stack.isFinal;
   node.comments = createCommentsNode(ctx, stack, node)
   return node;
}