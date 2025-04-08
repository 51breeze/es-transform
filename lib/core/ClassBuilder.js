import Utils from "easescript/lib/core/Utils";
import {
    MODIFIER_PUBLIC,MODIFIER_PROTECTED,MODIFIER_PRIVATE,PRIVATE_NAME,KIND_ACCESSOR,KIND_VAR,
    KIND_CONST,KIND_METHOD, KIND_CLASS, KIND_INTERFACE, MODIFIER_STATIC, MODIFIER_ABSTRACT, MODIFIER_FINAL, KIND_ENUM_PROPERTY} from "../core/Constant";
import {createCommentsNode, createMainAnnotationNode,createModuleReferenceNode,createStaticReferenceNode, createUniqueHashId} from "./Common";
import Namespace from "easescript/lib/core/Namespace"
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

class ClassBuilder{

    constructor(stack){
        this.stack = stack;
        this.compilation = stack.compilation;
        this.module =  stack.module;
        this.privateProperties=[];
        this.initProperties=[];
        this.body = [];
        this.beforeBody = [];
        this.afterBody = [];
        this.methods = [];
        this.members = [];
        this.construct = null;
        this.implements = [];
        this.inherit = null;
        this.privateSymbolNode = null;
        this.definePrivatePropertyNode=null;
        this.privateName = null;
        this.mainEnter = null;
        this.constructDecorators = null;
        this.useClassConstructor = false;
    }

    #moduleDeclareIdNode = null;
    getModuleIdNode(){
        return this.#moduleDeclareIdNode;
    }

    setModuleIdNode(node){
        this.#moduleDeclareIdNode = node;
    }

    #exportReferenceNode = null;
    getExportReferenceNode(){
        return this.#exportReferenceNode || this.getModuleIdNode();
    }

    setExportReferenceNode(node){
        this.#exportReferenceNode = node;
    }

    create(ctx){
        ctx.setNode(this.stack, this);
        const module = this.module;
        const stack = this.stack;
        this.useClassConstructor = ctx.useClassConstructor(module);
        this.setModuleIdNode(ctx.createIdentifier(this.getModuleDeclarationId(module), stack.id));
        this.createInherit(ctx, module, stack)
        this.createImplements(ctx, module, stack)
        this.createBody(ctx, module, stack);

        const methods = this.createMemberDescriptors(ctx, this.methods)
        const members = this.createMemberDescriptors(ctx, this.members)
        const creator = this.createCreator(
            ctx,
            this.getModuleIdNode(),
            this.createClassDescriptor(ctx, module, methods, members)
        );

        ctx.crateModuleAssets(module)
        ctx.createModuleImportReferences(module)

        if(this.mainEnter){
            ctx.addNodeToAfterBody(
                ctx.createExpressionStatement(
                    ctx.createExpressionStatement(this.mainEnter)
                )
            )
        }

        if(this.construct){
            let exists = this.construct.comments;
            let classComments = createCommentsNode(ctx, stack);
            if(!exists){
                this.construct.comments = classComments;
            }else if(exists && classComments){
                exists.value = classComments.value + "\n" + exists.value;
            }
        }
        
        let decorators = this.getClassDecorators(ctx, stack);
        if(this.constructDecorators && this.constructDecorators.length>0){
            if(decorators){
                decorators.push(...this.constructDecorators);
            }else{
                decorators = this.constructDecorators;
            }
        }

        const construct = this.createClassConstructor(ctx, this.construct);
        const expressions = [
            this.createApplyClassDecorator(ctx, decorators, construct),
            ...this.beforeBody,
            ...this.body,
            ...this.afterBody,
            ctx.createExpressionStatement(creator)
        ];

        const symbolNode = this.privateSymbolNode;
        if(symbolNode){
            expressions.unshift(symbolNode)
        }

        this.createExport(ctx, module);

        ctx.removeNode(this.stack);
        return ctx.createMultipleStatement(expressions)
    }

    createClassConstructor(ctx, construct){
        if(this.useClassConstructor){
            let comments = construct.comments;
            delete construct.comments;
            construct.key = ctx.createIdentifier('constructor');
            construct.type = "MethodDefinition";
            construct.kind = "method";
            let body =  [];
            if(construct.body && construct.body.body.length>0){
                body.push(construct);
            }
            construct = ctx.createClassDeclaration(
                this.getModuleIdNode(),
                this.inherit,
                body,
                this.stack
            );
            construct.comments = comments;
        }
        return construct;
    }

    getModuleDeclarationId(module){
        return module.id;
    }

    createExport(ctx, module){
        if(this.stack.compilation.mainModule===module){
            ctx.addExport(
                'default',
                this.getExportReferenceNode()
            )
        }else{
            ctx.addExport(
                module.id,
                this.getExportReferenceNode()
            )
        }
    }

    createBody(ctx, module, stack){
        this.createMemebers(ctx, stack);
        this.createIteratorMethodNode(ctx, module)
        if(!this.construct){
            this.construct = this.createDefaultConstructor(ctx, this.getModuleIdNode(), module.inherit);
        }
        this.checkConstructor(ctx, this.construct, module);
        if(!this.useClassConstructor){
            this.checkSuperES6Class(ctx, this.construct, module);
        }
    }

    createInherit(ctx, module, stack=null){
        let inherit = module.inherit;
        if(inherit){
            if(ctx.isActiveModule(inherit, module, true)){
                ctx.addDepend(inherit, module);
                let refs = null;
                if(inherit.isDeclaratorModule && stack && Utils.isStack(stack.inherit) && stack.inherit.isIdentifier){
                    let desc = stack.inherit.description();
                    if(Utils.isStack(desc) && desc.isDeclarator){
                        refs = stack.inherit.value();
                    }
                }
                if(!refs){
                    refs = ctx.getModuleReferenceName(inherit, module);
                }
                this.inherit = ctx.createIdentifier(refs);
            }
        }
    }

    createImplements(ctx, module, stack=null){
        let iteratorModule = null;
        this.implements = module.implements.map( (impModule)=>{
            if(impModule.isInterface && ctx.isActiveModule(impModule, module, true)){
                iteratorModule = iteratorModule || Namespace.globals.get('Iterator');
                if(iteratorModule !== impModule){
                    ctx.addDepend(impModule, module);
                    let refs = null;
                    if(impModule.isDeclaratorModule){
                        let impStack = stack.implements.find(imp=>imp.type()===impModule);
                        if(impStack && impStack.isIdentifier){
                            let desc = impStack.description();
                            if(Utils.isStack(desc) && desc.isDeclarator){
                                refs = impStack.value();
                            }
                        }
                    }
                    if(!refs){
                        refs = ctx.getModuleReferenceName(impModule, module)
                    }
                    return ctx.createIdentifier(refs)
                }
            }
            return null
        }).filter(Boolean)
    }

    createIteratorMethodNode(ctx, module){
        const iteratorType = Namespace.globals.get("Iterator");
        if(module.implements.includes(iteratorType) ){
            const block = ctx.createBlockStatement()
            block.body.push(
                ctx.createReturnStatement(
                    ctx.createThisExpression()
                )
            );
            const method = ctx.createMethodDefinition('Symbol.iterator', block);
            method.key.computed = true;
            method.static = false;
            method.modifier = 'public';
            method.kind = 'method';
            this.members.push(method);
        }
    }

    createPrivateRefsName(ctx){
        if(!this.privateName && ctx.options.privateChain){
            this.privateName = ctx.getGlobalRefName(this.stack, PRIVATE_NAME, this.module);
            if( !this.privateSymbolNode ){
                this.privateSymbolNode = this.createPrivateSymbolNode(ctx, this.privateName);
            }
        }
        return this.privateName;
    }

    createPrivateSymbolNode(ctx, name){
        if(!ctx.options.privateChain)return null;
        let isProd = ctx.plugin.options.mode === 'production';
        if(isProd){
            return ctx.createVariableDeclaration(
                'const',
                [
                    ctx.createVariableDeclarator(
                        ctx.createIdentifier(name),
                        ctx.createCallExpression( 
                            ctx.createIdentifier('Symbol'),
                            [
                                ctx.createLiteral('private')
                            ]
                        )
                    )
                ]
            );
        }else{
            return ctx.createVariableDeclaration(
                'const',
                [
                    ctx.createVariableDeclarator(
                        ctx.createIdentifier(name),
                        ctx.createCallExpression( 
                            createStaticReferenceNode(ctx, this.stack, 'Class', 'getKeySymbols'),
                            [
                                ctx.createLiteral(ctx.getHashId())
                            ]
                        )
                    )
                ]
            );
        }
    }

    checkSuperES6Class(ctx, construct, module){
        const inherit = module.inherit
        if(inherit && inherit.isDeclaratorModule && ctx.isES6ClassModule(inherit)){
            let refs = null;
            let identifier = this.stack.inherit;
            if(identifier && identifier.isIdentifier){
                let desc = identifier.description();
                if(Utils.isStack(desc) && desc.isDeclarator){
                    refs = identifier.value();
                }
            }
            if(!refs){
                refs = ctx.getModuleReferenceName(inherit,module);
            }
            const wrap = ctx.createFunctionExpression(construct.body)
            construct.body.body.push(ctx.createReturnStatement(ctx.createThisExpression()))
            const block = ctx.createBlockStatement();
            block.body.push(
                ctx.createReturnStatement(
                    ctx.createCallExpression(
                        createStaticReferenceNode(ctx, this.stack, 'Reflect', 'apply'), [
                        wrap,
                        ctx.createCallExpression(
                            createStaticReferenceNode(ctx, this.stack, 'Reflect', 'construct'),
                            [
                                ctx.createIdentifier(refs),
                                ctx.createIdentifier('arguments'),
                                this.getModuleIdNode()
                            ]
                        )
                    ])
                )
            );
            construct.body = block;
        }
    }

    createDefinePrivatePropertyNode(ctx){
        let exists = this.definePrivatePropertyNode;
        if(exists)return exists;
        let privateName = this.createPrivateRefsName(ctx)
        return this.definePrivatePropertyNode = ctx.createExpressionStatement(
            ctx.createCallExpression(
                ctx.createMemberExpression([
                    ctx.createIdentifier('Object'),
                    ctx.createIdentifier('defineProperty')
                ]),
                [
                    ctx.createThisExpression(),
                    ctx.createIdentifier(privateName),
                    ctx.createObjectExpression([
                        ctx.createProperty(
                            ctx.createIdentifier('value'),
                            ctx.createObjectExpression([])
                        )
                    ])
                ]
            )
        );
    }

    appendDefinePrivatePropertyNode(ctx, ...propertyNodes){
        const node = this.createDefinePrivatePropertyNode(ctx);
        if(propertyNodes.length>0){
            node.expression.arguments[2].properties[0].init.properties.push(...propertyNodes);
        }
        return node;
    }

    checkNeedInitPrivateNode(){
        return this.privateProperties.length > 0 || this.initProperties.length>0;
    }

    checkConstructor(ctx, construct, module){
        construct.type = 'FunctionDeclaration'
        construct.kind = '';
        construct.key = this.getModuleIdNode();
        if(this.checkNeedInitPrivateNode()){
            let body = construct.body.body;
            let hasInherit = module.inherit && this.inherit;
            let appendAt = hasInherit ? 1 : 0;
            let els = [];
            if(hasInherit && construct.isDefaultConstructMethod && !construct.hasCallSupper){
                appendAt = 0;
                els.push(this.createCallSuperNode(ctx));
                construct.hasCallSupper = true;
            }
            els.push(...this.initProperties);
            els.push(this.appendDefinePrivatePropertyNode(ctx, ...this.privateProperties));
            body.splice(appendAt, 0, ...els);
        }
    }

    createInitMemberProperty(ctx, node, stack=null, staticFlag=false){
        if(staticFlag)return;
        if(ctx.options.privateChain && node.modifier === "private"){
            this.privateProperties.push(
                ctx.createProperty(
                    node.key,
                    node.init || ctx.createLiteral(null)
                )
            );
        }else{
            this.initProperties.push(
                ctx.createExpressionStatement(
                    ctx.createAssignmentExpression(
                        ctx.createMemberExpression([
                            ctx.createThisExpression(),
                            node.key
                        ]),
                        node.init || ctx.createLiteral(null)
                    )
                )
            );
        }
        node.init = null;
    }

    createMemebers(ctx, stack){
        const cache1 = new Map();
        const cache2 = new Map();
        stack.body.forEach( item=> {
            const child = this.createMemeber(ctx, item, !!stack.static);
            if(!child)return;
            const staticFlag = !!(stack.static || child.static);
            const refs  = staticFlag ? this.methods : this.members;
            if(child.type ==="PropertyDefinition"){
                this.createInitMemberProperty(ctx, child, item, staticFlag)
            }
            if(item.isMethodSetterDefinition || item.isMethodGetterDefinition){
                const name = child.key.value;
                const dataset = staticFlag ? cache1 : cache2;
                let target = dataset.get( name );
                if(!target){
                    target={
                        isAccessor:true,
                        kind:'accessor', 
                        key:child.key, 
                        modifier:child.modifier
                    };
                    dataset.set(name, target);
                    refs.push( target );
                }
                if(item.isMethodGetterDefinition){
                    target.get =child;
                }else if(item.isMethodSetterDefinition){
                    target.set = child;
                }
            }else if(item.isConstructor && item.isMethodDefinition){
                this.construct = child;
            }
            else{
                refs.push( child );
            }
        });
    }

    createAnnotations(ctx, stack, node, staticFlag=false){
        if(staticFlag && stack.isMethodDefinition && stack.isEnterMethod && node.modifier ==='public' && !this.mainEnter){
            this.mainEnter = createMainAnnotationNode(ctx,stack)
        }
        let annotations = stack.annotations;
        if(annotations && annotations.length>0){
            let decorators = [];
            node.decorators = decorators;
            annotations.forEach(annot=>{
                const node = this.createDecoratorByAnnotation(ctx, annot)
                if(node){
                    decorators.push(node);
                }
            });
        }
        if(stack.isMethodDefinition){
            stack.params.forEach((param,index)=>{
                let annotations = param.annotations;
                if(annotations && annotations.length>0){
                    let decorators = null;
                    if(stack.isConstructor){
                        decorators = this.constructDecorators || (this.constructDecorators = []);
                    }else{
                        decorators = node.decorators || (node.decorators=[]);
                    }
                    annotations.forEach(annot=>{
                        const node = this.createDecoratorByAnnotation(ctx, annot, index)
                        if(node){
                            decorators.push(node);
                        }
                    });
                }
            })
        }
        return node;
    }

    createMemeber(ctx, stack, staticFlag=false){
        const node = ctx.createToken(stack);
        if(node){
            this.createAnnotations(ctx, stack, node, !!(staticFlag || node.static));
        }
        return node;
    }

    createCallSuperNode(ctx, params=[]){
        let refs = null;
        let inheritStack = this.stack.inherit;
        let inherit = this.module.inherit;
        if(inherit.isDeclaratorModule && Utils.isStack(inheritStack) && inheritStack.isIdentifier){
            let desc = inheritStack.description();
            if(Utils.isStack(desc) && desc.isDeclarator){
                refs = inheritStack.value();
            }
        }
        if(!refs){
            refs = ctx.getModuleReferenceName(inherit, this.module);
        }

        let args = null;
        if(this.inherit && this.stack.isModuleForWebComponent(this.module.inherit)){
            const propsNode = ctx.createMemberExpression([ 
                ctx.createIdentifier('arguments'), 
                ctx.createLiteral(0)
            ]);
            propsNode.computed = true;
            args = propsNode;
        }else{
            args = params.length > 0 ? params : ctx.createIdentifier('arguments');
        }

        if(this.useClassConstructor){
            let _args = Array.isArray(args) ? args : args.value==="arguments" ? [ctx.createSpreadElement(args)] : [args];
            return ctx.createCallExpression(
                ctx.createSuperExpression(),
                _args
            );
        }

        let _args = Array.isArray(args) ? ctx.createArrayExpression(args) : args.value==="arguments" ? args : ctx.createArrayExpression([args]);
        return ctx.createCallExpression( 
            ctx.createMemberExpression(
                [
                    ctx.createIdentifier(refs),
                    ctx.createIdentifier('apply')
                ]
            ),[
                ctx.createThisExpression(),
                _args
            ]
        );
    }

    createDefaultConstructor(ctx, id, inherit=null, params=[]){
        const block = ctx.createBlockStatement();
        let hasCallSupper = false;
        if(inherit && this.inherit && !(this.useClassConstructor || ctx.isES6ClassModule(inherit))){
            hasCallSupper = true;
            block.body.push( 
                ctx.createExpressionStatement(
                    this.createCallSuperNode(ctx, params)
                )
            );
        }
        const node =  ctx.createMethodDefinition(
            id,
            block,
            params
        );
        node.hasCallSupper = hasCallSupper;
        node.isDefaultConstructMethod = true;
        return node;
    }

    createMemberDescriptor(ctx, node){
        if(node.dynamic && node.type==='PropertyDefinition'){
            return null;
        }
        let key = node.key;
        let kind = kindMaps[node.kind];
        let modifier = node.modifier || 'public';
        let properties = [];
        let mode = modifierMaps[modifier] | kindMaps[node.kind];
        let _static = node.static;
        if(node.static){
            mode |= MODIFIER_STATIC;
        }

        if(node.isAbstract){
            mode |= MODIFIER_ABSTRACT;
        }
        if(node.isFinal){
            mode |= MODIFIER_FINAL;
        }

        delete node.static;
        if(node.type==='MethodDefinition' || node.kind ==='method'){
            node.kind = '';
            if(key.computed){
                node.key = null;
            }
        }
        node.disabledNewLine = true;
        properties.push(
            ctx.createProperty(
                ctx.createIdentifier('m'),
                ctx.createLiteral(mode)
            )
        );
       
        if( kind === KIND_VAR){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('writable'),
                    ctx.createLiteral(true)
                )
            );
        }
        if(!_static && (node.isAccessor || kind === KIND_VAR || kind === KIND_CONST) && modifier==="public" ){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('enumerable'),
                    ctx.createLiteral(true)
                )
            );
        }
        let isConfigurable = !!node.isConfigurable;

        let createProperty = (key, value, raw=null)=>{
            let node =  ctx.createProperty(
                ctx.createIdentifier(key),
                value
            );
            raw = raw || value;
            if(raw.comments){
                node.comments = raw.comments;
                raw.comments = null;
            }
            return node;
        }

        let decorators = node.decorators;
        if( node.isAccessor ){
            decorators = [];
            if( node.get ){
                if(node.get.isConfigurable)isConfigurable = true;
                node.get.disabledNewLine = true;
                delete node.get.static;
                properties.push(createProperty('get', node.get));
                if(node.get.decorators){
                    decorators.push(...node.get.decorators);
                }
            }
            if( node.set ){
                if(node.set.isConfigurable)isConfigurable = true;
                node.set.disabledNewLine = true;
                delete node.set.static;
                properties.push(createProperty('set', node.set));
                if(node.set.decorators){
                    decorators.push(...node.set.decorators);
                }
            }
        }else{
            if(node.type==='PropertyDefinition'){
                if(node.init){
                    properties.push(createProperty('value', node.init, node));
                }
            }else{
                properties.push(createProperty('value', node));
            }
        }
        if(isConfigurable){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('configurable'),
                    ctx.createLiteral(true)
                )
            );
        }

        return ctx.createProperty(
            key,
            this.createMemberDecorator(
                ctx,
                decorators,
                ctx.createLiteral(key.value),
                ctx.createObjectExpression(properties)
            )
        );
    }

    createClassDescriptor(ctx, module, methods, members){
        const properties = [];
        let kind = module.isEnum ? KIND_CLASS : module.isInterface ? KIND_INTERFACE : KIND_CLASS;
        kind |= MODIFIER_PUBLIC;
        if(module.static){
            kind |= MODIFIER_STATIC;
        }
        if(module.abstract){
            kind |= MODIFIER_ABSTRACT;
        }
        if(module.isFinal){
            kind |= MODIFIER_FINAL;
        }

        properties.push(
            ctx.createProperty(
                ctx.createIdentifier('m'),
                ctx.createLiteral(kind)
            )
        );

        const ns = module.namespace && module.namespace.toString();
        if( ns ){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('ns'),
                    ctx.createLiteral( ns )
                )
            );
        }

        properties.push(
            ctx.createProperty(
                ctx.createIdentifier('name'), 
                ctx.createLiteral( module.id )
            )
        );

        if( module.dynamic ){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('dynamic'),
                    ctx.createLiteral(true)
                )
            );
        }

        if( this.privateName ){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('private'),
                    ctx.createIdentifier(this.privateName)
                )
            );
        }

        if( this.implements.length > 0 ){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('imps'), 
                    ctx.createArrayExpression(this.implements)
                )
            );
        }

        if(this.inherit){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('inherit'),
                    this.inherit
                )
            );
        }

        if(this.useClassConstructor){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('useClass'),
                    ctx.createLiteral(true)
                )
            );
        }

        if(methods){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('methods'),
                    methods
                )
            );
        }

        if(members){
            properties.push(
                ctx.createProperty(
                    ctx.createIdentifier('members'),
                    members
                )
            );
        }

        return ctx.createObjectExpression(properties);
    }

    createDecoratorByAnnotation(ctx, annot, index=null){
        if(!annot || !annot.isAnnotationDeclaration)return null;
        let desc = annot.description();
        if(!desc)return null;
        let type = desc.type();
        let isCallee = annot.isCallee();
        let callee = null;
        if(Utils.isModule(type)){
            type.getDescriptor('constructor', (desc)=>{
                let type = desc.getFunType().getReturnedType();
                if(type && type.isFunctionType)return isCallee =true;
                return desc;
            });
            callee = ctx.createIdentifier(ctx.getModuleReferenceName(type))
            ctx.addDepend(type);
        }else{
            callee = ctx.createIdentifier(annot.id.value());
        }
        let args = (annot.body || []).map(item=>{
            if(item.isAssignmentPattern)item = item.right;
            return ctx.createToken(item)
        });
        if(isCallee){
            callee = ctx.createCallExpression(callee, args);
        }else if(args.length>0){
            annot.error(10114);
        }
        if(index !== null && index>=0){
            return ctx.createCallExpression(
                createStaticReferenceNode(ctx, this.stack, "Reflect", "decorateParam"),
                [
                    ctx.createLiteral(index),
                    callee
                ]
            );
        }
        return callee;
    }

    createMemberDecorator(ctx, decorators, key, descriptor){
        if(!decorators || !decorators.length)return descriptor;
        decorators = decorators.filter(Boolean);
        if(!decorators.length)return descriptor;
        let target = this.getModuleIdNode();
        let arr = ctx.createArrayExpression(decorators);
        arr.newLine = true;
        arr.disableCommaNewLine = true;
        return ctx.createCallExpression(
            createStaticReferenceNode(ctx, this.stack, "Reflect", "decorate"),
            [
                arr,
                target,
                key,
                descriptor
            ]
        );
    }

    getClassDecorators(ctx, stack){
        let annotations = stack.annotations;
        if(annotations && annotations.length>0){
            let decorators = [];
            annotations.forEach(annot=>{
                const node = this.createDecoratorByAnnotation(ctx, annot)
                if(node){
                    decorators.push(node);
                }
            });
            return decorators;
        }
        return null;
    }

    createApplyClassDecorator(ctx, decorators, classConstructNode){
        if(decorators && decorators.length>0){
            decorators = ctx.createArrayExpression(decorators);
            decorators.newLine = true;
            decorators.disableCommaNewLine = true;
            classConstructNode.disabledNewLine = true;
            if(classConstructNode.type==="ClassDeclaration"){
                classConstructNode.type="ClassExpression"
            }
            return ctx.createExpressionStatement(
                ctx.createVariableDeclaration('const',[ctx.createVariableDeclarator(
                    this.getModuleIdNode(),
                    ctx.createCallExpression(
                        createStaticReferenceNode(ctx, this.stack, "Reflect", "decorate"),
                        [
                            decorators,
                            classConstructNode
                        ]
                    )
                )])
            );
        }
        return classConstructNode;
    }

    createCreator(ctx, id, description){
        return ctx.createCallExpression(
            createStaticReferenceNode(ctx, this.stack, 'Class', 'creator'),
            [
                id,
                description
            ]
        );
    }

    createMemberDescriptors(ctx, members){
        if(!members.length )return;
        return ctx.createObjectExpression(
            members.map(node=>this.createMemberDescriptor(ctx, node)).filter(Boolean)
        );
    }
}
export default ClassBuilder;