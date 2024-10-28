import { getMethodOrPropertyAlias } from '../core/Common';
import FunctionExpression from './FunctionExpression';
export default function(ctx,stack,type){
    const node = FunctionExpression(ctx,stack,type);
    if(stack.key){
        let name = stack.key.value();
        if( stack.isMethodDefinition && !stack.isConstructor ){
            name = getMethodOrPropertyAlias(ctx, stack, name) || name;
        }
        node.key = ctx.createIdentifier(name, stack.key);
    }
    return node;
};