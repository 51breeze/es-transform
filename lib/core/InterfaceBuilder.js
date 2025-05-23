import {
    MODIFIER_PUBLIC,MODIFIER_PROTECTED,MODIFIER_PRIVATE,KIND_ACCESSOR,KIND_VAR,
    KIND_CONST,KIND_METHOD, MODIFIER_STATIC, MODIFIER_ABSTRACT, MODIFIER_FINAL, KIND_ENUM_PROPERTY, KIND_STRUCT_COLUMN} from "../core/Constant";
import ClassBuilder from './ClassBuilder.js'
import * as Common from '../core/Common'
const modifierMaps={
    "public":MODIFIER_PUBLIC,
    "protected":MODIFIER_PROTECTED,
    "private":MODIFIER_PRIVATE,
}

const kindMaps={
    "accessor":KIND_ACCESSOR,
    "var":KIND_VAR,
    "column":KIND_STRUCT_COLUMN,
    "const":KIND_CONST,
    "method":KIND_METHOD,
    "enumProperty":KIND_ENUM_PROPERTY
};

class InterfaceBuilder extends ClassBuilder{

    create(ctx){
        ctx.setNode(this.stack, this);
        const module = this.module;
        const stack = this.stack;
        this.isStructTable = stack.isStructTableDeclaration;
        this.setModuleIdNode(ctx.createIdentifier(this.getModuleDeclarationId(module)));
        this.createInherit(ctx, module, stack)
        this.createImplements(ctx, module, stack)
        this.createBody(ctx, module, stack);
        let members = this.createMemberDescriptors(ctx, this.members)
        let creator = this.createCreator(
            ctx,
            this.getModuleIdNode(),
            this.createClassDescriptor(ctx, module, null, members)
        );
        ctx.crateModuleAssets(module)
        ctx.createModuleImportReferences(module)
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
        this.createExport(ctx, module);
        ctx.removeNode(this.stack);
        return ctx.createMultipleStatement(expressions)
    }

    createBody(ctx, module, stack){
        this.createMemebers(ctx, stack);
        this.construct = this.createDefaultConstructor(ctx, module.id, module.inherit);
    }

    createMemeber(ctx, stack, staticFlag=false){
        if(this.isStructTable){
            if(stack.isStructTableColumnDefinition){
                const node = ctx.createNode(stack, 'PropertyDefinition');
                node.modifier = 'public';
                node.kind = 'column';
                node.key = ctx.createIdentifier(stack.key.value(),stack.key)
                node.comments = Common.createCommentsNode(ctx, stack)
                return node;
            }
            return null;
        }else{
            const node = ctx.createToken(stack);
            if(node){
                this.createAnnotations(ctx, stack, node, !!(staticFlag || node.static));
            }
            return node;
        }
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