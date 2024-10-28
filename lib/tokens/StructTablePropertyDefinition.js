import {createIdentNode} from '../core/Common';
export default function(ctx, stack){
    const node = ctx.createNode(stack);
    node.assignment = !!stack.assignment;
    node.key = createIdentNode(ctx, stack.key);
    node.init = createIdentNode(ctx, stack.init);
    return node;
};