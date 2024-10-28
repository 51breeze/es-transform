import FunctionExpression from './FunctionExpression';
export default function(ctx,stack,type){
    const node = FunctionExpression(ctx,stack,type);
    node.type = type;
    return node;
}