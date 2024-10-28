import {createIdentNode} from '../core/Common';
export default function(ctx, stack){
    const node = ctx.createNode(stack);
    node.key = createIdentNode(ctx,stack.key);
    const key = stack.key.value().toLowerCase();
    node.prefix = key==='primary' || key==='key' ? null : ctx.createIdentifier('key');
    node.local = ctx.createToken(stack.local);
    node.properties = (stack.properties||[]).map( item=>createIdentNode(ctx, item) );
    return node;
};