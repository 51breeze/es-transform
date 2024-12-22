import Namespace from 'easescript/lib/core/Namespace'
import { createJSXAttrHookNode, getMethodOrPropertyAlias } from '../core/Common';
export default function(ctx,stack){
    let ns = null;
    if( stack.hasNamespaced ){
        const xmlns = stack.getXmlNamespace();
        if( xmlns ){
            ns = xmlns.value.value();
        }else {
            const nsStack = stack.getNamespaceStack();
            const ops = stack.compiler.options;
            ns = ops.jsx.xmlns.default[ nsStack.namespace.value() ] || ns;
        }
    }

    const node = ctx.createNode( stack );
    node.namespace = ns;
    
    let name = null;
    let value = stack.value ? ctx.createToken( stack.value ) : ctx.createLiteral(true);

    if( stack.isMemberProperty ){
        const eleClass = stack.jsxElement.getSubClassDescription();
        const propsDesc = stack.getAttributeDescription( eleClass );
        const resolveName = getMethodOrPropertyAlias(ctx, propsDesc);
        if( resolveName ){
            name = resolveName.includes('-') ? ctx.createLiteral(resolveName) : ctx.createIdentifier( resolveName );
        }
        const invoke = createJSXAttrHookNode(ctx, stack, propsDesc);
        if(invoke)value = invoke;
    }

    if( !name ){
        name = ctx.createToken( stack.hasNamespaced ? stack.name.name : stack.name ); 
    }

    if( ns ==="@binding" && stack.value ){
        const desc = stack.value.description();
        let has = false;
        if(desc){
            has =(desc.isPropertyDefinition || desc.isTypeObjectPropertyDefinition) && !desc.isReadonly || 
                (desc.isMethodGetterDefinition && desc.module && desc.module.getMember( desc.key.value(), 'set') );
        }
        if( !has && stack.value.isJSXExpressionContainer ){
            let expression = stack.value.expression;
            if(expression){
                if(expression.isTypeAssertExpression){
                    expression = expression.left;
                } 
                if(expression.isMemberExpression){
                    const objectType = Namespace.globals.get('Object')
                    has = objectType && objectType.is(expression.object.type());
                }
            }
        }
        if( !has ){
            stack.value.error(10000, stack.value.raw());
        }
    }

    node.name = name;
    node.value = value;
    return node;
}