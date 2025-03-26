import Namespace from 'easescript/lib/core/Namespace';
import Utils from 'easescript/lib/core/Utils'

function checkVNodeType(type){
    if(!type || type.isAnyType)return false;
    if(type.isUnionType){
        return type.elements.every(el=>checkVNodeType(el.type()))
    }
    let origin = Utils.getOriginType(type)
    if(origin && Utils.isModule(origin)){
        if(origin.isWebComponent() || Namespace.globals.get('VNode').is(origin)){
            return true;
        }
    }
    return false;
}


export default function(ctx, stack){

    if(stack.expression.isMemberExpression || stack.expression.isIdentifier){
        const desc = stack.expression.descriptor();
        if(desc && (!desc.isAccessor && desc.isMethodDefinition)){
            let object = ctx.createToken(stack.expression);
            return ctx.createCallExpression(
                ctx.createMemberExpression([
                    object,
                    ctx.createIdentifier('bind')
                ]),
                [ctx.createThisExpression()],
                stack
            );
        }
    }

    let node = ctx.createToken( stack.expression );
    if(node){
        let isExplicitVNode = false;
        let type = stack.expression.type();
        let isScalar = stack.expression.isLiteral || Utils.isScalar(type);
        if(type && !isScalar){
            isExplicitVNode = checkVNodeType(type);
        }
        node.isExplicitVNode = isExplicitVNode;
        node.isScalarType = isScalar;
        node.isExpressionContainer = true;
    }
    return node;
}