import {createIdentNode} from '../core/Common';
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
    return node;
};