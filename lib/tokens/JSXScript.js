export default function(ctx, stack){
    const node = ctx.createNode( stack );
    node.openingElement = ctx.createToken( stack.openingElement );
    node.closingElement = ctx.createToken( stack.closingElement );
    node.body =  (stack.body || []).map( child=>ctx.createToken(child) );
}