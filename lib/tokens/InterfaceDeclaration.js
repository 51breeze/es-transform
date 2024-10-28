import InterfaceBuilder from "../core/InterfaceBuilder";
export default function(ctx,stack){
    const builder = new InterfaceBuilder(stack)
    return builder.create(ctx);
}