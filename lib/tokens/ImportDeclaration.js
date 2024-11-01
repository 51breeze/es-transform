import * as Common from '../core/Common'
export default function(ctx,stack){
   let module = stack.additional ? stack.additional.module : null;
   Common.parseImportDeclaration(ctx, stack, module)
   return null;
}