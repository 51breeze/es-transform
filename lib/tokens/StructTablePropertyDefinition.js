import {createIdentNode} from '../core/Common';
export default function(ctx, stack){
    const node = ctx.createNode(stack);
    node.assignment = !!stack.assignment;
    node.key = createIdentNode(ctx, stack.key);
    let init = null;
    if(stack.init && stack.init.isMemberExpression){
        const desc = stack.init.description();
        if(desc && desc.isEnumProperty){
            init = ctx.createLiteral(String(desc.init.value()));
        }
    }
    node.init = init || createIdentNode(ctx, stack.init);
    return node;
};