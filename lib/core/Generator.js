import Utils from "easescript/lib/core/Utils";
import SourceMap from "source-map";
let disabledNewLine = false;
class Generator{
    #file = null;
    #context = null;
    #sourceMap = null;
    #code = '';
    #line = 1;
    #column = 0;
    #indent = 0;
    constructor(context=null, disableSourceMaps=false){
        if(context){
            this.#context = context;
            if(disableSourceMaps !== true ){
                this.#file = context.target.file;
                this.#sourceMap = context.options.sourceMaps ? this.createSourceMapGenerator() : null;
            }
        }
    }

    get file(){
        return this.#file
    }

    get context(){
        return this.#context
    }

    get sourceMap(){
        return this.#sourceMap
    }

    get code(){
        return this.#code
    }

    get line(){
        return this.#line
    }

    createSourceMapGenerator(){
        let target = this.context.target;
        let generator = new SourceMap.SourceMapGenerator();
        let compi = Utils.isModule(target) ? target.compilation : target;
        if(Utils.isCompilation(compi) && compi.source){
            generator.setSourceContent(compi.file, compi.source);
        }
        return generator
    }

    addMapping( node ){
        if( this.sourceMap ){
            const loc = node.loc;
            if( loc ){
                this.sourceMap.addMapping({
                    generated: {
                        line: this.#line,
                        column: this.getStartColumn()
                    },
                    source: this.#file,
                    original: {
                        line: loc.start.line,
                        column:loc.start.column
                    },
                    name: node.type ==='Identifier' ? node.value : null
                });
            }
        }
    }

    newBlock(){
       this.#indent++;
       return this;
    }

    endBlock(){
        this.#indent--;
        return this;
    }

    newLine(){
        const len = this.#code.length;
        if(!len)return;
        const char = this.#code.charCodeAt( len-1 );
        if( char === 10 || char ===13 ){
            return this;
        }
        this.#line++;
        this.#code+='\r\n';
        this.#column = 0;
        return this;
    }

    getStartColumn(){
        if( this.#column===0 ){
            return (this.#indent * 4)+1;
        }
        return this.#column;
    }

    withString( value ){
        if( !value )return;
        if( this.#column===0 ){
            this.#column = this.getStartColumn();
            this.#code += '    '.repeat( this.#indent );
        }
        this.#code +=value;
        this.#column += value.length || 0;
    }

    withEnd( expr ){
        if( expr ){
            this.withString( expr );
            this.withSemicolon();
        }
        this.newLine();
    }

    withParenthesL(){
        this.withString('(');
    }

    withParenthesR(){
        this.withString(')');
    }

    withBracketL(){
        this.withString('[');
    }

    withBracketR(){
        this.withString(']');
    }

    withBraceL(){
        this.withString('{');
    }

    withBraceR(){
        this.withString('}');
    }

    withSpace(){
        this.withString(' ');
    }

    withDot(){
        this.withString('.');
    }

    withColon(){
        this.withString(':');
    }

    withOperator( value ){
        this.withString(` ${value} `);
    }

    withComma(){
        this.withString(',');
    }

    withSemicolon(){
        const code = this.#code;
        const char = code.charCodeAt( code.length-1 );
        if( char === 59 || char === 10 || char ===13 || char ===32 || char===125 ){
            return this;
        }
        this.withString(';');
        return this;
    }

    withSequence( items , newLine){
        if( !items )return this;
        const len = items.length-1;
        items.forEach( (item,index)=>{
            if(item.newLineBefore)this.newLine();
            this.make(item);
            if( index < len ){
                this.withString(',');
                if(newLine || (item.newLine && !item.disableCommaNewLine))this.newLine();
            }
        });
        return this;
    }

    make( token ){
        if( !token )return;
        switch( token.type ){
            case "ArrayExpression" :
            case "ArrayPattern" :
                this.withBracketL();
                this.addMapping(token);
                if( token.elements.length > 0 ){
                    if(token.newLine===true){
                        this.newLine();
                        this.newBlock();
                    }
                    this.withSequence(token.elements, !!token.newLine);
                    if(token.newLine===true){
                        this.newLine();
                        this.endBlock();
                    }
                }
                this.withBracketR();
            break;
            case "ArrowFunctionExpression" :
                if(token.async){
                    this.withString('async');
                    this.withSpace();
                }
                this.withParenthesL();
                this.withSequence(token.params);
                this.withParenthesR();
                this.withString('=>')
                this.make(token.body);
            break;
            case "AssignmentExpression" :
            case "AssignmentPattern" :
                this.make(token.left);
                this.addMapping(token);
                if(token.operator){
                    this.withString(token.operator);
                }else{
                    this.withString('=');
                }
                this.make(token.right);
            break;
            case "AwaitExpression" :
                this.withString('await ');
                this.make(token.argument);
            break;
            case "BinaryExpression" :
                this.addMapping(token);
                this.make(token.left);
                this.withOperator( token.operator );
                this.make(token.right);
            break;
            case "BreakStatement" :
                this.newLine();
                this.addMapping(token);
                this.withString('break');
                if(token.label){
                    this.withSpace();
                    this.make(token.label);
                }
                this.withSemicolon();
            break;
            case "BlockStatement" :
                if( token.isWhenStatement ){
                    token.body.forEach( item=>this.make(item) );
                }else{
                    this.withBraceL();
                    this.newBlock();
                    token.body.length > 0 && this.newLine();
                    token.body.forEach( item=>this.make(item) );
                    this.endBlock();
                    token.body.length > 0 && this.newLine();
                    this.withBraceR();
                }
            break;
            case "ChunkExpression" :
                if( token.value ){
                    if(token.newLine !== false){
                        this.newLine();
                    }
                    let lines = String(token.value).split(/[\r\n]+/)
                    lines.forEach((line,index)=>{
                        this.withString(line);
                        if(token.semicolon && index < lines.length){
                            this.withSemicolon();
                        }
                        if(index < lines.length && token.newLine !== false){
                            this.newLine();
                        }
                    })
                    if(token.semicolon){
                        this.withSemicolon();
                    }
                    if(token.newLine !== false){
                        this.newLine();
                    }
                }
            break;
            case "CallExpression" :
                this.addMapping(token);
                this.make(token.callee)
                if(token.isChainExpression){
                    this.withString('?.')
                }
                this.withParenthesL();
                if(token.newLine)this.newLine();
                if(token.indentation)this.newBlock();
                this.withSequence(token.arguments, token.newLine);
                if(token.indentation)this.endBlock();
                if(token.newLine)this.newLine();
                this.withParenthesR();
            break;
            case "ClassStatement" :
                this.withString('class')
                this.withSpace();
                this.make(token.key);
                if( token.extends){
                    this.withSpace();
                    this.withString('extends')
                    this.withSpace();
                    this.make(token.extends)
                }
                this.make(token.body);
                this.newLine();
            break;
            case "ClassDeclaration" :
            case "ClassExpression" :
                if(token.comments){
                    this.newLine();
                    this.make( token.comments );
                    this.newLine();
                }
                if(token.type === "ClassDeclaration"){
                    this.newLine()
                }
                this.withString('class')
                this.withSpace();
                this.make(token.id);
                if( token.superClass){
                    this.withSpace();
                    this.withString('extends')
                    this.withSpace();
                    this.make(token.superClass)
                }
                this.make(token.body)
            break;
            case "ConditionalExpression" :
                this.addMapping(token);
                if(token.newLine)this.newLine();
                this.make(token.test);
                this.withOperator('?');
                this.make(token.consequent);
                this.withOperator(':');
                this.make(token.alternate);
                if(token.newLine)this.newLine();
            break;
            case "ContinueStatement" :
                this.newLine();
                this.addMapping(token);
                this.withString('continue');
                if(token.label){
                    this.withSpace();
                    this.make(token.label);
                }
                this.withSemicolon();
            break;
            case "ChainExpression" :
                this.make(token.expression);
            break;
            case "DoWhileStatement" :
                this.newLine();
                this.withString('do');
                this.make(token.body);
                this.withString('while');
                this.withParenthesL();
                this.make(token.condition);
                this.withParenthesR();
                this.withSemicolon();
            break;
            case "ExpressionStatement" :
                this.newLine();
                this.make(token.expression);
                this.withSemicolon();
            break;
            case "MultipleStatement" :
                token.expressions.forEach(exp=>this.make(exp))
                this.newLine();
            break;
            case "ExportDefaultDeclaration" :
                this.newLine();
                this.addMapping(token);
                this.withString('export default ');
                if( token.declaration.type ==='ExpressionStatement' ){
                    this.make(token.declaration.expression);
                }else{
                    this.make(token.declaration);
                }
                this.withSemicolon();
            break;
            case "ExportAllDeclaration" :
                this.addMapping(token);
                this.newLine();
                this.withString('export');
                this.withSpace();
                this.withString('*');
                this.withSpace();
                if(token.exported){
                    this.withString('as');
                    this.withSpace();
                    this.make(token.exported)
                    this.withSpace();
                }
                this.withString('from');
                this.withSpace();
                this.make(token.source);
                this.withSemicolon();
            break;
            case "ExportNamedDeclaration" :
                this.newLine();
                this.addMapping(token);
                this.withString('export');
                this.withSpace();
                if( token.specifiers && token.specifiers.length>0){
                    this.withBraceL()
                    this.newLine()
                    this.newBlock()
                    this.withSequence(token.specifiers, true)
                    this.endBlock()
                    this.newLine()
                    this.withBraceR()
                }else if( token.declaration ){
                    disabledNewLine = true
                    this.make(token.declaration);
                    disabledNewLine = false
                }
                if( token.source ){
                    this.withSpace();
                    this.withString('from');
                    this.withSpace();
                    this.make(token.source);
                }
                this.withSemicolon();
            break;
            case "ExportSpecifier" :
                this.addMapping(token);
                this.make(token.local);
                if( token.exported.value !== token.local.value ){
                    this.withString(' as ');
                    this.make(token.exported);
                }
            break;
            case "ForInStatement" :
                this.newLine();
                this.withString('for');
                this.withParenthesL();
                this.make(token.left);
                this.withOperator('in');
                this.make(token.right);
                this.withParenthesR();
                this.make(token.body);
                if( token.body.type !=="BlockStatement" ){
                    this.withSemicolon();
                }
            break;
            case "ForOfStatement" :
                this.newLine();
                this.withString('for');
                this.withParenthesL();
                this.make(token.left);
                this.withOperator('of');
                this.make(token.right);
                this.withParenthesR();
                this.make(token.body);
                if( token.body.type !=="BlockStatement" ){
                    this.withSemicolon();
                }
            break;
            case "ForStatement" :
                this.newLine();
                this.withString('for');
                this.withParenthesL();
                this.make(token.init);
                this.withSemicolon();
                this.make(token.condition);
                this.withSemicolon();
                this.make(token.update);
                this.withParenthesR();
                this.make(token.body);
                if( token.body.type !=="BlockStatement" ){
                    this.withSemicolon();
                }
            break;
            case "FunctionDeclaration" :
            case "MethodDefinition" :
            case "MethodGetterDefinition" :
            case "MethodSetterDefinition" :{
                if(token.comments){
                    this.newLine();
                    this.make( token.comments );
                    this.newLine();
                }
                let isNewLine = token.type ==="FunctionDeclaration" || token.kind==='method' || token.kind==='get' || token.kind==='set';
                if(isNewLine && !disabledNewLine && !token.disabledNewLine)this.newLine();
                if(token.async){
                    this.withString('async');
                    this.withSpace();
                }
                if(token.static && token.kind==='method'){
                    this.withString('static');
                    this.withSpace();
                }
                if( token.kind==='method' ){
                    this.make( token.key );
                }else{
                    this.withString('function');
                    if( token.key && !token.key.computed ){
                        this.withSpace();
                        this.make( token.key );
                    }
                }
                this.withParenthesL();
                this.withSequence(token.params);
                this.withParenthesR();
                this.make(token.body);
                if(isNewLine && !disabledNewLine && !token.disabledNewLine)this.newLine();
            }
            break;
            case "FunctionExpression" :
                this.addMapping(token);
                if(token.comments){
                    this.newLine();
                    this.make( token.comments );
                    this.newLine();
                }
                if(token.async){
                    this.withString('async');
                    this.withSpace();
                }
                this.withString('function');
                this.withParenthesL();
                this.withSequence(token.params);
                this.withParenthesR();
                this.make(token.body);
            break;
            case "Identifier" :
                this.addMapping( token );
                this.withString( token.value );
            break;
            case "IfStatement" :
                this.newLine();
                this.withString('if');
                this.withParenthesL();
                this.make(token.condition);
                this.withParenthesR();
                this.make(token.consequent);
                if( token.condition.type !=='BlockStatement'){
                    this.withSemicolon();
                }
                if( token.alternate ){
                    this.withString('else');
                    if(token.alternate.type==="IfStatement"){
                        this.withSpace();
                    }
                    this.make(token.alternate);
                    if( token.alternate.type !=="BlockStatement" ){
                        this.withSemicolon();
                    }
                }
            break;
            case "ImportDeclaration" :
                this.withString('import');
                this.withSpace();
                let lefts = [];
                let rights = [];
                token.specifiers.forEach( item=>{
                    if(item.type ==='ImportDefaultSpecifier' || item.type ==='ImportNamespaceSpecifier'){
                        lefts.push(item);
                    }else{
                        rights.push(item);
                    }
                });
                if(rights.length>0){
                    if(lefts.length>0){
                        this.make( lefts[0] );
                        this.withComma();
                    }
                    this.withBraceL();
                    this.withSequence( rights );
                    this.withBraceR();
                    this.withSpace();
                    this.withString('from');
                    this.withSpace();
                }else if(lefts.length>0){
                    this.make( lefts[0] );
                    this.withSpace();
                    this.withString('from');
                    this.withSpace();
                }
                this.make( token.source );
                this.withSemicolon();
                this.newLine();
            break;
            case "ImportSpecifier" :
                if( token.imported && token.local.value !== token.imported.value ){
                    this.make( token.imported );
                    this.withOperator('as');
                }
                this.make( token.local );
            break;
            case "ImportNamespaceSpecifier" :
                this.withString(' * ');
                this.withOperator('as');
                this.make( token.local );
            break;
            case "ImportDefaultSpecifier" :
                this.make( token.local );
            break;
            case "ImportExpression" :
                this.withString('import');
                this.withParenthesL();
                this.make( token.source );
                this.withParenthesR();
            break;
            case "LabeledStatement" :
                this.newLine();
                this.addMapping(token);
                this.make( token.label );
                this.withString(':');
                this.make( token.body );
            break;
            case "Literal" :
                this.addMapping(token);
                if( this.foreSingleQuotationMarks ){
                    this.withString( token.raw.replace(/\u0022/g,"'") );
                }else{
                    this.withString( token.raw );
                }
            break;
            case "LogicalExpression" :
                this.make(token.left);
                this.withOperator( token.operator );
                this.make(token.right);
            break;
            case "MemberExpression" :
                this.addMapping(token);
                this.make(token.object);
                if( token.computed){
                    if(token.optional){
                        this.withString('?.');
                    }
                    this.withBracketL();
                    this.make(token.property);
                    this.withBracketR();
                }else{
                    if(token.optional){
                        this.withString('?.');
                    }else{
                        this.withString('.');
                    }
                    this.make(token.property);
                }
            break;
            case "NewExpression" :
                this.addMapping(token);
                this.withString('new');
                this.withSpace();
                this.make(token.callee);
                this.withParenthesL();
                this.withSequence( token.arguments );
                this.withParenthesR();
            break;
            case "ObjectExpression" :
                this.addMapping(token);
                if(token.comments){
                    this.newLine();
                    this.make( token.comments );
                    this.newLine();
                }
                this.withBraceL();
                if( token.properties.length > 0 ){
                    this.newBlock();
                    this.newLine();
                    this.withSequence( token.properties , true);
                    this.newLine();
                    this.endBlock();
                }
                this.withBraceR();
            break;
            case "ObjectPattern" :
                this.withBraceL();
                this.addMapping(token);
                token.properties.forEach( (property,index)=>{
                    if(property){
                        if( property.type==='RestElement' ){
                            this.make( property );
                        }else{
                            if(property.init && (property.init.type === 'AssignmentPattern')){
                                this.make( property.init );
                            }else{
                                this.make( property.key );
                                if( property.init && property.key.value !== property.init.value){
                                    this.withColon()
                                    this.make( property.init );
                                }
                            }
                        }
                        if( index < token.properties.length-1 ){
                            this.withComma();
                        }
                    }
                });
                this.withBraceR();
            break;
            case "ParenthesizedExpression" :
                if(token.newLine)this.newLine();
                this.withParenthesL();
                this.make( token.expression );
                this.withParenthesR();
                if(token.newLine)this.newLine();
            break;
            case "Property" :
                this.addMapping(token);
                if(token.comments){
                    this.newLine();
                    this.make( token.comments );
                    this.newLine();
                }
                if( token.computed ){
                    this.withBracketL()
                    this.make( token.key );
                    this.withBracketR()
                }else{
                    this.make( token.key );
                }
                if(token.init){
                    this.withColon()
                    this.make( token.init );
                }
            break;
            case "PropertyDefinition" :
                this.addMapping(token);

                if(token.comments){
                    this.newLine();
                    this.make( token.comments );
                    this.newLine();
                }

                this.newLine();
                if(token.static){
                    this.withString('static')
                    this.withSpace();
                }
                this.make( token.key );
                if(token.init){
                    this.withOperator('=')
                    this.make( token.init );
                }
                this.newLine();
            break;
            case "RestElement" :
                this.addMapping(token);
                this.withString('...' );
                this.withString( token.value );
            break;
            case "ReturnStatement" :
                this.addMapping(token);
                this.newLine();
                this.withString('return');
                this.withSpace();
                this.make( token.argument );
                this.withSemicolon();
            break;
            case "SequenceExpression" :
                this.withSequence( token.expressions );
            break;
            case "SpreadElement" :
                this.withString('...' );
                this.addMapping(token);
                this.make( token.argument );
            break;
            case "SuperExpression" :
                this.addMapping(token);
                if(token.value){
                    this.withString(token.value);
                }else{
                    this.withString('super');
                }
            break;
            case "SwitchCase" :
                this.newLine();
                if( token.condition ){
                    this.withString('case');
                    this.withSpace();
                    this.make( token.condition );
                }else{
                    this.withString('default' );
                }
                this.withSpace();
                this.withColon();
                this.newBlock();
                token.consequent.forEach( item=>this.make(item) );
                this.endBlock();
            break;
            case "SwitchStatement" :
                this.newLine();
                this.withString('switch');
                this.withParenthesL();
                this.make( token.condition );
                this.withParenthesR();
                this.withBraceL();
                this.newBlock();
                token.cases.forEach( item=>this.make(item) );
                this.newLine();
                this.endBlock();
                this.withBraceR();
            break;
            case "TemplateElement" :
                this.withString(token.value);
            break;
            case "TemplateLiteral" :
                const expressions =token.expressions;
                this.withString('`');
                token.quasis.map( (item,index)=>{
                    const has = item.value;
                    if(has){
                        this.make( item );
                    }
                    if(index < expressions.length){
                        this.withString('$');
                        this.withBraceL()
                        this.make( expressions[index] );
                        this.withBraceR()
                    }
                });
                this.withString('`');
            break;
            case "ThisExpression" :
                this.addMapping(token);
                this.withString( token.value || 'this');
            break;
            case "ThrowStatement" :
                this.newLine();
                this.withString('throw');
                this.withSpace();
                this.make( token.argument );
                this.withSemicolon();
            break;
            case "TryStatement" :
                this.newLine();
                this.withString('try');
                this.make( token.block );
                this.withString('catch');
                this.withParenthesL();
                this.make( token.param );
                this.withParenthesR();
                this.make( token.handler );
                if( token.finalizer ){
                    this.withString('finally');
                    this.make( token.finalizer );
                }
            break;
            case "UnaryExpression" :
                this.addMapping(token);
                if( token.prefix ){
                    this.withString(token.operator);
                    if( ![33,43,45,126].includes(token.operator.charCodeAt(0)) ){
                        this.withSpace();
                    }
                    this.make( token.argument )
                }else{
                    this.make( token.argument )
                    this.withSpace();
                    this.withString(token.operator);
                }
            break;
            case "UpdateExpression" :
                this.addMapping(token);
                if( token.prefix ){
                    this.withString(token.operator);
                    this.make( token.argument )
                }else{
                    this.make( token.argument )
                    this.withString(token.operator);
                }
            break;
            case "VariableDeclaration" :
                this.addMapping(token);
                if(!token.inFor && !disabledNewLine)this.newLine();
                this.withString(token.kind);
                this.withSpace();
                this.withSequence( token.declarations );
                if( !token.inFor ){
                    this.withSemicolon();
                    this.newLine();
                }
            break;
            case "VariableDeclarator" :
                this.addMapping(token);
                this.make( token.id );
                if( token.init ){
                    this.withOperator('=');
                    this.make( token.init );
                }
            break;
            case "WhileStatement" :
                this.withString('while');
                this.withParenthesL();
                this.make( token.condition );
                this.withParenthesR();
                this.make( token.body );
                if( token.body.type !=="BlockStatement" ){
                    this.withSemicolon();
                }
            break;
            case "InterfaceDeclaration" :
            case "EnumDeclaration" :
            case "DeclaratorDeclaration" :
            case "PackageDeclaration" :
            case "Program" :
                token.body.forEach( item=>this.make(item) )
            break;

            /**
             * table
             */
            case "StructTableDeclaration" :
                this.genSql( token );
            break;
            case "StructTableMethodDefinition" :
                this.make( token.key );
                this.withParenthesL();
                this.withSequence( token.params );
                this.withParenthesR();
            break;
            case "StructTablePropertyDefinition" :
                this.withString(' ');
                this.make( token.key );
                if( token.init ){
                    if( token.assignment ){
                        this.withOperator('=');
                        this.make( token.init );
                    }else{
                        this.withString(' ');
                        this.make( token.init );
                    }
                }
            break;
            case "StructTableKeyDefinition" :
                this.make( token.key );
                this.withString(' ');
                if( token.prefix ){
                    this.make( token.prefix );
                    this.withString(' ');
                }
                this.make( token.local );
                token.properties.forEach( (item)=>{
                    this.withString(' ');
                    this.make(item);
                });
            break;
            case "StructTableColumnDefinition" :
                this.make( token.key );
                this.withString(' ');
                token.properties.forEach( (item,index)=>{
                    if( index > 0)this.withString(' ');
                    this.make(item);
                });
            break;

            /**
             * --------------
             * RAW JSX
             * ------------ 
             */    
            case "JSXAttribute":
            {
                let esx = this.#context.options.esx;
                if(esx.raw){
                    this.addMapping(token);
                    this.withSpace();
                    this.make( token.name );
                    if( token.value ){
                        this.withString('=');
                        this.withString( esx.delimit.attrs.left );
                        if(token.value){
                            this.foreSingleQuotationMarks = ops.delimit.attrs.left === '"';
                            this.make( token.value );
                            this.foreSingleQuotationMarks = false;
                        }
                        this.withString( ops.delimit.attrs.right );
                    }
                }else{
                    if( token.parent && token.parent.type ==="ObjectExpression"){
                        this.make( token.name );
                        this.withColon()
                        this.make( token.value );
                    }
                }
            }
            break;
            case "JSXSpreadAttribute":
                this.addMapping(token);
                this.withString('{...');
                this.make(token.argument)
                this.withString('}');
            break;
            case "JSXNamespacedName":
                this.addMapping(token);
                this.make(token.name);
            break;
            case "JSXExpressionContainer":
                this.addMapping(token);
                if( token.expression ){
                    this.withString( token.left || '{' );
                    this.make(token.expression);
                    this.withString( token.right || '}' );
                }
            break;
            case "JSXOpeningFragment":
            case "JSXOpeningElement":   
                this.addMapping(token);
                this.withString('<');
                this.make(token.name);
                token.attributes.forEach( attribute=>{
                    this.make(attribute);
                });
                if( token.selfClosing ){
                    this.withString(' />');
                }else{
                    this.withString('>');
                }
                
            break;
            case "JSXClosingFragment":  
            case "JSXClosingElement": 
                this.addMapping(token); 
                this.withString('</');
                this.make(token.name);
                this.withString('>');
            break;
            case "JSXElement":
                this.addMapping(token);
                let has = token.children.length > 0; 
                this.make( token.openingElement );
                if(has)this.newLine();
                this.newBlock();
                token.children.forEach( (child,index)=>{
                    if(index>0)this.newLine();
                    this.make(child);
                });
                this.endBlock()
                if(has)this.newLine();
                this.make( token.closingElement);
                this.newLine();
            break;
            case "JSXFragment":
                this.withString('<>');
                this.newLine();
                token.children.forEach( child=>{
                    this.make(child);
                });
                this.newLine();
                this.withString('</>');
                this.newLine();
            break;
            case "JSXText":
                this.withString(token.value);
            break;
        }
    }

    genSql(token){
        this.newLine();
        if(token.comments){
            this.make( token.comments );
            this.newLine();
        }
        this.withString('create table');
        this.withString(' ');
        this.make(token.id);
        this.withParenthesL();
        this.newLine();
        this.newBlock()
        token.body.forEach( (item,index)=>{
            if( item.type ==='StructTableKeyDefinition' || item.type==="StructTableColumnDefinition" ){
                if(index>0){
                    this.withComma(',');
                    this.newLine();
                }
            }
            this.make(item);
        });
        this.endBlock()
        this.newLine();
        this.withParenthesR();
        token.properties.forEach( item=>this.make(item) );
        this.withSemicolon();
        this.newLine();
    }
    
    toString(){
        return this.#code;
    }
}

export default Generator