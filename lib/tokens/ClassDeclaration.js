import ClassBuilder from '../core/ClassBuilder.js'
export default function(ctx, stack){
    const builder = new ClassBuilder(stack)
    return builder.create(ctx);
};