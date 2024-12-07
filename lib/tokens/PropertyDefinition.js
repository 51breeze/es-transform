import Utils from 'easescript/lib/core/Utils';
import * as Common from '../core/Common'
export default function(ctx,stack){
    let init = null;
    if(stack.annotations && stack.annotations.length > 0){
        let items = [];
        stack.annotations.forEach( annot=>{
            const name = annot.getLowerCaseName();
            if(name==='readfile'){
                items.push(
                    Common.createReadfileAnnotationNode(ctx, annot) || ctx.createLiteral(null)
                );
            }else if(name==='embed'){
                items.push(
                    Common.createEmbedAnnotationNode(ctx, annot)
                );
            }else if(name==='env'){
                items.push(
                    Common.createEnvAnnotationNode(ctx, annot)
                );
            }else if(name==='url'){
                items.push(
                    Common.createUrlAnnotationNode(ctx, annot)
                );
            }
        });
        if(items.length>0){
            init = items.length > 1 ? ctx.createArrayExpression(items) : items[0];
        }
    }
    const node = ctx.createNode(stack);
    const decl = ctx.createToken(stack.declarations[0])
    node.modifier = Utils.getModifierValue(stack);
    node.static = !!stack.static;
    node.kind = stack.kind;
    node.key =  decl.id;
    node.init = init || decl.init;
    node.dynamic = stack.dynamic;
    node.isAbstract = !!stack.isAbstract;
    node.isFinal = !!stack.isFinal;
    node.comments = Common.createCommentsNode(ctx, stack, node)
    return node;
}