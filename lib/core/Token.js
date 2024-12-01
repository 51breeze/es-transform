import Node from './Node.js'
class Token{

    createNode(stack,type){
        const isString = typeof stack === 'string';
        if(!type){
            type = isString ? stack : stack.toString();
        }
        if(!type)return null;
        return Node.create(type, isString ? null : stack)
    }

    createIdentifier(value, stack){
        let node = this.createNode(stack, 'Identifier'); 
        node.value = String(value);
        node.raw = node.value;
        return node;
    }

    createBlockStatement(body){
        const node = this.createNode('BlockStatement');
        node.body = body || [];
        return node;
    }

    createBinaryExpression(left, right, operator){
        const node = this.createNode('BinaryExpression');
        node.left = left;
        node.right = right;
        node.operator = operator;
        return node;
    }

    createAssignmentPattern(left, right){
        const node = this.createNode('AssignmentPattern');
        node.left = left;
        node.right = right;
        return node;
    }

    createLogicalExpression(left, right, operator='&&'){
        const node = this.createNode('LogicalExpression');
        node.left = left;
        node.right = right;
        node.operator = operator;
        return node;
    }

    createTemplateLiteral(quasis, expressions){
        const node = this.createNode('TemplateLiteral');
        node.quasis=quasis
        node.expressions = expressions;
        return node;
    }

    createTemplateElement(text){
        const node = this.createNode('TemplateElement');
        node.value = text;
        return node;
    }

    createUpdateExpression(argument, operator, prefix=false){
        const node = this.createNode('UpdateExpression');
        node.argument = argument
        node.operator = operator
        node.prefix = prefix
    }

    createFunctionExpression(block, params=[]){
        const node = this.createNode('FunctionExpression');
        node.params = params
        node.body = block;
        return node;
    }

    createFunctionDeclaration(key, block, params=[]){
        const node = this.createFunctionExpression(block, params);
        node.type = "FunctionDeclaration";
        node.key = this.createIdentifier(key);
        return node;
    }

    createArrowFunctionExpression(block, params=[]){
        const node = this.createNode('ArrowFunctionExpression');
        node.params = params;
        node.body = block;
        return node;
    }

    createReturnStatement( argument ){
        const node = this.createNode('ReturnStatement');
        if(argument){
            node.argument = argument;
        }
        return node;
    }

    createMethodDefinition(key, block, params=[]){
        const node = this.createFunctionExpression(block, params);
        node.type = "MethodDefinition";
        node.key = this.createIdentifier(key);
        return node;
    }

    createObjectExpression(properties ,stack){
        const node = this.createNode(stack, 'ObjectExpression');
        node.properties = properties || [];
        return node;
    }

    createArrayExpression(elements, stack){
        const node = this.createNode(stack, 'ArrayExpression');
        node.elements = elements || [];
        return node;
    }

    createObjectPattern(properties){
        const node = this.createNode('ObjectPattern');
        node.properties = properties;
        return node;
    }

    createProperty(key, init, stack){
        const node = this.createNode(stack, 'Property');
        node.key = key;
        node.computed = key.computed;
        node.init = init;
        return node;
    }

    createSpreadElement(argument){
        const node = this.createNode('SpreadElement')
        node.argument = argument
        return node;
    }

    createMemberExpression(items,stack){
        let object = items.shift();
        while(items.length>1){
            const _node = this.createNode('MemberExpression'); 
            _node.object = object
            _node.property = items.shift();
            object = _node;
        }
        const node = this.createNode(stack, 'MemberExpression'); 
        node.object = object;
        node.property = items.shift();
        return node;
    }

    createComputeMemberExpression(items,stack){
        const node = this.createMemberExpression(items,stack)
        node.computed = true;
        return node;
    }

    createCallExpression(callee, args, stack){
        const node = this.createNode(stack,'CallExpression');
        node.callee = callee;
        node.arguments = args;
        return node;
    }

    createNewExpression(callee, args, stack){
        const node = this.createNode(stack,'NewExpression');
        node.callee = callee;
        node.arguments = args;
        return node;
    }

    createAssignmentExpression(left,right){
        const node = this.createNode('AssignmentExpression');
        node.left = left;
        node.right = right;
        return node;
    }

    createExpressionStatement(expressions){
        const node = this.createNode('ExpressionStatement');
        node.expression=expressions;
        return node;
    }

    createMultipleStatement(expressions){
        const node = this.createNode('MultipleStatement');
        node.expressions=expressions;
        return node;
    }

    createConditionalExpression(test, consequent, alternate){
        const node = this.createNode('ConditionalExpression');
        node.test = test;
        node.consequent = consequent;
        node.alternate = alternate;
        return node;
    }

    createIfStatement(condition,consequent,alternate){
        const node = this.createNode('IfStatement');
        node.condition = condition;
        node.consequent = consequent;
        node.alternate = alternate;
        return node;
    }

    createSequenceExpression(items){
        const node = this.createNode('SequenceExpression');
        node.expressions = items;
        return node;
    }

    createParenthesizedExpression(expression){
        const node = this.createNode('ParenthesizedExpression');
        node.expression = expression;
        return node;
    }

    createUnaryExpression(argument, operator, prefix=false){
        const node = this.createNode('UnaryExpression');
        node.argument = argument;
        node.operator = operator;
        node.prefix = prefix;
        return node;
    }

    createVariableDeclaration(kind, items, stack){
        const node = this.createNode(stack, 'VariableDeclaration');
        node.kind = kind;
        node.declarations = items
        return node;
    }

    createVariableDeclarator(id, init, stack){
        const node = this.createNode(stack, 'VariableDeclarator');
        node.id = id;
        node.init = init;
        return node;
    }

    createLiteral(value, raw, stack){
        const node = this.createNode(stack, 'Literal');
        node.value = value;
        if(raw === void 0){
            if( typeof value === 'string'){
                node.raw = `"${value}"`;
            }else{
                node.raw = String(value); 
            }
        }else{
            node.raw = String(value);
        }
        return node;
    }

    createClassDeclaration(){
        const node = this.createNode('ClassDeclaration');
        node.body = this.createBlockStatement()
        return node;
    }

    createPropertyDefinition(key, init, isStatic=false){
        const node = this.createNode('PropertyDefinition');
        node.key = key;
        node.init = init;
        node.static = isStatic;
        return node;
    }

    createChunkExpression(value, newLine=true, semicolon=false){
        const node = this.createNode('ChunkExpression');
        node.newLine = newLine;
        node.semicolon = semicolon;
        node.value = value;
        node.raw = value;
        return node;
    }

    createThisExpression(stack){
        return this.createNode(stack, 'ThisExpression');
    }

    createSuperExpression(value, stack){
        const node = this.createNode(stack, 'SuperExpression');
        node.value = value;
        return node;
    }

    createImportDeclaration(source, specifiers, stack){
        const node = this.createNode(stack, 'ImportDeclaration');
        node.source = this.createLiteral(source);
        node.specifiers = specifiers;
        return node;
    }

    createImportSpecifier(local, imported=null, hasAs=false){
        if(!local)return null;
        if(imported && !hasAs){
           const node = this.createNode('ImportSpecifier');
           node.imported = this.createIdentifier(imported);
           node.local = this.createIdentifier(local);
           return node;
        }else if( hasAs ){
            const node = this.createNode('ImportNamespaceSpecifier');
            node.local = this.createIdentifier(local);
            return node;
        }else{
            const node = this.createNode('ImportDefaultSpecifier');
            node.local = this.createIdentifier(local);
            return node;
        }
    }

    createExportAllDeclaration(source, exported, stack){
        const node = this.createNode(stack, 'ExportAllDeclaration');
        if(exported==='*')exported = null;
        node.exported = exported ? this.createIdentifier(exported) : null;
        if(!Node.is(source)){
            node.source = this.createLiteral(source);
        }else{
            node.source = source;
        }
        return node;
    }

    createExportDefaultDeclaration(declaration, stack){
        const node = this.createNode(stack, 'ExportDefaultDeclaration');
        if(!Node.is(declaration)){
            declaration =  this.createIdentifier(declaration)
        } 
        node.declaration = declaration;
        return node;
    }

    createExportNamedDeclaration(declaration, source=null, specifiers=[], stack=null){
        const node = this.createNode(stack, 'ExportNamedDeclaration');
        if(declaration){
            node.declaration = declaration
        }else{
            if(source){
                if(!Node.is(source)){
                    node.source = this.createLiteral(source);
                }else{
                    node.source = source
                }
            }
            if(specifiers.length>0){
                node.specifiers = specifiers
            }else{
                throw new Error(`ExportNamedDeclaration arguments 'declaration' or 'source' must have one`)
            }
        }
        return node;
    }

    createExportSpecifier(local, exported=null, stack=null){
        const node = this.createNode(stack, 'ExportSpecifier');
        if(!Node.is(exported||local)){
            node.exported = this.createIdentifier(exported||local);
        }else{
            node.exported = exported||local;
        }
        if(!Node.is(local)){
            node.local = this.createIdentifier(local);
        }else{
            node.local =local;
        }
        return node;
    }
}

export default Token;