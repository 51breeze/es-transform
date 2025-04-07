import Utils from "easescript/lib/core/Utils";
export default function(ctx,stack){
    const node = ctx.createNode(stack);
    if(stack.parentStack.isCallExpression && ctx.useClassConstructor(stack.module)){
        return node;
    }
    const parent = stack.module.inherit;
    let refs = null;
    if(parent && parent.isDeclaratorModule){
        stack = stack.getParentStack(stack=>stack.isClassDeclaration || stack.isDeclaratorDeclaration);
        if(stack && (stack.isClassDeclaration || stack.isDeclaratorDeclaration)){
            let identifier = stack.inherit;
            if(stack.inherit && stack.inherit.isIdentifier){
                let desc = identifier.description();
                if(Utils.isStack(desc) && desc.isDeclarator){
                    refs = stack.inherit.value();
                }
            }
        }
    }
    node.value = refs || ctx.getModuleReferenceName(parent, stack.module);
    node.raw = node.value;
    return node;
}