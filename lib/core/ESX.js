import Namespace from 'easescript/lib/core/Namespace';
import Utils from 'easescript/lib/core/Utils'
import{getModuleAnnotations, getMethodAnnotations, parseAnnotationArguments, annotationIndexers, getAnnotationArgumentValue, compare, toCamelCase, toFirstUpperCase, parseHookAnnotation, createStaticReferenceNode} from './Common';
import {default as NodeToken} from './Node';

function createToDisplayStringNode(ctx, node){
    return ctx.createCallExpression(
        ctx.getVNodeApi('toDisplayString'),
        [
            node
        ]
    );
}

function createTextVNode(ctx, node){
    return ctx.createCallExpression(
        ctx.createIdentifier(ctx.getVNodeApi('createTextVNode')),
        [
            node
        ]
    );
}

function createFragmentVNode(ctx, children, props=null){
    const items = [
        ctx.createIdentifier(ctx.getVNodeApi('Fragment')),
        props ? props : ctx.createLiteral( null),
        children
    ]
    let node = ctx.createCallExpression(
        ctx.createIdentifier(ctx.getVNodeApi('createVNode')),
        items
    );
    node.isElementVNode = true;
    node.isFragmentVNode = true;
    return node;
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

function createCommentVNode(ctx, text, asBlock=false){
    let args = [
        ctx.createLiteral(text)
    ];
    if(asBlock){
        args.push(ctx.createLiteral(true)) 
    }
    return ctx.createCallExpression(
        ctx.createIdentifier( ctx.getVNodeApi('createCommentVNode') ),
        args
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
        node.isRenderSlot = true;
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
    return ctx.createCallExpression( 
        ctx.createIdentifier( 
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

    const node = ctx.createArrowFunctionExpression( ctx.createBlockStatement([
        ctx.createReturnStatement(element)
    ]), params);

    return ctx.createCallExpression(
        createStaticReferenceNode(ctx, stack, 'System', 'forMap'),
        [
            object,
            node
        ]
    );
}

function createForEachNode(ctx, refs, element, item, key, stack){
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
            ctx.createArrowFunctionExpression( ctx.createBlockStatement([
                ctx.createReturnStatement(element)
            ]),args)
        ] 
    );
    return node;
}

function getComponentDirectiveAnnotation(module){
    if(!Utils.isModule(module)) return null;
    const annots = getModuleAnnotations(module, ['define'])
    for(let annot of annots){
        const args = annot.getArguments();
        if( compare(getAnnotationArgumentValue(args[0]), 'directives') ){
            if( args.length > 1 ){
                return [module, getAnnotationArgumentValue(args[1]), annot];
            }else{
                return [module, module.getName('-'), annot];
            }
        }
    }
    return null;
}

let directiveInterface = null;
function isDirectiveInterface(module){
    if(!Utils.isModule(module))return false;
    directiveInterface = directiveInterface || Namespace.globals.get('web.components.Directive')
    if(directiveInterface && directiveInterface.isInterface ){
        return directiveInterface.type().isof( module );
    }
    return false;
}

function getComponentEmitAnnotation(module){
    if(!Utils.isModule(module))return null
    const dataset = Object.create(null)
    const annots = getModuleAnnotations(module, ['define'])
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
                    key,
                    stack
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
            content[0] = createFragmentVNode(ctx, content[0]);
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

function createChildren(ctx, children, data, stack){
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
                    data.slots[name] = createSlotNode(
                        ctx,
                        child, 
                        ctx.createArrowFunctionExpression(childrenNodes, params)
                    );
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
                    last.content.push( createCommentVNode(ctx, 'end if') );
                    value = getCascadeConditional( last.content );
                }
            }else if( !( last.ifEnd && last.cmd.includes('else') ) ) {
                value = last.content;
            }
            push(content, value);
        }
        last = result;
        if( !result )break;
    }

    if(content.length>1){
        content = content.reduce((acc, item)=>{
            if((item.type==="Literal" || (item.isScalarType && item.isExpressionContainer)) && acc.length>0){
                let index = acc.length-1;
                let last = acc[index];
                if(item.type === last.type && last.type==="Literal"){
                    last.value += item.value;
                    last.raw = `"${last.value}"`;
                    return acc;
                }else if(last.type==="Literal" || (last.isScalarType && last.isExpressionContainer)){
                    const node = ctx.createBinaryExpression(
                        last,
                        item,
                        '+'
                    );
                    node.isMergeStringNode = true;
                    node.isScalarType = true;
                    acc.splice(index,1,node);
                    return acc;
                }
            }
            acc.push(item);
            return acc;
        },[]);
    }
    return content.map(child=>createNormalChildrenVNode(ctx, child, stack));
}

function createNormalChildrenVNode(ctx, vnode, stack){
    let node = vnode;
    if(vnode.isExpressionContainer && !vnode.isExplicitVNode){
        node = ctx.createCallExpression(
            createStaticReferenceNode(ctx, stack, 'web.components.Component', 'normalVNode'),
            [
                vnode
            ]
        );
        node.isElementVNode = true;
    }
    return node;
}

function createGetEventValueNode(ctx, name='e'){
    return ctx.createCallExpression(
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
    if(attribute.value && attribute.value.isJSXExpressionContainer ){
        const expr = attribute.value.expression;
        if( expr.isAssignmentExpression || expr.isSequenceExpression){
            return ctx.createArrowFunctionExpression(valueTokenNode);
        }else if( !expr.isFunctionExpression ){
            if( expr.isCallExpression ){
                const isBind = expr.callee.isMemberExpression && expr.callee.property.value() === 'bind' &&
                            expr.arguments.length > 0 && expr.arguments[0].isThisExpression;           
                if(!isBind && valueTokenNode && valueTokenNode.type==='CallExpression'){
                    let disableCacheForVNode = valueTokenNode.arguments.length > 0;
                    valueTokenNode.arguments.push(ctx.createIdentifier('...args'));
                    valueTokenNode =  ctx.createArrowFunctionExpression(
                        valueTokenNode,
                        [
                            ctx.createIdentifier('...args')
                        ]
                    );
                    valueTokenNode.disableCacheForVNode = disableCacheForVNode;
                    return valueTokenNode;
                }
            }
            /*
            else if(expr.isMemberExpression || expr.isIdentifier){
                const desc = expr.descriptor();
                const isMethod = desc && (desc.isMethodDefinition && !desc.isAccessor);
                if(desc && (!desc.isAccessor && desc.isMethodDefinition)){
                if(isMethod){
                    return ctx.createCallExpression(
                        ctx.createMemberExpression([
                            valueTokenNode,
                            ctx.createIdentifier('bind')
                        ]), 
                        [ctx.createThisExpression()]
                    );
                }
            }*/
        }
    }
    return valueTokenNode;
}

function getBinddingEventName(stack){
    const bindding = getMethodAnnotations(stack, ['bindding'])
    if(bindding.length>0){
        const [annot] = bindding;
        const [args, result] = parseAnnotationArguments(annot.getArguments(), annotationIndexers.bindding)
        return result;
    }
    return null;
}

function createElementPropsNode(ctx, data, stack, excludes=null){
    const items = [];
    Object.entries(data).map( item=>{
        const [key, value] = item;
        if( key ==='slots' || key==='directives' || key==='keyProps'){
            return;
        }
        if(excludes && excludes.includes(key)){
            return;
        }
        if(value){
            if(key==='props' || key==='attrs' || key==='on'){
                if(Array.isArray(value)){
                    items.push( ...value ); 
                }else{
                    throw new Error(`Invalid ${key}`)
                }
            }else{
                if(value.type ==="Property"){
                    items.push( value );
                }else{
                    throw new Error(`Invalid ${key}`)
                }
            }
        }
    });

    const props = items.length > 0 ? ctx.createObjectExpression(items) : null;
    if(props && stack && stack.isComponent){
        const desc = stack.descriptor();
        if(desc && Utils.isModule(desc)){
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
    const ssr = !!ctx.options.ssr;
    const pushEvent=(name, node, category)=>{
        if(ssr && category==='on')return;
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

        if(category==='on'){
            if(property.computed){
                property.key = ctx.createTemplateLiteral([
                    ctx.createTemplateElement('on')
                ],[
                    ctx.createCallExpression(
                        createStaticReferenceNode(ctx, stack, 'System', 'firstUpperCase'),
                        [
                            property.key
                        ]
                    )
                ]);
            }else{
                property.key.value = 'on'+toFirstUpperCase(property.key.value);
                if(property.key.type==="Literal"){
                    property.key.raw = `"${property.key.value}"`;
                }
            }
        }
           
        events.push( property );
    }

    const createPropertyNode = (propName, propValue)=>{
        return ctx.createProperty(
            propName.includes('-') ? ctx.createLiteral(propName) : ctx.createIdentifier(propName),
            propValue
        )
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

    const descModule = stack.isWebComponent ? stack.descriptor() : null;
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
            pushEvent(name, createAttributeBindingEventNode(ctx, item, propValue), 'on')
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
        let binddingEventName = null;
        if( item.isMemberProperty ){
            if(ns ==="@binding"){
                const bindding = getBinddingEventName(item.description())
                if(bindding){
                    if(bindding.alias){
                        propName = bindding.alias;
                    }
                    binddingEventName = toCamelCase(bindding.event);
                }else if(attrLowerName ==='value'){
                    bindValuePropName = propName;
                    data.props.push(
                        createPropertyNode(
                            propName,
                            propValue
                        )
                    );
                    propName = 'modelValue';
                }
            }
            if(!isDOMAttribute){
                data.props.push(
                    createPropertyNode(
                        propName,
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
                let eventName = binddingEventName;
                if(!eventName){
                    eventName = propName;
                    if(propName ==='modelValue'){
                        eventName = 'update:modelValue';
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
                            ctx.createIdentifier('setRefNode')
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

        const property = createPropertyNode(
            propName,
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
                if(item.isMemberProperty){
                    data.props.push( property );
                }else{
                    data.attrs.push( property );
                }
        }
    });

    if(!data.key){
        data.key = createElementKeyPropertyNode(ctx, stack)
    }
}

const conditionElements = ['if','elseif','else'];
function createElementKeyPropertyNode(ctx, stack){
    const keys = ctx.options.esx.complete.keys;
    const fills = Array.isArray(keys) && keys.length > 0 ? keys : null;
    const all = keys === true;
    if(fills || all){
        let key = null;
        let direName = '*'
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
            if( !isForContext && stack.parentStack.isDirective && ['for','each'].includes(stack.parentStack.openingElement.name.value())){
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

        let isCondition = false;
        if(fills && fills.includes('condition')){
            if(!stack.isDirective && stack.directives && Array.isArray(stack.directives)){
                isCondition = stack.directives.some(directive=>conditionElements.includes(String(directive.name.value()).toLowerCase()));
            }
            if( !isCondition && !isForContext && stack.parentStack.isDirective){
                isCondition = conditionElements.includes(String(stack.parentStack.openingElement.name.value()).toLowerCase());
            }
        }

        if(all || isCondition || fills.includes(direName)){
            let count = ctx.cache.get(stack.compilation, 'createElementKeyPropertyNode::count');
            if(count==null)count = 0;
            ctx.cache.set(stack.compilation, 'createElementKeyPropertyNode::count', ++count);
            return ctx.createProperty(
                ctx.createIdentifier('key'),
                isForContext ? ctx.createBinaryExpression(
                        ctx.createLiteral(count+'-'),
                        ctx.createIdentifier( key || 'key'),
                        '+'
                    ) : ctx.createLiteral(count)
            );
        }
    }
}

function createComponentDirectiveProperties(ctx, stack, data, callback=null){
    if(stack){
        let desc = stack.descriptor();
        let parentIsComponentDirective = getComponentDirectiveAnnotation(desc);
        if(!parentIsComponentDirective){
            parentIsComponentDirective = isDirectiveInterface(desc)
        }
        if(parentIsComponentDirective){
            ctx.addDepend(desc);
            let [direModule, direName] = parentIsComponentDirective;
            let node = createResolveComponentDirective(ctx, stack, data, direModule, direName, false, callback);
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
    const node = createResolveComponentDirective(ctx, stack, data, null, null, true, callback);
    let res = false;
    if(node){
        res = true;
        data.directives.push(node);
    }
    if(stack.parentStack && stack.parentStack.isDirective && stack.jsxRootElement !== stack.parentStack){
        let dName = stack.parentStack.openingElement.name.value().toLowerCase();
        if( dName ==="custom" ){
            return createCustomDirectiveProperties(ctx, stack.parentStack, data, callback) || res;
        }
    }
    return res;
}

function createResolveComponentDirective(ctx, stack, data, direModule=null, direName=null, isCustom=false, callback=null){
    const props = [];
    const has = (items, name)=>items && items.some(prop=>prop.key.value===name);
    let expression = null;
    let modifier = null;
    let directive = direModule ? ctx.createIdentifier( ctx.getModuleReferenceName(direModule) ) : null;
    stack.openingElement.attributes.forEach( attr=>{
        if(attr.isAttributeXmlns || attr.isAttributeDirective)return;
        const name = attr.name.value()
        const lower = name.toLowerCase();
        if(lower ==='name' && isCustom){
            let value = attr.value;
            if(value && value.isJSXExpressionContainer){
                value = value.expression;
            }
            if(value){
                if(value.isLiteral){
                    directive = ctx.createToken(value);
                }else{
                    let desc = value.descriptor();
                    let result = null;
                    let isMember = desc && (desc.isMethodDefinition || desc.isPropertyDefinition);
                    if(isMember){
                        result = getComponentDirectiveAnnotation(desc.module); 
                    }else{
                        result = getComponentDirectiveAnnotation(desc);
                    }
                    if(result){
                        [direModule, direName,] = result;
                        ctx.addDepend(direModule);
                        if(isMember){
                            directive = ctx.createToken(value);
                        }else{
                            directive = ctx.createIdentifier( ctx.getModuleReferenceName(direModule, stack.module) );
                        }
                    }else if(isDirectiveInterface(desc)){
                        ctx.addDepend(desc);
                        direName = module.getName('-');
                        directive = ctx.createIdentifier( ctx.getModuleReferenceName(direModule, stack.module) );
                    }
                }
                if(!directive){
                    direName = attr.value.value();
                }
            }else{
                const range = stack.compilation.getRangeByNode( attr.name.node );
                console.warn(`No named value directive was specified.\r\n at ${stack.file}(${range.end.line}:${range.end.column})`);
            }
            return;
        }

        if(lower === 'value'){
            expression = attr.value ? ctx.createToken(attr.value) : ctx.createLiteral(false);
            return;
        }

        if(lower === 'modifier'){
            modifier = attr.value ? ctx.createToken(attr.value) : ctx.createObjectExpression();
            return;
        }

        const attrNode = ctx.createToken(attr);
        if(attrNode){
            const property = ctx.createProperty(
                attrNode.name, 
                attrNode.value,
            );
            property.loc = attrNode.loc;

            if(!has(data.attrs, name)){
                property.isInheritDirectiveProp = true
                data.attrs.push(property);
            }
            if(callback){
                callback(property);
            }
        }
    });

    if(direName){
        props.push(ctx.createProperty(
            ctx.createIdentifier('name'),
            ctx.createLiteral(direName)
        ))
    }

    if(directive){
        props.push(ctx.createProperty(
            ctx.createIdentifier('directiveClass'),
            directive
        ))
    }

    props.push(ctx.createProperty(
        ctx.createIdentifier('value'),
        expression || this.createLiteralNode(false)
    ));

    if( modifier ){
        props.push(properties.push(
            ctx.createProperty(
                ctx.createIdentifier('modifiers'),
                modifier
            )
        ));
    }

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
    if(!children){
        children = createCommentVNode(ctx, 'child is null');
    }
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
                    createForEachNode(ctx, argument.refs, children, item, key, stack);
                node.isForNode = true;
                return createFragmentVNode(ctx, node);
            }
    } 
    return null;
}

function createElementNode(ctx,stack,data,children){
    let name = null;
    if( stack.isComponent ){
        if( stack.jsxRootElement === stack && stack.parentStack.isProgram ){
            name = ctx.createLiteral("div");
        }else{
            let desc = stack.description();
            let isVar = stack.is(desc) && desc.isDeclarator;
            if(!isVar)desc = desc.type();
            if(!isVar && Utils.isModule(desc)){
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

    data = createElementPropsNode(ctx, data, stack);
    if(children){
        return ctx.createVNodeHandleNode(stack, name, data || ctx.createLiteral(null), children);
    }else if(data){
        return ctx.createVNodeHandleNode(stack, name, data);
    }else{
        return ctx.createVNodeHandleNode(stack, name);
    }
}

function getDepth(stack){
    let parentStack = stack.parentStack;
    while(parentStack){
        if(parentStack.isJSXElement || parentStack.isJSXExpressionContainer || parentStack.isMethodDefinition || parentStack.isBlockStatement || parentStack.isProgram)break;
        parentStack = parentStack.parentStack;
    }
    if( parentStack && (parentStack.isJSXElement || parentStack.isJSXExpressionContainer) ){
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

function makeNormalChildren(ctx, children){
    if(!children.length)return null;
    let childNods = ctx.createArrayExpression(children);
    let num = 0;
    childNods.newLine = children.some(item=>{
        if(item.type==="Literal"||item.type==="Identifier"){
            num++;
        }
        return item.type ==="CallExpression" || item.type==="ConditionalExpression" || item.isFragmentVNode;
    });
    if(num>1){
        childNods.newLine = true;
    }
    return childNods;
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
    let childNodes = makeNormalChildren(ctx, createChildren(ctx, children, data, stack))
    let desc = stack.descriptor();
    let componentDirective = getComponentDirectiveAnnotation(desc);
    let nodeElement = null;
    if( stack.isDirective && stack.openingElement.name.value().toLowerCase() ==="custom" ){
        componentDirective = true;
    }else if(stack.isComponent && isDirectiveInterface(desc)){
        componentDirective = true;
    }

    if(componentDirective){
        if(childNodes){
            if(childNodes.type == 'ArrayExpression'){
                if(childNodes.elements.length===1){
                    return childNodes.elements[0];
                }else{
                    return createFragmentVNode(ctx, childNodes)
                }
            }
        }
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

    if(!stack.isJSXFragment && !(isRoot && stack.openingElement.name.value()==='root')){
        createAttributes(ctx, stack, data)
    }

    const isWebComponent = stack.isWebComponent && !(stack.compilation.JSX && stack.parentStack.isProgram)
    if( isWebComponent ){
        const properties = []
        if( childNodes ){
            properties.push( ctx.createProperty(
                ctx.createIdentifier('default'), 
                createWithCtxNode(
                    ctx,
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
        if(childNodes && childNodes.type == 'ArrayExpression'){
            if(childNodes.elements.length > 1){
                childNodes = createFragmentVNode(ctx, childNodes)
            }else{
                childNodes = childNodes.elements[0];
            }
        }
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
    nodeElement.hasKeyAttribute = !!data.key;
    nodeElement.hasRefAttribute = !!data.ref;
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
    createToDisplayStringNode,
    createChildren,
    createChildNode,
    createElementPropsNode,
    createElementNode,
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
    createNormalChildrenVNode,
    getComponentEmitAnnotation,
    getCascadeConditional,
    getBinddingEventName,
    getChildren,
    getDepth,
    getComponentDirectiveAnnotation,
    isDirectiveInterface,
    makeNormalChildren,
}