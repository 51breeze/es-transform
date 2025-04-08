import Utils from "easescript/lib/core/Utils";
import { createStaticReferenceNode } from "../core/Common";
export default function(ctx,stack){
    const isMember = stack.callee.isMemberExpression;
    const desc = stack.descriptor();
    const module = stack.module;
    const isChainExpression = stack.parentStack.isChainExpression;
    if(stack.callee.isSuperExpression){
        let useClass = ctx.useClassConstructor(module);
        const parent = module && module.inherit;
        if(parent){
            if(!ctx.isActiveModule(parent, stack.module, true) || (!useClass && ctx.isES6ClassModule(parent))){
                return null;
            }
            ctx.addDepend(parent, module)
        }
        if(ctx.useClassConstructor(module)){
            return ctx.createCallExpression(
                ctx.createSuperExpression(void 0, stack.callee),
                stack.arguments.map(item=>ctx.createToken(item)),
                stack
            );
        }
    }

    if(isMember && !isChainExpression && (!desc || desc.isType && desc.isAnyType)){
        const property = stack.callee.computed ? 
                ctx.createToken(stack.callee.property) : 
                ctx.createLiteral(
                    stack.callee.property.value()
                );
        const args = [
            module ? ctx.createIdentifier(module.id) : ctx.createLiteral(null),
            ctx.createToken(stack.callee.object),
            property,
            ctx.createArrayExpression(
                stack.arguments.map( item=>ctx.createToken(item) )
            )
        ];
        if( stack.callee.object.isSuperExpression ){
            args.push(ctx.createThisExpression())
        }
        return ctx.createCallExpression(
            createStaticReferenceNode(ctx, stack,"Reflect",'call'),
            args,
            stack
        );
    }

    if( stack.callee.isSuperExpression || isMember && stack.callee.object.isSuperExpression && !isChainExpression ){
        return ctx.createCallExpression(
            ctx.createMemberExpression(
                [
                    ctx.createToken(stack.callee),
                    ctx.createIdentifier('call'),
                ]
            ),
            [
                ctx.createThisExpression()
            ].concat( stack.arguments.map( item=>ctx.createToken(item) ) ),
            stack
        );
    }

    const privateChain = ctx.options.privateChain;
    if( privateChain && desc && desc.isMethodDefinition && !(desc.static || desc.module.static)){
        const modifier = Utils.getModifierValue(desc);
        const refModule = desc.module;
        if( modifier==="private" && refModule.children.length > 0){
            return ctx.createCallExpression(
                ctx.createMemberExpression(
                    [
                        ctx.createToken(stack.callee),
                        ctx.createIdentifier('call'),
                    ]
                ),
                [ isMember ? ctx.createToken(stack.callee.object) : ctx.createThisExpression() ].concat( stack.arguments.map( item=>ctx.createToken(item) ) ),
                stack
            );
        }
    }

    if(desc){
        let type = desc.isCallDefinition ? desc.module : desc;
        if(!isMember && !stack.callee.isSuperExpression && desc.isMethodDefinition)type = desc.module;
        if( Utils.isTypeModule(type) ){
            ctx.addDepend(desc, module);
        }
    }

    const node = ctx.createNode( stack );
    node.callee = ctx.createToken( stack.callee );
    node.arguments = stack.arguments.map( item=>ctx.createToken(item) );
    node.isChainExpression = isChainExpression;
    return node;
}