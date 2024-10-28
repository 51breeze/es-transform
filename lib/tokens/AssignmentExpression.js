import Utils from 'easescript/lib/core/Utils'
import {createStaticReferenceNode} from '../core/Common';
export default function(ctx,stack){
    const desc = stack.left.description();
    const module = stack.module;
    const isMember = stack.left.isMemberExpression;
    let isReflect = false;
    let operator = stack.operator;
    if(isMember){
        if( stack.left.computed ){
            let hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
            if(!hasDynamic && desc && (desc.isProperty && desc.computed || desc.isPropertyDefinition && desc.dynamic)){
                hasDynamic = true
            }
            if( !hasDynamic && !Utils.isLiteralObjectType( stack.left.object.type() ) ){
                isReflect = true;
            }
        }else if(!desc || desc.isAnyType){
            isReflect = !Utils.isLiteralObjectType(stack.left.object.type())
        }
    }

    if(isReflect){
        let value =  ctx.createToken(stack.right);
        let scopeId =  module ? ctx.createIdentifier(module.id) : ctx.createLiteral(null);
        let propertyNode = ctx.createLiteral(
            stack.left.property.value(),
            void 0,
            stack.left.property
        );
        if(operator && operator.charCodeAt(0) !== 61 && operator.charCodeAt(operator.length-1) === 61 ){
            operator = operator.slice(0,-1)
            const callee = createStaticReferenceNode(ctx, stack,'Reflect', 'get')
            const left = ctx.createCallExpression(callee,[
                scopeId,
                ctx.createToken(stack.left.object),
                propertyNode,
            ], stack);
            value = ctx.createBinaryExpression(left, value, operator);
        }
        const callee = createStaticReferenceNode(ctx, stack,'Reflect', 'set')
        return ctx.createCallExpression(callee, [
            scopeId,
            ctx.createToken(stack.left.object), 
            propertyNode,
            value
        ], stack);
    }

    let left = ctx.createToken(stack.left)
    if(isMember && stack.left.object.isSuperExpression){
        if(left.type==='CallExpression' && left.callee.type==='MemberExpression' && left.callee.property.value==='callSuperSetter'){
            left.arguments.push(
                ctx.createToken(stack.right)
            )
            return left;
        }
    }

    const node = ctx.createNode( stack );
    node.left = left;
    node.right = ctx.createToken( stack.right );
    node.operator = operator;
    return node;
    
}