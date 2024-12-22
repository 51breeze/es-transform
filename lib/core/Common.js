import fs from 'fs';
import path from 'path';
import Utils from 'easescript/lib/core/Utils'
import {getCacheManager} from './Cache'
import Namespace from 'easescript/lib/core/Namespace'
import {createHash} from 'crypto';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
const Cache = getCacheManager('common');
const emptyObject = {};
const emptyArray = [];
const annotationIndexers = {
    env:['name','value','expect'],
    runtime:['platform','expect'],
    syntax:['plugin','expect'],
    plugin:['name','expect'],
    version:['name','version','operator','expect'],
    readfile:['dir','load','suffix','relative','lazy','only','source'],
    http:['classname','action', 'param', 'data','method','config'],
    router:['classname','action','param'],
    alias:['name', 'version'],
    hook:['type', 'version'],
    url:['source'],
}

const compareOperatorMaps = {
    '>=':'egt',
    '<=':'elt',
    '!=':'neq',
    '>':'gt',
    '<':'lt',
    '=':'eq',
}
const compareOperators = ['>=','<=','!=','>','<','='];

let beginNumericRE = /^\d+/;
function beginNumericLiteral(value){
    return beginNumericRE.test(value)
}

function normalizePropertyKey(name, prefix=''){
    name = name.replace(/[\.\-\s]/g,(v)=>{
        if(v=='-'||v=='.'||v=='_')return '_';
        return '';
    }).toLowerCase();
    if( prefix ){
        name = name.slice(0,1).toUpperCase() + name.slice(1);
    }
    return prefix + name
}

function parseMacroAnnotation(annotation){
    if(!(annotation.isAnnotationDeclaration || annotation.isAnnotationExpression)){
        return null;
    }
    const annName = annotation.getLowerCaseName();
    const indexes = annotationIndexers[annName];
    if(!indexes){
        throw new Error(`Annotation arguments is not defined. the '${annName}' annotations.`)
    }
    const args = annotation.getArguments();
    if(!args.length)return emptyObject
    return parseMacroArguments(args, annName, indexes)
}

function parseMacroArguments(args, name, indexes=null){
    indexes = indexes || annotationIndexers[name]
    const _expect = getAnnotationArgument('expect', args, indexes);
    const expect = _expect ? String(_expect.value).trim() !== 'false' : true;
    switch( name ){
        case "runtime" :
        case "syntax" :
            return {
                value:getAnnotationArgumentValue(args[0]),
                expect
            }
        case "env" :{
            const _name = getAnnotationArgument('name', args, indexes);
            const _value = getAnnotationArgument('value', args, indexes);
            if(_value && _name){
                return {
                    name:getAnnotationArgumentValue(_name),
                    value:getAnnotationArgumentValue(_value),
                    expect
                }
            }else{
                return emptyObject
            }
        }
        case 'version' :{
            const name = getAnnotationArgument('name', args, indexes);
            const version = getAnnotationArgument('version', args, indexes);
            const operator = getAnnotationArgument('operator', args, indexes);
            if(name && version){
                return {
                    name:getAnnotationArgumentValue(name),
                    version:getAnnotationArgumentValue(version),
                    operator:getAnnotationArgumentValue(operator) || 'elt',
                    expect
                }
            }else{
                return emptyObject
            }
        }
    }
    return null
}

function parseMacroMethodArguments(args, name){
    args = args.map( (item,index)=>{
        let value = null;
        let key = index;
        let assigned = false;
        if(item.isAssignmentExpression){
            assigned = true;
            key = item.left.value();
            value = item.right.value();
        }else{
            value = item.value(); 
        }
        return {index,key,value,assigned,stack:item};
    });
    return parseMacroArguments(args, name)
}

function parseReadfileAnnotation(ctx, stack){

    let args = stack.getArguments();
    let indexes = annotationIndexers.readfile;
    let stackArgs = {}
    let annotArgs = indexes.map( key=>{
        return stackArgs[key] = getAnnotationArgument(key, args, indexes)
    });
    let dirStack = annotArgs[0] && annotArgs[0].stack;
    let [_path, _load, _suffix, _relative, _lazy, _only, _source] = annotArgs.map( item=>{
        return item ? item.value : null;
    });

    if(!_path){
        return null;
    }
  
    let dir = String(_path).trim();
    let [load, relative, lazy, only, source]= [_load, _relative, _lazy, _only, _source].map(value=>{
        value = String(value).trim();
        return value=='true' || value==='TRUE'
    })

    let suffixPattern = null;
    if(dir.charCodeAt(0) === 64){
        dir = dir.slice(1);
        let segs = dir.split('.');
        let precede = segs.shift();
        let latter = segs.pop();
        let options = ctx.plugin[precede];
        if(precede==='options'){
            while(options && segs.length>0){
                options = options[segs.shift()];
            }
        }
        if(options && Object.prototype.hasOwnProperty.call(options, latter)){
            dir = options[latter];
        }
    }

    let rawDir = dir;
    dir = stack.compiler.resolveManager.resolveSource(dir, stack.compilation.file);
    if(!dir){
        ctx.error(`Readfile not found the '${rawDir}' folders`, dirStack || stack)
        return null;
    }

    if(_suffix){
        _suffix = String(_suffix).trim();
        if(_suffix.charCodeAt(0) === 47 && _suffix.charCodeAt(_suffix.length-1) === 47){
            let index = _suffix.lastIndexOf('/');
            let flags = '';
            if(index>0 && index !== _suffix.length-1){
                flags = _suffix.slice(index);
                _suffix = _suffix(0, index);
            }
            _suffix = suffixPattern = new RegExp(_suffix.slice(1,-1), flags);
        }else{
            _suffix = _suffix.split(',').map(item=>item.trim());
        }
    }

    let extensions = (stack.compiler.options.extensions || []).map(ext=>String(ext).startsWith('.') ? ext : '.'+ext);
    if(!extensions.includes('.es')){
        extensions.push('.es')
    }

    let suffix = _suffix || [...extensions, '.json', '.env', '.js','.css', '.scss', '.less'];
    const checkSuffix=(file)=>{
        if(suffixPattern){
            return suffixPattern.test(filepath);
        }
        if(suffix==='*')return true;
        return suffix.some( item=>file.endsWith(item) );
    }

    let files = stack.compiler.resolveFiles(dir).filter(checkSuffix)
    if(!files.length)return null;
    files.sort((a,b)=>{
        a = a.replaceAll('.', '/').split('/').length;
        b = b.replaceAll('.', '/').split('/').length;
        return a - b;
    });

    return {
        args:stackArgs,
        dir,
        only,
        suffix,
        load,
        relative,
        source,
        lazy,
        files
    }
}

function parseUrlAnnotation(ctx,stack){
    const args = stack.getArguments();
    return args.map(arg=>{
        if(arg && arg.resolveFile){
            const asset = (stack.module||stack.compilation).assets.get(arg.resolveFile);
            if(asset){
                return {
                    id:asset.assign,
                    file:asset.file,
                    resolve:arg.resolveFile
                }
            }
        }
        return null;
    }).filter(Boolean)
}

function parseEnvAnnotation(ctx,stack){
    const args = stack.getArguments();
    return args.map(item=>{
        let key = item.assigned ? item.key : item.value
        let value = ctx.options.metadata.env[key] || process.env[key]
        if(!value && item.assigned){
            value = item.value;
        }
        let type = typeof value;
        if(value != null && (type==='number' || type==='string' || type==='boolean' || type==='bigint')){
            return {
                key,
                value
            }
        }
    }).filter(Boolean)
}

function parseHttpAnnotation(ctx,stack){
    const args = stack.getArguments();
    const indexes=annotationIndexers.indexes;
    const [moduleClass, actionArg, paramArg, dataArg, methodArg, configArg ] = indexes.map(key=>getAnnotationArgument(key, args, indexes))
    const providerModule = moduleClass ? Namespace.globals.get(moduleClass.value) : null;
    if( !providerModule ){
        ctx.error(`Class '${moduleClass.value}' is not exists.`);
    }else{
        const member = actionArg ? providerModule.getMember(actionArg.value) : null;
        if(!member || !Utils.isModifierPublic(member) || 
            !(member.isMethodDefinition && !(member.isMethodGetterDefinition || member.isMethodSetterDefinition) ) ){
            ctx.error(`Method '${moduleClass.value}::${actionArg && actionArg.value}' is not exists.`, actionArg ? actionArg.stack : stack);
        }else{
            return {
                args:{
                    data:dataArg,
                    param:paramArg,
                    config:configArg,
                    method: methodArg,
                    action:actionArg,
                    module:moduleClass
                },
                module:providerModule,
                method:member
            };
        }
    }
    return null;
}

function parseRouterAnnotation(ctx,stack){
    const args = stack.getArguments();
    const indexes= annotationIndexers.router
    const [moduleClass, actionArg, paramArg ] = indexes.map(key=>getAnnotationArgument(key, args, indexes))
    const module = moduleClass ? Namespace.globals.get(moduleClass.value) : null;
    if( !module ){
        ctx.error(`Class '${moduleClass.value}' is not exists.`);
    }else{
        if(Utils.isModule(module) && module.isClass && stack.isModuleForWebComponent(module)){
            return {
                isWebComponent:true,
                args:{
                    module:moduleClass,
                    action:actionArg,
                    param:paramArg
                },
                module
            }
        }else{
            const method = actionArg ? module.getMember(actionArg.value) : null;
            if( !method || !Utils.isModifierPublic(method) || 
                !(method.isMethodDefinition && !(method.isMethodGetterDefinition || method.isMethodSetterDefinition) ) ){
                ctx.error(`Method '${moduleClass.value}::${actionArg && actionArg.value}' is not exists.`, actionArg ? actionArg.stack : stack);
            }else{
                return {
                    args:{
                        module:moduleClass,
                        action:actionArg,
                        param:paramArg
                    },
                    module,
                    method
                }
            }
        }
    }
    return null
}

function parseDefineAnnotation(annotation){
    const args = annotation.getArguments();
    const data = Object.create(null)
    args.forEach(arg=>{
        if(arg.assigned){
            data[String(arg.key).toLowerCase()] = arg.value
        }else{
            data[String(arg.value).toLowerCase()] = true
        }
    })
    return data;
}

function parseHookAnnotation(annotation, pluginVersion='0.0.0', optionVersion={}){ 
    const args = annotation.getArguments();
    if(args.length >= 1) {
        const [type, version] = getAnnotationArguments(
            args, 
            annotationIndexers.hook
        ).map(item=>getAnnotationArgumentValue(item));

        if(version){
            const result = parseVersionExpression(version, pluginVersion, optionVersion)
            if(result){
                if(compareVersion(result.left, result.right, result.operator) ){
                    return {
                        type
                    }
                }
            }
            return false;
        }else{
            return {
                type
            } 
        }
    }else{
        console.error('[es-transform] Annotations hook missing arguments')
        return false;
    }
}

function parseAliasAnnotation(annotation, pluginVersion, optionVersions={}){
    if(!annotation)return null;
    const args = annotation.getArguments();
    if(args.length > 0){
        const indexes = annotationIndexers.alias;
        const [name,version] = getAnnotationArguments(args, indexes).map(arg=>getAnnotationArgumentValue(arg))
        if(name){
            if(version){
                const result = parseVersionExpression(version, pluginVersion, optionVersions)
                if(result){
                    if(compareVersion(result.left, result.right, result.operator)){
                        return name;
                    }
                }
            }else{
                return name;
            }
        }
    }
    return null;
}

function getModuleAnnotations(module, allows = [], inheritFlag=true){
    if(!Utils.isModule(module) || !allows.length)return emptyArray;
    let key = `getModuleAnnotations:${String(inheritFlag)}:${allows.join('-')}`;
    let old = Cache.get(module, key);
    if(old)return old
    let result = [];
    module.getAnnotations(annotation=>{
        if(allows.includes(annotation.getLowerCaseName())){
            result.push(annotation)
        }
    },inheritFlag);
    Cache.set(module, key, result)
    return result;
}

function getMethodAnnotations(methodStack, allows = [], inheritFlag=true){
    if(!Utils.isStack(methodStack) || !(methodStack.isMethodDefinition || methodStack.isPropertyDefinition))return emptyArray;
    let result = [];
    let key = `getMethodAnnotations:${String(inheritFlag)}:${allows.join('-')}`;
    let old = Cache.get(methodStack, key);
    if(old)return old
    methodStack.findAnnotation(methodStack, (annotation)=>{
        if(allows.includes(annotation.getLowerCaseName())){
            result.push(annotation)
        }
    }, inheritFlag);
    Cache.set(methodStack, key, result)
    return result;
}

function getSourceAnnotations(stack){
    if(!Utils.isStack(stack))return emptyArray;
    if(!stack.module)return emptyArray;
    let module = stack.module;
    let statcks = null;
    if(stack.isMethodDefinition || stack.isPropertyDefinition){
        statcks = module.descriptors.get(stack.value());
        if(statcks){
            let isStatic = !!stack.static;
            statcks = statcks.filter(stack=>(!!stack.static) === isStatic);
        }
        if(stack.isMethodDefinition){
            if(stack.isMethodGetterDefinition){
                statcks = statcks.filter(stack=>!!stack.isMethodGetterDefinition);
            }else if(stack.isMethodSetterDefinition){
                statcks = statcks.filter(stack=>!!stack.isMethodSetterDefinition);
            }
        }
    }else if(stack.isClassDeclaration || stack.isDeclaratorDeclaration || stack.isInterfaceDeclaration || (stack.isEnumDeclaration && !stack.isExpression) || stack.isStructTableDeclaration){
        statcks = module.getStacks();
    }else{
        return emptyArray;
    }
    if(Array.isArray(statcks) && statcks.length>0){
        if(statcks.length > 1){
            return statcks.reduce((acc, stack)=>{
                if(Array.isArray(stack.annotations)){
                    acc.push(...stack.annotations)
                }
                return acc;
            }, []);
        }else if(statcks.length>0){
            return statcks[0].annotations || emptyArray;
        }
    }
    return emptyArray;
}

function getAnnotationArgument(name, args, indexes=null){
    name = String(name).toLowerCase()
    let index = args.findIndex(item=>{
        const key = String(item.key).toLowerCase();
        return key===name;
    });
    if( index < 0 && indexes && Array.isArray(indexes)){
        index = indexes.indexOf(name);
        if( index>= 0 ){
            const arg = args[index];
            return arg && !arg.assigned ? arg : null;
        }
    }
    return args[index];
}

function getAnnotationArguments(args, indexes=[]){
    return indexes.map(key=>getAnnotationArgument(key, args, indexes))
}

function getAnnotationArgumentValue(argument){
   return argument ? argument.value : null
}

function isEmptyObject(value){
    return emptyObject === value;
}

function isRuntime(name , metadata={}){
    name = String(name).toLowerCase();
    if(!(name==='client' || name==='server'))return false;
    return compare(metadata.platform, name) || compare(process.env.platform, name);
}

function compare(left, right){
    if(!left || !right)return false
    if(left === right)return true
    left = String(left)
    right = String(right)
    return left.toLowerCase() === right.toLowerCase()
}

function isSyntax(name, value){
    if(!name)return false;
    if(name === value)return true;
    return compare(name, value);
}

function isEnv(name, value, options={}){
    const metadata = options.metadata || {};
    const env = metadata?.env || {};
    let lower = String(name).toLowerCase();
    if(value !== void 0){
        if(process.env[name]===value)return true;
        if(lower==='mode'){
            if(options.mode === value || process.env.NODE_ENV===value){
                return true;
            }
        }
        if(lower==='hot'){
            if(options.hot === value){
                return true;
            }
        }
        return env[name] === value;
    }
    return false;
}

function toVersion(value){
    const [a="0",b="0",c="0"] = Array.from( String(value).matchAll( /\d+/g ) ).map( item=>item ? item[0].substring(0,2) : "0" );
    return [a,b,c].join('.');
}

function compareVersion(left, right, operator='elt'){
    operator = operator.toLowerCase();
    if( operator === 'eq' && left == right)return true;
    if( operator === 'neq' && left != right)return true;
    const toInt = (val)=>{
        val = parseInt(val);
        return isNaN(val) ? 0 : val;
    }
    left = String(left).split('.',3).map( toInt );
    right = String(right).split('.',3).map( toInt );
    for(let i=0;i<left.length;i++){
        let l = left[i] || 0;
        let r = right[i] || 0;
        if( operator === 'eq' ){
            if( l != r ){
                return false;
            }
        }else{
            if( l != r ){
                if( operator === 'gt' && !(l > r) ){
                    return false;
                }else if( operator === 'egt' && !(l >= r) ){
                    return false;
                }else if( operator === 'lt' && !(l < r) ){
                    return false;
                }else if( operator === 'elt' && !(l <= r) ){
                    return false;
                }else if( operator === 'neq' ){
                    return true;
                }
                return true;
            }
        }
    }
    return operator === 'eq' || operator === 'egt' || operator === 'elt';
}

function createRoutePath(route, params={}){
    if(!route||!route.path||!route.isRoute){
        throw new Error('route invalid')
    }
    params = Object.assign({}, route.params||{}, params);
    return '/'+route.path.split('/').map( (segment,index)=>{
        if( segment.charCodeAt(0)===58 ){
            segment = segment.slice(1)
            const optional = segment.charCodeAt(segment.length-1)===63;
            if(optional){
                segment = segment.slice(0,-1);
            }
            if( params[segment] ){
                return params[segment]
            }
            if( !optional ) {
                console.error(`[es-transform] Route params the "${segment}" missing default value or set optional. on page-component the "${route.path}"`)
            }
            return null;
        }
        return segment;
    }).filter( val=>!!val ).join('/')
}

function getModuleRoutes(module, allows = ['router'], options={}){
    if(!Utils.isModule(module)||!module.isClass)return [];
    const routes = [];
    const annotations = getModuleAnnotations(module, allows);
    if( annotations && annotations.length){
        annotations.forEach( annotation=>{
            const args = annotation.getArguments();
            let annotName = annotation.getLowerCaseName();
            let method = annotName;
            if(annotName ==='router'){
                method = '*';
                const methodArg = getAnnotationArgument('method', args, []);
                if(methodArg){
                    method = String(methodArg.value).toLowerCase();
                }
            }
            const pathArg = getAnnotationArgument('path', args, ['path']);
            const defaultValue = {};
            const params = args.filter(arg=>!(arg===method || arg===pathArg)).map( item=>{
                return getModuleRouteParamRule(item.assigned ? item.key : item.value, item.stack, defaultValue)
            });

            let withNs = options.routePathWithNamespace?.client;
            let className = module.getName('/');
            let pathName =pathArg ? pathArg.value : withNs === false ? module.id : className;
            if(pathName.charCodeAt(0) ===47){
                pathName = pathName.substring(1)
            }

            if(pathName.charCodeAt(pathName.length-1) ===47){
                pathName = pathName.slice(0,-1)
            }

            let segments = [pathName].concat(params)
            let routePath = '/'+segments.join('/');
            let formatRoute = options.formation?.route;
            if(formatRoute){
                routePath = formatRoute(routePath, {
                    pathArg,
                    params,
                    method,
                    defaultParamsValue:defaultValue,
                    className:module.getName()
                }) || routePath;
            }
            routes.push({
                isRoute:true,
                name:className,
                path:routePath,
                params:defaultValue,
                method,
                module:module
            });

        });
    }
    return routes;
}

function getModuleRouteParamRule(name, annotParamStack, defaultValue={}){
    let question = annotParamStack.question || annotParamStack.node.question;
    if(annotParamStack.isAssignmentPattern){
        if(!question)question=annotParamStack.left.question || annotParamStack.left.node.question
        if(annotParamStack.right.isIdentifier || annotParamStack.right.isLiteral){
            defaultValue[name] = annotParamStack.right.value();
        }else{
            const gen = new Generator();
            gen.make(this.createToken(annotParamStack.right))
            defaultValue[name] = gen.toString();
        }
    }
    return question ? ':'+name+'?' : ':'+name;
}

function parseVersionExpression(expression, pluginVersion='0.0.0', optionVersions={}){
    expression = String(expression).trim();
    const token = compareOperators.find( (value)=>{
        return expression.includes(value) || expression.includes( compareOperatorMaps[value] );
    });
    if(!token){
        throw new Error('Version expression operator is invalid. availables:'+compareOperators.join(', '))
    }
    const operation = expression.includes(token) ? token : compareOperatorMaps[token];
    const segs = expression.split(operation, 2).map(val=>val.trim());
    if(!segs[0])segs[0] = pluginVersion;
    else if(!segs[1])segs[1] = pluginVersion;
    if(segs.length===2){
        let left = segs[0];
        let right = segs[1];
        if(!beginNumericLiteral(left)){
            left = optionVersions[left] || '0.0.0'
        }
        if(!beginNumericLiteral(right)){
            right = optionVersions[right] || '0.0.0'
        }

        if(left && right){
            return {
                left:toVersion(left),
                right:toVersion(right),
                operator:compareOperatorMaps[token]
            }
        }
    }else{
        throw new Error('Version expression parse failed')
    }
}

function createFormatImportSpecifiers(stack){
    return stack.specifiers.map(spec=>{
        if(spec.isImportDefaultSpecifier){
            return {
                local:spec.value(),
                stack:spec
            }
        }else if(spec.isImportSpecifier){
            return {
                local:spec.value(),
                imported:spec.imported.value(),
                stack:spec
            }
        }else if(spec.isImportNamespaceSpecifier){
            return {
                local:spec.value(),
                imported:'*',
                stack:spec
            }
        }
    });
}

function parseImportDeclaration(ctx, stack, context=null, graph=null){
    let importSource = null
    if(!context){
        context = stack.compilation;
    }
    if(!graph && context){
        graph = ctx.getBuildGraph(context)
    }
    if(stack.source.isLiteral){
        let compilation = stack.getResolveCompilation();
        let source = stack.getResolveFile() || stack.source.value();
        let specifiers = null;
        let ownerModule = null;
        if(compilation && !compilation.isDescriptorDocument()){
            source =  ctx.getModuleImportSource(source, stack.compilation.file);
            specifiers = createFormatImportSpecifiers(stack);
            ctx.addDepend(compilation)
        }else{
            if(stack.additional && stack.additional.isDeclaratorDeclaration){
                ownerModule = stack.additional.module;
            }
            let isLocal = fs.existsSync(source);
            specifiers = createFormatImportSpecifiers(stack)
            source = ctx.getImportAssetsMapping(source, {
                group:'imports', 
                source,
                specifiers,
                ctx,
                context
            });
            if(isLocal && source){
                let asset = ctx.createAsset(source)
                source = ctx.getAssetsImportSource(asset, stack.compilation)
                graph.addAsset(asset)
            }
        }

        if(source){
            if(specifiers.length>0){
                specifiers.forEach(spec=>{
                    let local = spec.local;
                    if(ownerModule && spec.local === ownerModule.id){
                        local = ctx.getModuleReferenceName(ownerModule, context);
                    }
                    importSource = ctx.addImport(source, local, spec.imported, spec.stack)
                })
            }else{
                importSource = ctx.addImport(source, null, null, stack.source)
            }
            if(compilation){
                importSource.setSourceTarget(compilation);
            }
        }

    }else{
        const classModule = stack.description();
        if(classModule && classModule.isModule && ctx.isActiveModule(classModule) && ctx.isNeedBuild(classModule)){
            let local = stack.alias ? stack.alias.value() : classModule.id;
            let source = ctx.getModuleImportSource(classModule, Utils.isModule(context) ? context : stack.compilation);
            importSource = ctx.addImport(source, local, null, stack.source)
            importSource.setSourceTarget(classModule);
        }
    }
    if(importSource){
        importSource.stack = stack;
        if(graph){
            graph.addImport(importSource)
        }
    }
    return importSource;
}


const allMethods = ['get','post','put','delete','option','router'];
function createHttpAnnotationNode(ctx,stack){
    const result = parseHttpAnnotation(ctx, stack)
    if(!result)return null;
    const {param, method, data, config} = result.args
    const routeConfigNode = createRouteConfigNode(ctx, result.module, result.method, param);
    const createArgNode =( argItem )=>{
        if( argItem ){
            if( argItem.stack.isAssignmentPattern ){
                return ctx.createToken( argItem.stack.right );
            }else{
                return ctx.createToken( argItem.stack );
            }
        }
        return null;
    }
    const System = Namespace.globals.get("System");
    const Http = Namespace.globals.get("net.Http");
    ctx.addDepend( System, stack.module);
    ctx.addDepend( Http, stack.module);

    const props = {
        data:createArgNode(data),
        options:createArgNode(config),
        method: method && allMethods.includes(method.value) ? ctx.createLiteral(method.value) : null
    };
    const properties = Object.keys(props).map( name=>{
        const value = props[name];
        if( value ){
            return ctx.createProperty(ctx.createIdentifier(name), value);
        }
        return null;
    }).filter( item=>!!item );

    let calleeArgs = [
        ctx.createIdentifier(
            ctx.getGlobalRefName( 
                stack,
                ctx.getModuleReferenceName(Http, stack.module)
            ) 
        ),
        routeConfigNode
    ];

    if( properties.length>0 ){
        calleeArgs.push(ctx.createObjectExpression(properties));
    }
    
    return ctx.createCallExpression(
        ctx.createMemberExpression([
            ctx.createIdentifier(
                ctx.getGlobalRefName(
                    stack,
                    ctx.builder.getModuleReferenceName(System, stack.module)
                )
            ),
            ctx.createIdentifier('createHttpRequest')
        ]),
        calleeArgs,
        stack
    );
}

function createUrlAnnotationNode(ctx,stack){
    let result = parseUrlAnnotation(ctx, stack)
    if(result.length>0){
        let items = result.map(item=>{
            if(item.id)return ctx.createIdentifier(item.id)
            return ctx.createLiteral(item.resolve)
        });
        if(items.length>1){
            return ctx.createArrayExpression(items)
        }else{
            return items[0];
        }
    }
    return ctx.createLiteral('');
}

function createEmbedAnnotationNode(ctx,stack){
    let result = parseUrlAnnotation(ctx, stack)
    if(result.length>0){
        let items = result.map(item=>{
            if(item.id)return ctx.createIdentifier(item.id)
            return ctx.createLiteral(
                ctx.getRelativePath(stack.file, item.resolve)
            )
        });
        if(items.length>1){
            return ctx.createArrayExpression(items)
        }else{
            return items[0];
        }
    }
    return ctx.createLiteral('');
}

function createEnvAnnotationNode(ctx,stack){
    let result = parseEnvAnnotation(ctx, stack)
    if(result.length>0){
        let properties = result.map(item=>{
           return ctx.createProperty(ctx.createIdentifier(item.key), ctx.createLiteral(item.value))
        });
        return ctx.createObjectExpression(properties)
    }
    return ctx.createLiteral(null);
}

function createRouterAnnotationNode(ctx,stack){
    const result = parseHttpAnnotation(ctx, stack)
    if(!result)return null;
    if(result.isWebComponent){
        let route = getModuleRoutes(result.module, ['router'], ctx.options);
        if(route && Array.isArray(route) )route = route[0];
        if(!route){
            return ctx.createLiteral(result.module.getName('/'));
        }
        const paramArg = result.args.param
        if(!paramArg){
            return ctx.createLiteral(createRoutePath(route))
        }else{
            const System = Namespace.globals.get("System");
            const routePath = '/'+route.path.split('/').map( segment=>{
                if( segment.charCodeAt(0)===58 ){
                    return  '<'+segment.slice(1)+'>'
                }
                return segment;
            }).filter( val=>!!val ).join('/');
            let paramNode = ctx.createToken(paramArg.assigned ? paramArg.stack.right :  paramArg.stack);
            ctx.addDepend(System, stack.module);
            if( route.params ){
                const defaultParams = ctx.createObjectExpression(
                    Object.keys(route.params).map( name=>{
                        const value = route.params[name];
                        return ctx.createProperty(ctx.createIdentifier(name), ctx.createLiteral(value));
                    })
                );
                paramNode = ctx.createCallExpression(
                    ctx.createMemberExpression([
                        ctx.createIdentifier('Object'),
                        ctx.createIdentifier('assign')
                    ]),
                    [
                        defaultParams,
                        paramNode
                    ]
                );
            }
            return ctx.createCallExpression(
                ctx.createMemberExpression([
                    ctx.createIdentifier(
                        ctx.getGlobalRefName(
                            stack,
                            ctx.getModuleReferenceName(System, stack.module)
                        ),
                        stack
                    ),
                    ctx.createIdentifier('createHttpRoute', stack)
                ]),
                [
                    ctx.createLiteral(routePath), 
                    paramNode
                ],
                stack
            );
        }

    }else{
        return createRouteConfigNode(ctx, result.module, result.method, result.args.param);
    }
}

function createMainAnnotationNode(ctx, stack){
    if(!stack || !stack.isMethodDefinition)return;
    const main = Array.isArray(stack.annotations) ? 
                stack.annotations.find(stack=>stack.getLowerCaseName() ==='main') :
                null;
    if(!main)return;
    let callMain = ctx.createCallExpression(
        ctx.createMemberExpression([
            ctx.createIdentifier(stack.module.id),
            ctx.createIdentifier(stack.key.value())
        ])
    );
    const args = main ? main.getArguments() : [];
    const defer = args.length>0 ? !(String(args[0].value).toLowerCase() ==='false') : true;
    if(defer){
        callMain = ctx.createCallExpression(
            createStaticReferenceNode(ctx, stack, 'System', 'setImmediate'),
            [
                ctx.createArrowFunctionExpression(callMain)
            ]
        )
    }
    return callMain;
}

function createRouteConfigNode(ctx, module, method, paramArg){
    if(!Utils.isStack(method) || !method.isMethodDefinition){
        throw new Error(`method invalid`)
    }
    const annotations = method.annotations;
    const annotation = annotations && annotations.find( (item)=>{
        return allMethods.includes(item.getLowerCaseName());
    });
    const mapNameds = ['path'];
    const args = annotation ? annotation.getArguments() : [];
    const pathArg = annotation ? getAnnotationArgument(mapNameds[0], args, mapNameds) : null;
    const actionName = method.value();
    const value = String(pathArg ? pathArg.value : actionName);
    const defaultParams = [];
    const declareParams = (method.params||[]).map( item=>{
        const required = !(item.question || item.isAssignmentPattern);
        const question = required ? '' : '?';
        if( item.isAssignmentPattern ){
            if( item.right.isLiteral ){
                defaultParams.push(ctx.createProperty(ctx.createIdentifier(item.value()),ctx.createToken(item.right)))
            }else{
                item.right.error(10101, item.value())
            }
        }
        return `<${item.value()}${question}>`;
    });

    const uri = declareParams.length > 0 ? [value].concat(declareParams).join('/') : value;
    let url = uri;

    if(uri.charCodeAt(0)!==47){
        const withNs = ctx.options.routePathWithNamespace?.server;
        url = withNs ? `/${module.getName('/')}/${uri}` : `/${module.id}/${uri}`;
    }

    let allowMethodNode = ctx.createLiteral( annotation ? annotation.getLowerCaseName() : '*');
    let allowMethodNames = annotation ? annotation.getLowerCaseName() : '*';
    if( annotation && annotation.getLowerCaseName() ==='router' ){
        const allowMethods = args.filter( item=>item !== pathArg );
        if( allowMethods.length > 0 ){
            allowMethodNames = allowMethods.map( item=>item.value ).join(',')
            allowMethodNode = ctx.createArrayExpression( allowMethods.map( item=>ctx.createLiteral(item.value) ) );
        }else{
            allowMethodNode = ctx.createLiteral('*');
        }
    }

    let formatRoute = ctx.options.formation?.route;
    if(formatRoute){
        url = formatRoute(url, {
            action:actionName,
            pathArg:value,
            method:allowMethodNames,
            params:declareParams,
            className:module.getName()
        }) || url;
    }
   
    let paramNode = null;
    if( paramArg ){
        if( paramArg.stack.isAssignmentPattern ){
            paramNode = ctx.createToken( paramArg.stack.right );
        }else{
            paramNode = ctx.createToken( paramArg.stack );
        }
    }

    const props = {
        url:ctx.createLiteral(url),
        param:paramNode,
        allowMethod:allowMethodNode
    };

    if( defaultParams.length > 0 ){
        props['default'] = ctx.createObjectExpression(defaultParams);
    }

    return ctx.createObjectExpression(
        Object.keys(props).map( name=>{
            const value = props[name];
            if( value ){
                return ctx.createProperty(name, value);
            }
            return null;
        }).filter( item=>!!item )
    );
}

function createReadfileAnnotationNode(ctx, stack){
    const result = parseReadfileAnnotation(ctx, stack)
    if(!result)return  null;
    const addDeps=(source, local)=>{
        source = ctx.getSourceFileMappingFolder(source) || source;
        ctx.addImport(source, local)
    }

    const fileMap = {};
    const localeCxt = result.dir.toLowerCase()
    const getParentFile=(pid)=>{
        if(fileMap[pid] ){
            return fileMap[pid]
        }
        if(localeCxt !==pid && pid.includes(localeCxt)){
            return getParentFile(path.dirname(pid))
        }
        return null;
    }

    const dataset = [];
    const namedMap = new Set();
    const only = result.only;
    result.files.forEach( file=>{
        const pid = path.dirname(file).toLowerCase();
        const named = path.basename(file,path.extname(file));
        const id = (pid+'/'+named).toLowerCase();
        const filepath = result.relative ? ctx.compiler.getRelativeWorkspacePath(file) : file;
        let item = {
            path:filepath,
            isFile:fs.statSync(file).isFile()
        }
        if(item.isFile && result.load){
            let data = '';
            if(file.endsWith('.env')){
                const content = dotenv.parse(fs.readFileSync(file));
                dotenvExpand.expand({parsed:content})
                data = JSON.stringify(content);
            }else{
                if(result.lazy){
                    data = `import('${file}')`
                }else{
                    namedMap.add(file);
                    data = ctx.getGlobalRefName(stack, '_'+named.replaceAll('-', '_') +namedMap.size);
                    addDeps(file, data);
                }
            }
            item.content = data;
        }else if(result.source){
            item.content =JSON.stringify(fs.readFileSync(file));
        }
        const parent = getParentFile(pid);
        if( parent ){
            const children = parent.children || (parent.children = []);
            children.push(item);
        }else{
            fileMap[id+path.extname(file)] = item;
            dataset.push(item);
        }
    });

    const make = (list)=>{
        return list.map( object=>{
            if(only){
                return object.content ? ctx.createChunkExpression(object.content) : ctx.createLiteral(null);
            }
            const properties = [
                ctx.createProperty(
                    ctx.createIdentifier('path'), 
                    ctx.createLiteral(object.path)
                )
            ];
            if(object.isFile){
                properties.push(ctx.createProperty(ctx.createIdentifier('isFile'), ctx.createLiteral(true)))
            }
            if(object.content){
                properties.push(ctx.createProperty(ctx.createIdentifier('content'),ctx.createChunkExpression(object.content)))
            }
            if(object.children){
                properties.push(ctx.createProperty(ctx.createIdentifier('children'),ctx.createArrayExpression(make(object.children))))
            }
            return ctx.createObjectExpression(properties)
        });
    }

    return ctx.createArrayExpression(make(dataset))
}

function createImplementIteratorMethodNode(ctx, module){
    const iteratorType = Namespace.globals.get("Iterator");
    if(module.implements.includes(iteratorType) ){
        const key = ctx.createIdentifier('Symbol.iterator')
        key.computed = true;

        const block = ctx.createBlockStatement()
        block.body.push(
            ctx.createReturnStatement(
                ctx.createThisExpression()
            )
        )

        const method = ctx.createMethodDefinition(key, block);
        method.static = false;
        method.modifier = 'public';
        method.kind = 'method';
        return method;
    }
}

function createIdentNode(ctx, stack){
    if(!stack)return null;
    return stack.isIdentifier ? 
            ctx.createIdentifier(stack.value(), stack) : 
                stack.isLiteral ? 
                    ctx.createLiteral(stack.value()) : 
                        ctx.createToken(stack);
}

function toCamelCase(name){
    name = String(name);
    if(name.includes('-')){
        name = name.replace(/-([a-z])/g, (a,b)=>b.toUpperCase());
    }
    return name;
}

function toFirstUpperCase(str){
    return str.substring(0,1).toUpperCase()+str.substring(1);
}

function createCJSImports(ctx, importManage){
    let imports = [];
    importManage.getAllImportSource().forEach(importSource=>{
        if(importSource.isExportSource)return;
        const properties = [];
        importSource.specifiers.forEach(spec=>{
            if(spec.type==='default' || spec.type==='namespace'){
                let requireNode = ctx.createCallExpression(
                    ctx.createIdentifier('require'),
                    [
                        ctx.createLiteral(importSource.sourceId)
                    ]
                );
                if(spec.type==='default'){
                    const module = importSource.getSourceTarget();
                    if(Utils.isCompilation(module)){
                        requireNode = ctx.createCallExpression(
                            createStaticReferenceNode(ctx, null, 'Class', 'getExportDefault'),
                            [
                                requireNode
                            ]
                        );
                    }
                }
                const node = ctx.createVariableDeclaration('const', [
                    ctx.createVariableDeclarator(
                        ctx.createIdentifier(spec.local, importSource.stack),
                        requireNode,
                        importSource.stack
                    )
                ]);
                imports.push(node)

            }else if(spec.type==='specifier'){
                let imported = ctx.createIdentifier(spec.local);
                let local = null
                if(spec.imported && spec.imported !== spec.local){
                    local = imported;
                    imported =  ctx.createIdentifier(spec.imported);
                }
                properties.push(
                    ctx.createProperty(
                        imported,
                        local,
                    )
                );
            }
        });

        if(properties.length>0){
            const node = ctx.createVariableDeclaration('const', [
                ctx.createVariableDeclarator(
                    ctx.createObjectPattern(properties),
                    ctx.createCallExpression(
                        ctx.createIdentifier('require'),
                        [
                            ctx.createLiteral(importSource.sourceId)
                        ]
                    ),
                    importSource.stack
                )
            ]);
            imports.push(node)
        }else if(!(importSource.specifiers.length>0)){
            imports.unshift(
                ctx.createExpressionStatement(
                    ctx.createCallExpression(
                        ctx.createIdentifier('require'),
                        [
                            ctx.createLiteral(importSource.sourceId)
                        ]
                    )
                )
            );
        }
    })
    return imports;
}

function createESMImports(ctx, importManage){
    let imports = [];
    importManage.getAllImportSource().forEach(importSource=>{
        if(importSource.isExportSource)return;
        const specifiers = importSource.specifiers.map(spec=>{
            if(spec.type==='default'){
                return ctx.createImportSpecifier(spec.local)
            }else if(spec.type==='specifier'){
                return ctx.createImportSpecifier(spec.local, spec.imported)
            }else if(spec.type==='namespace'){
                return ctx.createImportSpecifier(spec.local, null, true)
            }
        });
        if(importSource.specifiers.length>0){
            imports.push(
                ctx.createImportDeclaration(
                    importSource.sourceId,
                    specifiers,
                    importSource.stack
                )
            )
        }else{
            imports.unshift(
                ctx.createImportDeclaration(
                    importSource.sourceId,
                    specifiers,
                    importSource.stack
                )
            )
        }
    })
    return imports
}


function createCJSExports(ctx, exportManage,graph){
    let importSpecifiers = new Map();
    let imports = [];
    let exports = [];
    let declares = [];
    let exportSets = new Set(exportManage.getAllExportSource());
    let properties = [];
    let exportAlls = [];
    exportSets.forEach(exportSource=>{
        let importSource = exportSource.importSource;
        let sourceId = importSource ? importSource.sourceId : null
        if(sourceId){
            sourceId = ctx.createLiteral(sourceId)
        }
        let specifiers = [];
        graph.addExport(exportSource);
        exportSource.specifiers.forEach(spec=>{
            if(spec.type==='namespace'){
                if(!spec.exported){
                    exportAlls.push(
                        ctx.createCallExpression(
                            ctx.createIdentifier('require'),
                            [
                                sourceId
                            ],
                            spec.stack
                        )
                    );
                }else{
                    properties.push(
                        ctx.createProperty(
                            ctx.createIdentifier(spec.exported),
                            ctx.createCallExpression(
                                ctx.createIdentifier('require'),
                                [
                                    sourceId
                                ]
                            ),
                            spec.stack
                        )
                    );
                }
            }else if(spec.type === 'default'){
                properties.push(
                    ctx.createProperty(
                        ctx.createIdentifier('default'),
                        spec.local,
                        spec.stack
                    )
                );
            }else if(spec.type==='named'){
                if(spec.local.type==='VariableDeclaration'){
                    spec.local.declarations.map(decl=>{
                        properties.push(
                            ctx.createProperty(
                                decl.id,
                                decl.init || ctx.createLiteral(null),
                                spec.stack
                            )
                        )
                    });
                }else if(spec.local.type==='FunctionDeclaration'){
                    declares.push(spec.local)
                    properties.push(
                        ctx.createProperty(
                            spec.local.key,
                            null,
                            spec.stack
                        )
                    );
                }
            }else if(spec.type==='specifier'){
                if(sourceId){
                    let node = ctx.createProperty(
                        ctx.createIdentifier(spec.local),
                        ctx.createIdentifier(spec.exported),
                        spec.stack
                    )
                    properties.push(
                        ctx.createProperty(
                            ctx.createIdentifier(spec.exported),
                            null,
                            spec.stack
                        )
                    );
                    specifiers.push(node);
                }else{
                    let node = ctx.createProperty(
                        ctx.createIdentifier(spec.exported),
                        ctx.createIdentifier(spec.local),
                        spec.stack
                    )
                    properties.push(node);
                }
            }
        });
        if(specifiers.length > 0){
            let dataset = importSpecifiers.get(sourceId)
            if(!dataset){
                importSpecifiers.set(sourceId, dataset=[]) 
            }
            dataset.push(...specifiers)
        }
    });

    importSpecifiers.forEach((specifiers, sourceId)=>{
        imports.push(
            ctx.createVariableDeclaration('const',[
                ctx.createVariableDeclarator(
                    ctx.createObjectPattern(specifiers),
                    ctx.createCallExpression(
                        ctx.createIdentifier('require'),
                        [
                            sourceId
                        ]
                    )
                )
            ])
        );
    });

    if(exportAlls.length>0 && !properties.length){
        if(exportAlls.length===1){
            exports.push(
                ctx.createExpressionStatement(
                    ctx.createAssignmentExpression(
                        ctx.createChunkExpression('module.exports', false, false),
                        exportAlls[0]
                    )
                )
            );
        }else{
            let spreads = exportAlls.map(require=>{
                return ctx.createSpreadElement(
                    ctx.createParenthesizedExpression(
                        ctx.createLogicalExpression(
                            require,
                            ctx.createObjectExpression(),
                            '||'
                        )
                    )
                )
            });
            exports.push(
                ctx.createExpressionStatement(
                    ctx.createAssignmentExpression(
                        ctx.createChunkExpression('module.exports',false, false),
                        ctx.createObjectExpression(spreads)
                    )
                )
            );
        }
    }else if(!exportAlls.length && properties.length===1 && properties[0].key.value==='default'){
        exports.push(
            ctx.createExpressionStatement(
                ctx.createAssignmentExpression(
                    ctx.createChunkExpression('module.exports',false, false),
                    properties[0].init
                )
            )
        );
    }else{
        let spreads = exportAlls.map(require=>{
            return ctx.createSpreadElement(
                ctx.createParenthesizedExpression(
                    ctx.createLogicalExpression(
                        require,
                        ctx.createObjectExpression(),
                        '||'
                    )
                )
            )
        });

        let items = [
            ...spreads,
            ...properties
        ];

        exports.push(
            ctx.createExpressionStatement(
                ctx.createAssignmentExpression(
                    ctx.createChunkExpression('module.exports',false, false),
                    ctx.createObjectExpression(items)
                )
            )
        );
    }
    return {imports, exports, declares}
}

function createESMExports(ctx, exportManage, graph){
    let importSpecifiers = new Map();
    let exports = [];
    let imports = [];
    let declares = [];
    let exportSets = new Set(exportManage.getAllExportSource());
    exportSets.forEach(exportSource=>{
        let importSource = exportSource.importSource;
        let sourceId = importSource ? importSource.sourceId : null
        let specifiers = [];
        graph.addExport(exportSource);
        exportSource.specifiers.forEach(spec=>{
            if(spec.type==='namespace'){
                exports.push(
                    ctx.createExportAllDeclaration(sourceId, spec.exported, spec.stack)
                )
            }else if(spec.type === 'default'){
                exports.push(
                    ctx.createExportDefaultDeclaration(spec.local, spec.stack)
                )
            }else if(spec.type==='named' && !sourceId){
                exports.push(
                    ctx.createExportNamedDeclaration(spec.local, null, [], spec.stack)
                )
            }else if(spec.type==='specifier'){
                specifiers.push(
                    ctx.createExportSpecifier(spec.local, spec.exported, spec.stack)
                )
            }
        });

        if(specifiers.length > 0){
            let dataset = importSpecifiers.get(sourceId)
            if(!dataset){
                importSpecifiers.set(sourceId, dataset=[]) 
            }
            dataset.push(...specifiers)
        }
    });

    importSpecifiers.forEach((specifiers, sourceId)=>{
        exports.push(ctx.createExportNamedDeclaration(null, sourceId, specifiers))
    });

    return {imports, exports, declares}
}


function isExternalDependency(externals, source, module=null){
    if(Array.isArray(externals) && externals.length > 0){
        return externals.some( rule=>{
            if(typeof rule === 'function'){
                return rule(source, module);
            }else if( rule instanceof RegExp ){
                return rule.test( source )
            }
            return rule === source;
        });
    }
    return false;
}

function isExcludeDependency(excludes, source, module=null){
    if(Array.isArray(excludes) && excludes.length > 0){
        return excludes.some( rule=>{
            if(typeof rule === 'function'){
                return rule(source, module);
            }else if( rule instanceof RegExp ){
                return rule.test( source )
            }
            return rule === source;
        });
    }
    return false;
}

function getMethodOrPropertyAlias(ctx, stack, name=null){
    if(Cache.has(stack, 'getMethodOrPropertyAlias')){
        return Cache.get(stack, 'getMethodOrPropertyAlias')
    }
    let result = getMethodAnnotations(stack, ['alias'])
    let resolevName = name;
    if( result ){
        const [annotation] = result;
        const value = parseAliasAnnotation(annotation, ctx.plugin.version, ctx.options.metadata.versions)
        if(value){
            resolevName = value;
        }
    }
    Cache.set(stack, 'getMethodOrPropertyAlias', resolevName);
    return resolevName;
}

function getMethodOrPropertyHook(ctx, stack){
    if(!stack)return null;
    if(Cache.has(stack, 'getMethodOrPropertyHook')){
        return Cache.get(stack, 'getMethodOrPropertyHook')
    }
    let result = getMethodAnnotations(stack, ['hook'])
    let invoke = null;
    if(result.length>0){
        let annotation = result[0];
        result = parseHookAnnotation(annotation, ctx.plugin.version, ctx.options.metadata.versions)
        if(result) {
            invoke = [
                result.type, 
                annotation
            ];
        }
    }
    Cache.set(stack, 'getMethodOrPropertyHook', invoke);
    return invoke
}

function createJSXAttrHookNode(ctx, stack, desc){
    if(!(stack && stack.isMemberProperty && stack.value && desc))return null;
    const hookAnnot = getMethodOrPropertyHook(desc);
    if( hookAnnot ){
        let [type,annotation] = hookAnnot;
        let lower = type && String(type).toLowerCase()

        const hooks = ctx.options.hooks;
        let createdNode = null
        if(hooks.createJSXAttrValue){
            createdNode = hooks.createJSXAttrValue({ctx, type, jsxAttrNode:stack, descriptor:desc, annotation})
        }

        if(!createdNode){
            if(lower==='compiling:create-route-path'){
                if( stack.value && stack.value.isJSXExpressionContainer ){
                    const value = stack.value.description();
                    if(value && value.isModule && stack.isModuleForWebComponent(value)){
                        let route = getModuleRoutes(value, ['router'], ctx.options);
                        if(route && route[0]){
                            if( Array.isArray(route) )route = route[0];
                            if(route.path){
                                return ctx.createLiteral(createRoutePath(route))
                            }else{
                                console.error(`[es-transform] Route missing the 'path' property.`)
                            }
                        }
                        return ctx.createLiteral( value.getName('/') );
                    }
                }
                return null;
            }

            if(type){
                const node = ctx.createCallExpression(
                    ctx.createMemberExpression([
                        ctx.createThisExpression(stack),
                        ctx.createIdentifier('invokeHook')
                    ]),
                    [
                        ctx.createLiteral(type),
                        ctx.createToken(stack.value),
                        ctx.createLiteral(stack.name.value()),
                        ctx.createLiteral(desc.module.getName())
                    ]
                );
                node.hasInvokeHook = true;
                node.hookAnnotation = annotation;
                return node;
            }
        }
    }
    return null;
}

function createStaticReferenceNode(ctx, stack, className, method){
    return ctx.createMemberExpression([
        createModuleReferenceNode(ctx, stack, className),
        ctx.createIdentifier(method, stack)
    ]);
}

function createModuleReferenceNode(ctx, stack, className){
    let gloablModule = Namespace.globals.get(className)
    if(gloablModule){
        let context =  stack ? stack.module || stack.compilation : null;
        ctx.addDepend(gloablModule, context)
        return ctx.createIdentifier(
            ctx.getModuleReferenceName(gloablModule, context),
        )
    }else{
        throw new Error(`References the '${className}' module is not exists`)
    }
}

function createCommentsNode(ctx, stack){
    const manifests = ctx.options.manifests || {};
    const enable = ctx.options.comments;
    if(stack.module && (enable||manifests.comments)){
        const result = stack.parseComments('Block');
        if(result){
            if(manifests.comments && result.meta){
                let kind = 'class';
                if(stack.isMethodSetterDefinition){
                    kind = 'setter'
                }else if(stack.isMethodGetterDefinition){
                    kind = 'getter'
                }else if(stack.isMethodDefinition){
                    kind = 'method'
                }else if(stack.isPropertyDefinition){
                    kind = 'property'
                }
                const vm = ctx.getVModule("manifest.Comments");
                if(vm){
                    let id = stack.module.getName();
                    ctx.addDepend(vm);
                    let key = stack.value()+':'+kind;
                    if(kind==='class')key = 'top';
                    vm.append(ctx, {
                        [id]:{[key]:result.meta}
                    });
                }
            }
            if(enable && result.comments.length>0){
                return ctx.createChunkExpression( ['/**',...result.comments,'**/'].join("\n"), true )
            }
        }
    }
    return null;
}

let hashCache = Object.create(null);
function createUniqueHashId(source){
    let exists = hashCache[source];
    if(exists){
        return exists;
    }
    return hashCache[source] = createHash("sha256").update(source).digest("hex").substring(0, 8);
}


async function callAsyncSequence(items, asyncMethod){
    if(!Array.isArray(items))return false;
    if(items.length<1)return false;
    let index = 0;
    items = items.slice(0);
    const callAsync = async()=>{
        if(index<items.length){
            await asyncMethod(items[index], index++)
            await callAsync();
        }
    }
    await callAsync();
}

export {
    isEmptyObject,
    annotationIndexers,
    getAnnotationArgument,
    getAnnotationArgumentValue,
    getAnnotationArguments,
    getModuleAnnotations,
    getMethodAnnotations,
    getSourceAnnotations,
    getModuleRoutes,
    getMethodOrPropertyHook,
    getMethodOrPropertyAlias,
    parseMacroAnnotation,
    parseMacroArguments,
    parseMacroMethodArguments,
    parseReadfileAnnotation,
    parseHttpAnnotation,
    parseRouterAnnotation,
    parseHookAnnotation,
    parseAliasAnnotation,
    parseVersionExpression,
    parseImportDeclaration,
    parseDefineAnnotation,
    parseUrlAnnotation,
    createRoutePath,
    createHttpAnnotationNode,
    createRouterAnnotationNode,
    createReadfileAnnotationNode,
    createRouteConfigNode,
    createUrlAnnotationNode,
    createEnvAnnotationNode,
    createEmbedAnnotationNode,
    createMainAnnotationNode,
    createImplementIteratorMethodNode,
    createJSXAttrHookNode,
    createIdentNode,
    createStaticReferenceNode,
    createModuleReferenceNode,
    createCommentsNode,
    compare,
    compareVersion,
    isExternalDependency,
    isExcludeDependency,
    isRuntime,
    isSyntax,
    isEnv,
    toVersion,
    toCamelCase,
    toFirstUpperCase,
    beginNumericLiteral,
    createCJSImports,
    createESMImports,
    createCJSExports,
    createESMExports,
    createUniqueHashId,
    callAsyncSequence,
    normalizePropertyKey
}