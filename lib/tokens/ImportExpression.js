export default function(ctx,stack){
   const node = ctx.createNode(stack);
   const desc = stack.description();
   if( desc ){
      const source = ctx.getModuleImportSource(desc, stack.compilation.file, stack.source.value());
      node.source  = ctx.createLiteral(source, void 0, stack.source);
   }else{
      node.source  = ctx.createToken(stack.source);
   }
   return node;
}