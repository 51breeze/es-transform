import {createIdentNode, parseDefineAnnotation, getMethodAnnotations} from '../core/Common';
export default function(ctx, stack){
    const node = ctx.createNode(stack);
    node.key = ctx.createIdentifier( '`'+stack.key.value()+'`', stack.key);
    node.properties = [];
    const type = stack.typename ? ctx.createToken(stack.typename) : ctx.createIdentifier('varchar(255)');
    const unsigned = stack.unsigned ? ctx.createIdentifier('unsigned') : null;
    const notnull = !stack.question ? ctx.createIdentifier('not null') : null;
    node.properties.push(type);
    if( unsigned ){
        node.properties.push(unsigned);
    }
    if( notnull ){
        node.properties.push(notnull);
    }
    {
        (stack.properties||[]).forEach( item=>{
            node.properties.push( createIdentNode(ctx, item) ) 
        })
    }
    const defineAnnotations = getMethodAnnotations(stack, ['define']);
    node.order = 99;
    if(defineAnnotations && defineAnnotations.length>0){
        for(let defineAnnotation of defineAnnotations){
            const data = parseDefineAnnotation(defineAnnotation);
            if(data && data.order != null){
                node.order = data.order;
                break;
            }
        }
    }
    return node;
};