import InterfaceBuilder from "../core/InterfaceBuilder";
export default function(ctx, stack){
    ctx.table.getAllBuilder().forEach(
        build=>build.createTable(ctx, stack)
    );
    const builder = new InterfaceBuilder(stack)
    return builder.create(ctx);
}