export default function(ctx, stack){
    ctx.table.getAllBuilder().forEach(
        build=>build.createTable(ctx, stack)
    );
}