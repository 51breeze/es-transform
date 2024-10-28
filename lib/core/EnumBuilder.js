import Namespace from 'easescript/lib/core/Namespace.js';
import ClassBuilder from './ClassBuilder.js'
class EnumBuilder extends ClassBuilder{

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

    createEnumExpression(ctx){
        let stack = this.stack;
        const name = stack.value();
        const init = ctx.createAssignmentExpression(
            ctx.createIdentifier(name, stack),
            ctx.createObjectExpression()
        );
        const properties = stack.properties.map( item =>{
            const initNode = ctx.createMemberExpression([
                ctx.createIdentifier(name, item.key),
                ctx.createLiteral(
                    item.key.value(),
                    void 0, 
                    item.key
                )
            ]);
            initNode.computed = true;
            const initAssignmentNode = ctx.createAssignmentExpression(
                initNode, 
                ctx.createLiteral(
                    item.init.value(),
                    item.init.value(),
                    item.init
                )
            );
            const left = ctx.createMemberExpression([
                ctx.createIdentifier(name),
                initAssignmentNode
            ]);
            left.computed = true;
            return ctx.createAssignmentExpression(
                left,
                ctx.createLiteral(
                    item.key.value(),
                    void 0, 
                    item.key
                )
            );
        });
        properties.push( ctx.createIdentifier(name) );
        return ctx.createVariableDeclaration('var', [
            ctx.createVariableDeclarator(
                ctx.createIdentifier(name, stack),
                ctx.createParenthesizedExpression(
                    ctx.createSequenceExpression([init, ...properties])
                )
            )
        ]);
    }

    createBody(ctx, module, stack){
        this.createMemebers(ctx, stack);
        if(!this.construct){
            this.construct = this.createDefaultConstructor(ctx, module.id, module.inherit);
        }
        this.checkConstructor(ctx, this.construct, module);
    }

    createInherit(ctx, module, stack=null){
        let inherit = module.inherit;
        if(inherit){
            ctx.addDepend(inherit, stack.module);
            if(ctx.isActiveModule(inherit, stack.module)){
                this.inherit = ctx.createIdentifier(
                    ctx.getModuleReferenceName(inherit, module),
                    stack.inherit
                )
            }
        }
        if(!this.inherit){
            const inherit = Namespace.globals.get('Enumeration')
            ctx.addDepend(inherit, stack.module);
            this.inherit = ctx.createIdentifier(
                ctx.getModuleReferenceName(inherit, module)
            )
        }
    }

    createMemebers(ctx, stack){
        let methods = this.methods;
        stack.properties.forEach( item=> {
            const child = this.createMemeber(ctx, item);
            if(child){
                methods.push(child)
            }
        });
        super.createMemebers(ctx, stack)
    }
}
export default EnumBuilder;