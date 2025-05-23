import Utils from "easescript/lib/core/Utils";
import { createStaticReferenceNode } from "../core/Common";
export default function(ctx,stack){
    const type = Utils.getOriginType(stack.right.type());
    if( Utils.isLocalModule(type) || stack.right.type().isAnyType ){
        const node = ctx.createNode(stack,'ForStatement');
        const obj = ctx.getLocalRefName(stack, '_i');
        const res = ctx.getLocalRefName(stack, '_v');
        const init = ctx.createToken(stack.left);
        const object = ctx.createAssignmentExpression(
            ctx.createIdentifier(obj),
            ctx.createCallExpression(
                createStaticReferenceNode(ctx, stack, 'System','getIterator'),
                [
                    ctx.createToken(stack.right)
                ],
                stack.right
            )
        );
        init.kind = 'let';
        init.declarations.push( ctx.createIdentifier( res ) );
        init.declarations.push( object );
        const condition = ctx.createChunkExpression(`${obj} && (${res}=${obj}.next()) && !${res}.done`, false);
        node.init = init;
        node.condition = condition;
        node.update = null;
        node.body  = ctx.createToken(stack.body);
        const block = node.body; 
        const assignment = ctx.createExpressionStatement(
            ctx.createAssignmentExpression(
                ctx.createIdentifier( init.declarations[0].id.value ),
                ctx.createMemberExpression([
                    ctx.createIdentifier( res ),
                    ctx.createIdentifier('value')
                ])
            )
        );
        block.body.splice(0,0,assignment);
        return node;
    }
    const node = ctx.createNode(stack);
    node.left  = ctx.createToken(stack.left);
    node.right = ctx.createToken(stack.right);
    node.body  = ctx.createToken(stack.body);
    return node;
}