import {
    MODIFIER_PUBLIC,MODIFIER_PROTECTED,MODIFIER_PRIVATE,KIND_ACCESSOR,KIND_VAR,
    KIND_CONST,KIND_METHOD, MODIFIER_STATIC, MODIFIER_ABSTRACT, MODIFIER_FINAL, KIND_ENUM_PROPERTY, KIND_STRUCT_COLUMN, MODIFIER_OPTIONAL} from "../core/Constant";
import ClassBuilder from './ClassBuilder.js'
import * as Common from '../core/Common'
import Utils from "easescript/lib/core/Utils.js";
import Generator from "./Generator.js";
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

    createInitMemberProperty(){}

    createMemeber(ctx, stack, staticFlag=false){
        if(this.isStructTable){
            if(stack.isStructTableColumnDefinition){
                const node = ctx.createNode(stack, 'PropertyDefinition');
                const typeName = Utils.getStructTableMethodTypeName(stack.typename?.value() || 'varchar');
                let defaultValue = null;
                if(stack.properties){
                    const defaultProperty = stack.properties.find(prop=>{
                        if(!prop.isStructTablePropertyDefinition)return false;
                        return prop.key.isIdentifier && prop.init && String(prop.key.value()).toLowerCase() ==='default'
                    });
                    if(defaultProperty){
                        const initStack = defaultProperty.init
                        if(initStack.isMemberExpression){
                            const desc = initStack.description();
                            if(desc && desc.isEnumProperty){
                                defaultValue = ctx.createLiteral(String(desc.init.value()));
                            }
                        }else if(initStack.isLiteral){
                            defaultValue = ctx.createToken(initStack)
                        }
                    }
                }

                node.modifier = 'public';
                node.kind = 'column';
                node.key = ctx.createIdentifier(stack.key.value(),stack.key)
                node.comments = Common.createCommentsNode(ctx, stack)
                node.question = !!stack.question;
                node.init = defaultValue || ctx.createLiteral(typeName==='string' ? '' : null)
                let format = '* @Formal(varchar,255)';
                let defaultV = defaultValue && defaultValue.type==="Literal" ? defaultValue.value : null;
                if(stack.typename){
                    const formatNode = ctx.createToken(stack.typename);
                    const generator = new Generator();
                    if(formatNode.type==="StructTableMethodDefinition"){
                        generator.withSequence([formatNode.key, ...formatNode.params])
                    }else{
                        generator.make(formatNode);
                    }
                    format = `* @Formal(${generator.toString()})`;
                }
                let comments = [stack.question ? '* @Optional' : '* @Requred', format];
                if(defaultV){
                    comments.push('* @Default "'+String(defaultV)+'"');
                }
                if(node.comments){
                    const lines = String(node.comments.value).split(/[\r\n]+/);
                    lines.splice(lines.length-2, 0, ...comments)
                    node.comments.value = lines.join('\n');
                }else{
                    node.comments = ctx.createChunkExpression(['/**', ...comments, '**/'].join("\n"))
                }
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
        if(node.question){
            mode |= MODIFIER_OPTIONAL;   
        }
        
        properties.push(
            ctx.createProperty(
                ctx.createIdentifier('m'),
                ctx.createLiteral(mode)
            )
        );
        if( node.isAccessor ){
            let getComments = null;
            let setComments = null;
            if(node.get){
                getComments=node.get.comments;
                properties.push(ctx.createProperty(
                    ctx.createIdentifier('get'),
                    ctx.createLiteral(true)
                ));
            }
            if(node.set){
                setComments=node.get.comments;
                properties.push(ctx.createProperty(
                    ctx.createIdentifier('set'),
                    ctx.createLiteral(true)
                ));
            }
            if(getComments || setComments){
                const commentsProperties = [];
                if(getComments){
                    commentsProperties.push(
                        ctx.createProperty(
                            ctx.createIdentifier('get'),
                            ctx.createChunkExpression(JSON.stringify(getComments.value), false)
                        )
                    )
                }
                if(setComments){
                    commentsProperties.push(
                        ctx.createProperty(
                            ctx.createIdentifier('set'),
                            ctx.createChunkExpression(JSON.stringify(setComments.value), false)
                        )
                    )
                }
                properties.push(
                    ctx.createProperty(
                        ctx.createIdentifier('comments'),
                        ctx.createObjectExpression(commentsProperties)
                    )
                );
            }
        }else{
            if(node.comments){
                properties.push(
                    ctx.createProperty(
                        ctx.createIdentifier('comments'),
                        ctx.createChunkExpression(JSON.stringify(node.comments.value), false)
                    )
                );
            }
            if(this.isStructTable){
                if(node.type==='PropertyDefinition'){
                    properties.push(
                        ctx.createProperty(
                            ctx.createIdentifier('writable'),
                            ctx.createLiteral(true)
                        )
                    );
                    properties.push(
                        ctx.createProperty(
                            ctx.createIdentifier('enumerable'),
                            ctx.createLiteral(true)
                        )
                    );
                    if(node.init){
                        properties.push(ctx.createProperty(
                            ctx.createIdentifier('value'),
                            node.init
                        ));
                    }
                }
            }
        }
        const propertyNode = ctx.createProperty(
            key,
            ctx.createObjectExpression( properties )
        );
        propertyNode.comments = node.comments;
        return propertyNode;
    }
}
export default InterfaceBuilder;