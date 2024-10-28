import EnumBuilder from '../core/EnumBuilder';
export default function(ctx,stack){
    const builder = new EnumBuilder(stack)
    if(stack.isExpression){
        return builder.createEnumExpression(ctx)
    }else{
        return builder.create(ctx)
    }
}