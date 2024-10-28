import * as Common from '../core/Common'
export default function(ctx,stack){
   Common.parseImportDeclaration(ctx, stack)
   return null;
}