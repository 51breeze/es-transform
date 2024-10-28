export default function(ctx,stack){
    const node = ctx.createNode(stack);
    node.raw = stack.raw();
    const code = node.raw.charCodeAt(0);
    if(code === 34 || code ===39){
        node.value = node.raw.slice(1,-1);
    }else{
        node.value = stack.value();
    }
    return node;
}