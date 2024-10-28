export default function(ctx, stack){
    let value = stack.value();
    if( value ){  
        value = value.replace(/\s+/g,' ').replace(/(\u0022|\u0027)/g,'\\$1');
        if(value){
            return ctx.createLiteral(value);
        }
    }
    return null;
}
