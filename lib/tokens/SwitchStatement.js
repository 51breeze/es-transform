export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.condition = ctx.createToken( stack.condition );
    node.cases = stack.cases.map( item=>ctx.createToken(item) );
    return node;
}