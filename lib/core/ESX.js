import Namespace from 'easescript/lib/core/Namespace';
import {isModule} from 'easescript/lib/core/Utils'
import{getModuleAnnotations, getMethodAnnotations, getAnnotationArgumentValue, compare, toCamelCase, toFirstUpperCase, parseHookAnnotation, createStaticReferenceNode} from './Common';
import {default as NodeToken} from './Node';

function createTextVNode(ctx, node){
    return ctx.createCallExpression(
        this.createIdentifier( ctx.getVNodeApi('createTextVNode') ),
        [
            node
        ]
    );
}

function createFragmentVNode(ctx, children, props=null){
    const items = [
        ctx.getVNodeApi('Fragment'),
        props ? props : ctx.createLiteral( null),
        children
    ]
    return ctx.createCallExpression(
        ctx.getVNodeApi('createVNode'),
        items
    );
}

function createWithDirectives(ctx, node, directives){
    const array = ctx.createArrayExpression( directives );
    array.newLine=true;
    return ctx.createCallExpression( 
        ctx.createIdentifier(
            ctx.getVNodeApi('withDirectives')
        ),
        [
            node,
            array
        ]
    );
}

function createCommentVNode(ctx, text){
    return ctx.createCallExpression(
        ctx.createIdentifier( ctx.getVNodeApi('createCommentVNode') ),
        [
            ctx.createLiteral(text)
        ]
    );
}

function createSlotWithCtxNode(ctx, children, scope=null){
    return ctx.createCallExpression( 
        ctx.createIdentifier( ctx.getVNodeApi('withCtx') ), 
        [
            ctx.createArrowFunctionExpression(children, scope ? [ctx.createIdentifier(scope)] : []),
            ctx.createCallExpression(
                ctx.createMemberExpression([
                    ctx.createThisExpression(),
                    ctx.createIdentifier('getAttribute')
                ]),
                [
                    ctx.createLiteral('instance')
                ]
            )
        ]
    );
}

function createSlotNode(ctx, stack,...args){
    if(stack.isSlot && stack.isSlotDeclared){
        const slots = ctx.createCallExpression( 
            ctx.createMemberExpression([
                ctx.createThisExpression(),
                ctx.createIdentifier('getAttribute')
            ]),
            [
                ctx.createLiteral('slots')
            ]
        );
        const node= ctx.createCallExpression(
            ctx.createIdentifier(
                ctx.getVNodeApi('renderSlot')
            ),
            [slots].concat(args)
        );
        node.isSlotNode = true;
        return node;
    }else{
        const node= ctx.createCallExpression(
            ctx.createIdentifier(ctx.getVNodeApi('withCtx')),
            args
        );
        node.isSlotNode = true;
        return node;
    }
}

function createWithCtxNode(ctx, node){
    return ctx.createCallExpression( 
        ctx.createIdentifier( ctx.getVNodeApi('withCtx') ), 
        [
            node
        ]
    );
}

function createResolveDirectiveNode(ctx, directiveName){
    return ctx.createCalleeNode( 
        ctx.createIdentifierNode( 
            ctx.getVNodeApi('resolveDirective') 
        ),
        [
          ctx.createLiteral(directiveName)
        ]
    )
}

function createForMapNode(ctx, object, element, item, key, index, stack){
    const params = [item]
    if(key){
        params.push(key)
    }

    if(index){
        params.push(index)
    }

    if( element.type ==="ArrayExpression" && element.elements.length === 1){
        element = element.elements[0];
    }

    const node = ctx.createArrowFunctionExpression(element, params);
    return ctx.createCallExpression(
        createStaticReferenceNode(ctx, stack, 'System', 'forMap'),
        [
            object,
            node
        ]
    );
}

function createForEachNode(ctx, refs, element, item, key){
    const args = [item];
    if(key){
        args.push(key);
    }
    if( element.type ==='ArrayExpression' && element.elements.length === 1){
        element =  element.elements[0];
    }
    const node = ctx.createCallExpression( 
        ctx.createMemberExpression([
            refs,
            ctx.createIdentifier('map')
        ]),
        [
            ctx.createArrowFunctionExpression(element,args)
        ] 
    );
    if( element.type ==='ArrayExpression' ){
        return ctx.createCallExpression( 
            ctx.createMemberExpression([
                node,
                ctx.createIdentifier('reduce')
            ]),
            [
                ctx.createArrowFunctionExpression([
                    ctx.createIdentifier('acc'),
                    ctx.createIdentifier('item')
                ],  ctx.createCallee( 
                    ctx.createMemberExpression([
                        ctx.createIdentifier('acc'),
                        ctx.createIdentifier('concat')
                    ]),
                    [
                        ctx.createIdentifier('item')
                    ] 
                )),
                ctx.createArrayExpression()
            ] 
        );
    }
    return node;
}

function getComponentDirectiveAnnotation(module){
    if(!isModule(module)) return null;
    const annots = getModuleAnnotations(module, ['define'])
    for(let annot of annots){
        const args = annot.getArguments();
        if( compare(getAnnotationArgumentValue(args[0]), 'directives') ){
            if( args.length > 1 ){
                return [module, getAnnotationArgumentValue(args[1]), annot];
            }else{
                return [module, desc.getName('-'), annot];
            }
        }
    }
    return null;
}

let directiveInterface = null;
function isDirectiveInterface(module){
    if(!isModule(module))return false;
    directiveInterface = directiveInterface || Namespace.globals.get('web.components.Directive')
    if(directiveInterface && directiveInterface.isInterface ){
        return directiveInterface.type().isof( module );
    }
    return false;
}

function getComponentEmitAnnotation(module){
    if(!isModule(module))return null
    const dataset = Object.create(null)
    const annots = getModuleAnnotations(desc, ['define'])
    annots.forEach(annot=>{
        const args = annot.getArguments()
        if(args.length>1){
            let value = getAnnotationArgumentValue(args[0])
            let _args = args;
            let _key = null;
            let isEmits = compare(value, 'emits');
            let isOptions = compare(value, 'options');
            if(isEmits){
                _args = args.slice(1)
                _key = 'emits'
            }else if(isOptions){
                _args = args.slice(2)
                _key =  getAnnotationArgumentValue(args[1])
            }
            _key = String(_key).toLowerCase();
            if(_key ==='emits'){
                let skip = _args.length > 1 ? _args[_args.length-1] : null;
                if(skip && skip.assigned && String(skip.key).toLowerCase()==='type'){
                    if(skip.value !== '--literal'){
                        skip = null
                    }
                }else{
                    skip = null
                }
                _args.forEach(arg=>{
                    if(arg===skip || !arg)return;
                    if(arg.assigned){
                        dataset[arg.key] = arg.value
                    }else{
                        dataset[arg.value] = arg.value
                    }
                });
            }
        }
    })
    return dataset;
}

function createChildNode(ctx, stack, childNode, prev=null){
    if(!childNode)return null;
    const cmd=[];
    let content = [childNode];
    if( !stack.directives || !(stack.directives.length > 0) ){
        return {
            cmd,
            child: stack,
            content
        };
    }
    const directives = stack.directives.slice(0).sort( (a,b)=>{
        const bb = b.name.value().toLowerCase();
        const aa = a.name.value().toLowerCase();
        const v1 = bb === 'each' || bb ==="for" ? 1 : 0;
        const v2 = aa === 'each' || aa ==="for" ? 1 : 0;
        return v1 - v2;
    });

    while( directives.length > 0){
        const directive = directives.shift();
        const name = directive.name.value().toLowerCase();
        const valueArgument = directive.valueArgument;
        if( name ==="each" || name ==="for" ){
            let refs = ctx.createToken(valueArgument.expression);
            let item = ctx.createIdentifier(valueArgument.declare.item);
            let key  = ctx.createIdentifier(valueArgument.declare.key || 'key');
            let index = valueArgument.declare.index;
            if(index){
                index = ctx.createIdentifier(index)
            }
            if( name ==="each"){
                content[0] = createForEachNode(
                    ctx,
                    refs,
                    content[0],
                    item,
                    key
                );
            }else{
                content[0] = createForMapNode(
                    ctx,
                    refs,
                    content[0],
                    item,
                    key,
                    index,
                    stack
                );
            }
            content[0].isForNode = true;
            cmd.push(name);

        }else if( name ==="if" ){
            const node = ctx.createNode('ConditionalExpression');
            node.test = ctx.createToken(valueArgument.expression);
            node.consequent = content[0];
            content[0] = node;
            cmd.push(name);
        }else if( name ==="elseif" ){
            if( !prev || !(prev.cmd.includes('if') || prev.cmd.includes('elseif')) ){
                directive.name.error(1114, name);
            }else{
                cmd.push(name);
            }
            const node = ctx.createNode('ConditionalExpression');
            node.test = ctx.createToken(valueArgument.expression);
            node.consequent = content[0];
            content[0]=node;
        }else if( name ==="else"){
            if( !prev || !(prev.cmd.includes('if') || prev.cmd.includes('elseif')) ){
                directive.name.error(1114, name);
            }else{
                cmd.push(name);
            }
        }
    }
    return {
        cmd,
        child: stack,
        content
    };
}

function createSlotCalleeNode(ctx, stack, child, ...args){
    if(stack.isSlotDeclared){
        return ctx.createCallExpression(
            ctx.createMemberExpression([
                ctx.createThisExpression(), 
                ctx.createIdentifier('slot')
            ]),
            child ? args.concat( child ) : args,
            stack
        );
    }else{
        return child || ctx.createArrowFunctionExpression(ctx.createArrayExpression())
    }
}

function getCascadeConditional( elements ){
    if( elements.length < 2 ){
        throw new Error('Invaild expression');
    }
    let lastElement = elements.pop();
    while( elements.length > 0 ){
        const _last = elements.pop();
        if( _last.type ==="ConditionalExpression" ){
            _last.alternate = lastElement;
            lastElement = _last;
        }else{
            throw new Error('Invaild expression');
        }
    }
    return lastElement;
}

function createChildren(ctx, children, data){
    let content = [];
    let len = children.length;
    let index = 0;
    let last = null;
    let result = null;
    let next = ()=>{
        if(index<len){
            const child = children[index++];
            const childNode = createChildNode(
                ctx,
                child,
                ctx.createToken(child),
                last
            ) || next();
            if( child.hasAttributeSlot ){
                const attributeSlot = child.openingElement.attributes.find(attr=>attr.isAttributeSlot);
                if( attributeSlot ){
                    const name = attributeSlot.name.value();
                    const scopeName = attributeSlot.value ? 
                            ctx.createToken(
                                attributeSlot.parserSlotScopeParamsStack()
                            ) : null;
                    let childrenNodes = childNode.content;
                    if( childrenNodes.length ===1 && childrenNodes[0].type ==="ArrayExpression" ){
                        childrenNodes = childrenNodes[0];
                    }else{
                        childrenNodes = ctx.createArrayExpression(childrenNodes);
                    }
                    const params = scopeName ? [ 
                        ctx.createAssignmentExpression(
                            scopeName,
                            ctx.createObjectExpression()
                        ) 
                    ] : [];
                    const renderSlots= createSlotCalleeNode(
                        ctx,
                        child, 
                        ctx.createArrowFunctionExpression(childrenNodes, params)
                    );
                    data.slots[name] = renderSlots
                    return next();
                }
            }else if( child.isSlot && !child.isSlotDeclared ){
                const name = child.openingElement.name.value();
                data.slots[name] = childNode.content[0]
                return next();
            }else if( child.isDirective ){
                childNode.cmd.push(
                    child.openingElement.name.value().toLowerCase()
                )
            }
            return childNode;
        }
        return null;
    }

    const push = (data, value)=>{
        if( value ){
            if( Array.isArray(value) ){
                data.push( ...value );
            }else{
                data.push( value );
            }
        }
    }

    let hasComplex = false;
    while(true){
        result = next();
        if( last ){
            let value = null;
            const hasIf = last.cmd.includes('if');
            if( hasIf ){
                if( result && result.cmd.includes('elseif') ){
                    result.cmd = last.cmd.concat( result.cmd );
                    result.content = last.content.concat( result.content );
                }else if(result && result.cmd.includes('else') ){
                    value = getCascadeConditional( last.content.concat( result.content ) );
                    result.ifEnd = true;
                }else{
                    if(result)result.ifEnd = true;
                    last.content.push( createCommentVNode('end if') );
                    value = getCascadeConditional( last.content );
                }
            }else if( !( last.ifEnd && last.cmd.includes('else') ) ) {
                value = last.content;
            }

            const complex = last.child.isJSXExpressionContainer ? !!(last.child.expression.isMemberExpression || last.child.expression.isCallExpression) : false;
            if( last.cmd.includes('each') || last.cmd.includes('for') || last.child.isSlot || last.child.isDirective || complex ){
                hasComplex = true;
            }
            push(content, value);
        }
        last = result;
        if( !result )break;
    }

    if( !content.length )return null;
    if( hasComplex ){
        let first = content[0];
        if( content.length === 1 && (first.type == 'ArrayExpression' || first.isForNode || first.isSlotNode) ){
            return first;
        }

        let base =  content.length > 1 ? content.shift() : ctx.createArrayExpression();
        if( base.type !== 'ArrayExpression' && !base.isForNode ){
            base = ctx.createArrayExpression([base]);
            base.newLine = true;
        }

        const node = ctx.createCallExpression( 
            ctx.createMemberExpression([
                base,
                ctx.createIdentifier('concat')
            ]),
            content.reduce(function(acc, val){
                if( val.type === 'ArrayExpression' ){
                    return acc.concat( ...val.elements );
                }else{
                    return acc.concat(val)
                }
            },[])
        );
        node.newLine = true;
        node.indentation = true; 
        return node;
    }
    const node = ctx.createArrayExpression( content );
    if( content.length > 1 || !(content[0].type ==="Literal" || content[0].type ==="Identifier") ){
        node.newLine = true;
    }
    return node;
}

function createGetEventValueNode(ctx, name='e'){
    return ctx.createCalleeNode(
        ctx.createMemberExpression([
            ctx.createThisExpression(), 
            ctx.createIdentifier('getBindEventValue')
        ]),
        [
            ctx.createIdentifier(name)
        ]
    );
}

function createDirectiveArrayNode(ctx, name, expression, ...args){
    const elems = [
        ctx.createIdentifier(ctx.getVNodeApi(name)),
        expression,
        ...args
    ];
    return ctx.createArrayExpression(elems);
}

function createResolveAttriubeDirective(ctx, attrDirective){
    if(!attrDirective.value)return;
    return ctx.createCallExpression(
        createStaticReferenceNode(ctx, attrDirective, 'web.components.Component', 'resolveDirective'),
        [
            ctx.createToken( attrDirective.parserAttributeValueStack() ),
            attrDirective.module ? ctx.createThisExpression() : ctx.createLiteral(null)
        ]
    );
}

function createAttributeBindingEventNode(ctx, attribute, valueTokenNode){
    if( attribute.value.isJSXExpressionContainer ){
        const expr = attribute.value.expression;
        if( expr.isAssignmentExpression || expr.isSequenceExpression){
            return ctx.createArrowFunctionExpression(valueTokenNode);
        }else if( !expr.isFunctionExpression ){
            if( expr.isCallExpression ){
                const isBind = expr.callee.isMemberExpression && expr.callee.property.value() === 'bind' &&
                            expr.arguments.length > 0 && expr.arguments[0].isThisExpression;           
                if(!isBind && valueTokenNode && valueTokenNode.type==='CallExpression'){
                    valueTokenNode.arguments.push(ctx.createIdentifier('...args'))
                    return ctx.createArrowFunctionExpression(
                        valueTokenNode,
                        [
                            ctx.createIdentifier('...args')
                        ]
                    )
                }
            }else if(expr.isMemberExpression || expr.isIdentifier){
                const desc = expr.description();
                const isMethod = desc && (desc.isMethodDefinition && !desc.isAccessor);
                if(isMethod){
                    return ctx.createCallExpression(
                        ctx.createMemberExpression([
                            valueTokenNode,
                            ctx.createIdentifier('bind')
                        ]), 
                        [ctx.createThisExpression()]
                    );
                }
            }
        }
    }
    return valueTokenNode;
}

function getBinddingEventName(stack){
    const bindding = getMethodAnnotations(stack, ['bindding'])
    if(bindding.length>0){
        const [annot] = bindding;
        const args = annot.getArguments();
        return getAnnotationArgumentValue(args[0])
    }
    return null;
}

function mergeElementPropsNode(ctx, data, stack){
    const items = [];
    const ssr = !!ctx.options.ssr;
    Object.entries(data).map( item=>{
        const [key, value] = item;
        if( key ==='slots' || key==='directives' || key==='keyProps'){
            return;
        }
        if(value){
            if( Array.isArray(value) ){
                if( value.length > 0 ){
                    const type = value[0].type;
                    const isObject = type ==='Property' || type ==='SpreadElement';
                    if( isObject ){
                        if( key==='props'||key==='attrs' ){
                            items.push( ...value );
                            return;
                        }else if( key==='on' ){
                            if(ssr)return;
                            value.forEach( item=>{
                                if( item.type ==='Property' ){
                                    if(item.computed){
                                        item.key = ctx.createTemplateLiteral([
                                            ctx.createTemplateElement('on')
                                        ],[
                                            ctx.createCallExpression(
                                                createStaticReferenceNode(ctx, stack, 'System', 'firstUpperCase'),
                                                [
                                                    item.key
                                                ]
                                            )
                                        ]);
                                    }else{
                                        item.key.value = 'on'+toFirstUpperCase(item.key.value);
                                    }
                                    items.push( item );
                                }
                            });
                            return;
                        }
                        items.push(
                            ctx.createProperty(
                                ctx.createIdentifier(key),
                                ctx.createObjectExpression(value)
                            )
                        );
                    }else{
                        items.push(
                            ctx.createProperty(
                                ctx.createIdentifier(key),
                                ctx.createArrayExpression(value)
                            )
                        );
                    }
                }
            }else{
                if(value.type ==="Property"){
                    items.push( value );
                }else{
                    items.push(
                        ctx.createProperty(
                            ctx.createIdentifier(key),
                            value
                        )
                    ); 
                }
            }
        }
    });

    const props = items.length > 0 ? ctx.createObjectExpression(items) : null;
    if(props && stack && stack.isComponent){
        const desc = stack.description();
        if(desc && isModule(desc)){
            let has = getModuleAnnotations(desc, ['hook']).some(annot=>{
                let result = parseHookAnnotation(annot, ctx.plugin.version, ctx.options.metadata.versions)
                return result && result.type ==='polyfills:props';
            })
            if(has){
                return createComponentPropsHookNode(ctx, props, ctx.createLiteral(desc.getName()))
            }
        }
    }
    return props;
}

function createComponentPropsHookNode(ctx, props, className){
    return ctx.createCallExpression(
        ctx.createMemberExpression([
            ctx.createThisExpression(),
            ctx.createIdentifier('invokeHook')
        ]),
        [
            ctx.createLiteral('polyfills:props'),
            props,
            className
        ]
    );
}

function createAttributes(ctx, stack, data){
    const pushEvent=(name, node, category)=>{
        let events =  data[ category ] || (data[category]=[]);
        if(!NodeToken.is(name)){
            name = String(name)
            name = name.includes(':') ? ctx.createLiteral(name) : ctx.createIdentifier(name)
        }
        let property = ctx.createProperty(name, node);
        if( property.key.computed ){
            property.computed = true;
            property.key.computed = false;
        }
        events.push( property );
    }

    let isComponent = stack.isComponent || stack.isWebComponent;
    let nodeType = !isComponent ? stack.openingElement.name.value().toLowerCase() : null;
    let binddingModelValue = null;
    let afterDirective = null;
    let custom = null;

    if( nodeType ==="input" ){
        afterDirective='vModelText';
    }else if( nodeType ==="select" ){
        afterDirective = 'vModelSelect';
    }else if( nodeType ==="textarea" ){
        afterDirective = 'vModelText';
    }

    const forStack = stack.getParentStack(stack=>{
        return stack.scope.isForContext || !(stack.isJSXElement || stack.isJSXExpressionContainer)
    },true);
    const inFor = forStack && forStack.scope && forStack.scope.isForContext ? true : false;

    const descModule = stack.isWebComponent ? stack.description() : null;
    const definedEmits = getComponentEmitAnnotation(descModule);
    const getDefinedEmitName = (name)=>{
        if(definedEmits && Object.prototype.hasOwnProperty.call(definedEmits, name)){
            name = toCamelCase(definedEmits[name]);
        }
        return name;
    }

    stack.openingElement.attributes.forEach(item=>{
        if(item.isAttributeXmlns)return;
        if(item.isAttributeDirective){
            if( item.isAttributeDirective ){
                const name = item.name.value();
                if(compare(name, 'show')){
                    data.directives.push(
                        createDirectiveArrayNode(
                            ctx,
                            'vShow',
                            ctx.createToken( item.valueArgument.expression )
                        )
                    );
                }else if(compare(name, 'custom')){
                    data.directives.push(
                        createResolveAttriubeDirective(
                            ctx,
                            item
                        )
                    )
                }
            }
            return;
        }else if(item.isJSXSpreadAttribute){
            if(item.argument){
                data.props.push(
                    ctx.createSpreadElement(
                        ctx.createToken(item.argument),
                        item
                    )
                );
            }
            return;
        }else if( item.isAttributeSlot ){
            return;
        }

        let value = ctx.createToken( item );
        if( !value )return;

        let ns = value.namespace;
        let name = value.name.value;
        let propName = name;
        let propValue = value.value;
        let attrLowerName = name.toLowerCase();

        if( (ns ==="@events" || ns ==="@natives") ){
            name = getDefinedEmitName(name);
        }

        if( ns && ns.includes('::') ){
            let [seg, className] = ns.split('::',2);
            ns = seg;
            name = createStaticReferenceNode(ctx, item, className, name);
            name.computed = true;
            custom = name;
        }

        let isDOMAttribute = false;
        if( item.isMemberProperty ){
            let attrDesc = item.getAttributeDescription( stack.getSubClassDescription() );
            if( attrDesc ){
                isDOMAttribute = getMethodAnnotations(attrDesc, ['domattribute']).length > 0;
            }
        }

        if( ns ==="@events" || ns ==="@natives" ){
            pushEvent(name, createAttributeBindingEventNode(item, propValue), 'on')
            return;
        }else if( ns ==="@binding" ){
            binddingModelValue = propValue;
            if( !binddingModelValue || !(binddingModelValue.type ==='MemberExpression' || binddingModelValue.type ==='Identifier') ){
                binddingModelValue = null;
                if(item.value && item.value.isJSXExpressionContainer){
                    const stack = item.value.expression;
                    if(stack && stack.isMemberExpression && !stack.optional){
                        binddingModelValue = ctx.createCallExpression(
                            createStaticReferenceNode(ctx, stack, 'Reflect', 'set'),
                            [
                                stack.module ? ctx.createIdentifier(stack.module.id) : ctx.createLiteral(null), 
                                ctx.createToken(stack.object), 
                                stack.computed ? ctx.createToken(stack.property) : ctx.createLiteral(stack.property.value()),
                                ctx.createIdentifier('value')
                            ],
                            stack
                        );
                        binddingModelValue.isReflectSetter = true;
                    }
                }
            }
        }
        
        if( item.isMemberProperty ){
            if( ns ==="@binding" && attrLowerName ==='value'){
                data.props.push(
                    ctx.createProperty(
                        ctx.createIdentifier(
                            propName,
                            item.name
                        ),
                        propValue
                    )
                );
                propName = 'modelValue';
            }
            if(!isDOMAttribute){
                data.props.push(
                    ctx.createProperty(
                        ctx.createIdentifier(
                            propName,
                            item.name
                        ),
                        propValue
                    )
                );
                if(ns !=="@binding" )return;
            }
        }

        if( attrLowerName === 'type' && nodeType ==="input" && propValue  && propValue.type ==="Literal"){
            const value = propValue.value.toLowerCase();
            if( value ==='checkbox' ){
                afterDirective = 'vModelCheckbox';
            }else if( value ==='radio' ){
                afterDirective='vModelRadio';
            }
        }

        if( ns ==="@binding" ){

            const createBinddingParams = (getEvent=false)=>{
                return [
                    binddingModelValue.isReflectSetter ? 
                        binddingModelValue : 
                            ctx.createAssignmentExpression(
                                binddingModelValue,
                                getEvent ? 
                                    createGetEventValueNode(ctx) : 
                                        ctx.createIdentifier('e')
                            ),
                    [
                        ctx.createIdentifier('e')
                    ], 
                ]
            }

            if( custom && binddingModelValue ){
                pushEvent(custom , ctx.createArrowFunctionExpression(
                    ...createBinddingParams(!stack.isWebComponent)
                ), 'on');
            }else if( (stack.isWebComponent || afterDirective) && binddingModelValue ){

                let eventName = propName;
                if(propName ==='modelValue'){
                    eventName = 'update:modelValue';
                }

                if(item.isMemberProperty){
                    let _name = getBinddingEventName(item.description())
                    if(_name){
                        eventName = toCamelCase(_name);
                    }
                }

                pushEvent(
                    getDefinedEmitName(eventName),
                    ctx.createArrowFunctionExpression(
                        ...createBinddingParams()
                    ),
                'on');
    
            }else if( binddingModelValue ){
                pushEvent(
                    ctx.createIdentifier('input'),
                    ctx.createArrowFunctionExpression(
                        ...createBinddingParams(true)
                    ),
                'on');
            }
    
            if(afterDirective && binddingModelValue){
                data.directives.push(
                    createDirectiveArrayNode(ctx, afterDirective, binddingModelValue)
                );
            }
            return;
        }

        if( !ns && (attrLowerName ==='ref' || attrLowerName ==='refs') ){
            name = propName = 'ref';
            let useArray = inFor || attrLowerName ==='refs';
            if( useArray ){
                propValue = ctx.createArrowFunctionExpression(
                    ctx.createCallExpression(
                        ctx.createMemberExpression([
                            ctx.createThisExpression(),
                            ctx.createIdentifierExpression('setRefNode')
                        ]),
                        [
                            value.value,
                            ctx.createIdentifier('node'),
                            ctx.createLiteral( true )
                        ]
                    ),
                    [
                        ctx.createIdentifier('node')
                    ], 
                );
            }
        }
        
        if(name==='class' || name==='staticClass'){
            if(propValue && propValue.type !== 'Literal'){
                propValue = ctx.createCallExpression(
                    ctx.createIdentifier(
                        ctx.getVNodeApi('normalizeClass')
                    ),
                    [
                        propValue
                    ]
                );
            }
        }else if(name==='style' || name==='staticStyle'){
            if(propValue && !(propValue.type === 'Literal' || propValue.type === 'ObjectExpression')){
                propValue = ctx.createCallExpression(
                    ctx.createIdentifier(
                        ctx.getVNodeApi('normalizeStyle')
                    ),
                    [propValue]
                );
            }
        }else if(attrLowerName==='key' || attrLowerName==='tag'){
            name = attrLowerName
        }

        const property = ctx.createProperty(
            ctx.createIdentifier(
                propName,
                item.name
            ),
            propValue
        );

        switch(name){
            case "class" :
            case "style" :
            case "key" :
            case "tag" :
            case "ref" :
                data[name] = property
                break;
            default:
                data.attrs.push( property );
        }
    });

    if(!data.key){
        data.key = createElementKeyPropertyNode(ctx, stack)
    }
}

function createElementKeyPropertyNode(ctx, stack){
    const keys = ctx.options.esx.complete.keys;
    const fills = Array.isArray(keys) && keys.length > 0 ? keys : null;
    const all = keys === true;
    if(fills || all){
        let key = null;
        let direName = null
        let isForContext = false;
        if(all || fills.includes('for') || fills.includes('each')){
            if(!stack.isDirective && stack.directives && Array.isArray(stack.directives)){
                let directive = stack.directives.find(directive=>['for','each'].includes(directive.name.value().toLowerCase()));
                if( directive ){
                    isForContext = true
                    direName = directive.name.value().toLowerCase()
                    let valueArgument = directive.valueArgument;
                    if(valueArgument){
                        key = valueArgument.declare.index || valueArgument.declare.key;
                    }
                }
            }
            if( !direName && stack.parentStack.isDirective && ['for','each'].includes(stack.parentStack.openingElement.name.value())){
                const attrs = stack.parentStack.openingElement.attributes;
                const argument = {};
                isForContext = true
                direName = stack.parentStack.openingElement.name.value().toLowerCase()
                attrs.forEach( attr=>{
                    argument[ attr.name.value() ] = attr.value.value();
                });
                key = argument['index'] ||  argument['key'];
            }
        }

        if(fills && fills.includes('condition')){
            if(!stack.isDirective && stack.directives && Array.isArray(stack.directives)){
                let directive = stack.directives.find(directive=>['if','elseif','else'].includes(directive.name.value().toLowerCase()));
                if( directive ){
                    direName = directive.name.value().toLowerCase()
                }
            }
            if( !isForContext && stack.parentStack.isDirective && ['if','elseif','else'].includes(stack.parentStack.openingElement.name.value())){
                direName = stack.parentStack.openingElement.name.value().toLowerCase()
            }
        }
        if(all || fills.includes(direName)){
            return ctx.createProperty(
                ctx.createIdentifier('key'),
                isForContext ? ctx.createBinaryExpression(
                        ctx.createLiteral(getDepth(stack)+'.'),
                        ctx.createIdentifierNode( key || 'key'),
                        '+'
                    ) : ctx.createLiteral(getDepth(stack))
            );
        }
    }
}

function createComponentDirectiveProperties(ctx, stack, data, callback=null){
    if(stack){
        let desc = stack.description();
        let parentIsComponentDirective = getComponentDirectiveAnnotation(desc);
        if(!parentIsComponentDirective){
            parentIsComponentDirective = isDirectiveInterface(desc)
        }
        if(parentIsComponentDirective){
            let node = createResolveComponentDirective(ctx, stack, data, callback);
            if(node){
                data.directives.push(node);
            }
            if(stack.jsxRootElement !== stack){
                createComponentDirectiveProperties(ctx, stack.parentStack, data, callback);
            }
            return true
        }
    }
    return false;
}


function createCustomDirectiveProperties(ctx, stack, data, callback=null){  
    const node = createResolveComponentDirective(ctx, stack, data, callback);
    if(node){
        data.directives.push(node);
    }
    if(stack.parentStack && stack.parentStack.isDirective && stack.jsxRootElement !== stack.parentStack){
        let dName = stack.parentStack.openingElement.name.value().toLowerCase();
        if( dName ==="custom" ){
            createCustomDirectiveProperties(ctx, stack.parentStack, data, callback);
        }
    }
}

function createResolveComponentDirective(ctx, stack, data, callback=null){
    const props = [];
    const has = (items, name)=>items && items.some(prop=>prop.key.value===name)
    stack.openingElement.attributes.forEach( attr=>{
        if(attr.isAttributeXmlns || attr.isAttributeDirective)return;
        const name = attr.name.value()
        const property = ctx.createProperty(
            ctx.createIdentifier(name), 
            attr.value ? ctx.createToken(attr.value) : ctx.createLiteral(true)
        );
        if( attr.isMemberProperty ){
            if(!has(data.props, name)){
                property.isInheritDirectiveProp = true
                data.props.push( property );
            }
        }else{
            if(!has(data.attrs, name)){
                property.isInheritDirectiveAttr = true
                data.attrs.push( property );
            }
        }
        if(callback){
            callback( property );
        }
    });
    const object = ctx.createObjectExpression(props); 
    const node = ctx.createCallExpression(
        createStaticReferenceNode(ctx, stack, 'web.components.Component', 'resolveDirective'),
        [
            object,
            ctx.createThisExpression()
        ]
    );
    node.isInheritComponentDirective = true;
    return node;
}

function createSlotElementNode(ctx, stack , children){
    const openingElement = ctx.createToken(stack.openingElement);
    const args = [ctx, stack];
    let props = null;
    let params = [];
    if( stack.isSlotDeclared ){
        args.push( ctx.createLiteral(stack.openingElement.name.value()) )
        if( openingElement.attributes.length > 0 ){
            const properties = openingElement.attributes.map(attr=>{
                return ctx.createProperty(
                    attr.name,
                    attr.value
                )
            });
            props = ctx.createObjectExpression(properties);
        }else{
            props = ctx.createObjectExpression();
        }
        args.push( props );
    }else if( stack.openingElement.attributes.length > 0 ){
        const attribute = stack.openingElement.attributes[0];
        if( attribute.value ){
            const stack = attribute.parserSlotScopeParamsStack();
            params.push(
                ctx.createAssignmentExpression(
                    ctx.createToken(stack),
                    ctx.createObjectExpression()
                )
            );
        }
    }
    if( children ){
        if(Array.isArray(children) && children.length===0){
            children = null
        }else if( children.type ==='ArrayExpression' && children.elements.length === 0){
            children = null
        }
        if(children){
            args.push( ctx.createArrowFunctionExpression(children, params) );
        }
    }
    return createSlotNode(...args);
}

function createDirectiveElementNode(ctx, stack, children){
    const openingElement = stack.openingElement;
    const name = openingElement.name.value().toLowerCase();
    switch( name ){
        case 'custom' :
        case 'show' :
            return children;
        case 'if' :
        case 'elseif' :
            {
                const condition = ctx.createToken( stack.attributes[0].parserAttributeValueStack() )
                const node = ctx.createNode('ConditionalExpression')
                node.test = condition;
                node.consequent = children
                return node;
            }
        case 'else' :
            return children;
        case 'for' :
        case 'each' :
            {
                const attrs = stack.openingElement.attributes;
                const argument = {};
                attrs.forEach( attr=>{
                    if( attr.name.value()==='name'){
                        argument[ 'refs' ] = ctx.createToken( attr.parserAttributeValueStack() );
                    }else{
                        argument[attr.name.value()] = ctx.createIdentifier(attr.value.value());
                    }
                });
                let item = argument.item || ctx.createIdentifier('item')
                let key = argument.key || ctx.createIdentifier('key')
                let node = name === 'for' ? 
                    createForMapNode(ctx, argument.refs, children, item, key, argument.index, stack) :
                    createForEachNode(ctx, argument.refs, children, item, key);
                node.isForNode = true;
                return node;
            }
    } 
    return null;
}

function createHandleNode(ctx, stack, ...args){
    let handle = ctx.createIdentifier(
        ctx.getLocalRefName(
            stack,
            ctx.options.esx.handle||'createVNode'
        )
    );
    return ctx.createCallExpression(handle,args);
}

function createElementNode(ctx,stack,data,children){
    let name = null;
    if( stack.isComponent ){
        if( stack.jsxRootElement === stack && stack.parentStack.isProgram ){
            name = ctx.createLiteral("div");
        }else{
            const desc = stack.description();
            if(isModule(desc)){
                ctx.addDepend(desc, stack.module)
                name = ctx.createIdentifier(
                    ctx.getModuleReferenceName(desc, stack.module)
                );
            }else{
                name = ctx.createIdentifier(
                    stack.openingElement.name.value(),
                    stack.openingElement.name
                );
            }
        }
    }else{
        name = ctx.createLiteral(stack.openingElement.name.value());
    }

    data = mergeElementPropsNode(ctx, data, stack);
    if(children){
        return createHandleNode(ctx, stack, name, data || ctx.createLiteral(null), children);
    }else if(data){
        return createHandleNode(ctx, stack, name, data);
    }else{
        return createHandleNode(ctx, stack, name);
    }
}

function getDepth(stack){
    let parentStack = stack.parentStack;
    while(parentStack){
        if(parentStack.isJSXElement || parentStack.isJSXExpressionContainer || parentStack.isMethodDefinition || parentStack.isProgram)break;
        parentStack = parentStack.parentStack;
    }
    if( parentStack && (parentStack.isDirective  || parentStack.isSlot || parentStack.isJSXExpressionContainer) ){
        const index = stack.childIndexAt;
        const prefix = getDepth(parentStack);
        return prefix ? prefix+'.'+index : index;
    }
    return stack.childIndexAt;
}

function getChildren(stack){
    return stack.children.filter(child=>{
        return !((child.isJSXScript && child.isScriptProgram) || child.isJSXStyle)
    })
}

function createElement(ctx, stack){
    let data = {
        directives:[],
        slots:{},
        attrs:[],
        props:[]
    };
    let isRoot = stack.jsxRootElement === stack;
    let children = getChildren(stack)
    let childNodes = createChildren(ctx, children, data, stack)
    let desc = stack.description();
    let componentDirective = getComponentDirectiveAnnotation(desc);
    let nodeElement = null;
    if( stack.isDirective && stack.openingElement.name.value().toLowerCase() ==="custom" ){
        componentDirective = true;
    }else if(stack.isComponent && isDirectiveInterface(desc)){
        componentDirective = true;
    }

    if(componentDirective){
        return childNodes;
    }

    if(stack.parentStack && stack.parentStack.isDirective ){
        let dName = stack.parentStack.openingElement.name.value().toLowerCase();
        if( dName === 'show' ){
            const condition= stack.parentStack.openingElement.attributes[0];
            data.directives.push(
                createDirectiveArrayNode(
                    ctx,
                    'vShow',
                    ctx.createToken(condition.parserAttributeValueStack())
                )
            );
        }else if( dName ==="custom" ){
            createCustomDirectiveProperties(ctx, stack.parentStack, data);
        }
    }else{
        createComponentDirectiveProperties(ctx, stack.parentStack, data)
    }

    if(!stack.isJSXFragment){
        if(!(isRoot && stack.openingElement.name.value()==='root') ){
            createAttributes(ctx, stack, data)
        }
    }

    const isWebComponent = stack.isWebComponent && !(stack.compilation.JSX && stack.parentStack.isProgram)
    if( isWebComponent ){
        const properties = []
        if( childNodes ){
            properties.push( ctx.createProperty(
                ctx.createIdentifier('default'), 
                createWithCtxNode(
                    ctx.createArrowFunctionExpression(childNodes)
                )
            ));
            childNodes = null;
        }
        if(data.slots){
            for(let key in data.slots){
                properties.push( 
                    ctx.createProperty(
                        ctx.createIdentifier(key), 
                        data.slots[key]
                    )
                );
            }
        } 
        if( properties.length > 0 ){
            childNodes = ctx.createObjectExpression( properties );
        }
    }

    if(stack.isSlot ){
        nodeElement = createSlotElementNode(ctx, stack, childNodes);
    }else if(stack.isDirective){
        nodeElement = createDirectiveElementNode(ctx, stack, childNodes);
    }else{
        if(stack.isJSXFragment || (isRoot && !isWebComponent && stack.openingElement.name.value()==='root')){
            if(Array.isArray(childNodes) && childNodes.length===1){
                nodeElement = childNodes[0]
            }else{
                nodeElement = createFragmentVNode(ctx, childNodes)
            }
        }else{
            nodeElement = createElementNode(ctx, stack, data, childNodes);
        }
    }

    if( nodeElement && data.directives && data.directives.length > 0){
        nodeElement = createWithDirectives(ctx, nodeElement, data.directives);
    }
    
    return nodeElement;
}

export {
    createElement,
    createTextVNode,
    createCommentVNode,
    createSlotWithCtxNode,
    createWithCtxNode,
    createForMapNode,
    createForEachNode,
    createResolveDirectiveNode,
    createChildren,
    createChildNode,
    createElementNode,
    createHandleNode,
    createDirectiveElementNode,
    createSlotElementNode,
    createResolveComponentDirective,
    createCustomDirectiveProperties,
    createComponentDirectiveProperties,
    createElementKeyPropertyNode,
    createAttributes,
    createComponentPropsHookNode,
    createAttributeBindingEventNode,
    createResolveAttriubeDirective,
    createDirectiveArrayNode,
    createGetEventValueNode,
    createSlotNode,
    createWithDirectives,
    createFragmentVNode,
    getComponentEmitAnnotation,
    getCascadeConditional,
    getBinddingEventName,
    getChildren,
    getDepth,
    getComponentDirectiveAnnotation,
    isDirectiveInterface,
    mergeElementPropsNode
}