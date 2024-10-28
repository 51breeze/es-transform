export default function(ctx,stack){
    const node = ctx.createNode( stack );
    node.name = ctx.createToken(stack.name);
    node.namespace = ctx.createToken(stack.namespace);
    const xmlns = stack.getXmlNamespace();
    if( xmlns ){
        node.value = xmlns.value.value();
    }else {
        const ops = stack.compiler.options;
        node.value = ops.jsx.xmlns.default[ stack.namespace.value() ] || null;
    }
    node.raw = node.value;
    return node;
}