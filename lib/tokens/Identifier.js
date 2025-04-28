import Utils from 'easescript/lib/core/Utils';
import {PRIVATE_NAME} from '../core/Constant';
import {parseImportDeclaration} from '../core/Common';
export default function(ctx,stack){
     const desc = stack.parentStack && stack.parentStack.isImportSpecifier ? null : stack.descriptor();
     const module = stack.module;
     if(Utils.isStack(desc) && (desc.isDeclaratorVariable || desc.isDeclaratorFunction) ){
          let imports = desc.imports;
          if(Array.isArray(imports)){
               imports.forEach( item=>{
                    if(item.source.isLiteral){
                         parseImportDeclaration(ctx, item, module||stack.compilation)
                    }
               });
          }
     }

     if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition || desc.isEnumProperty) && !(stack.parentStack.isProperty && stack.parentStack.key === stack) ){
          const privateChain = ctx.options.privateChain;
          const ownerModule = desc.module;
          const isStatic = !!(desc.static || ownerModule.static || desc.isEnumProperty);
          const property = ctx.createIdentifier(stack.value(), stack);
          const modifier = Utils.getModifierValue(desc);
          let object = isStatic ? ctx.createIdentifier(ownerModule.id) : ctx.createThisExpression();
          if( privateChain && desc.isPropertyDefinition && modifier ==="private" && !isStatic ){
               object = ctx.createMemberExpression([
                    object, 
                    ctx.createIdentifier(
                         ctx.getGlobalRefName(stack, PRIVATE_NAME, stack.module),
                         stack
                    )
               ]);
               object.computed = true;
               return ctx.createMemberExpression([object, property], stack);
          }else{
               return ctx.createMemberExpression([object, property], stack);
          }
     }

     if(desc !== stack.module && (Utils.isClassType(desc) || Utils.isInterface(desc) && !desc.isStructTable)){
          ctx.addDepend( desc, stack.module );
          if(!stack.hasLocalDefined()){
               return ctx.createIdentifier(
                    ctx.getModuleReferenceName(desc, module, stack),
                    stack
               );
          }
     }
     return ctx.createIdentifier(stack.value(), stack);
};