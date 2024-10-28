import MethodDefinition from './MethodDefinition';
export default function(ctx,stack,type){
    const node = MethodDefinition(ctx,stack,type);
    node.kind = 'get';
    return node;
 };