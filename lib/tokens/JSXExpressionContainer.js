import Namespace from 'easescript/lib/core/Namespace';
import Utils from 'easescript/lib/core/Utils'

function checkVNodeType(type){
    if(!type || type.isAnyType)return false;
    if(type.isUnionType){
        return type.elements.some(el=>checkVNodeType(el.type()))
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