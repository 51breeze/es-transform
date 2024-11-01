import Utils from 'easescript/lib/core/Utils';
import { getMethodOrPropertyAlias , createStaticReferenceNode, parseImportDeclaration} from '../core/Common';
import {PRIVATE_NAME} from '../core/Constant';
function addImportReference(ctx, desc, module){
    if(Utils.isStack(desc) && (desc.isDeclaratorVariable || desc.isDeclaratorFunction)){
        let imports = desc.imports;
        if(Array.isArray(imports)){
            imports.forEach( item=>{
                if(item.source.isLiteral){
                    parseImportDeclaration(ctx, item, module)
                }
            });
        }
   }
}

function MemberExpression(ctx,stack){
    const refsName = stack.getReferenceName();
    if(refsName){
        return ctx.createIdentifier( refsName, stack );
    }
    const module = stack.module;
    const description = stack.descriptor();
    const objectType = stack.object.type();
    if( description && description.isModule && objectType && !objectType.isLiteralObjectType && Utils.isTypeModule(description) ){
        ctx.addDepend( description,stack.module );
    }else{
        const objectDescriptor = stack.object.descriptor();
        if( Utils.isTypeModule(objectDescriptor) ){
            ctx.addDepend( objectDescriptor, stack.module );
        }else{
            addImportReference(ctx, objectDescriptor, module||stack.compilation);
            addImportReference(ctx, description, module||stack.compilation);
        }
    }

    if( !description || Utils.isType(description) && description.isAnyType && !stack.optional){
        let isReflect = true;
        if(description){
            isReflect = false;
            let hasDynamic = description.isComputeType && description.isPropertyExists();
            if( !hasDynamic && !Utils.isLiteralObjectType(objectType) ){
                isReflect = true;
            }
        }
        if(isReflect){
            return ctx.createCallExpression(
                createStaticReferenceNode(ctx, stack, 'Reflect', 'get'),
                [
                    module ? ctx.createIdentifier(module.id) : ctx.createLiteral(null), 
                    ctx.createToken(stack.object), 
                    stack.computed ? ctx.createToken(stack.property) : ctx.createLiteral(stack.property.value()),
                ],
                stack
            );
        }
    }

    const resolveName = getMethodOrPropertyAlias(ctx, description);
    const privateChain = ctx.options.privateChain;
    if(privateChain && description && description.isMethodDefinition && !(description.static || description.module.static)){
        const modifier = Utils.getModifierValue(description);
        const refModule = description.module;
        if(modifier==="private" && refModule.children.length > 0){
            let property = resolveName ? ctx.createIdentifier(resolveName, stack.property) : ctx.createToken(stack.property);
            return ctx.createMemberExpression(
                [ 
                    ctx.createIdentifier(module.id), 
                    ctx.createIdentifier('prototype'),
                    property
                ],
                stack
            );
        }
    }

    if( objectType && !objectType.isLiteralObjectType && Utils.isClassType(description) ){
        ctx.addDepend( description,stack.module );
        if(!stack.hasMatchAutoImporter){
            return ctx.createIdentifier(
                ctx.getModuleReferenceName(description,module),
                stack
            );
        }
    }
    
    if(stack.object.isSuperExpression){
        let property = resolveName ? ctx.createIdentifier(resolveName, stack.property) : ctx.createToken(stack.property);
        if( description && description.isMethodGetterDefinition){
            if(property.type === 'Identifier'){
                property = ctx.createLiteral(
                    property.value, 
                    void 0,
                    stack.property
                )
            }
            const args = [
                ctx.createIdentifier(module.id),
                ctx.createThisExpression(),
                property
            ]
            return ctx.createCallExpression(
                createStaticReferenceNode(ctx, stack, 'Class', 'callSuperGetter'),
                args
            );
        }else if(description && description.isMethodSetterDefinition){
            if(property.type === 'Identifier'){
                property = ctx.createLiteral(
                    property.value, 
                    void 0,
                    stack.property
                )
            }
            const args = [
                ctx.createIdentifier(module.id),
                ctx.createThisExpression(),
                property
            ]
            return ctx.createCallExpression(
                createStaticReferenceNode(ctx, stack, 'Class', 'callSuperSetter'),
                args
            );
        }else{
            return ctx.createMemberExpression([
                ctx.createToken(stack.object), 
                ctx.createIdentifier('prototype'),
                property
            ]);
        }
    }
    
    let propertyNode = resolveName ? ctx.createIdentifier(resolveName, stack.property) : ctx.createToken(stack.property);
    if(privateChain && description && description.isPropertyDefinition && !(description.static || description.module.static) ){
        const modifier = Utils.getModifierValue(description);
        if( "private" === modifier ){
            const object = ctx.createMemberExpression([
                ctx.createToken(stack.object),
                ctx.createIdentifier(
                    ctx.getGlobalRefName(stack, PRIVATE_NAME, stack.module)
                )
            ]);
            object.computed = true;
            return ctx.createMemberExpression([
                object, 
                propertyNode
            ]);
        }
    }

    if( description && (!description.isAccessor && description.isMethodDefinition) ){
        const pStack = stack.getParentStack( stack=>!!(stack.jsxElement || stack.isBlockStatement || stack.isCallExpression || stack.isExpressionStatement));
        if( pStack && pStack.jsxElement ){
            return ctx.createCallExpression(
                ctx.createMemberExpression([ 
                    ctx.createToken(stack.object), 
                    propertyNode,
                    ctx.createIdentifier('bind')
                ]),
                [ctx.createThisExpression()]
            );
        }
    }

    const node = ctx.createNode(stack);
    node.computed = !!stack.computed;
    node.optional = !!stack.optional;
    node.object = ctx.createToken( stack.object );
    node.property = propertyNode;
    return node;
}

export default MemberExpression;