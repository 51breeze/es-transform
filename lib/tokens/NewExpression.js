import Utils from "easescript/lib/core/Utils";
export default function(ctx,stack){
    let desc = stack.callee.type();
    desc = Utils.getOriginType(desc)
    if( desc !== stack.module && Utils.isTypeModule(desc) ){
        ctx.addDepend(desc, stack.module);
    }
    const node = ctx.createNode( stack );
    node.callee = ctx.createToken( stack.callee );
    node.arguments = stack.arguments.map( item=> ctx.createToken(item) );
    return node;
}