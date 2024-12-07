import {
    MODIFIER_PUBLIC,MODIFIER_PROTECTED,MODIFIER_PRIVATE,PRIVATE_NAME,KIND_ACCESSOR,KIND_VAR,
    KIND_CONST,KIND_METHOD, KIND_CLASS, KIND_INTERFACE, MODIFIER_STATIC, MODIFIER_ABSTRACT, MODIFIER_FINAL, KIND_ENUM_PROPERTY} from "../core/Constant";
import {createHash} from 'crypto';
import {createCommentsNode, createMainAnnotationNode,createStaticReferenceNode} from "./Common";
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
        this.privateName = null;
        this.mainEnter = null;
    }

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

        if(this.mainEnter){
            ctx.addNodeToAfterBody(
                ctx.createExpressionStatement(
                    ctx.createExpressionStatement(this.mainEnter)
                )
            )
        }
        
        ctx.removeNode(this.stack);

        if(this.construct){
            let exists = this.construct.comments;
            let classComments = createCommentsNode(ctx, stack);
            if(!exists){
                this.construct.comments = classComments;
            }else if(exists && classComments){
                exists.value = classComments.value + "\n" + exists.value;
            }
        }
        
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
        this.createIteratorMethodNode(ctx, module)
        if(!this.construct){
            this.construct = this.createDefaultConstructor(ctx, module.id, module.inherit);
        }
        this.checkConstructor(ctx, this.construct, module);
    }

    createInherit(ctx, module, stack=null){
        let inherit = module.inherit;
        if(inherit){
            ctx.addDepend(inherit, module);
            if(ctx.isActiveModule(inherit, module)){
                this.inherit = ctx.createIdentifier(
                    ctx.getModuleReferenceName(inherit, module)
                )
            }
        }
    }

    createImplements(ctx, module, stack=null){
        this.implements = module.implements.map( impModule=>{
            ctx.addDepend(impModule, module);
            if(impModule.isInterface && ctx.isActiveModule(impModule, module) && Namespace.globals.get('Iterator') !== impModule ){
                return ctx.createIdentifier(
                    ctx.getModuleReferenceName(impModule, module)
                )
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

    getHashId(len=8){
        let moduleHashId = this._moduleHashId;
        if(!moduleHashId){
            const name = this.module.getName();
            const file = this.compilation.file;
            this._moduleHashId = moduleHashId = createHash("sha256").update(`${file}:${name}`).digest("hex").substring(0, len);
        }
        return moduleHashId;
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
                                ctx.createLiteral(this.getHashId())
                            ]
                        )
                    )
                ]
            );
        }
    }

    checkSuperES6Class(ctx, construct, module){
        const inherit = module.inherit
        if(inherit && ctx.isES6ClassModule(inherit)){
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
                                ctx.createIdentifier(ctx.getModuleReferenceName(inherit,module)),
                                ctx.createIdentifier('arguments'),
                                ctx.createIdentifier(module.id)
                            ]
                        )
                    ])
                )
            );
            construct.body = block;
        }
    }

    checkConstructor(ctx, construct, module){
        construct.type = 'FunctionDeclaration'
        construct.kind = '';
        construct.key.value = module.id;
        if(this.privateProperties.length > 0 || this.initProperties.length>0){
            let body = construct.body.body;
            let appendAt = module.inherit ? 1 : 0;
            let els = [...this.initProperties]
            if(this.privateProperties.length > 0){
                let privateName = this.createPrivateRefsName(ctx)
                let definePrivateProperties = ctx.createExpressionStatement(
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
                                    ctx.createObjectExpression(this.privateProperties)
                                )
                            ])
                        ]
                    )
                );
                els.push(definePrivateProperties)
            }
            body.splice(appendAt,0, ...els);
        }
        this.checkSuperES6Class(ctx, construct, module);
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
        return node;
    }

    createMemeber(ctx, stack, staticFlag=false){
        const node = ctx.createToken(stack);
        if(node){
            this.createAnnotations(ctx, stack, node, !!(staticFlag || node.static));
        }
        return node;
    }

    createDefaultConstructor(ctx, name, inherit=null, params=[]){
        const block = ctx.createBlockStatement();
        if(inherit){
            const se = ctx.createSuperExpression(
                ctx.getModuleReferenceName(inherit, this.module)
            );
            const args = params.length > 0 ? 
                ctx.createArrayExpression( params ) : 
                ctx.createIdentifier('arguments');
            block.body.push( 
                ctx.createExpressionStatement(
                    ctx.createCallExpression( 
                        ctx.createMemberExpression(
                            [
                                se,
                                ctx.createIdentifier('apply')
                            ]
                        ),[
                            ctx.createThisExpression(),
                            args
                        ]
                    )
                )
            );
        }
        return ctx.createMethodDefinition(
            name,
            block,
            params
        );
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

        if( node.isAccessor ){
            if( node.get ){
                if(node.get.isConfigurable)isConfigurable = true;
                node.get.disabledNewLine = true;
                delete node.get.static;
                properties.push(createProperty('get', node.get));
            }
            if( node.set ){
                if(node.set.isConfigurable)isConfigurable = true;
                node.set.disabledNewLine = true;
                delete node.set.static;
                properties.push(createProperty('set', node.set));
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
            ctx.createObjectExpression( properties )
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

    createCreator(ctx, module, className, description){
        const args = [
            ctx.createIdentifier(className || module.id),
            description
        ];
        return ctx.createCallExpression(
            createStaticReferenceNode(ctx, this.stack, 'Class', 'creator'),
            args
        )
    }

    createMemberDescriptors(ctx, members){
        if(!members.length )return;
        return ctx.createObjectExpression(
            members.map(node=>this.createMemberDescriptor(ctx, node)).filter(Boolean)
        );
    }
}
export default ClassBuilder;