import Utils from 'easescript/lib/core/Utils';
import { createStaticReferenceNode } from '../core/Common';
export default function(ctx,stack){
    const node = ctx.createNode(stack);
    const operator = stack.operator;
    const prefix = stack.prefix;
    const isMember = stack.argument.isMemberExpression;
    if(isMember){
        const desc = stack.argument.description();
        const module = stack.module;
        const scopeId = module ? module.id : null;
        let isReflect = false;
        if( stack.argument.computed ){
            const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
            if( !hasDynamic && !Utils.isLiteralObjectType(stack.argument.object.type()) ){
                isReflect = true;
            }
        }else if( desc && desc.isAnyType ){
            isReflect = !Utils.isLiteralObjectType(stack.argument.object.type())
        }

        if(isReflect){
            const method = operator ==='++' ? 'incre' : 'decre';
            const callee = createStaticReferenceNode(ctx, stack, 'Reflect', method)
            return ctx.createCallExpression( callee, [
                ctx.createIdentifier(scopeId),
                ctx.createToken(stack.argument.object), 
                ctx.createLiteral(stack.argument.property.value()),
                ctx.createLiteral( !!prefix ),
            ], stack);
        }
    }
    
    node.argument = ctx.createToken(stack.argument);
    node.operator = operator;
    node.prefix = prefix;
    return node;
}