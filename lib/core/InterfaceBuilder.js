import {
    MODIFIER_PUBLIC,MODIFIER_PROTECTED,MODIFIER_PRIVATE,KIND_ACCESSOR,KIND_VAR,
    KIND_CONST,KIND_METHOD, MODIFIER_STATIC, MODIFIER_ABSTRACT, MODIFIER_FINAL, KIND_ENUM_PROPERTY} from "../core/Constant";
import ClassBuilder from './ClassBuilder.js'
const modifierMaps={
    "public":MODIFIER_PUBLIC,
    "protected":MODIFIER_PROTECTED,
    "private":MODIFIER_PRIVATE,
}

const kindMaps={
    "accessor":KIND_ACCESSOR,
    "var":KIND_VAR,
    "const":KIND_CONST,
    "method":KIND_METHOD,
    "enumProperty":KIND_ENUM_PROPERTY
};

class InterfaceBuilder extends ClassBuilder{

    create(ctx){
        ctx.setNode(this.stack, this);
        const module = this.module;
        const stack = this.stack;
        this.createInherit(ctx, module, stack)
        this.createImplements(ctx, module, stack)
        this.createBody(ctx, module, stack);
        let methods = this.createMemberDescriptors(ctx, this.methods)
        let members = this.createMemberDescriptors(ctx, this.members)
        let creator = this.createCreator(
            ctx,
            module,
            module.id,
            this.createClassDescriptor(ctx, module, methods, members)
        );
        ctx.crateModuleAssets(module)
        ctx.createModuleImportReferences(module)
        if(stack.compilation.mainModule===module){
            ctx.addExport('default', ctx.createIdentifier(module.id))
        }

        ctx.removeNode(this.stack);
        let expressions = [
            this.construct,
            ...this.beforeBody,
            ...this.body,
            ...this.afterBody,
            ctx.createExpressionStatement(creator)
        ];

        let symbolNode = this.privateSymbolNode;
        if(symbolNode){
            expressions.unshift(symbolNode)
        }
        return ctx.createMultipleStatement(expressions)
    }

    createBody(ctx, module, stack){
        this.createMemebers(ctx, stack);
        if(!this.construct){
            this.construct = this.createDefaultConstructor(ctx, module.id, module.inherit);
        }
        this.checkConstructor(ctx, this.construct, module);
    }

    createMemberDescriptor(ctx, node){
        if(node.dynamic && node.type==='PropertyDefinition'){
            return null;
        }
        let key = node.key;
        let modifier = node.modifier || 'public';
        let properties = [];
        let mode = modifierMaps[modifier] | kindMaps[node.kind];
        if(node.static){
            mode |= MODIFIER_STATIC;
        }
        if(node.isAbstract){
            mode |= MODIFIER_ABSTRACT;
        }
        if(node.isFinal){
            mode |= MODIFIER_FINAL;
        }
        properties.push(
            ctx.createProperty(
                ctx.createIdentifier('m'),
                ctx.createLiteral(mode)
            )
        );

        if( node.isAccessor ){
            if( node.get ){
                properties.push(
                    ctx.createProperty(
                        ctx.createIdentifier('get'),
                        ctx.createLiteral(true)
                    )
                );
            }
            if( node.set ){
                properties.push(
                    ctx.createProperty(
                        ctx.createIdentifier('set'),
                        ctx.createLiteral(true)
                    )
                );
            }
        }
        
        return ctx.createProperty(
            key,
            ctx.createObjectExpression( properties )
        );
    }
}
export default InterfaceBuilder;