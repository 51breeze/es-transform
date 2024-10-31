var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/core/Node.js
var Node, Node_default;
var init_Node = __esm({
  "lib/core/Node.js"() {
    Node = class _Node {
      static is(value) {
        return value ? value instanceof _Node : false;
      }
      static create(type, stack2) {
        return new _Node(type, stack2);
      }
      constructor(type, stack2 = null) {
        this.type = type;
        if (stack2 && stack2.node && stack2.node.loc) {
          this.loc = stack2.node.loc;
        }
      }
    };
    Node_default = Node;
  }
});

// lib/core/Token.js
var require_Token = __commonJS({
  "lib/core/Token.js"(exports2, module2) {
    init_Node();
    var Token2 = class {
      createNode(stack2, type) {
        const isString = typeof stack2 === "string";
        if (!type) {
          type = isString ? stack2 : stack2.toString();
        }
        if (!type) return null;
        return Node_default.create(type, isString ? null : stack2);
      }
      createIdentifier(value, stack2) {
        let node = this.createNode(stack2, "Identifier");
        node.value = String(value);
        node.raw = node.value;
        return node;
      }
      createBlockStatement() {
        const node = this.createNode("BlockStatement");
        node.body = [];
        return node;
      }
      createBinaryExpression(left, right, operator) {
        const node = this.createNode("BinaryExpression");
        node.left = left;
        node.right = right;
        node.operator = operator;
        return node;
      }
      createLogicalExpression(left, right, operator = "&&") {
        const node = this.createNode("LogicalExpression");
        node.left = left;
        node.right = right;
        node.operator = operator;
        return node;
      }
      createTemplateLiteral(quasis, expressions) {
        const node = this.createNode("TemplateLiteral");
        node.quasis = quasis;
        node.expressions = expressions;
        return node;
      }
      createTemplateElement(text) {
        const node = this.createNode("TemplateElement");
        node.value = text;
        return node;
      }
      createUpdateExpression(argument, operator, prefix = false) {
        const node = this.createNode("UpdateExpression");
        node.argument = argument;
        node.operator = operator;
        node.prefix = prefix;
      }
      createFunctionExpression(block, params = []) {
        const node = this.createNode("FunctionExpression");
        node.params = params;
        node.body = block;
        return node;
      }
      createFunctionDeclaration(key, block, params = []) {
        const node = this.createFunctionExpression(block, params);
        node.type = "FunctionDeclaration";
        node.key = this.createIdentifier(key);
        return node;
      }
      createArrowFunctionExpression(block, params = []) {
        const node = this.createNode("ArrowFunctionExpression");
        node.params = params;
        node.body = block;
        return node;
      }
      createReturnStatement(argument) {
        const node = this.createNode("ReturnStatement");
        if (argument) {
          node.argument = argument;
        }
        return node;
      }
      createMethodDefinition(key, block, params = []) {
        const node = this.createFunctionExpression(block, params);
        node.type = "MethodDefinition";
        node.key = this.createIdentifier(key);
        return node;
      }
      createObjectExpression(properties, stack2) {
        const node = this.createNode(stack2, "ObjectExpression");
        node.properties = properties || [];
        return node;
      }
      createArrayExpression(elements, stack2) {
        const node = this.createNode(stack2, "ArrayExpression");
        node.elements = elements || [];
        return node;
      }
      createObjectPattern(properties) {
        const node = this.createNode("ObjectPattern");
        node.properties = properties;
        return node;
      }
      createProperty(key, init, stack2) {
        const node = this.createNode(stack2, "Property");
        node.key = key;
        node.computed = key.computed;
        node.init = init;
        return node;
      }
      createSpreadElement(argument) {
        const node = this.createNode("SpreadElement");
        node.argument = argument;
        return node;
      }
      createMemberExpression(items, stack2) {
        let object = items.shift();
        while (items.length > 1) {
          const _node = this.createNode("MemberExpression");
          _node.object = object;
          _node.property = items.shift();
          object = _node;
        }
        const node = this.createNode(stack2, "MemberExpression");
        node.object = object;
        node.property = items.shift();
        return node;
      }
      createComputeMemberExpression(items, stack2) {
        const node = this.createMemberExpression(items, stack2);
        node.computed = true;
        return node;
      }
      createCallExpression(callee, args, stack2) {
        const node = this.createNode(stack2, "CallExpression");
        node.callee = callee;
        node.arguments = args;
        return node;
      }
      createNewExpression(callee, args, stack2) {
        const node = this.createNode(stack2, "NewExpression");
        node.callee = callee;
        node.arguments = args;
        return node;
      }
      createAssignmentExpression(left, right) {
        const node = this.createNode("AssignmentExpression");
        node.left = left;
        node.right = right;
        return node;
      }
      createExpressionStatement(expressions) {
        const node = this.createNode("ExpressionStatement");
        node.expression = expressions;
        return node;
      }
      createMultipleStatement(expressions) {
        const node = this.createNode("MultipleStatement");
        node.expressions = expressions;
        return node;
      }
      createSequenceExpression(items) {
        const node = this.createNode("SequenceExpression");
        node.expressions = items;
        return node;
      }
      createParenthesizedExpression(expression) {
        const node = this.createNode("ParenthesizedExpression");
        node.expression = expression;
        return node;
      }
      createVariableDeclaration(kind, items, stack2) {
        const node = this.createNode(stack2, "VariableDeclaration");
        node.kind = kind;
        node.declarations = items;
        return node;
      }
      createVariableDeclarator(id, init, stack2) {
        const node = this.createNode(stack2, "VariableDeclarator");
        node.id = id;
        node.init = init;
        return node;
      }
      createLiteral(value, raw, stack2) {
        const node = this.createNode(stack2, "Literal");
        node.value = value;
        if (raw === void 0) {
          if (typeof value === "string") {
            node.raw = `"${value}"`;
          } else {
            node.raw = String(value);
          }
        } else {
          node.raw = String(value);
        }
        return node;
      }
      createClassDeclaration() {
        const node = this.createNode("ClassDeclaration");
        node.body = this.createBlockStatement();
        return node;
      }
      createChunkExpression(value, newLine = true, semicolon = false) {
        const node = this.createNode("ChunkExpression");
        node.newLine = newLine;
        node.semicolon = semicolon;
        node.value = value;
        node.raw = value;
        return node;
      }
      createThisExpression(stack2) {
        return this.createNode(stack2, "ThisExpression");
      }
      createSuperExpression(value, stack2) {
        const node = this.createNode(stack2, "SuperExpression");
        node.value = value;
        return node;
      }
      createImportDeclaration(source, specifiers, stack2) {
        const node = this.createNode(stack2, "ImportDeclaration");
        node.source = this.createLiteral(source);
        node.specifiers = specifiers;
        return node;
      }
      createImportSpecifier(local, imported = null, hasAs = false) {
        if (!local) return null;
        if (imported && !hasAs) {
          const node = this.createNode("ImportSpecifier");
          node.imported = this.createIdentifier(imported);
          node.local = this.createIdentifier(local);
          return node;
        } else if (hasAs) {
          const node = this.createNode("ImportNamespaceSpecifier");
          node.local = this.createIdentifier(local);
          return node;
        } else {
          const node = this.createNode("ImportDefaultSpecifier");
          node.local = this.createIdentifier(local);
          return node;
        }
      }
      createExportAllDeclaration(source, exported, stack2) {
        const node = this.createNode(stack2, "ExportAllDeclaration");
        if (exported === "*") exported = null;
        node.exported = exported ? this.createIdentifier(exported) : null;
        if (!Node_default.is(source)) {
          node.source = this.createLiteral(source);
        } else {
          node.source = source;
        }
        return node;
      }
      createExportDefaultDeclaration(declaration, stack2) {
        const node = this.createNode(stack2, "ExportDefaultDeclaration");
        if (!Node_default.is(declaration)) {
          declaration = this.createIdentifier(declaration);
        }
        node.declaration = declaration;
        return node;
      }
      createExportNamedDeclaration(declaration, source = null, specifiers = [], stack2 = null) {
        const node = this.createNode(stack2, "ExportNamedDeclaration");
        if (declaration) {
          node.declaration = declaration;
        } else {
          if (source) {
            if (!Node_default.is(source)) {
              node.source = this.createLiteral(source);
            } else {
              node.source = source;
            }
          }
          if (specifiers.length > 0) {
            node.specifiers = specifiers;
          } else {
            throw new Error(`ExportNamedDeclaration arguments 'declaration' or 'source' must have one`);
          }
        }
        return node;
      }
      createExportSpecifier(local, exported = null, stack2 = null) {
        const node = this.createNode(stack2, "ExportSpecifier");
        if (!Node_default.is(exported || local)) {
          node.exported = this.createIdentifier(exported || local);
        } else {
          node.exported = exported || local;
        }
        if (!Node_default.is(local)) {
          node.local = this.createIdentifier(local);
        } else {
          node.local = local;
        }
        return node;
      }
    };
    module2.exports = Token2;
  }
});

// lib/index.js
var lib_exports = {};
__export(lib_exports, {
  default: () => lib_default,
  getOptions: () => getOptions,
  plugin: () => plugin
});
module.exports = __toCommonJS(lib_exports);
var import_path6 = __toESM(require("path"));
var import_merge = __toESM(require("lodash/merge"));

// lib/core/Plugin.js
var import_Compilation = __toESM(require("easescript/lib/core/Compilation"));
var import_glob_path = __toESM(require("glob-path"));

// lib/core/Builder.js
var import_Utils17 = __toESM(require("easescript/lib/core/Utils"));

// lib/core/Context.js
var import_path2 = __toESM(require("path"));
var import_fs2 = __toESM(require("fs"));
var import_Token = __toESM(require_Token());

// lib/tokens/index.js
var tokens_exports = {};
__export(tokens_exports, {
  AnnotationDeclaration: () => AnnotationDeclaration_default,
  AnnotationExpression: () => AnnotationExpression_default,
  ArrayExpression: () => ArrayExpression_default,
  ArrayPattern: () => ArrayPattern_default,
  ArrowFunctionExpression: () => ArrowFunctionExpression_default,
  AssignmentExpression: () => AssignmentExpression_default,
  AssignmentPattern: () => AssignmentPattern_default,
  AwaitExpression: () => AwaitExpression_default,
  BinaryExpression: () => BinaryExpression_default,
  BlockStatement: () => BlockStatement_default,
  BreakStatement: () => BreakStatement_default,
  CallExpression: () => CallExpression_default,
  ChainExpression: () => ChainExpression_default,
  ClassDeclaration: () => ClassDeclaration_default,
  ConditionalExpression: () => ConditionalExpression_default,
  ContinueStatement: () => ContinueStatement_default,
  Declarator: () => Declarator_default,
  DeclaratorDeclaration: () => DeclaratorDeclaration_default,
  DoWhileStatement: () => DoWhileStatement_default,
  EmptyStatement: () => EmptyStatement_default,
  EnumDeclaration: () => EnumDeclaration_default,
  EnumProperty: () => EnumProperty_default,
  ExportAllDeclaration: () => ExportAllDeclaration_default,
  ExportDefaultDeclaration: () => ExportDefaultDeclaration_default,
  ExportNamedDeclaration: () => ExportNamedDeclaration_default,
  ExportSpecifier: () => ExportSpecifier_default,
  ExpressionStatement: () => ExpressionStatement_default,
  ForInStatement: () => ForInStatement_default,
  ForOfStatement: () => ForOfStatement_default,
  ForStatement: () => ForStatement_default,
  FunctionDeclaration: () => FunctionDeclaration_default,
  FunctionExpression: () => FunctionExpression_default,
  Identifier: () => Identifier_default,
  IfStatement: () => IfStatement_default,
  ImportDeclaration: () => ImportDeclaration_default,
  ImportDefaultSpecifier: () => ImportDefaultSpecifier_default,
  ImportExpression: () => ImportExpression_default,
  ImportNamespaceSpecifier: () => ImportNamespaceSpecifier_default,
  ImportSpecifier: () => ImportSpecifier_default,
  InterfaceDeclaration: () => InterfaceDeclaration_default,
  JSXAttribute: () => JSXAttribute_default,
  JSXCdata: () => JSXCdata_default,
  JSXClosingElement: () => JSXClosingElement_default,
  JSXClosingFragment: () => JSXClosingFragment_default,
  JSXElement: () => JSXElement,
  JSXEmptyExpression: () => JSXEmptyExpression_default,
  JSXExpressionContainer: () => JSXExpressionContainer_default,
  JSXFragment: () => JSXFragment_default,
  JSXIdentifier: () => JSXIdentifier_default,
  JSXMemberExpression: () => JSXMemberExpression_default,
  JSXNamespacedName: () => JSXNamespacedName_default,
  JSXOpeningElement: () => JSXOpeningElement_default,
  JSXOpeningFragment: () => JSXOpeningFragment_default,
  JSXScript: () => JSXScript_default,
  JSXSpreadAttribute: () => JSXSpreadAttribute_default,
  JSXStyle: () => JSXStyle_default,
  JSXText: () => JSXText_default,
  LabeledStatement: () => LabeledStatement_default,
  Literal: () => Literal_default,
  LogicalExpression: () => LogicalExpression_default,
  MemberExpression: () => MemberExpression_default,
  MethodDefinition: () => MethodDefinition_default,
  MethodGetterDefinition: () => MethodGetterDefinition_default,
  MethodSetterDefinition: () => MethodSetterDefinition_default,
  NewExpression: () => NewExpression_default,
  ObjectExpression: () => ObjectExpression_default,
  ObjectPattern: () => ObjectPattern_default,
  PackageDeclaration: () => PackageDeclaration_default,
  ParenthesizedExpression: () => ParenthesizedExpression_default,
  Property: () => Property_default,
  PropertyDefinition: () => PropertyDefinition_default,
  RestElement: () => RestElement_default,
  ReturnStatement: () => ReturnStatement_default,
  SequenceExpression: () => SequenceExpression_default,
  SpreadElement: () => SpreadElement_default,
  StructTableColumnDefinition: () => StructTableColumnDefinition_default,
  StructTableDeclaration: () => StructTableDeclaration_default,
  StructTableKeyDefinition: () => StructTableKeyDefinition_default,
  StructTableMethodDefinition: () => StructTableMethodDefinition_default,
  StructTablePropertyDefinition: () => StructTablePropertyDefinition_default,
  SuperExpression: () => SuperExpression_default,
  SwitchCase: () => SwitchCase_default,
  SwitchStatement: () => SwitchStatement_default,
  TemplateElement: () => TemplateElement_default,
  TemplateLiteral: () => TemplateLiteral_default,
  ThisExpression: () => ThisExpression_default,
  ThrowStatement: () => ThrowStatement_default,
  TryStatement: () => TryStatement_default,
  TypeAssertExpression: () => TypeAssertExpression_default,
  TypeTransformExpression: () => TypeTransformExpression_default,
  UnaryExpression: () => UnaryExpression_default,
  UpdateExpression: () => UpdateExpression_default,
  VariableDeclaration: () => VariableDeclaration_default,
  VariableDeclarator: () => VariableDeclarator_default,
  WhenStatement: () => WhenStatement_default,
  WhileStatement: () => WhileStatement_default
});

// lib/tokens/AnnotationDeclaration.js
function AnnotationDeclaration_default() {
}

// lib/core/Common.js
var import_Utils = __toESM(require("easescript/lib/core/Utils"));

// lib/core/Cache.js
var records = /* @__PURE__ */ new Map();
function set(key, name, value) {
  let dataset = records.get(key);
  if (!dataset) {
    records.set(key, dataset = /* @__PURE__ */ new Map());
  }
  dataset.set(name, value);
  return value;
}
function get(key, name) {
  let dataset = records.get(key);
  return dataset ? dataset.get(name) : null;
}
function has(key, name) {
  let dataset = records.get(key);
  return dataset ? dataset.has(name) : false;
}

// lib/core/Common.js
var import_Namespace = __toESM(require("easescript/lib/core/Namespace"));
var emptyObject = {};
var emptyArray = [];
var annotationIndexers = {
  env: ["name", "value", "expect"],
  runtime: ["platform", "expect"],
  syntax: ["plugin", "expect"],
  plugin: ["name", "expect"],
  version: ["name", "version", "operator", "expect"],
  readfile: ["dir", "load", "suffix", "relative", "lazy", "only", "source"],
  http: ["classname", "action", "param", "data", "method", "config"],
  router: ["classname", "action", "param"],
  alias: ["name", "version"],
  hook: ["type", "version"],
  url: ["source"]
};
var compareOperatorMaps = {
  ">=": "egt",
  "<=": "elt",
  "!=": "neq",
  ">": "gt",
  "<": "lt",
  "=": "eq"
};
var compareOperators = [">=", "<=", "!=", ">", "<", "="];
var beginNumericRE = /^\d+/;
function beginNumericLiteral(value) {
  return beginNumericRE.test(value);
}
function parseMacroAnnotation(annotation) {
  if (!(annotation.isAnnotationDeclaration || annotation.isAnnotationExpression)) {
    return null;
  }
  const annName = annotation.getLowerCaseName();
  const indexes = annotationIndexers[annName];
  if (!indexes) {
    throw new Error(`Annotation arguments is not defined. the '${annName}' annotations.`);
  }
  const args = annotation.getArguments();
  if (!args.length) return emptyObject;
  return parseMacroArguments(args, annName, indexes);
}
function parseMacroArguments(args, name, indexes = null) {
  indexes = indexes || annotationIndexers[name];
  const _expect = getAnnotationArgument("expect", args, indexes);
  const expect = _expect ? String(_expect.value).trim() !== "false" : true;
  switch (name) {
    case "runtime":
    case "syntax":
      return {
        value: getAnnotationArgumentValue(args[0]),
        expect
      };
    case "env": {
      const _name = getAnnotationArgument("name", args, indexes);
      const _value = getAnnotationArgument("value", args, indexes);
      if (_value && _name) {
        return {
          name: getAnnotationArgumentValue(_name),
          value: getAnnotationArgumentValue(_value),
          expect
        };
      } else {
        return emptyObject;
      }
    }
    case "version": {
      const name2 = getAnnotationArgument("name", args, indexes);
      const version = getAnnotationArgument("version", args, indexes);
      const operator = getAnnotationArgument("operator", args, indexes);
      if (name2 && version) {
        return {
          name: getAnnotationArgumentValue(name2),
          version: getAnnotationArgumentValue(version),
          operator: getAnnotationArgumentValue(operator) || "elt",
          expect
        };
      } else {
        return emptyObject;
      }
    }
  }
  return null;
}
function parseMacroMethodArguments(args, name) {
  args = args.map((item, index) => {
    let value = null;
    let key = index;
    let assigned = false;
    if (item.isAssignmentExpression) {
      assigned = true;
      key = item.left.value();
      value = item.right.value();
    } else {
      value = item.value();
    }
    return { index, key, value, assigned, stack: item };
  });
  return parseMacroArguments(args, name);
}
function parseReadfileAnnotation(ctx2, stack2) {
  let args = stack2.getArguments();
  let indexes = annotationIndexers.readfile;
  let stackArgs = {};
  let annotArgs = indexes.map((key) => {
    return stackArgs[key] = getAnnotationArgument(key, args, indexes);
  });
  let dirStack = annotArgs[0] && annotArgs[0].stack;
  let [_path, _load, _suffix, _relative, _lazy, _only, _source] = annotArgs.map((item) => {
    return item ? item.value : null;
  });
  if (!_path) {
    return null;
  }
  let dir = String(_path).trim();
  let [load, relative, lazy, only2, source] = [_load, _relative, _lazy, _only, _source].map((value) => {
    value = String(value).trim();
    return value == "true" || value === "TRUE";
  });
  let suffixPattern = null;
  if (dir.charCodeAt(0) === 64) {
    dir = dir.slice(1);
    let segs = dir.split(".");
    let precede = segs.shift();
    let latter = segs.pop();
    let options = ctx2.plugin[precede];
    if (precede === "options") {
      while (options && segs.length > 0) {
        options = options[segs.shift()];
      }
    }
    if (options && Object.prototype.hasOwnProperty.call(options, latter)) {
      dir = options[latter];
    }
  }
  let rawDir = dir;
  dir = stack2.compiler.resolveManager.resolveSource(dir, stack2.compilation.file);
  if (!dir) {
    ctx2.error(`Readfile not found the '${rawDir}' folders`, dirStack || stack2);
    return null;
  }
  if (_suffix) {
    _suffix = String(_suffix).trim();
    if (_suffix.charCodeAt(0) === 47 && _suffix.charCodeAt(_suffix.length - 1) === 47) {
      let index = _suffix.lastIndexOf("/");
      let flags = "";
      if (index > 0 && index !== _suffix.length - 1) {
        flags = _suffix.slice(index);
        _suffix = _suffix(0, index);
      }
      _suffix = suffixPattern = new RegExp(_suffix.slice(1, -1), flags);
    } else {
      _suffix = _suffix.split(",").map((item) => item.trim());
    }
  }
  let extensions2 = (stack2.compiler.options.extensions || []).map((ext) => String(ext).startsWith(".") ? ext : "." + ext);
  if (!extensions2.includes(".es")) {
    extensions2.push(".es");
  }
  let suffix = _suffix || [...extensions2, ".json", ".env", ".js", ".css", ".scss", ".less"];
  const checkSuffix = (file) => {
    if (suffixPattern) {
      return suffixPattern.test(filepath);
    }
    if (suffix === "*") return true;
    return suffix.some((item) => file.endsWith(item));
  };
  let files = stack2.compiler.resolveFiles(dir).filter(checkSuffix);
  if (!files.length) return null;
  files.sort((a, b) => {
    a = a.replaceAll(".", "/").split("/").length;
    b = b.replaceAll(".", "/").split("/").length;
    return a - b;
  });
  return {
    args: stackArgs,
    dir,
    only: only2,
    suffix,
    load,
    relative,
    source,
    lazy,
    files
  };
}
function parseUrlAnnotation(ctx2, stack2) {
  const args = stack2.getArguments();
  return args.map((arg) => {
    if (arg && arg.resolveFile) {
      const asset = (stack2.module || stack2.compilation).assets.get(arg.resolveFile);
      if (asset) {
        return {
          id: asset.assign,
          file: asset.file,
          resolve: arg.resolveFile
        };
      }
    }
    return null;
  }).filter(Boolean);
}
function parseEnvAnnotation(ctx2, stack2) {
  const args = stack2.getArguments();
  return args.map((item) => {
    let key = item.assigned ? item.key : item.value;
    let value = ctx2.options.metadata.env[key] || process.env[key];
    if (!value && item.assigned) {
      value = item.value;
    }
    let type = typeof value;
    if (value != null && (type === "number" || type === "string" || type === "boolean" || type === "bigint")) {
      return {
        key,
        value
      };
    }
  }).filter(Boolean);
}
function parseHttpAnnotation(ctx2, stack2) {
  const args = stack2.getArguments();
  const indexes = annotationIndexers.indexes;
  const [moduleClass, actionArg, paramArg, dataArg, methodArg, configArg] = indexes.map((key) => getAnnotationArgument(key, args, indexes));
  const providerModule = moduleClass ? import_Namespace.default.globals.get(moduleClass.value) : null;
  if (!providerModule) {
    ctx2.error(`Class '${moduleClass.value}' is not exists.`);
  } else {
    const member = actionArg ? providerModule.getMember(actionArg.value) : null;
    if (!member || !import_Utils.default.isModifierPublic(member) || !(member.isMethodDefinition && !(member.isMethodGetterDefinition || member.isMethodSetterDefinition))) {
      ctx2.error(`Method '${moduleClass.value}::${actionArg && actionArg.value}' is not exists.`, actionArg ? actionArg.stack : stack2);
    } else {
      return {
        args: {
          data: dataArg,
          param: paramArg,
          config: configArg,
          method: methodArg,
          action: actionArg,
          module: moduleClass
        },
        module: providerModule,
        method: member
      };
    }
  }
  return null;
}
function parseDefineAnnotation(annotation) {
  const args = annotation.getArguments();
  const data = /* @__PURE__ */ Object.create(null);
  args.forEach((arg) => {
    if (arg.assigned) {
      data[String(arg.key).toLowerCase()] = arg.value;
    } else {
      data[String(arg.value).toLowerCase()] = true;
    }
  });
  return data;
}
function parseHookAnnotation(annotation, pluginVersion = "0.0.0", optionVersion = {}) {
  const args = annotation.getArguments();
  if (args.length >= 1) {
    const [type, version] = getAnnotationArguments(
      args,
      annotationIndexers.hook
    ).map((item) => getAnnotationArgumentValue(item));
    if (version) {
      const result = parseVersionExpression(version, pluginVersion, optionVersion);
      if (result) {
        if (compareVersion(result.left, result.right, result.operator)) {
          return {
            type
          };
        }
      }
      return false;
    } else {
      return {
        type
      };
    }
  } else {
    console.error("[es-transform] Annotations hook missing arguments");
    return false;
  }
}
function parseAliasAnnotation(annotation, pluginVersion, optionVersions = {}) {
  if (!annotation) return null;
  const args = annotation.getArguments();
  if (args.length > 0) {
    const indexes = annotationIndexers.alias;
    const [name, version] = getAnnotationArguments(args, indexes).map((arg) => getAnnotationArgumentValue(arg));
    if (name) {
      if (version) {
        const result = parseVersionExpression(version, pluginVersion, optionVersions);
        if (result) {
          if (compareVersion(result.left, result.right, result.operator)) {
            return name;
          }
        }
      } else {
        return name;
      }
    }
  }
  return null;
}
function getModuleAnnotations(module2, allows = [], inheritFlag = true) {
  if (!import_Utils.default.isModule(module2) || !allows.length) return emptyArray;
  let key = `Common.getModuleAnnotations:${String(inheritFlag)}:${allows.join("-")}`;
  let old = get(module2, key);
  if (old) return old;
  let result = [];
  module2.getAnnotations((annotation) => {
    if (allows.includes(annotation.getLowerCaseName())) {
      result.push(annotation);
    }
  }, inheritFlag);
  set(module2, key, result);
  return result;
}
function getMethodAnnotations(methodStack, allows = [], inheritFlag = true) {
  if (!import_Utils.default.isStack(methodStack) || !(methodStack.isMethodDefinition || methodStack.isPropertyDefinition)) return emptyArray;
  let result = [];
  let key = `Common.getMethodAnnotations:${String(inheritFlag)}:${allows.join("-")}`;
  let old = get(methodStack, key);
  if (old) return old;
  methodStack.findAnnotation(methodStack, (annotation) => {
    if (allows.includes(annotation.getLowerCaseName())) {
      result.push(annotation);
    }
  }, inheritFlag);
  set(methodStack, key, result);
  return result;
}
function getAnnotationArgument(name, args, indexes = null) {
  name = String(name).toLowerCase();
  let index = args.findIndex((item) => {
    const key = String(item.key).toLowerCase();
    return key === name;
  });
  if (index < 0 && indexes && Array.isArray(indexes)) {
    index = indexes.indexOf(name);
    if (index >= 0) {
      const arg = args[index];
      return arg && !arg.assigned ? arg : null;
    }
  }
  return args[index];
}
function getAnnotationArguments(args, indexes = []) {
  return indexes.map((key) => getAnnotationArgument(key, args, indexes));
}
function getAnnotationArgumentValue(argument) {
  return argument ? argument.value : null;
}
function isRuntime(name, metadata = {}) {
  name = String(name).toLowerCase();
  if (!(name === "client" || name === "server")) return false;
  return compare(metadata.platform, name) || compare(process.env.platform, name);
}
function compare(left, right) {
  if (!left || !right) return false;
  if (left === right) return true;
  left = String(left);
  right = String(right);
  return left.toLowerCase() === right.toLowerCase();
}
function isSyntax(name, value) {
  if (!name) return false;
  if (name === value) return true;
  return compare(name, value);
}
function isEnv(name, value, options = {}) {
  const metadata = options.metadata || {};
  const env = metadata?.env || {};
  let lower = String(name).toLowerCase();
  if (value !== void 0) {
    if (process.env[name] === value) return true;
    if (lower === "mode") {
      if (options.mode === value || "production" === value) {
        return true;
      }
    }
    if (lower === "hot") {
      if (options.hot === value) {
        return true;
      }
    }
    return env[name] === value;
  }
  return false;
}
function toVersion(value) {
  const [a = "0", b = "0", c = "0"] = Array.from(String(value).matchAll(/\d+/g)).map((item) => item ? item[0].substring(0, 2) : "0");
  return [a, b, c].join(".");
}
function compareVersion(left, right, operator = "elt") {
  operator = operator.toLowerCase();
  if (operator === "eq" && left == right) return true;
  if (operator === "neq" && left != right) return true;
  const toInt = (val) => {
    val = parseInt(val);
    return isNaN(val) ? 0 : val;
  };
  left = String(left).split(".", 3).map(toInt);
  right = String(right).split(".", 3).map(toInt);
  for (let i = 0; i < left.length; i++) {
    let l = left[i] || 0;
    let r = right[i] || 0;
    if (operator === "eq") {
      if (l != r) {
        return false;
      }
    } else {
      if (l != r) {
        if (operator === "gt" && !(l > r)) {
          return false;
        } else if (operator === "egt" && !(l >= r)) {
          return false;
        } else if (operator === "lt" && !(l < r)) {
          return false;
        } else if (operator === "elt" && !(l <= r)) {
          return false;
        } else if (operator === "neq") {
          return true;
        }
        return true;
      }
    }
  }
  return operator === "eq" || operator === "egt" || operator === "elt";
}
function createRoutePath(route, params = {}) {
  if (!route || !route.path || !route.isRoute) {
    throw new Error("route invalid");
  }
  params = Object.assign({}, route.params || {}, params);
  return "/" + route.path.split("/").map((segment, index) => {
    if (segment.charCodeAt(0) === 58) {
      segment = segment.slice(1);
      const optional = segment.charCodeAt(segment.length - 1) === 63;
      if (optional) {
        segment = segment.slice(0, -1);
      }
      if (params[segment]) {
        return params[segment];
      }
      if (!optional) {
        console.error(`[es-transform] Route params the "${segment}" missing default value or set optional. on page-component the "${route.path}"`);
      }
      return null;
    }
    return segment;
  }).filter((val) => !!val).join("/");
}
function getModuleRoutes(module2, allows = ["router"], options = {}) {
  if (!import_Utils.default.isModule(module2) || !module2.isClass) return [];
  const routes = [];
  const annotations = getModuleAnnotations(module2, allows);
  if (annotations && annotations.length) {
    annotations.forEach((annotation) => {
      const args = annotation.getArguments();
      let annotName = annotation.getLowerCaseName();
      let method = annotName;
      if (annotName === "router") {
        method = "*";
        const methodArg = getAnnotationArgument("method", args, []);
        if (methodArg) {
          method = String(methodArg.value).toLowerCase();
        }
      }
      const pathArg = getAnnotationArgument("path", args, ["path"]);
      const defaultValue = {};
      const params = args.filter((arg) => !(arg === method || arg === pathArg)).map((item) => {
        return getModuleRouteParamRule(item.assigned ? item.key : item.value, item.stack, defaultValue);
      });
      let withNs = options.routePathWithNamespace?.client;
      let className = module2.getName("/");
      let pathName = pathArg ? pathArg.value : withNs === false ? module2.id : className;
      if (pathName.charCodeAt(0) === 47) {
        pathName = pathName.substring(1);
      }
      if (pathName.charCodeAt(pathName.length - 1) === 47) {
        pathName = pathName.slice(0, -1);
      }
      let segments = [pathName].concat(params);
      let routePath = "/" + segments.join("/");
      let formatRoute = options.formation?.route;
      if (formatRoute) {
        routePath = formatRoute(routePath, {
          pathArg,
          params,
          method,
          defaultParamsValue: defaultValue,
          className: module2.getName()
        }) || routePath;
      }
      routes.push({
        isRoute: true,
        name: className,
        path: routePath,
        params: defaultValue,
        method,
        module: module2
      });
    });
  }
  return routes;
}
function getModuleRouteParamRule(name, annotParamStack, defaultValue = {}) {
  let question = annotParamStack.question || annotParamStack.node.question;
  if (annotParamStack.isAssignmentPattern) {
    if (!question) question = annotParamStack.left.question || annotParamStack.left.node.question;
    if (annotParamStack.right.isIdentifier || annotParamStack.right.isLiteral) {
      defaultValue[name] = annotParamStack.right.value();
    } else {
      const gen = new Generator();
      gen.make(this.createToken(annotParamStack.right));
      defaultValue[name] = gen.toString();
    }
  }
  return question ? ":" + name + "?" : ":" + name;
}
function parseVersionExpression(expression, pluginVersion = "0.0.0", optionVersions = {}) {
  expression = String(expression).trim();
  const token = compareOperators.find((value) => {
    return expression.includes(value) || expression.includes(compareOperatorMaps[value]);
  });
  if (!token) {
    throw new Error("Version expression operator is invalid. availables:" + compareOperators.join(", "));
  }
  const operation = expression.includes(token) ? token : compareOperatorMaps[token];
  const segs = expression.split(operation, 2).map((val) => val.trim());
  if (!segs[0]) segs[0] = pluginVersion;
  else if (!segs[1]) segs[1] = pluginVersion;
  if (segs.length === 2) {
    let left = segs[0];
    let right = segs[1];
    if (!beginNumericLiteral(left)) {
      left = optionVersions[left] || "0.0.0";
    }
    if (!beginNumericLiteral(right)) {
      right = optionVersions[right] || "0.0.0";
    }
    if (left && right) {
      return {
        left: toVersion(left),
        right: toVersion(right),
        operator: compareOperatorMaps[token]
      };
    }
  } else {
    throw new Error("Version expression parse failed");
  }
}
function createFormatImportSpecifiers(stack2) {
  return stack2.specifiers.map((spec) => {
    if (spec.isImportDefaultSpecifier) {
      return {
        local: spec.value(),
        stack: spec
      };
    } else if (spec.isImportSpecifier) {
      return {
        local: spec.value(),
        imported: spec.imported.value(),
        stack: spec
      };
    } else if (spec.isImportNamespaceSpecifier) {
      return {
        local: spec.value(),
        imported: "*",
        stack: spec
      };
    }
  });
}
function parseImportDeclaration(ctx2, stack2, context = null, graph = null) {
  let importSource = null;
  if (!graph && context) {
    graph = ctx2.getBuildGraph(context);
  }
  if (stack2.source.isLiteral) {
    let compilation = stack2.getResolveCompilation();
    let source = stack2.getResolveFile() || stack2.source.value();
    let specifiers = null;
    if (compilation && !compilation.isDescriptorDocument()) {
      source = ctx2.getModuleImportSource(source, stack2.compilation.file);
      specifiers = createFormatImportSpecifiers(stack2);
      ctx2.addFragment(compilation);
    } else {
      let external = isExternalDependency(ctx2.options.dependences.externals, source, context);
      specifiers = createFormatImportSpecifiers(stack2);
      if (!external) {
        source = ctx2.getImportAssetsMapping(source, {
          group: "imports",
          source,
          specifiers,
          ctx: ctx2,
          context
        });
        if (source) {
          let asset = ctx2.createAsset(source);
          source = ctx2.getAssetsImportSource(asset, stack2.compilation);
          graph.addAsset(asset);
        }
      }
    }
    if (source) {
      if (specifiers.length > 0) {
        specifiers.forEach((spec) => {
          importSource = ctx2.addImport(source, spec.local, spec.imported, spec.stack);
        });
      } else {
        importSource = ctx2.addImport(source, null, null, stack2.source);
      }
      if (compilation) {
        importSource.setSourceTarget(compilation);
      }
    }
  } else {
    const classModule = stack2.description();
    if (classModule && classModule.isModule && ctx2.isActiveModule(classModule) && ctx2.isNeedBuild(classModule)) {
      let local = stack2.alias ? stack2.alias.value() : classModule.id;
      let source = ctx2.getModuleImportSource(classModule, import_Utils.default.isModule(context) ? context : stack2.compilation);
      importSource = ctx2.addImport(source, local, null, stack2.source);
      importSource.setSourceTarget(classModule);
    }
  }
  if (importSource) {
    importSource.setSourceContext(context);
    importSource.stack = stack2;
    if (graph) {
      graph.addImport(importSource);
    }
  }
  return importSource;
}
var allMethods = ["get", "post", "put", "delete", "option", "router"];
function createHttpAnnotationNode(ctx2, stack2) {
  const result = parseHttpAnnotation(ctx2, stack2);
  if (!result) return null;
  const { param, method, data, config } = result.args;
  const routeConfigNode = createRouteConfigNode(ctx2, result.module, result.method, param);
  const createArgNode = (argItem) => {
    if (argItem) {
      if (argItem.stack.isAssignmentPattern) {
        return ctx2.createToken(argItem.stack.right);
      } else {
        return ctx2.createToken(argItem.stack);
      }
    }
    return null;
  };
  const System = import_Namespace.default.globals.get("System");
  const Http = import_Namespace.default.globals.get("net.Http");
  ctx2.addDepend(System, stack2.module);
  ctx2.addDepend(Http, stack2.module);
  const props = {
    data: createArgNode(data),
    options: createArgNode(config),
    method: method && allMethods.includes(method.value) ? ctx2.createLiteral(method.value) : null
  };
  const properties = Object.keys(props).map((name) => {
    const value = props[name];
    if (value) {
      return ctx2.createProperty(ctx2.createIdentifier(name), value);
    }
    return null;
  }).filter((item) => !!item);
  let calleeArgs = [
    ctx2.createIdentifier(
      ctx2.getGlobalRefName(
        stack2,
        ctx2.getModuleReferenceName(Http, stack2.module)
      )
    ),
    routeConfigNode
  ];
  if (properties.length > 0) {
    calleeArgs.push(ctx2.createObjectExpression(properties));
  }
  return ctx2.createCallExpression(
    ctx2.createMemberExpression([
      ctx2.createIdentifier(
        ctx2.getGlobalRefName(
          stack2,
          ctx2.builder.getModuleReferenceName(System, stack2.module)
        )
      ),
      ctx2.createIdentifier("createHttpRequest")
    ]),
    calleeArgs,
    stack2
  );
}
function createUrlAnnotationNode(ctx2, stack2) {
  let result = parseUrlAnnotation(ctx2, stack2);
  if (result.length > 0) {
    let items = result.map((item) => {
      if (item.id) return ctx2.createIdentifier(item.id);
      return ctx2.createLiteral(item.resolve);
    });
    if (items.length > 1) {
      return ctx2.createArrayExpression(items);
    } else {
      return items[0];
    }
  }
  return ctx2.createLiteral("");
}
function createEmbedAnnotationNode(ctx2, stack2) {
  let result = parseUrlAnnotation(ctx2, stack2);
  if (result.length > 0) {
    let items = result.map((item) => {
      if (item.id) return ctx2.createIdentifier(item.id);
      return ctx2.createLiteral(
        ctx2.getRelativePath(stack2.file, item.resolve)
      );
    });
    if (items.length > 1) {
      return ctx2.createArrayExpression(items);
    } else {
      return items[0];
    }
  }
  return ctx2.createLiteral("");
}
function createEnvAnnotationNode(ctx2, stack2) {
  let result = parseEnvAnnotation(ctx2, stack2);
  if (result.length > 0) {
    let properties = result.map((item) => {
      return ctx2.createProperty(ctx2.createIdentifier(item.key), ctx2.createLiteral(item.value));
    });
    return ctx2.createObjectExpression(properties);
  }
  return ctx2.createLiteral(null);
}
function createRouterAnnotationNode(ctx2, stack2) {
  const result = parseHttpAnnotation(ctx2, stack2);
  if (!result) return null;
  if (result.isWebComponent) {
    let route = getModuleRoutes(result.module, ["router"], ctx2.options);
    if (route && Array.isArray(route)) route = route[0];
    if (!route) {
      return ctx2.createLiteral(result.module.getName("/"));
    }
    const paramArg = result.args.param;
    if (!paramArg) {
      return ctx2.createLiteral(createRoutePath(route));
    } else {
      const System = import_Namespace.default.globals.get("System");
      const routePath = "/" + route.path.split("/").map((segment) => {
        if (segment.charCodeAt(0) === 58) {
          return "<" + segment.slice(1) + ">";
        }
        return segment;
      }).filter((val) => !!val).join("/");
      let paramNode = ctx2.createToken(paramArg.assigned ? paramArg.stack.right : paramArg.stack);
      ctx2.addDepend(System, stack2.module);
      if (route.params) {
        const defaultParams = ctx2.createObjectExpression(
          Object.keys(route.params).map((name) => {
            const value = route.params[name];
            return ctx2.createProperty(ctx2.createIdentifier(name), ctx2.createLiteral(value));
          })
        );
        paramNode = ctx2.createCallExpression(
          ctx2.createMemberExpression([
            ctx2.createIdentifier("Object"),
            ctx2.createIdentifier("assign")
          ]),
          [
            defaultParams,
            paramNode
          ]
        );
      }
      return ctx2.createCallExpression(
        ctx2.createMemberExpression([
          ctx2.createIdentifier(
            ctx2.getGlobalRefName(
              stack2,
              ctx2.getModuleReferenceName(System, stack2.module)
            ),
            stack2
          ),
          ctx2.createIdentifier("createHttpRoute", stack2)
        ]),
        [
          ctx2.createLiteral(routePath),
          paramNode
        ],
        stack2
      );
    }
  } else {
    return createRouteConfigNode(ctx2, result.module, result.method, result.args.param);
  }
}
function createMainAnnotationNode(ctx2, stack2) {
  if (!stack2 || !stack2.isMethodDefinition) return;
  const main = Array.isArray(stack2.annotations) ? stack2.annotations.find((stack3) => stack3.getLowerCaseName() === "main") : null;
  if (!main) return;
  let callMain = ctx2.createCallExpression(
    ctx2.createMemberExpression([
      ctx2.createIdentifier(stack2.module.id),
      ctx2.createIdentifier(stack2.key.value())
    ])
  );
  const args = main ? main.getArguments() : [];
  const defer = args.length > 0 ? !(String(args[0].value).toLowerCase() === "false") : true;
  if (defer) {
    callMain = ctx2.createCallExpression(
      createStaticReferenceNode(ctx2, stack2, "System", "setImmediate"),
      [
        ctx2.createArrowFunctionExpression(callMain)
      ]
    );
  }
  return callMain;
}
function createRouteConfigNode(ctx2, module2, method, paramArg) {
  if (!import_Utils.default.isStack(method) || !method.isMethodDefinition) {
    throw new Error(`method invalid`);
  }
  const annotations = method.annotations;
  const annotation = annotations && annotations.find((item) => {
    return allMethods.includes(item.getLowerCaseName());
  });
  const mapNameds = ["path"];
  const args = annotation ? annotation.getArguments() : [];
  const pathArg = annotation ? getAnnotationArgument(mapNameds[0], args, mapNameds) : null;
  const actionName = method.value();
  const value = String(pathArg ? pathArg.value : actionName);
  const defaultParams = [];
  const declareParams = (method.params || []).map((item) => {
    const required = !(item.question || item.isAssignmentPattern);
    const question = required ? "" : "?";
    if (item.isAssignmentPattern) {
      if (item.right.isLiteral) {
        defaultParams.push(ctx2.createProperty(ctx2.createIdentifier(item.value()), ctx2.createToken(item.right)));
      } else {
        item.right.error(10101, item.value());
      }
    }
    return `<${item.value()}${question}>`;
  });
  const uri = declareParams.length > 0 ? [value].concat(declareParams).join("/") : value;
  let url = uri;
  if (uri.charCodeAt(0) !== 47) {
    const withNs = ctx2.options.routePathWithNamespace?.server;
    url = withNs ? `/${module2.getName("/")}/${uri}` : `/${module2.id}/${uri}`;
  }
  let allowMethodNode = ctx2.createLiteral(annotation ? annotation.getLowerCaseName() : "*");
  let allowMethodNames = annotation ? annotation.getLowerCaseName() : "*";
  if (annotation && annotation.getLowerCaseName() === "router") {
    const allowMethods = args.filter((item) => item !== pathArg);
    if (allowMethods.length > 0) {
      allowMethodNames = allowMethods.map((item) => item.value).join(",");
      allowMethodNode = ctx2.createArrayExpression(allowMethods.map((item) => ctx2.createLiteral(item.value)));
    } else {
      allowMethodNode = ctx2.createLiteral("*");
    }
  }
  let formatRoute = ctx2.options.formation?.route;
  if (formatRoute) {
    url = formatRoute(url, {
      action: actionName,
      pathArg: value,
      method: allowMethodNames,
      params: declareParams,
      className: module2.getName()
    }) || url;
  }
  let paramNode = null;
  if (paramArg) {
    if (paramArg.stack.isAssignmentPattern) {
      paramNode = ctx2.createToken(paramArg.stack.right);
    } else {
      paramNode = ctx2.createToken(paramArg.stack);
    }
  }
  const props = {
    url: ctx2.createLiteral(url),
    param: paramNode,
    allowMethod: allowMethodNode
  };
  if (defaultParams.length > 0) {
    props["default"] = ctx2.createObjectExpression(defaultParams);
  }
  return ctx2.createObjectExpression(
    Object.keys(props).map((name) => {
      const value2 = props[name];
      if (value2) {
        return ctx2.createProperty(name, value2);
      }
      return null;
    }).filter((item) => !!item)
  );
}
function createReadfileAnnotationNode(ctx2, stack2) {
  const result = parseReadfileAnnotation(ctx2, stack2);
  if (!result) return null;
  const addDeps = (source, local) => {
    source = ctx2.getSourceFileMappingFolder(source) || source;
    ctx2.addImport(source, local);
  };
  const fileMap = {};
  const localeCxt = result.dir.toLowerCase();
  const getParentFile = (pid) => {
    if (fileMap[pid]) {
      return fileMap[pid];
    }
    if (localeCxt !== pid && pid.includes(localeCxt)) {
      return getParentFile(path.dirname(pid));
    }
    return null;
  };
  const dataset = [];
  const namedMap = /* @__PURE__ */ new Set();
  result.files.forEach((file) => {
    const pid = path.dirname(file).toLowerCase();
    const named = path.basename(file, path.extname(file));
    const id = (pid + "/" + named).toLowerCase();
    const filepath2 = result.relative ? ctx2.compiler.getRelativeWorkspacePath(file) : file;
    let item = {
      path: filepath2,
      isFile: fs.statSync(file).isFile()
    };
    if (item.isFile && result.load) {
      let data = "";
      if (file.endsWith(".env")) {
        const content = dotenv.parse(fs.readFileSync(file));
        dotenvExpand.expand({ parsed: content });
        data = JSON.stringify(content);
      } else {
        if (result.lazy) {
          data = `import('${file}')`;
        } else {
          namedMap.add(file);
          data = ctx2.getGlobalRefName(stack2, "_" + named.replaceAll("-", "_") + namedMap.size);
          addDeps(file, data);
        }
      }
      item.content = data;
    } else if (result.source) {
      item.content = JSON.stringify(fs.readFileSync(file));
    }
    const parent = getParentFile(pid);
    if (parent) {
      const children = parent.children || (parent.children = []);
      children.push(item);
    } else {
      fileMap[id + path.extname(file)] = item;
      dataset.push(item);
    }
  });
  const make = (list) => {
    return list.map((object) => {
      if (only) {
        return object.content ? ctx2.createChunkExpression(object.content) : ctx2.createLiteral(null);
      }
      const properties = [
        ctx2.createProperty(
          ctx2.createIdentifier("path"),
          ctx2.createLiteral(object.path)
        )
      ];
      if (object.isFile) {
        properties.push(ctx2.createProperty("isFile", ctx2.createLiteral(true)));
      }
      if (object.content) {
        properties.push(ctx2.createProperty("content", ctx2.createChunkExpression(object.content)));
      }
      if (object.children) {
        properties.push(ctx2.createProperty("children", ctx2.createArrayExpression(make(object.children))));
      }
      return ctx2.createObjectExpression(properties);
    });
  };
  return ctx2.createArrayExpression(make(dataset));
}
function createIdentNode(ctx2, stack2) {
  if (!stack2) return null;
  return stack2.isIdentifier ? ctx2.createIdentifier(stack2.value(), stack2) : stack2.isLiteral ? ctx2.createLiteral(stack2.value()) : ctx2.createToken(stack2);
}
function toCamelCase(name) {
  name = String(name);
  if (name.includes("-")) {
    name = name.replace(/-([a-z])/g, (a, b) => b.toUpperCase());
  }
  return name;
}
function toFirstUpperCase(str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}
function createCJSImports(ctx2, importManage) {
  let imports = [];
  importManage.getAllImportSource().forEach((importSource) => {
    if (importSource.isExportSource) return;
    const properties = [];
    importSource.specifiers.forEach((spec) => {
      if (spec.type === "default" || spec.type === "namespace") {
        let requireNode = ctx2.createCallExpression(
          ctx2.createIdentifier("require"),
          [
            ctx2.createLiteral(importSource.sourceId)
          ]
        );
        if (spec.type === "default") {
          const module2 = importSource.getSourceTarget();
          if (import_Utils.default.isCompilation(module2)) {
            requireNode = ctx2.createCallExpression(
              createStaticReferenceNode(ctx2, null, "Class", "getExportDefault"),
              [
                requireNode
              ]
            );
          }
        }
        const node = ctx2.createVariableDeclaration("const", [
          ctx2.createVariableDeclarator(
            ctx2.createIdentifier(spec.local, importSource.stack),
            requireNode,
            importSource.stack
          )
        ]);
        imports.push(node);
      } else if (spec.type === "specifier") {
        let imported = ctx2.createIdentifier(spec.local);
        let local = null;
        if (spec.imported && spec.imported !== spec.local) {
          local = imported;
          imported = ctx2.createIdentifier(spec.imported);
        }
        properties.push(
          ctx2.createProperty(
            imported,
            local
          )
        );
      }
    });
    if (properties.length > 0) {
      const node = ctx2.createVariableDeclaration("const", [
        ctx2.createVariableDeclarator(
          ctx2.createObjectPattern(properties),
          ctx2.createCallExpression(
            ctx2.createIdentifier("require"),
            [
              ctx2.createLiteral(importSource.sourceId)
            ]
          ),
          importSource.stack
        )
      ]);
      imports.push(node);
    } else if (!(importSource.specifiers.length > 0)) {
      imports.unshift(
        ctx2.createExpressionStatement(
          ctx2.createCallExpression(
            ctx2.createIdentifier("require"),
            [
              ctx2.createLiteral(importSource.sourceId)
            ]
          )
        )
      );
    }
  });
  return imports;
}
function createESMImports(ctx2, importManage) {
  let imports = [];
  importManage.getAllImportSource().forEach((importSource) => {
    if (importSource.isExportSource) return;
    const specifiers = importSource.specifiers.map((spec) => {
      if (spec.type === "default") {
        return ctx2.createImportSpecifier(spec.local);
      } else if (spec.type === "specifier") {
        return ctx2.createImportSpecifier(spec.local, spec.imported);
      } else if (spec.type === "namespace") {
        return ctx2.createImportSpecifier(spec.local, null, true);
      }
    });
    if (importSource.specifiers.length > 0) {
      imports.push(
        ctx2.createImportDeclaration(
          importSource.sourceId,
          specifiers,
          importSource.stack
        )
      );
    } else {
      imports.unshift(
        ctx2.createImportDeclaration(
          importSource.sourceId,
          specifiers,
          importSource.stack
        )
      );
    }
  });
  return imports;
}
function createCJSExports(ctx2, exportManage) {
  let importSpecifiers = /* @__PURE__ */ new Map();
  let imports = [];
  let exports2 = [];
  let declares = [];
  let exportSets = new Set(exportManage.getAllExportSource());
  let properties = [];
  let exportAlls = [];
  exportSets.forEach((exportSource) => {
    let importSource = exportSource.importSource;
    let sourceId = importSource ? importSource.sourceId : null;
    if (sourceId) {
      sourceId = ctx2.createLiteral(sourceId);
    }
    let specifiers = [];
    exportSource.specifiers.forEach((spec) => {
      if (spec.type === "namespace") {
        if (!spec.exported) {
          exportAlls.push(
            ctx2.createCallExpression(
              ctx2.createIdentifier("require"),
              [
                sourceId
              ],
              spec.stack
            )
          );
        } else {
          properties.push(
            ctx2.createProperty(
              ctx2.createIdentifier(spec.exported),
              ctx2.createCallExpression(
                ctx2.createIdentifier("require"),
                [
                  sourceId
                ]
              ),
              spec.stack
            )
          );
        }
      } else if (spec.type === "default") {
        properties.push(
          ctx2.createProperty(
            ctx2.createIdentifier("default"),
            spec.local,
            spec.stack
          )
        );
      } else if (spec.type === "named") {
        if (spec.local.type === "VariableDeclaration") {
          spec.local.declarations.map((decl) => {
            properties.push(
              ctx2.createProperty(
                decl.id,
                decl.init || ctx2.createLiteral(null),
                spec.stack
              )
            );
          });
        } else if (spec.local.type === "FunctionDeclaration") {
          declares.push(spec.local);
          properties.push(
            ctx2.createProperty(
              spec.local.key,
              null,
              spec.stack
            )
          );
        }
      } else if (spec.type === "specifier") {
        if (sourceId) {
          let node = ctx2.createProperty(
            ctx2.createIdentifier(spec.local),
            ctx2.createIdentifier(spec.exported),
            spec.stack
          );
          properties.push(
            ctx2.createProperty(
              ctx2.createIdentifier(spec.exported),
              null,
              spec.stack
            )
          );
          specifiers.push(node);
        } else {
          let node = ctx2.createProperty(
            ctx2.createIdentifier(spec.exported),
            ctx2.createIdentifier(spec.local),
            spec.stack
          );
          properties.push(node);
        }
      }
    });
    if (specifiers.length > 0) {
      let dataset = importSpecifiers.get(sourceId);
      if (!dataset) {
        importSpecifiers.set(sourceId, dataset = []);
      }
      dataset.push(...specifiers);
    }
  });
  importSpecifiers.forEach((specifiers, sourceId) => {
    imports.push(
      ctx2.createVariableDeclaration("const", [
        ctx2.createVariableDeclarator(
          ctx2.createObjectPattern(specifiers),
          ctx2.createCallExpression(
            ctx2.createIdentifier("require"),
            [
              sourceId
            ]
          )
        )
      ])
    );
  });
  if (exportAlls.length > 0 && !properties.length) {
    if (exportAlls.length === 1) {
      exports2.push(
        ctx2.createExpressionStatement(
          ctx2.createAssignmentExpression(
            ctx2.createChunkExpression("module.exports", false, false),
            exportAlls[0]
          )
        )
      );
    } else {
      let spreads = exportAlls.map((require2) => {
        return ctx2.createSpreadElement(
          ctx2.createParenthesizedExpression(
            ctx2.createLogicalExpression(
              require2,
              ctx2.createObjectExpression(),
              "||"
            )
          )
        );
      });
      exports2.push(
        ctx2.createExpressionStatement(
          ctx2.createAssignmentExpression(
            ctx2.createChunkExpression("module.exports", false, false),
            ctx2.createObjectExpression(spreads)
          )
        )
      );
    }
  } else if (!exportAlls.length && properties.length === 1 && properties[0].key.value === "default") {
    exports2.push(
      ctx2.createExpressionStatement(
        ctx2.createAssignmentExpression(
          ctx2.createChunkExpression("module.exports", false, false),
          properties[0].init
        )
      )
    );
  } else {
    let spreads = exportAlls.map((require2) => {
      return ctx2.createSpreadElement(
        ctx2.createParenthesizedExpression(
          ctx2.createLogicalExpression(
            require2,
            ctx2.createObjectExpression(),
            "||"
          )
        )
      );
    });
    let items = [
      ...spreads,
      ...properties
    ];
    exports2.push(
      ctx2.createExpressionStatement(
        ctx2.createAssignmentExpression(
          ctx2.createChunkExpression("module.exports", false, false),
          ctx2.createObjectExpression(items)
        )
      )
    );
  }
  return { imports, exports: exports2, declares };
}
function createESMExports(ctx2, exportManage) {
  let importSpecifiers = /* @__PURE__ */ new Map();
  let exports2 = [];
  let imports = [];
  let declares = [];
  let exportSets = new Set(exportManage.getAllExportSource());
  exportSets.forEach((exportSource) => {
    let importSource = exportSource.importSource;
    let sourceId = importSource ? importSource.sourceId : null;
    let specifiers = [];
    exportSource.specifiers.forEach((spec) => {
      if (spec.type === "namespace") {
        exports2.push(
          ctx2.createExportAllDeclaration(sourceId, spec.exported, spec.stack)
        );
      } else if (spec.type === "default") {
        exports2.push(
          ctx2.createExportDefaultDeclaration(spec.local, spec.stack)
        );
      } else if (spec.type === "named" && !sourceId) {
        exports2.push(
          ctx2.createExportNamedDeclaration(spec.local, null, [], spec.stack)
        );
      } else if (spec.type === "specifier") {
        specifiers.push(
          ctx2.createExportSpecifier(spec.local, spec.exported, spec.stack)
        );
      }
    });
    if (specifiers.length > 0) {
      let dataset = importSpecifiers.get(sourceId);
      if (!dataset) {
        importSpecifiers.set(sourceId, dataset = []);
      }
      dataset.push(...specifiers);
    }
  });
  importSpecifiers.forEach((specifiers, sourceId) => {
    exports2.push(ctx2.createExportNamedDeclaration(null, sourceId, specifiers));
  });
  return { imports, exports: exports2, declares };
}
function isExternalDependency(externals, source, module2 = null) {
  if (Array.isArray(externals) && externals.length > 0) {
    return externals.some((rule) => {
      if (typeof rule === "function") {
        return rule(source, module2);
      } else if (rule instanceof RegExp) {
        return rule.test(source);
      }
      return rule === source;
    });
  }
  return false;
}
function getMethodOrPropertyAlias(ctx2, stack2, name = null) {
  if (has(stack2, "Common.getMethodOrPropertyAlias")) {
    return get(stack2, "Common.getMethodOrPropertyAlias");
  }
  let result = getMethodAnnotations(stack2, ["alias"]);
  let resolevName = name;
  if (result) {
    const [annotation] = result;
    const value = parseAliasAnnotation(annotation, ctx2.plugin.version, ctx2.options.metadata.versions);
    if (value) {
      resolevName = value;
    }
  }
  set(stack2, "Common.getMethodOrPropertyAlias", resolevName);
  return resolevName;
}
function getMethodOrPropertyHook(ctx2, stack2) {
  if (!stack2) return null;
  if (has(stack2, "Common.getMethodOrPropertyHook")) {
    return get(stack2, "Common.getMethodOrPropertyHook");
  }
  let result = getMethodAnnotations(stack2, ["hook"]);
  let invoke = null;
  if (result.length > 0) {
    let annotation = result[0];
    result = parseHookAnnotation(annotation, ctx2.plugin.version, ctx2.options.metadata.versions);
    if (result) {
      invoke = [
        result.type,
        annotation
      ];
    }
  }
  set(stack2, "Common.getMethodOrPropertyHook", invoke);
  return invoke;
}
function createJSXAttrHookNode(ctx2, stack2, desc2) {
  if (!(stack2 && stack2.isMemberProperty && stack2.value && desc2)) return null;
  const hookAnnot = getMethodOrPropertyHook(desc2);
  if (hookAnnot) {
    let [type, annotation] = hookAnnot;
    let lower = type && String(type).toLowerCase();
    const hooks = ctx2.options.hooks;
    let createdNode = null;
    if (hooks.createJSXAttrValue) {
      createdNode = hooks.createJSXAttrValue({ ctx: ctx2, type, jsxAttrNode: stack2, descriptor: desc2, annotation });
    }
    if (!createdNode) {
      if (lower === "compiling:create-route-path") {
        if (stack2.value && stack2.value.isJSXExpressionContainer) {
          const value = stack2.value.description();
          if (value && value.isModule && stack2.isModuleForWebComponent(value)) {
            let route = getModuleRoutes(value, ["router"], ctx2.options);
            if (route && route[0]) {
              if (Array.isArray(route)) route = route[0];
              if (route.path) {
                return ctx2.createLiteral(createRoutePath(route));
              } else {
                console.error(`[es-transform] Route missing the 'path' property.`);
              }
            }
            return ctx2.createLiteral(value.getName("/"));
          }
        }
        return null;
      }
      if (type) {
        const node = ctx2.createCallExpression(
          ctx2.createMemberExpression([
            ctx2.createThisExpression(stack2),
            ctx2.createIdentifier("invokeHook")
          ]),
          [
            ctx2.createLiteral(type),
            ctx2.createToken(stack2.value),
            ctx2.createLiteral(stack2.name.value()),
            ctx2.createLiteral(desc2.module.getName())
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
function createStaticReferenceNode(ctx2, stack2, className, method) {
  return ctx2.createMemberExpression([
    createModuleReferenceNode(ctx2, stack2, className),
    ctx2.createIdentifier(method, stack2)
  ]);
}
function createModuleReferenceNode(ctx2, stack2, className) {
  let gloablModule = import_Namespace.default.globals.get(className);
  if (gloablModule) {
    let context = stack2 ? stack2.module || stack2.compilation : null;
    ctx2.addDepend(gloablModule, context);
    return ctx2.createIdentifier(
      ctx2.getModuleReferenceName(gloablModule, context)
    );
  } else {
    throw new Error(`References the '${className}' module is not exists`);
  }
}

// lib/tokens/AnnotationExpression.js
function AnnotationExpression_default(ctx2, stack2) {
  const name = stack2.getLowerCaseName();
  switch (name) {
    case "http": {
      return createHttpAnnotationNode(ctx2, stack2) || ctx2.createLiteral(null);
    }
    case "router": {
      return createRouterAnnotationNode(ctx2, stack2) || ctx2.createLiteral(null);
    }
    case "url": {
      return createUrlAnnotationNode(ctx2, stack2);
    }
    case "env": {
      return createEnvAnnotationNode(ctx2, stack2);
    }
    case "readfile": {
      return createReadfileAnnotationNode(ctx2, stack2) || ctx2.createLiteral(null);
    }
    default:
      ctx2.error(`The '${name}' annotations is not supported.`);
  }
  return null;
}

// lib/tokens/ArrayExpression.js
function ArrayExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.elements = stack2.elements.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/ArrayPattern.js
function ArrayPattern_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.elements = stack2.elements.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/FunctionExpression.js
function FunctionExpression_default(ctx2, stack2, type) {
  const node = ctx2.createNode(stack2, type);
  node.async = stack2.async ? true : false;
  node.params = stack2.params.map((item) => ctx2.createToken(item));
  node.body = ctx2.createToken(stack2.body);
  return node;
}

// lib/tokens/ArrowFunctionExpression.js
function ArrowFunctionExpression_default(ctx2, stack2, type) {
  const node = FunctionExpression_default(ctx2, stack2, type);
  node.type = type;
  return node;
}

// lib/tokens/AssignmentExpression.js
var import_Utils2 = __toESM(require("easescript/lib/core/Utils"));
function AssignmentExpression_default(ctx2, stack2) {
  const desc2 = stack2.left.description();
  const module2 = stack2.module;
  const isMember = stack2.left.isMemberExpression;
  let isReflect = false;
  let operator = stack2.operator;
  if (isMember) {
    if (stack2.left.computed) {
      let hasDynamic = desc2 && desc2.isComputeType && desc2.isPropertyExists();
      if (!hasDynamic && desc2 && (desc2.isProperty && desc2.computed || desc2.isPropertyDefinition && desc2.dynamic)) {
        hasDynamic = true;
      }
      if (!hasDynamic && !import_Utils2.default.isLiteralObjectType(stack2.left.object.type())) {
        isReflect = true;
      }
    } else if (!desc2 || desc2.isAnyType) {
      isReflect = !import_Utils2.default.isLiteralObjectType(stack2.left.object.type());
    }
  }
  if (isReflect) {
    let value = ctx2.createToken(stack2.right);
    let scopeId = module2 ? ctx2.createIdentifier(module2.id) : ctx2.createLiteral(null);
    let propertyNode = ctx2.createLiteral(
      stack2.left.property.value(),
      void 0,
      stack2.left.property
    );
    if (operator && operator.charCodeAt(0) !== 61 && operator.charCodeAt(operator.length - 1) === 61) {
      operator = operator.slice(0, -1);
      const callee2 = createStaticReferenceNode(ctx2, stack2, "Reflect", "get");
      const left2 = ctx2.createCallExpression(callee2, [
        scopeId,
        ctx2.createToken(stack2.left.object),
        propertyNode
      ], stack2);
      value = ctx2.createBinaryExpression(left2, value, operator);
    }
    const callee = createStaticReferenceNode(ctx2, stack2, "Reflect", "set");
    return ctx2.createCallExpression(callee, [
      scopeId,
      ctx2.createToken(stack2.left.object),
      propertyNode,
      value
    ], stack2);
  }
  let left = ctx2.createToken(stack2.left);
  if (isMember && stack2.left.object.isSuperExpression) {
    if (left.type === "CallExpression" && left.callee.type === "MemberExpression" && left.callee.property.value === "callSuperSetter") {
      left.arguments.push(
        ctx2.createToken(stack2.right)
      );
      return left;
    }
  }
  const node = ctx2.createNode(stack2);
  node.left = left;
  node.right = ctx2.createToken(stack2.right);
  node.operator = operator;
  return node;
}

// lib/tokens/AssignmentPattern.js
function AssignmentPattern_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.left = ctx2.createToken(stack2.left);
  node.right = ctx2.createToken(stack2.right);
  return node;
}

// lib/tokens/AwaitExpression.js
function AwaitExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.argument = ctx2.createToken(stack2.argument);
  return node;
}

// lib/tokens/BinaryExpression.js
var import_Utils3 = __toESM(require("easescript/lib/core/Utils"));
var globals = ["Array", "Object", "RegExp", "Number", "String", "Function"];
function BinaryExpression_default(ctx2, stack2) {
  let operator = stack2.operator;
  let node = ctx2.createNode(stack2);
  let right = ctx2.createToken(stack2.right);
  if (operator === "is" || operator === "instanceof") {
    let type = stack2.right.type();
    let origin = !import_Utils3.default.isModule(type) ? import_Utils3.default.getOriginType(type) : type;
    if (!stack2.right.hasLocalDefined()) {
      ctx2.addDepend(origin, stack2.module);
      right = ctx2.createIdentifier(
        ctx2.getGlobalRefName(
          stack2,
          ctx2.getModuleReferenceName(origin, stack2.module)
        )
      );
    }
    if (operator === "is" && !(origin && globals.includes(origin.id))) {
      return ctx2.createCallExpression(
        createStaticReferenceNode(ctx2, stack2, "System", "is"),
        [
          ctx2.createToken(stack2.left),
          right
        ],
        stack2
      );
    }
    operator = "instanceof";
  }
  node.left = ctx2.createToken(stack2.left);
  node.right = right;
  node.operator = operator;
  return node;
}

// lib/tokens/BlockStatement.js
function BlockStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.body = [];
  ctx2.setNode(stack2, node);
  for (let child of stack2.body) {
    const token = ctx2.createToken(child);
    if (token) {
      node.body.push(token);
      if (child.isWhenStatement) {
        const express = token.type === "BlockStatement" ? token.body : [token];
        if (Array.isArray(express)) {
          const last = express[express.length - 1];
          if (last && last.type === "ReturnStatement") {
            break;
          }
        }
      } else if (child.isReturnStatement || child.hasReturnStatement) {
        break;
      }
    }
  }
  ;
  ctx2.removeNode(stack2);
  return node;
}

// lib/tokens/BreakStatement.js
function BreakStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.label = stack2.label && ctx2.createIdentifier(stack2.label.value(), stack2.label);
  return node;
}

// lib/tokens/CallExpression.js
var import_Utils4 = __toESM(require("easescript/lib/core/Utils"));
function CallExpression_default(ctx2, stack2) {
  const isMember = stack2.callee.isMemberExpression;
  const desc2 = stack2.descriptor();
  const module2 = stack2.module;
  const isChainExpression = stack2.parentStack.isChainExpression;
  if (stack2.callee.isSuperExpression) {
    const parent = module2 && module2.inherit;
    if (parent) {
      ctx2.addDepend(parent, module2);
      if (!ctx2.isActiveModule(parent, stack2.module) || ctx2.isES6ClassModule(parent)) {
        return null;
      }
    }
  }
  if (isMember && !isChainExpression && (!desc2 || desc2.isType && desc2.isAnyType)) {
    const property = stack2.callee.computed ? ctx2.createToken(stack2.callee.property) : ctx2.createLiteral(
      stack2.callee.property.value()
    );
    const args = [
      module2 ? ctx2.createIdentifier(module2.id) : ctx2.createLiteral(null),
      ctx2.createToken(stack2.callee.object),
      property,
      ctx2.createArrayExpression(
        stack2.arguments.map((item) => ctx2.createToken(item))
      )
    ];
    if (stack2.callee.object.isSuperExpression) {
      args.push(ctx2.createThisExpression());
    }
    return ctx2.createCallExpression(
      createStaticReferenceNode(ctx2, stack2, "Reflect", "call"),
      args,
      stack2
    );
  }
  if (stack2.callee.isSuperExpression || isMember && stack2.callee.object.isSuperExpression && !isChainExpression) {
    return ctx2.createCallExpression(
      ctx2.createMemberExpression(
        [
          ctx2.createToken(stack2.callee),
          ctx2.createIdentifier("call")
        ]
      ),
      [
        ctx2.createThisExpression()
      ].concat(stack2.arguments.map((item) => ctx2.createToken(item))),
      stack2
    );
  }
  const privateChain = ctx2.options.privateChain;
  if (privateChain && desc2 && desc2.isMethodDefinition && !(desc2.static || desc2.module.static)) {
    const modifier = import_Utils4.default.getModifierValue(desc2);
    const refModule = desc2.module;
    if (modifier === "private" && refModule.children.length > 0) {
      return ctx2.createCallExpression(
        ctx2.createMemberExpression(
          [
            ctx2.createToken(stack2.callee),
            ctx2.createIdentifier("call")
          ]
        ),
        [isMember ? ctx2.createToken(stack2.callee.object) : ctx2.createThisExpression()].concat(stack2.arguments.map((item) => ctx2.createToken(item))),
        stack2
      );
    }
  }
  if (desc2) {
    let type = desc2.isCallDefinition ? desc2.module : desc2;
    if (!isMember && !stack2.callee.isSuperExpression && desc2.isMethodDefinition) type = desc2.module;
    if (import_Utils4.default.isTypeModule(type)) {
      ctx2.addDepend(desc2, module2);
    }
  }
  const node = ctx2.createNode(stack2);
  node.callee = ctx2.createToken(stack2.callee);
  node.arguments = stack2.arguments.map((item) => ctx2.createToken(item));
  node.isChainExpression = isChainExpression;
  return node;
}

// lib/tokens/ChainExpression.js
function ChainExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.expression = ctx2.createToken(stack2.expression);
  return node;
}

// lib/core/Constant.js
var Constant_exports = {};
__export(Constant_exports, {
  KIND_ACCESSOR: () => KIND_ACCESSOR,
  KIND_CLASS: () => KIND_CLASS,
  KIND_CONST: () => KIND_CONST,
  KIND_ENUM: () => KIND_ENUM,
  KIND_ENUM_PROPERTY: () => KIND_ENUM_PROPERTY,
  KIND_INTERFACE: () => KIND_INTERFACE,
  KIND_METHOD: () => KIND_METHOD,
  KIND_VAR: () => KIND_VAR,
  MODIFIER_ABSTRACT: () => MODIFIER_ABSTRACT,
  MODIFIER_FINAL: () => MODIFIER_FINAL,
  MODIFIER_PRIVATE: () => MODIFIER_PRIVATE,
  MODIFIER_PROTECTED: () => MODIFIER_PROTECTED,
  MODIFIER_PUBLIC: () => MODIFIER_PUBLIC,
  MODIFIER_STATIC: () => MODIFIER_STATIC,
  PRIVATE_NAME: () => PRIVATE_NAME
});
var KIND_CLASS = 1 << 0;
var KIND_INTERFACE = 1 << 1;
var KIND_ENUM = 1 << 2;
var KIND_VAR = 1 << 3;
var KIND_CONST = 1 << 4;
var KIND_METHOD = 1 << 5;
var KIND_ACCESSOR = 1 << 6;
var KIND_ENUM_PROPERTY = 1 << 7;
var MODIFIER_STATIC = 1 << 8;
var MODIFIER_PUBLIC = 1 << 9;
var MODIFIER_PROTECTED = 1 << 10;
var MODIFIER_PRIVATE = 1 << 11;
var MODIFIER_ABSTRACT = 1 << 12;
var MODIFIER_FINAL = 1 << 13;
var PRIVATE_NAME = "_private";

// lib/core/ClassBuilder.js
var import_crypto = require("crypto");
var import_Namespace2 = __toESM(require("easescript/lib/core/Namespace"));
var modifierMaps = {
  "public": MODIFIER_PUBLIC,
  "protected": MODIFIER_PROTECTED,
  "private": MODIFIER_PRIVATE
};
var kindMaps = {
  "accessor": KIND_ACCESSOR,
  "var": KIND_VAR,
  "const": KIND_CONST,
  "method": KIND_METHOD,
  "enumProperty": KIND_ENUM_PROPERTY
};
var ClassBuilder = class {
  constructor(stack2) {
    this.stack = stack2;
    this.compilation = stack2.compilation;
    this.module = stack2.module;
    this.privateProperties = [];
    this.initProperties = [];
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
  create(ctx2) {
    ctx2.setNode(this.stack, this);
    const module2 = this.module;
    const stack2 = this.stack;
    this.createInherit(ctx2, module2, stack2);
    this.createImplements(ctx2, module2, stack2);
    this.createBody(ctx2, module2, stack2);
    let methods = this.createMemberDescriptors(ctx2, this.methods);
    let members = this.createMemberDescriptors(ctx2, this.members);
    let creator = this.createCreator(
      ctx2,
      module2,
      module2.id,
      this.createClassDescriptor(ctx2, module2, methods, members)
    );
    ctx2.crateModuleAssets(module2);
    ctx2.createModuleImportReferences(module2);
    if (stack2.compilation.mainModule === module2) {
      ctx2.addExport("default", ctx2.createIdentifier(module2.id));
    }
    if (this.mainEnter) {
      ctx2.addNodeToAfterBody(
        ctx2.createExpressionStatement(
          ctx2.createExpressionStatement(this.mainEnter)
        )
      );
    }
    ctx2.removeNode(this.stack);
    let expressions = [
      this.construct,
      ...this.beforeBody,
      ...this.body,
      ...this.afterBody,
      ctx2.createExpressionStatement(creator)
    ];
    let symbolNode = this.privateSymbolNode;
    if (symbolNode) {
      expressions.unshift(symbolNode);
    }
    return ctx2.createMultipleStatement(expressions);
  }
  createBody(ctx2, module2, stack2) {
    this.createMemebers(ctx2, stack2);
    this.createIteratorMethodNode(ctx2, module2);
    if (!this.construct) {
      this.construct = this.createDefaultConstructor(ctx2, module2.id, module2.inherit);
    }
    this.checkConstructor(ctx2, this.construct, module2);
  }
  createInherit(ctx2, module2, stack2 = null) {
    let inherit = module2.inherit;
    if (inherit) {
      ctx2.addDepend(inherit, module2);
      if (ctx2.isActiveModule(inherit, module2)) {
        this.inherit = ctx2.createIdentifier(
          ctx2.getModuleReferenceName(inherit, module2)
        );
      }
    }
  }
  createImplements(ctx2, module2, stack2 = null) {
    this.implements = module2.implements.map((impModule) => {
      ctx2.addDepend(impModule, module2);
      if (impModule.isInterface && ctx2.isActiveModule(impModule, module2) && import_Namespace2.default.globals.get("Iterator") !== impModule) {
        return ctx2.createIdentifier(
          ctx2.getModuleReferenceName(impModule, module2)
        );
      }
      return null;
    }).filter(Boolean);
  }
  createIteratorMethodNode(ctx2, module2) {
    const iteratorType = import_Namespace2.default.globals.get("Iterator");
    if (module2.implements.includes(iteratorType)) {
      const block = ctx2.createBlockStatement();
      block.body.push(
        ctx2.createReturnStatement(
          ctx2.createThisExpression()
        )
      );
      const method = ctx2.createMethodDefinition("Symbol.iterator", block);
      method.key.computed = true;
      method.static = false;
      method.modifier = "public";
      method.kind = "method";
      this.members.push(method);
    }
  }
  createPrivateRefsName(ctx2) {
    if (!this.privateName && ctx2.options.privateChain) {
      this.privateName = ctx2.getGlobalRefName(this.stack, PRIVATE_NAME, this.module);
      if (!this.privateSymbolNode) {
        this.privateSymbolNode = this.createPrivateSymbolNode(ctx2, this.privateName);
      }
    }
    return this.privateName;
  }
  getHashId(len = 8) {
    let moduleHashId = this._moduleHashId;
    if (!moduleHashId) {
      const name = this.module.getName();
      const file = this.compilation.file;
      this._moduleHashId = moduleHashId = (0, import_crypto.createHash)("sha256").update(`${file}:${name}`).digest("hex").substring(0, len);
    }
    return moduleHashId;
  }
  createPrivateSymbolNode(ctx2, name) {
    if (!ctx2.options.privateChain) return null;
    let isProd = ctx2.plugin.options.mode === "production";
    if (isProd) {
      return ctx2.createVariableDeclaration(
        "const",
        [
          ctx2.createVariableDeclarator(
            ctx2.createIdentifier(name),
            ctx2.createCallExpression(
              ctx2.createIdentifier("Symbol"),
              [
                ctx2.createLiteral("private")
              ]
            )
          )
        ]
      );
    } else {
      return ctx2.createVariableDeclaration(
        "const",
        [
          ctx2.createVariableDeclarator(
            ctx2.createIdentifier(name),
            ctx2.createCallExpression(
              createStaticReferenceNode(ctx2, this.stack, "Class", "getKeySymbols"),
              [
                ctx2.createLiteral(this.getHashId())
              ]
            )
          )
        ]
      );
    }
  }
  checkSuperES6Class(ctx2, construct, module2) {
    const inherit = module2.inherit;
    if (inherit && ctx2.isES6ClassModule(inherit)) {
      const wrap = ctx2.createFunctionExpression(construct.body);
      construct.body.body.push(ctx2.createReturnStatement(ctx2.createThisExpression()));
      const block = ctx2.createBlockStatement();
      block.body.push(
        ctx2.createReturnStatement(
          ctx2.createCallExpression(
            createStaticReferenceNode(ctx2, this.stack, "Reflect", "apply"),
            [
              wrap,
              ctx2.createCallExpression(
                createStaticReferenceNode(ctx2, this.stack, "Reflect", "construct"),
                [
                  ctx2.createIdentifier(ctx2.getModuleReferenceName(inherit, module2)),
                  ctx2.createIdentifier("arguments"),
                  ctx2.createIdentifier(module2.id)
                ]
              )
            ]
          )
        )
      );
      construct.body = block;
    }
  }
  checkConstructor(ctx2, construct, module2) {
    construct.type = "FunctionDeclaration";
    construct.kind = "";
    construct.key.value = module2.id;
    if (this.privateProperties.length > 0 || this.initProperties.length > 0) {
      let body = construct.body.body;
      let appendAt = module2.inherit ? 1 : 0;
      let els = [...this.initProperties];
      if (this.privateProperties.length > 0) {
        let privateName = this.createPrivateRefsName(ctx2);
        let definePrivateProperties = ctx2.createExpressionStatement(
          ctx2.createCallExpression(
            ctx2.createMemberExpression([
              ctx2.createIdentifier("Object"),
              ctx2.createIdentifier("defineProperty")
            ]),
            [
              ctx2.createThisExpression(),
              ctx2.createIdentifier(privateName),
              ctx2.createObjectExpression([
                ctx2.createProperty(
                  ctx2.createIdentifier("value"),
                  ctx2.createObjectExpression(this.privateProperties)
                )
              ])
            ]
          )
        );
        els.push(definePrivateProperties);
      }
      body.splice(appendAt, 0, ...els);
    }
    this.checkSuperES6Class(ctx2, construct, module2);
  }
  createInitMemberProperty(ctx2, node, stack2 = null, staticFlag = false) {
    if (staticFlag) return;
    if (ctx2.options.privateChain && node.modifier === "private") {
      this.privateProperties.push(
        ctx2.createProperty(
          node.key,
          node.init || ctx2.createLiteral(null)
        )
      );
    } else {
      this.initProperties.push(
        ctx2.createExpressionStatement(
          ctx2.createAssignmentExpression(
            ctx2.createMemberExpression([
              ctx2.createThisExpression(),
              node.key
            ]),
            node.init || ctx2.createLiteral(null)
          )
        )
      );
    }
    node.init = null;
  }
  createMemebers(ctx2, stack2) {
    const cache1 = /* @__PURE__ */ new Map();
    const cache2 = /* @__PURE__ */ new Map();
    stack2.body.forEach((item) => {
      const child = this.createMemeber(ctx2, item, !!stack2.static);
      if (!child) return;
      const staticFlag = !!(stack2.static || child.static);
      const refs = staticFlag ? this.methods : this.members;
      if (child.type === "PropertyDefinition") {
        this.createInitMemberProperty(ctx2, child, item, staticFlag);
      }
      if (item.isMethodSetterDefinition || item.isMethodGetterDefinition) {
        const name = child.key.value;
        const dataset = staticFlag ? cache1 : cache2;
        let target = dataset.get(name);
        if (!target) {
          target = {
            isAccessor: true,
            kind: "accessor",
            key: child.key,
            modifier: child.modifier
          };
          dataset.set(name, target);
          refs.push(target);
        }
        if (item.isMethodGetterDefinition) {
          target.get = child;
        } else if (item.isMethodSetterDefinition) {
          target.set = child;
        }
      } else if (item.isConstructor && item.isMethodDefinition) {
        this.construct = child;
      } else {
        refs.push(child);
      }
    });
  }
  createAnnotations(ctx2, stack2, node, staticFlag = false) {
    if (staticFlag && stack2.isMethodDefinition && stack2.isEnterMethod && node.modifier === "public" && !this.mainEnter) {
      this.mainEnter = createMainAnnotationNode(ctx2, stack2);
    }
    return node;
  }
  createMemeber(ctx2, stack2, staticFlag = false) {
    const node = ctx2.createToken(stack2);
    if (node) {
      this.createAnnotations(ctx2, stack2, node, !!(staticFlag || node.static));
    }
    return node;
  }
  createDefaultConstructor(ctx2, name, inherit = null, params = []) {
    const block = ctx2.createBlockStatement();
    if (inherit) {
      const se = ctx2.createSuperExpression(
        ctx2.getModuleReferenceName(inherit, this.module)
      );
      const args = params.length > 0 ? ctx2.createArrayExpression(params) : ctx2.createIdentifier("arguments");
      block.body.push(
        ctx2.createExpressionStatement(
          ctx2.createCallExpression(
            ctx2.createMemberExpression(
              [
                se,
                ctx2.createIdentifier("apply")
              ]
            ),
            [
              ctx2.createThisExpression(),
              args
            ]
          )
        )
      );
    }
    return ctx2.createMethodDefinition(
      name,
      block,
      params
    );
  }
  createMemberDescriptor(ctx2, node) {
    if (node.dynamic && node.type === "PropertyDefinition") {
      return null;
    }
    let key = node.key;
    let kind = kindMaps[node.kind];
    let modifier = node.modifier || "public";
    let properties = [];
    let mode = modifierMaps[modifier] | kindMaps[node.kind];
    let _static = node.static;
    if (node.static) {
      mode |= MODIFIER_STATIC;
    }
    if (node.isAbstract) {
      mode |= MODIFIER_ABSTRACT;
    }
    if (node.isFinal) {
      mode |= MODIFIER_FINAL;
    }
    delete node.static;
    if (node.type === "MethodDefinition" || node.kind === "method") {
      node.kind = "";
      if (key.computed) {
        node.key = null;
      }
    }
    node.disabledNewLine = true;
    properties.push(
      ctx2.createProperty(
        ctx2.createIdentifier("m"),
        ctx2.createLiteral(mode)
      )
    );
    if (kind === KIND_VAR) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("writable"),
          ctx2.createLiteral(true)
        )
      );
    }
    if (!_static && (node.isAccessor || kind === KIND_VAR || kind === KIND_CONST) && modifier === "public") {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("enumerable"),
          ctx2.createLiteral(true)
        )
      );
    }
    let isConfigurable = !!node.isConfigurable;
    if (node.isAccessor) {
      if (node.get) {
        if (node.get.isConfigurable) isConfigurable = true;
        node.get.disabledNewLine = true;
        delete node.get.static;
        properties.push(
          ctx2.createProperty(
            ctx2.createIdentifier("get"),
            node.get
          )
        );
      }
      if (node.set) {
        if (node.set.isConfigurable) isConfigurable = true;
        node.set.disabledNewLine = true;
        delete node.set.static;
        properties.push(
          ctx2.createProperty(
            ctx2.createIdentifier("set"),
            node.set
          )
        );
      }
    } else {
      if (node.type === "PropertyDefinition") {
        if (node.init) {
          properties.push(
            ctx2.createProperty(
              ctx2.createIdentifier("value"),
              node.init
            )
          );
        }
      } else {
        properties.push(
          ctx2.createProperty(
            ctx2.createIdentifier("value"),
            node
          )
        );
      }
    }
    if (isConfigurable) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("configurable"),
          ctx2.createLiteral(true)
        )
      );
    }
    return ctx2.createProperty(
      key,
      ctx2.createObjectExpression(properties)
    );
  }
  createClassDescriptor(ctx2, module2, methods, members) {
    const properties = [];
    let kind = module2.isEnum ? KIND_CLASS : module2.isInterface ? KIND_INTERFACE : KIND_CLASS;
    kind |= MODIFIER_PUBLIC;
    if (module2.static) {
      kind |= MODIFIER_STATIC;
    }
    if (module2.abstract) {
      kind |= MODIFIER_ABSTRACT;
    }
    if (module2.isFinal) {
      kind |= MODIFIER_FINAL;
    }
    properties.push(
      ctx2.createProperty(
        ctx2.createIdentifier("m"),
        ctx2.createLiteral(kind)
      )
    );
    const ns = module2.namespace && module2.namespace.toString();
    if (ns) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("ns"),
          ctx2.createLiteral(ns)
        )
      );
    }
    properties.push(
      ctx2.createProperty(
        ctx2.createIdentifier("name"),
        ctx2.createLiteral(module2.id)
      )
    );
    if (module2.dynamic) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("dynamic"),
          ctx2.createLiteral(true)
        )
      );
    }
    if (this.privateName) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("private"),
          ctx2.createIdentifier(this.privateName)
        )
      );
    }
    if (this.implements.length > 0) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("imps"),
          ctx2.createArrayExpression(this.implements)
        )
      );
    }
    if (this.inherit) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("inherit"),
          this.inherit
        )
      );
    }
    if (methods) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("methods"),
          methods
        )
      );
    }
    if (members) {
      properties.push(
        ctx2.createProperty(
          ctx2.createIdentifier("members"),
          members
        )
      );
    }
    return ctx2.createObjectExpression(properties);
  }
  createCreator(ctx2, module2, className, description) {
    const args = [
      ctx2.createIdentifier(className || module2.id),
      description
    ];
    return ctx2.createCallExpression(
      createStaticReferenceNode(ctx2, this.stack, "Class", "creator"),
      args
    );
  }
  createMemberDescriptors(ctx2, members) {
    if (!members.length) return;
    return ctx2.createObjectExpression(
      members.map((node) => this.createMemberDescriptor(ctx2, node)).filter(Boolean)
    );
  }
};
var ClassBuilder_default = ClassBuilder;

// lib/tokens/ClassDeclaration.js
function ClassDeclaration_default(ctx2, stack2) {
  const builder = new ClassBuilder_default(stack2);
  return builder.create(ctx2);
}

// lib/tokens/ConditionalExpression.js
function ConditionalExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.test = ctx2.createToken(stack2.test);
  node.consequent = ctx2.createToken(stack2.consequent);
  node.alternate = ctx2.createToken(stack2.alternate);
  return node;
}

// lib/tokens/ContinueStatement.js
function ContinueStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.label = ctx2.createToken(stack2.label);
  return node;
}

// lib/tokens/Declarator.js
function Declarator_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2, "Identifier");
  node.value = node.raw = stack2.value();
  return node;
}

// lib/tokens/DeclaratorDeclaration.js
function DeclaratorDeclaration_default(ctx2, stack2) {
}

// lib/tokens/DoWhileStatement.js
function DoWhileStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.condition = ctx2.createToken(stack2.condition);
  node.body = ctx2.createToken(stack2.body);
  return node;
}

// lib/tokens/EmptyStatement.js
function EmptyStatement_default() {
}

// lib/core/EnumBuilder.js
var import_Namespace3 = __toESM(require("easescript/lib/core/Namespace.js"));
var EnumBuilder = class extends ClassBuilder_default {
  create(ctx2) {
    ctx2.setNode(this.stack, this);
    const module2 = this.module;
    const stack2 = this.stack;
    this.createInherit(ctx2, module2, stack2);
    this.createImplements(ctx2, module2, stack2);
    this.createBody(ctx2, module2, stack2);
    let methods = this.createMemberDescriptors(ctx2, this.methods);
    let members = this.createMemberDescriptors(ctx2, this.members);
    let creator = this.createCreator(
      ctx2,
      module2,
      module2.id,
      this.createClassDescriptor(ctx2, module2, methods, members)
    );
    ctx2.crateModuleAssets(module2);
    ctx2.createModuleImportReferences(module2);
    if (stack2.compilation.mainModule === module2) {
      ctx2.addExport("default", ctx2.createIdentifier(module2.id));
    }
    ctx2.removeNode(this.stack);
    let expressions = [
      this.construct,
      ...this.beforeBody,
      ...this.body,
      ...this.afterBody,
      ctx2.createExpressionStatement(creator)
    ];
    let symbolNode = this.privateSymbolNode;
    if (symbolNode) {
      expressions.unshift(symbolNode);
    }
    return ctx2.createMultipleStatement(expressions);
  }
  createEnumExpression(ctx2) {
    let stack2 = this.stack;
    const name = stack2.value();
    const init = ctx2.createAssignmentExpression(
      ctx2.createIdentifier(name, stack2),
      ctx2.createObjectExpression()
    );
    const properties = stack2.properties.map((item) => {
      const initNode = ctx2.createMemberExpression([
        ctx2.createIdentifier(name, item.key),
        ctx2.createLiteral(
          item.key.value(),
          void 0,
          item.key
        )
      ]);
      initNode.computed = true;
      const initAssignmentNode = ctx2.createAssignmentExpression(
        initNode,
        ctx2.createLiteral(
          item.init.value(),
          item.init.value(),
          item.init
        )
      );
      const left = ctx2.createMemberExpression([
        ctx2.createIdentifier(name),
        initAssignmentNode
      ]);
      left.computed = true;
      return ctx2.createAssignmentExpression(
        left,
        ctx2.createLiteral(
          item.key.value(),
          void 0,
          item.key
        )
      );
    });
    properties.push(ctx2.createIdentifier(name));
    return ctx2.createVariableDeclaration("var", [
      ctx2.createVariableDeclarator(
        ctx2.createIdentifier(name, stack2),
        ctx2.createParenthesizedExpression(
          ctx2.createSequenceExpression([init, ...properties])
        )
      )
    ]);
  }
  createBody(ctx2, module2, stack2) {
    this.createMemebers(ctx2, stack2);
    if (!this.construct) {
      this.construct = this.createDefaultConstructor(ctx2, module2.id, module2.inherit);
    }
    this.checkConstructor(ctx2, this.construct, module2);
  }
  createInherit(ctx2, module2, stack2 = null) {
    let inherit = module2.inherit;
    if (inherit) {
      ctx2.addDepend(inherit, stack2.module);
      if (ctx2.isActiveModule(inherit, stack2.module)) {
        this.inherit = ctx2.createIdentifier(
          ctx2.getModuleReferenceName(inherit, module2),
          stack2.inherit
        );
      }
    }
    if (!this.inherit) {
      const inherit2 = import_Namespace3.default.globals.get("Enumeration");
      ctx2.addDepend(inherit2, stack2.module);
      this.inherit = ctx2.createIdentifier(
        ctx2.getModuleReferenceName(inherit2, module2)
      );
    }
  }
  createMemebers(ctx2, stack2) {
    let methods = this.methods;
    stack2.properties.forEach((item) => {
      const child = this.createMemeber(ctx2, item);
      if (child) {
        methods.push(child);
      }
    });
    super.createMemebers(ctx2, stack2);
  }
};
var EnumBuilder_default = EnumBuilder;

// lib/tokens/EnumDeclaration.js
function EnumDeclaration_default(ctx2, stack2) {
  const builder = new EnumBuilder_default(stack2);
  if (stack2.isExpression) {
    return builder.createEnumExpression(ctx2);
  } else {
    return builder.create(ctx2);
  }
}

// lib/tokens/EnumProperty.js
function EnumProperty_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2, "PropertyDefinition");
  node.static = true;
  node.key = ctx2.createToken(stack2.key);
  node.init = ctx2.createToken(stack2.init);
  node.modifier = "public";
  node.kind = "enumProperty";
  return node;
}

// lib/tokens/ExportAllDeclaration.js
function ExportAllDeclaration_default(ctx2, stack2) {
  if (stack2.getResolveJSModule() || !stack2.source) {
    return null;
  }
  let source = stack2.source.value();
  const compilation = stack2.getResolveCompilation();
  if (compilation && compilation.stack) {
    ctx2.addFragment(compilation);
    source = ctx2.getModuleImportSource(stack2.getResolveFile(), stack2.compilation.file);
  } else {
    source = ctx2.getModuleImportSource(source, stack2.compilation.file);
  }
  let importSource = ctx2.getImport(source, true);
  if (!importSource) {
    importSource = ctx2.addImport(source, null, "*");
    importSource.setExportSource();
  }
  ctx2.addExport(stack2.exported ? stack2.exported.value() : null, "*", importSource, stack2);
}

// lib/tokens/ExportDefaultDeclaration.js
function ExportDefaultDeclaration_default(ctx2, stack2) {
  let declaration = ctx2.createToken(stack2.declaration);
  if (declaration) {
    ctx2.addExport("default", declaration, null, stack2);
  }
}

// lib/tokens/ExportNamedDeclaration.js
function ExportNamedDeclaration_default(ctx2, stack2) {
  if (stack2.getResolveJSModule()) {
    return null;
  }
  let exportSource = null;
  if (stack2.declaration) {
    const decl = stack2.declaration;
    if (decl.isVariableDeclaration) {
      let decls = decl.declarations.map((decl2) => decl2.id.value());
      exportSource = ctx2.addExport(decls.shift(), ctx2.createToken(decl), null, decl);
      exportSource.bindExport(decls);
    } else if (decl.isFunctionDeclaration) {
      exportSource = ctx2.addExport(decl.key.value(), ctx2.createToken(decl), null, decl);
    } else {
      throw new Error(`Export declaration type only support 'var' or 'function'`);
    }
  } else if (stack2.specifiers && stack2.specifiers.length > 0) {
    let source = null;
    if (stack2.source) {
      source = stack2.source.value();
      let compilation = stack2.getResolveCompilation();
      if (compilation && compilation.stack) {
        ctx2.addFragment(compilation);
        source = ctx2.getModuleImportSource(stack2.getResolveFile(), stack2.compilation.file);
      } else {
        source = ctx2.getModuleImportSource(source, stack2.compilation.file);
      }
      let importSource = ctx2.getImport(source);
      if (!importSource) {
        importSource = ctx2.addImport(source);
        importSource.setExportSource();
      }
      source = importSource;
    }
    stack2.specifiers.forEach((spec) => {
      let exported = spec.exported || spec.local;
      exportSource = ctx2.addExport(exported.value(), spec.local.value(), source, spec);
    });
  }
  if (exportSource) {
    exportSource.stack = stack2;
  }
}

// lib/tokens/ExportSpecifier.js
function ExportSpecifier_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.exported = ctx2.createToken(stack2.exported);
  node.local = ctx2.createToken(stack2.local);
  return node;
}

// lib/tokens/ExpressionStatement.js
function ExpressionStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.expression = ctx2.createToken(stack2.expression);
  return node;
}

// lib/tokens/ForInStatement.js
function ForInStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.left = ctx2.createToken(stack2.left);
  node.right = ctx2.createToken(stack2.right);
  node.body = ctx2.createToken(stack2.body);
  return node;
}

// lib/tokens/ForOfStatement.js
var import_Utils5 = __toESM(require("easescript/lib/core/Utils"));
function ForOfStatement_default(ctx2, stack2) {
  const type = import_Utils5.default.getOriginType(stack2.right.type());
  if (import_Utils5.default.isLocalModule(type) || stack2.right.type().isAnyType) {
    const node2 = ctx2.createNode(stack2, "ForStatement");
    const obj = ctx2.getLocalRefName(stack2, "_i");
    const res = ctx2.getLocalRefName(stack2, "_v");
    const init = ctx2.createToken(stack2.left);
    const object = ctx2.createAssignmentExpression(
      ctx2.createIdentifier(obj),
      ctx2.createCallExpression(
        createStaticReferenceNode(ctx2, stack2, "System", "getIterator"),
        [
          ctx2.createToken(stack2.right)
        ],
        stack2.right
      )
    );
    init.declarations.push(ctx2.createIdentifier(res));
    init.declarations.push(object);
    const condition = ctx2.createChunkExpression(`${obj} && (${res}=${obj}.next()) && !${res}.done`, false);
    node2.init = init;
    node2.condition = condition;
    node2.update = null;
    node2.body = ctx2.createToken(stack2.body);
    const block = node2.body;
    const assignment = ctx2.createExpressionStatement(
      ctx2.createAssignmentExpression(
        ctx2.createIdentifier(init.declarations[0].id.value),
        ctx2.createMemberExpression([
          ctx2.createIdentifier(res),
          ctx2.createIdentifier("value")
        ])
      )
    );
    block.body.splice(0, 0, assignment);
    return node2;
  }
  const node = ctx2.createNode(stack2);
  node.left = ctx2.createToken(stack2.left);
  node.right = ctx2.createToken(stack2.right);
  node.body = ctx2.createToken(stack2.body);
  return node;
}

// lib/tokens/ForStatement.js
function ForStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.init = ctx2.createToken(stack2.init);
  node.condition = ctx2.createToken(stack2.condition);
  node.update = ctx2.createToken(stack2.update);
  node.body = ctx2.createToken(stack2.body);
  return node;
}

// lib/tokens/FunctionDeclaration.js
function FunctionDeclaration_default(ctx2, stack2, type) {
  const node = FunctionExpression_default(ctx2, stack2, type);
  if (stack2.key) {
    let name = stack2.key.value();
    if (stack2.isMethodDefinition && !stack2.isConstructor) {
      name = getMethodOrPropertyAlias(ctx2, stack2, name) || name;
    }
    node.key = ctx2.createIdentifier(name, stack2.key);
  }
  return node;
}

// lib/tokens/Identifier.js
var import_Utils6 = __toESM(require("easescript/lib/core/Utils"));
function Identifier_default(ctx2, stack2) {
  const desc2 = stack2.parentStack && stack2.parentStack.isImportSpecifier ? null : stack2.descriptor();
  const module2 = stack2.module;
  if (desc2 && desc2.isStack && desc2.imports) {
    const isDecl = desc2.isDeclaratorVariable || desc2.isDeclaratorFunction;
    if (isDecl && Array.isArray(desc2.imports)) {
      desc2.imports.forEach((item) => {
        if (item.source.isLiteral) {
          ctx2.createToken(item);
        }
      });
    }
  }
  if (desc2 && (desc2.isPropertyDefinition || desc2.isMethodDefinition || desc2.isEnumProperty) && !(stack2.parentStack.isProperty && stack2.parentStack.key === stack2)) {
    const privateChain = ctx2.options.privateChain;
    const ownerModule = desc2.module;
    const isStatic = !!(desc2.static || ownerModule.static || desc2.isEnumProperty);
    const property = ctx2.createIdentifier(stack2.value(), stack2);
    const modifier = import_Utils6.default.getModifierValue(desc2);
    var object = isStatic ? ctx2.createIdentifier(ownerModule.id) : ctx2.createThisExpression();
    if (privateChain && desc2.isPropertyDefinition && modifier === "private" && !isStatic) {
      object = ctx2.createMemberExpression([
        object,
        ctx2.createIdentifier(
          ctx2.getGlobalRefName(stack2, PRIVATE_NAME, stack2.module),
          stack2
        )
      ]);
      object.computed = true;
      return ctx2.createMemberExpression([object, property], stack2);
    } else {
      return ctx2.createMemberExpression([object, property], stack2);
    }
  }
  if (desc2 !== stack2.module && import_Utils6.default.isClassType(desc2)) {
    ctx2.addDepend(desc2, stack2.module);
    if (!stack2.hasLocalDefined()) {
      return ctx2.createIdentifier(
        ctx2.getGlobalRefName(
          stack2,
          ctx2.getModuleReferenceName(desc2, module2)
        ),
        stack2
      );
    }
  }
  return ctx2.createIdentifier(stack2.value(), stack2);
}

// lib/tokens/IfStatement.js
function IfStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.condition = ctx2.createToken(stack2.condition);
  node.consequent = ctx2.createToken(stack2.consequent);
  node.alternate = ctx2.createToken(stack2.alternate);
  return node;
}

// lib/tokens/ImportDeclaration.js
function ImportDeclaration_default(ctx2, stack2) {
  parseImportDeclaration(ctx2, stack2);
  return null;
}

// lib/tokens/ImportDefaultSpecifier.js
function ImportDefaultSpecifier_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.local = stack2.local ? ctx2.createToken(stack2.local) : ctx2.createIdentifier(stack2.value(), stack2);
  return node;
}

// lib/tokens/ImportExpression.js
function ImportExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  const desc2 = stack2.description();
  if (desc2) {
    const source = ctx2.getModuleImportSource(desc2, stack2.compilation.file, stack2.source.value());
    node.source = ctx2.createLiteral(source, void 0, stack2.source);
  } else {
    node.source = ctx2.createToken(stack2.source);
  }
  return node;
}

// lib/tokens/ImportNamespaceSpecifier.js
function ImportNamespaceSpecifier_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.local = stack2.local ? ctx2.createToken(stack2.local) : ctx2.createIdentifier(stack2.value(), stack2);
  return node;
}

// lib/tokens/ImportSpecifier.js
function ImportSpecifier_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.imported = node.createToken(stack2.imported);
  node.local = stack2.local ? ctx2.createToken(stack2.local) : ctx2.createIdentifier(stack2.value(), stack2);
  return node;
}

// lib/core/InterfaceBuilder.js
var modifierMaps2 = {
  "public": MODIFIER_PUBLIC,
  "protected": MODIFIER_PROTECTED,
  "private": MODIFIER_PRIVATE
};
var kindMaps2 = {
  "accessor": KIND_ACCESSOR,
  "var": KIND_VAR,
  "const": KIND_CONST,
  "method": KIND_METHOD,
  "enumProperty": KIND_ENUM_PROPERTY
};
var InterfaceBuilder = class extends ClassBuilder_default {
  create(ctx2) {
    ctx2.setNode(this.stack, this);
    const module2 = this.module;
    const stack2 = this.stack;
    this.createInherit(ctx2, module2, stack2);
    this.createImplements(ctx2, module2, stack2);
    this.createBody(ctx2, module2, stack2);
    let methods = this.createMemberDescriptors(ctx2, this.methods);
    let members = this.createMemberDescriptors(ctx2, this.members);
    let creator = this.createCreator(
      ctx2,
      module2,
      module2.id,
      this.createClassDescriptor(ctx2, module2, methods, members)
    );
    ctx2.crateModuleAssets(module2);
    ctx2.createModuleImportReferences(module2);
    if (stack2.compilation.mainModule === module2) {
      ctx2.addExport("default", ctx2.createIdentifier(module2.id));
    }
    ctx2.removeNode(this.stack);
    let expressions = [
      this.construct,
      ...this.beforeBody,
      ...this.body,
      ...this.afterBody,
      ctx2.createExpressionStatement(creator)
    ];
    let symbolNode = this.privateSymbolNode;
    if (symbolNode) {
      expressions.unshift(symbolNode);
    }
    return ctx2.createMultipleStatement(expressions);
  }
  createBody(ctx2, module2, stack2) {
    this.createMemebers(ctx2, stack2);
    if (!this.construct) {
      this.construct = this.createDefaultConstructor(ctx2, module2.id, module2.inherit);
    }
    this.checkConstructor(ctx2, this.construct, module2);
  }
  createMemberDescriptor(ctx2, node) {
    if (node.dynamic && node.type === "PropertyDefinition") {
      return null;
    }
    let key = node.key;
    let modifier = node.modifier || "public";
    let properties = [];
    let mode = modifierMaps2[modifier] | kindMaps2[node.kind];
    if (node.static) {
      mode |= MODIFIER_STATIC;
    }
    if (node.isAbstract) {
      mode |= MODIFIER_ABSTRACT;
    }
    if (node.isFinal) {
      mode |= MODIFIER_FINAL;
    }
    properties.push(
      ctx2.createProperty(
        ctx2.createIdentifier("m"),
        ctx2.createLiteral(mode)
      )
    );
    if (node.isAccessor) {
      if (node.get) {
        properties.push(
          ctx2.createProperty(
            ctx2.createIdentifier("get"),
            ctx2.createLiteral(true)
          )
        );
      }
      if (node.set) {
        properties.push(
          ctx2.createProperty(
            ctx2.createIdentifier("set"),
            ctx2.createLiteral(true)
          )
        );
      }
    }
    return ctx2.createProperty(
      key,
      ctx2.createObjectExpression(properties)
    );
  }
};
var InterfaceBuilder_default = InterfaceBuilder;

// lib/tokens/InterfaceDeclaration.js
function InterfaceDeclaration_default(ctx2, stack2) {
  const builder = new InterfaceBuilder_default(stack2);
  return builder.create(ctx2);
}

// lib/tokens/JSXAttribute.js
var import_Namespace4 = __toESM(require("easescript/lib/core/Namespace"));
function JSXAttribute_default(ctx2, stack2) {
  let ns = null;
  if (stack2.hasNamespaced) {
    const xmlns = stack2.getXmlNamespace();
    if (xmlns) {
      ns = xmlns.value.value();
    } else {
      const nsStack = stack2.getNamespaceStack();
      const ops2 = stack2.compiler.options;
      ns = ops2.jsx.xmlns.default[nsStack.namespace.value()] || ns;
    }
  }
  const node = ctx2.createNode(stack2);
  node.namespace = ns;
  let name = null;
  let value = stack2.value ? ctx2.createToken(stack2.value) : ctx2.createLiteral(true);
  if (stack2.isMemberProperty) {
    const eleClass = stack2.jsxElement.getSubClassDescription();
    const propsDesc = stack2.getAttributeDescription(eleClass);
    const resolveName = getMethodOrPropertyAlias(ctx2, propsDesc);
    if (resolveName) {
      name = resolveName.includes("-") ? ctx2.createLiteral(resolveName) : ctx2.createIdentifier(resolveName);
    }
    const invoke = createJSXAttrHookNode(ctx2, stack2, propsDesc);
    if (invoke) value = invoke;
  }
  if (!name) {
    name = ctx2.createToken(stack2.name);
  }
  if (ns === "@binding" && stack2.value) {
    const desc2 = stack2.value.description();
    let has2 = false;
    if (desc2) {
      has2 = (desc2.isPropertyDefinition || desc2.isTypeObjectPropertyDefinition) && !desc2.isReadonly || desc2.isMethodGetterDefinition && desc2.module && desc2.module.getMember(desc2.key.value(), "set");
    }
    if (!has2 && stack2.value.isJSXExpressionContainer) {
      let expression = stack2.value.expression;
      if (expression) {
        if (expression.isTypeAssertExpression) {
          expression = expression.left;
        }
        if (expression.isMemberExpression) {
          const objectType = import_Namespace4.default.globals.get("Object");
          has2 = objectType && objectType.is(expression.object.type());
        }
      }
    }
    if (!has2) {
      stack2.value.error(1e4, stack2.value.raw());
    }
  }
  node.name = name;
  node.value = value;
  return node;
}

// lib/tokens/JSXCdata.js
function JSXCdata_default(ctx2, stack2) {
  let value = stack2.value();
  if (value) {
    value = value.replace(/[\r\n]+/g, "").replace(/\u0022/g, '\\"');
    if (value) {
      return ctx2.createLiteral(value);
    }
  }
  return null;
}

// lib/tokens/JSXClosingElement.js
function JSXClosingElement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.name = ctx2.createToken(stack2.name);
  return node;
}

// lib/tokens/JSXClosingFragment.js
function JSXClosingFragment_default(ctx2, stack2) {
  return ctx2.createNode(stack2);
}

// lib/core/ESX.js
var import_Namespace5 = __toESM(require("easescript/lib/core/Namespace"));
var import_Utils7 = require("easescript/lib/core/Utils");
init_Node();
function createFragmentVNode(ctx2, children, props = null) {
  const items = [
    ctx2.getVNodeApi("Fragment"),
    props ? props : ctx2.createLiteral(null),
    children
  ];
  return ctx2.createCallExpression(
    ctx2.getVNodeApi("createVNode"),
    items
  );
}
function createWithDirectives(ctx2, node, directives) {
  const array = ctx2.createArrayExpression(directives);
  array.newLine = true;
  return ctx2.createCallExpression(
    ctx2.createIdentifier(
      ctx2.getVNodeApi("withDirectives")
    ),
    [
      node,
      array
    ]
  );
}
function createCommentVNode(ctx2, text) {
  return ctx2.createCallExpression(
    ctx2.createIdentifier(ctx2.getVNodeApi("createCommentVNode")),
    [
      ctx2.createLiteral(text)
    ]
  );
}
function createSlotNode(ctx2, stack2, ...args) {
  if (stack2.isSlot && stack2.isSlotDeclared) {
    const slots = ctx2.createCallExpression(
      ctx2.createMemberExpression([
        ctx2.createThisExpression(),
        ctx2.createIdentifier("getAttribute")
      ]),
      [
        ctx2.createLiteral("slots")
      ]
    );
    const node = ctx2.createCallExpression(
      ctx2.createIdentifier(
        ctx2.getVNodeApi("renderSlot")
      ),
      [slots].concat(args)
    );
    node.isSlotNode = true;
    return node;
  } else {
    const node = ctx2.createCallExpression(
      ctx2.createIdentifier(ctx2.getVNodeApi("withCtx")),
      args
    );
    node.isSlotNode = true;
    return node;
  }
}
function createWithCtxNode(ctx2, node) {
  return ctx2.createCallExpression(
    ctx2.createIdentifier(ctx2.getVNodeApi("withCtx")),
    [
      node
    ]
  );
}
function createForMapNode(ctx2, object, element, item, key, index, stack2) {
  const params = [item];
  if (key) {
    params.push(key);
  }
  if (index) {
    params.push(index);
  }
  if (element.type === "ArrayExpression" && element.elements.length === 1) {
    element = element.elements[0];
  }
  const node = ctx2.createArrowFunctionExpression(element, params);
  return ctx2.createCallExpression(
    createStaticReferenceNode(ctx2, stack2, "System", "forMap"),
    [
      object,
      node
    ]
  );
}
function createForEachNode(ctx2, refs, element, item, key) {
  const args = [item];
  if (key) {
    args.push(key);
  }
  if (element.type === "ArrayExpression" && element.elements.length === 1) {
    element = element.elements[0];
  }
  const node = ctx2.createCallExpression(
    ctx2.createMemberExpression([
      refs,
      ctx2.createIdentifier("map")
    ]),
    [
      ctx2.createArrowFunctionExpression(element, args)
    ]
  );
  if (element.type === "ArrayExpression") {
    return ctx2.createCallExpression(
      ctx2.createMemberExpression([
        node,
        ctx2.createIdentifier("reduce")
      ]),
      [
        ctx2.createArrowFunctionExpression([
          ctx2.createIdentifier("acc"),
          ctx2.createIdentifier("item")
        ], ctx2.createCallee(
          ctx2.createMemberExpression([
            ctx2.createIdentifier("acc"),
            ctx2.createIdentifier("concat")
          ]),
          [
            ctx2.createIdentifier("item")
          ]
        )),
        ctx2.createArrayExpression()
      ]
    );
  }
  return node;
}
function getComponentDirectiveAnnotation(module2) {
  if (!(0, import_Utils7.isModule)(module2)) return null;
  const annots = getModuleAnnotations(module2, ["define"]);
  for (let annot of annots) {
    const args = annot.getArguments();
    if (compare(getAnnotationArgumentValue(args[0]), "directives")) {
      if (args.length > 1) {
        return [module2, getAnnotationArgumentValue(args[1]), annot];
      } else {
        return [module2, desc.getName("-"), annot];
      }
    }
  }
  return null;
}
var directiveInterface = null;
function isDirectiveInterface(module2) {
  if (!(0, import_Utils7.isModule)(module2)) return false;
  directiveInterface = directiveInterface || import_Namespace5.default.globals.get("web.components.Directive");
  if (directiveInterface && directiveInterface.isInterface) {
    return directiveInterface.type().isof(module2);
  }
  return false;
}
function getComponentEmitAnnotation(module2) {
  if (!(0, import_Utils7.isModule)(module2)) return null;
  const dataset = /* @__PURE__ */ Object.create(null);
  const annots = getModuleAnnotations(desc, ["define"]);
  annots.forEach((annot) => {
    const args = annot.getArguments();
    if (args.length > 1) {
      let value = getAnnotationArgumentValue(args[0]);
      let _args = args;
      let _key = null;
      let isEmits = compare(value, "emits");
      let isOptions = compare(value, "options");
      if (isEmits) {
        _args = args.slice(1);
        _key = "emits";
      } else if (isOptions) {
        _args = args.slice(2);
        _key = getAnnotationArgumentValue(args[1]);
      }
      _key = String(_key).toLowerCase();
      if (_key === "emits") {
        let skip = _args.length > 1 ? _args[_args.length - 1] : null;
        if (skip && skip.assigned && String(skip.key).toLowerCase() === "type") {
          if (skip.value !== "--literal") {
            skip = null;
          }
        } else {
          skip = null;
        }
        _args.forEach((arg) => {
          if (arg === skip || !arg) return;
          if (arg.assigned) {
            dataset[arg.key] = arg.value;
          } else {
            dataset[arg.value] = arg.value;
          }
        });
      }
    }
  });
  return dataset;
}
function createChildNode(ctx2, stack2, childNode, prev = null) {
  if (!childNode) return null;
  const cmd = [];
  let content = [childNode];
  if (!stack2.directives || !(stack2.directives.length > 0)) {
    return {
      cmd,
      child: stack2,
      content
    };
  }
  const directives = stack2.directives.slice(0).sort((a, b) => {
    const bb = b.name.value().toLowerCase();
    const aa = a.name.value().toLowerCase();
    const v1 = bb === "each" || bb === "for" ? 1 : 0;
    const v2 = aa === "each" || aa === "for" ? 1 : 0;
    return v1 - v2;
  });
  while (directives.length > 0) {
    const directive = directives.shift();
    const name = directive.name.value().toLowerCase();
    const valueArgument = directive.valueArgument;
    if (name === "each" || name === "for") {
      let refs = ctx2.createToken(valueArgument.expression);
      let item = ctx2.createIdentifier(valueArgument.declare.item);
      let key = ctx2.createIdentifier(valueArgument.declare.key || "key");
      let index = valueArgument.declare.index;
      if (index) {
        index = ctx2.createIdentifier(index);
      }
      if (name === "each") {
        content[0] = createForEachNode(
          ctx2,
          refs,
          content[0],
          item,
          key
        );
      } else {
        content[0] = createForMapNode(
          ctx2,
          refs,
          content[0],
          item,
          key,
          index,
          stack2
        );
      }
      content[0].isForNode = true;
      cmd.push(name);
    } else if (name === "if") {
      const node = ctx2.createNode("ConditionalExpression");
      node.test = ctx2.createToken(valueArgument.expression);
      node.consequent = content[0];
      content[0] = node;
      cmd.push(name);
    } else if (name === "elseif") {
      if (!prev || !(prev.cmd.includes("if") || prev.cmd.includes("elseif"))) {
        directive.name.error(1114, name);
      } else {
        cmd.push(name);
      }
      const node = ctx2.createNode("ConditionalExpression");
      node.test = ctx2.createToken(valueArgument.expression);
      node.consequent = content[0];
      content[0] = node;
    } else if (name === "else") {
      if (!prev || !(prev.cmd.includes("if") || prev.cmd.includes("elseif"))) {
        directive.name.error(1114, name);
      } else {
        cmd.push(name);
      }
    }
  }
  return {
    cmd,
    child: stack2,
    content
  };
}
function createSlotCalleeNode(ctx2, stack2, child, ...args) {
  if (stack2.isSlotDeclared) {
    return ctx2.createCallExpression(
      ctx2.createMemberExpression([
        ctx2.createThisExpression(),
        ctx2.createIdentifier("slot")
      ]),
      child ? args.concat(child) : args,
      stack2
    );
  } else {
    return child || ctx2.createArrowFunctionExpression(ctx2.createArrayExpression());
  }
}
function getCascadeConditional(elements) {
  if (elements.length < 2) {
    throw new Error("Invaild expression");
  }
  let lastElement = elements.pop();
  while (elements.length > 0) {
    const _last = elements.pop();
    if (_last.type === "ConditionalExpression") {
      _last.alternate = lastElement;
      lastElement = _last;
    } else {
      throw new Error("Invaild expression");
    }
  }
  return lastElement;
}
function createChildren(ctx2, children, data) {
  let content = [];
  let len = children.length;
  let index = 0;
  let last = null;
  let result = null;
  let next = () => {
    if (index < len) {
      const child = children[index++];
      const childNode = createChildNode(
        ctx2,
        child,
        ctx2.createToken(child),
        last
      ) || next();
      if (child.hasAttributeSlot) {
        const attributeSlot = child.openingElement.attributes.find((attr) => attr.isAttributeSlot);
        if (attributeSlot) {
          const name = attributeSlot.name.value();
          const scopeName = attributeSlot.value ? ctx2.createToken(
            attributeSlot.parserSlotScopeParamsStack()
          ) : null;
          let childrenNodes = childNode.content;
          if (childrenNodes.length === 1 && childrenNodes[0].type === "ArrayExpression") {
            childrenNodes = childrenNodes[0];
          } else {
            childrenNodes = ctx2.createArrayExpression(childrenNodes);
          }
          const params = scopeName ? [
            ctx2.createAssignmentExpression(
              scopeName,
              ctx2.createObjectExpression()
            )
          ] : [];
          const renderSlots = createSlotCalleeNode(
            ctx2,
            child,
            ctx2.createArrowFunctionExpression(childrenNodes, params)
          );
          data.slots[name] = renderSlots;
          return next();
        }
      } else if (child.isSlot && !child.isSlotDeclared) {
        const name = child.openingElement.name.value();
        data.slots[name] = childNode.content[0];
        return next();
      } else if (child.isDirective) {
        childNode.cmd.push(
          child.openingElement.name.value().toLowerCase()
        );
      }
      return childNode;
    }
    return null;
  };
  const push = (data2, value) => {
    if (value) {
      if (Array.isArray(value)) {
        data2.push(...value);
      } else {
        data2.push(value);
      }
    }
  };
  let hasComplex = false;
  while (true) {
    result = next();
    if (last) {
      let value = null;
      const hasIf = last.cmd.includes("if");
      if (hasIf) {
        if (result && result.cmd.includes("elseif")) {
          result.cmd = last.cmd.concat(result.cmd);
          result.content = last.content.concat(result.content);
        } else if (result && result.cmd.includes("else")) {
          value = getCascadeConditional(last.content.concat(result.content));
          result.ifEnd = true;
        } else {
          if (result) result.ifEnd = true;
          last.content.push(createCommentVNode("end if"));
          value = getCascadeConditional(last.content);
        }
      } else if (!(last.ifEnd && last.cmd.includes("else"))) {
        value = last.content;
      }
      const complex = last.child.isJSXExpressionContainer ? !!(last.child.expression.isMemberExpression || last.child.expression.isCallExpression) : false;
      if (last.cmd.includes("each") || last.cmd.includes("for") || last.child.isSlot || last.child.isDirective || complex) {
        hasComplex = true;
      }
      push(content, value);
    }
    last = result;
    if (!result) break;
  }
  if (!content.length) return null;
  if (hasComplex) {
    let first = content[0];
    if (content.length === 1 && (first.type == "ArrayExpression" || first.isForNode || first.isSlotNode)) {
      return first;
    }
    let base = content.length > 1 ? content.shift() : ctx2.createArrayExpression();
    if (base.type !== "ArrayExpression" && !base.isForNode) {
      base = ctx2.createArrayExpression([base]);
      base.newLine = true;
    }
    const node2 = ctx2.createCallExpression(
      ctx2.createMemberExpression([
        base,
        ctx2.createIdentifier("concat")
      ]),
      content.reduce(function(acc, val) {
        if (val.type === "ArrayExpression") {
          return acc.concat(...val.elements);
        } else {
          return acc.concat(val);
        }
      }, [])
    );
    node2.newLine = true;
    node2.indentation = true;
    return node2;
  }
  const node = ctx2.createArrayExpression(content);
  if (content.length > 1 || !(content[0].type === "Literal" || content[0].type === "Identifier")) {
    node.newLine = true;
  }
  return node;
}
function createGetEventValueNode(ctx2, name = "e") {
  return ctx2.createCalleeNode(
    ctx2.createMemberExpression([
      ctx2.createThisExpression(),
      ctx2.createIdentifier("getBindEventValue")
    ]),
    [
      ctx2.createIdentifier(name)
    ]
  );
}
function createDirectiveArrayNode(ctx2, name, expression, ...args) {
  const elems = [
    ctx2.createIdentifier(ctx2.getVNodeApi(name)),
    expression,
    ...args
  ];
  return ctx2.createArrayExpression(elems);
}
function createResolveAttriubeDirective(ctx2, attrDirective) {
  if (!attrDirective.value) return;
  return ctx2.createCallExpression(
    createStaticReferenceNode(ctx2, attrDirective, "web.components.Component", "resolveDirective"),
    [
      ctx2.createToken(attrDirective.parserAttributeValueStack()),
      attrDirective.module ? ctx2.createThisExpression() : ctx2.createLiteral(null)
    ]
  );
}
function createAttributeBindingEventNode(ctx2, attribute, valueTokenNode) {
  if (attribute.value.isJSXExpressionContainer) {
    const expr = attribute.value.expression;
    if (expr.isAssignmentExpression || expr.isSequenceExpression) {
      return ctx2.createArrowFunctionExpression(valueTokenNode);
    } else if (!expr.isFunctionExpression) {
      if (expr.isCallExpression) {
        const isBind = expr.callee.isMemberExpression && expr.callee.property.value() === "bind" && expr.arguments.length > 0 && expr.arguments[0].isThisExpression;
        if (!isBind && valueTokenNode && valueTokenNode.type === "CallExpression") {
          valueTokenNode.arguments.push(ctx2.createIdentifier("...args"));
          return ctx2.createArrowFunctionExpression(
            valueTokenNode,
            [
              ctx2.createIdentifier("...args")
            ]
          );
        }
      } else if (expr.isMemberExpression || expr.isIdentifier) {
        const desc2 = expr.description();
        const isMethod = desc2 && (desc2.isMethodDefinition && !desc2.isAccessor);
        if (isMethod) {
          return ctx2.createCallExpression(
            ctx2.createMemberExpression([
              valueTokenNode,
              ctx2.createIdentifier("bind")
            ]),
            [ctx2.createThisExpression()]
          );
        }
      }
    }
  }
  return valueTokenNode;
}
function getBinddingEventName(stack2) {
  const bindding = getMethodAnnotations(stack2, ["bindding"]);
  if (bindding.length > 0) {
    const [annot] = bindding;
    const args = annot.getArguments();
    return getAnnotationArgumentValue(args[0]);
  }
  return null;
}
function mergeElementPropsNode(ctx2, data, stack2) {
  const items = [];
  const ssr = !!ctx2.options.ssr;
  Object.entries(data).map((item) => {
    const [key, value] = item;
    if (key === "slots" || key === "directives" || key === "keyProps") {
      return;
    }
    if (value) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          const type = value[0].type;
          const isObject = type === "Property" || type === "SpreadElement";
          if (isObject) {
            if (key === "props" || key === "attrs") {
              items.push(...value);
              return;
            } else if (key === "on") {
              if (ssr) return;
              value.forEach((item2) => {
                if (item2.type === "Property") {
                  if (item2.computed) {
                    item2.key = ctx2.createTemplateLiteral([
                      ctx2.createTemplateElement("on")
                    ], [
                      ctx2.createCallExpression(
                        createStaticReferenceNode(ctx2, stack2, "System", "firstUpperCase"),
                        [
                          item2.key
                        ]
                      )
                    ]);
                  } else {
                    item2.key.value = "on" + toFirstUpperCase(item2.key.value);
                  }
                  items.push(item2);
                }
              });
              return;
            }
            items.push(
              ctx2.createProperty(
                ctx2.createIdentifier(key),
                ctx2.createObjectExpression(value)
              )
            );
          } else {
            items.push(
              ctx2.createProperty(
                ctx2.createIdentifier(key),
                ctx2.createArrayExpression(value)
              )
            );
          }
        }
      } else {
        if (value.type === "Property") {
          items.push(value);
        } else {
          items.push(
            ctx2.createProperty(
              ctx2.createIdentifier(key),
              value
            )
          );
        }
      }
    }
  });
  const props = items.length > 0 ? ctx2.createObjectExpression(items) : null;
  if (props && stack2 && stack2.isComponent) {
    const desc2 = stack2.description();
    if (desc2 && (0, import_Utils7.isModule)(desc2)) {
      let has2 = getModuleAnnotations(desc2, ["hook"]).some((annot) => {
        let result = parseHookAnnotation(annot, ctx2.plugin.version, ctx2.options.metadata.versions);
        return result && result.type === "polyfills:props";
      });
      if (has2) {
        return createComponentPropsHookNode(ctx2, props, ctx2.createLiteral(desc2.getName()));
      }
    }
  }
  return props;
}
function createComponentPropsHookNode(ctx2, props, className) {
  return ctx2.createCallExpression(
    ctx2.createMemberExpression([
      ctx2.createThisExpression(),
      ctx2.createIdentifier("invokeHook")
    ]),
    [
      ctx2.createLiteral("polyfills:props"),
      props,
      className
    ]
  );
}
function createAttributes(ctx2, stack2, data) {
  const pushEvent = (name, node, category) => {
    let events = data[category] || (data[category] = []);
    if (!Node_default.is(name)) {
      name = String(name);
      name = name.includes(":") ? ctx2.createLiteral(name) : ctx2.createIdentifier(name);
    }
    let property = ctx2.createProperty(name, node);
    if (property.key.computed) {
      property.computed = true;
      property.key.computed = false;
    }
    events.push(property);
  };
  let isComponent = stack2.isComponent || stack2.isWebComponent;
  let nodeType = !isComponent ? stack2.openingElement.name.value().toLowerCase() : null;
  let binddingModelValue = null;
  let afterDirective = null;
  let custom = null;
  if (nodeType === "input") {
    afterDirective = "vModelText";
  } else if (nodeType === "select") {
    afterDirective = "vModelSelect";
  } else if (nodeType === "textarea") {
    afterDirective = "vModelText";
  }
  const forStack = stack2.getParentStack((stack3) => {
    return stack3.scope.isForContext || !(stack3.isJSXElement || stack3.isJSXExpressionContainer);
  }, true);
  const inFor = forStack && forStack.scope && forStack.scope.isForContext ? true : false;
  const descModule = stack2.isWebComponent ? stack2.description() : null;
  const definedEmits = getComponentEmitAnnotation(descModule);
  const getDefinedEmitName = (name) => {
    if (definedEmits && Object.prototype.hasOwnProperty.call(definedEmits, name)) {
      name = toCamelCase(definedEmits[name]);
    }
    return name;
  };
  stack2.openingElement.attributes.forEach((item) => {
    if (item.isAttributeXmlns) return;
    if (item.isAttributeDirective) {
      if (item.isAttributeDirective) {
        const name2 = item.name.value();
        if (compare(name2, "show")) {
          data.directives.push(
            createDirectiveArrayNode(
              ctx2,
              "vShow",
              ctx2.createToken(item.valueArgument.expression)
            )
          );
        } else if (compare(name2, "custom")) {
          data.directives.push(
            createResolveAttriubeDirective(
              ctx2,
              item
            )
          );
        }
      }
      return;
    } else if (item.isJSXSpreadAttribute) {
      if (item.argument) {
        data.props.push(
          ctx2.createSpreadElement(
            ctx2.createToken(item.argument),
            item
          )
        );
      }
      return;
    } else if (item.isAttributeSlot) {
      return;
    }
    let value = ctx2.createToken(item);
    if (!value) return;
    let ns = value.namespace;
    let name = value.name.value;
    let propName = name;
    let propValue = value.value;
    let attrLowerName = name.toLowerCase();
    if (ns === "@events" || ns === "@natives") {
      name = getDefinedEmitName(name);
    }
    if (ns && ns.includes("::")) {
      let [seg, className] = ns.split("::", 2);
      ns = seg;
      name = createStaticReferenceNode(ctx2, item, className, name);
      name.computed = true;
      custom = name;
    }
    let isDOMAttribute = false;
    if (item.isMemberProperty) {
      let attrDesc = item.getAttributeDescription(stack2.getSubClassDescription());
      if (attrDesc) {
        isDOMAttribute = getMethodAnnotations(attrDesc, ["domattribute"]).length > 0;
      }
    }
    if (ns === "@events" || ns === "@natives") {
      pushEvent(name, createAttributeBindingEventNode(item, propValue), "on");
      return;
    } else if (ns === "@binding") {
      binddingModelValue = propValue;
      if (!binddingModelValue || !(binddingModelValue.type === "MemberExpression" || binddingModelValue.type === "Identifier")) {
        binddingModelValue = null;
        if (item.value && item.value.isJSXExpressionContainer) {
          const stack3 = item.value.expression;
          if (stack3 && stack3.isMemberExpression && !stack3.optional) {
            binddingModelValue = ctx2.createCallExpression(
              createStaticReferenceNode(ctx2, stack3, "Reflect", "set"),
              [
                stack3.module ? ctx2.createIdentifier(stack3.module.id) : ctx2.createLiteral(null),
                ctx2.createToken(stack3.object),
                stack3.computed ? ctx2.createToken(stack3.property) : ctx2.createLiteral(stack3.property.value()),
                ctx2.createIdentifier("value")
              ],
              stack3
            );
            binddingModelValue.isReflectSetter = true;
          }
        }
      }
    }
    if (item.isMemberProperty) {
      if (ns === "@binding" && attrLowerName === "value") {
        data.props.push(
          ctx2.createProperty(
            ctx2.createIdentifier(
              propName,
              item.name
            ),
            propValue
          )
        );
        propName = "modelValue";
      }
      if (!isDOMAttribute) {
        data.props.push(
          ctx2.createProperty(
            ctx2.createIdentifier(
              propName,
              item.name
            ),
            propValue
          )
        );
        if (ns !== "@binding") return;
      }
    }
    if (attrLowerName === "type" && nodeType === "input" && propValue && propValue.type === "Literal") {
      const value2 = propValue.value.toLowerCase();
      if (value2 === "checkbox") {
        afterDirective = "vModelCheckbox";
      } else if (value2 === "radio") {
        afterDirective = "vModelRadio";
      }
    }
    if (ns === "@binding") {
      const createBinddingParams = (getEvent = false) => {
        return [
          binddingModelValue.isReflectSetter ? binddingModelValue : ctx2.createAssignmentExpression(
            binddingModelValue,
            getEvent ? createGetEventValueNode(ctx2) : ctx2.createIdentifier("e")
          ),
          [
            ctx2.createIdentifier("e")
          ]
        ];
      };
      if (custom && binddingModelValue) {
        pushEvent(custom, ctx2.createArrowFunctionExpression(
          ...createBinddingParams(!stack2.isWebComponent)
        ), "on");
      } else if ((stack2.isWebComponent || afterDirective) && binddingModelValue) {
        let eventName = propName;
        if (propName === "modelValue") {
          eventName = "update:modelValue";
        }
        if (item.isMemberProperty) {
          let _name = getBinddingEventName(item.description());
          if (_name) {
            eventName = toCamelCase(_name);
          }
        }
        pushEvent(
          getDefinedEmitName(eventName),
          ctx2.createArrowFunctionExpression(
            ...createBinddingParams()
          ),
          "on"
        );
      } else if (binddingModelValue) {
        pushEvent(
          ctx2.createIdentifier("input"),
          ctx2.createArrowFunctionExpression(
            ...createBinddingParams(true)
          ),
          "on"
        );
      }
      if (afterDirective && binddingModelValue) {
        data.directives.push(
          createDirectiveArrayNode(ctx2, afterDirective, binddingModelValue)
        );
      }
      return;
    }
    if (!ns && (attrLowerName === "ref" || attrLowerName === "refs")) {
      name = propName = "ref";
      let useArray = inFor || attrLowerName === "refs";
      if (useArray) {
        propValue = ctx2.createArrowFunctionExpression(
          ctx2.createCallExpression(
            ctx2.createMemberExpression([
              ctx2.createThisExpression(),
              ctx2.createIdentifierExpression("setRefNode")
            ]),
            [
              value.value,
              ctx2.createIdentifier("node"),
              ctx2.createLiteral(true)
            ]
          ),
          [
            ctx2.createIdentifier("node")
          ]
        );
      }
    }
    if (name === "class" || name === "staticClass") {
      if (propValue && propValue.type !== "Literal") {
        propValue = ctx2.createCallExpression(
          ctx2.createIdentifier(
            ctx2.getVNodeApi("normalizeClass")
          ),
          [
            propValue
          ]
        );
      }
    } else if (name === "style" || name === "staticStyle") {
      if (propValue && !(propValue.type === "Literal" || propValue.type === "ObjectExpression")) {
        propValue = ctx2.createCallExpression(
          ctx2.createIdentifier(
            ctx2.getVNodeApi("normalizeStyle")
          ),
          [propValue]
        );
      }
    } else if (attrLowerName === "key" || attrLowerName === "tag") {
      name = attrLowerName;
    }
    const property = ctx2.createProperty(
      ctx2.createIdentifier(
        propName,
        item.name
      ),
      propValue
    );
    switch (name) {
      case "class":
      case "style":
      case "key":
      case "tag":
      case "ref":
        data[name] = property;
        break;
      default:
        data.attrs.push(property);
    }
  });
  if (!data.key) {
    data.key = createElementKeyPropertyNode(ctx2, stack2);
  }
}
function createElementKeyPropertyNode(ctx2, stack2) {
  const keys2 = ctx2.options.esx.complete.keys;
  const fills = Array.isArray(keys2) && keys2.length > 0 ? keys2 : null;
  const all = keys2 === true;
  if (fills || all) {
    let key = null;
    let direName = null;
    let isForContext = false;
    if (all || fills.includes("for") || fills.includes("each")) {
      if (!stack2.isDirective && stack2.directives && Array.isArray(stack2.directives)) {
        let directive = stack2.directives.find((directive2) => ["for", "each"].includes(directive2.name.value().toLowerCase()));
        if (directive) {
          isForContext = true;
          direName = directive.name.value().toLowerCase();
          let valueArgument = directive.valueArgument;
          if (valueArgument) {
            key = valueArgument.declare.index || valueArgument.declare.key;
          }
        }
      }
      if (!direName && stack2.parentStack.isDirective && ["for", "each"].includes(stack2.parentStack.openingElement.name.value())) {
        const attrs = stack2.parentStack.openingElement.attributes;
        const argument = {};
        isForContext = true;
        direName = stack2.parentStack.openingElement.name.value().toLowerCase();
        attrs.forEach((attr) => {
          argument[attr.name.value()] = attr.value.value();
        });
        key = argument["index"] || argument["key"];
      }
    }
    if (fills && fills.includes("condition")) {
      if (!stack2.isDirective && stack2.directives && Array.isArray(stack2.directives)) {
        let directive = stack2.directives.find((directive2) => ["if", "elseif", "else"].includes(directive2.name.value().toLowerCase()));
        if (directive) {
          direName = directive.name.value().toLowerCase();
        }
      }
      if (!isForContext && stack2.parentStack.isDirective && ["if", "elseif", "else"].includes(stack2.parentStack.openingElement.name.value())) {
        direName = stack2.parentStack.openingElement.name.value().toLowerCase();
      }
    }
    if (all || fills.includes(direName)) {
      return ctx2.createProperty(
        ctx2.createIdentifier("key"),
        isForContext ? ctx2.createBinaryExpression(
          ctx2.createLiteral(getDepth(stack2) + "."),
          ctx2.createIdentifierNode(key || "key"),
          "+"
        ) : ctx2.createLiteral(getDepth(stack2))
      );
    }
  }
}
function createComponentDirectiveProperties(ctx2, stack2, data, callback = null) {
  if (stack2) {
    let desc2 = stack2.description();
    let parentIsComponentDirective = getComponentDirectiveAnnotation(desc2);
    if (!parentIsComponentDirective) {
      parentIsComponentDirective = isDirectiveInterface(desc2);
    }
    if (parentIsComponentDirective) {
      let node = createResolveComponentDirective(ctx2, stack2, data, callback);
      if (node) {
        data.directives.push(node);
      }
      if (stack2.jsxRootElement !== stack2) {
        createComponentDirectiveProperties(ctx2, stack2.parentStack, data, callback);
      }
      return true;
    }
  }
  return false;
}
function createCustomDirectiveProperties(ctx2, stack2, data, callback = null) {
  const node = createResolveComponentDirective(ctx2, stack2, data, callback);
  if (node) {
    data.directives.push(node);
  }
  if (stack2.parentStack && stack2.parentStack.isDirective && stack2.jsxRootElement !== stack2.parentStack) {
    let dName = stack2.parentStack.openingElement.name.value().toLowerCase();
    if (dName === "custom") {
      createCustomDirectiveProperties(ctx2, stack2.parentStack, data, callback);
    }
  }
}
function createResolveComponentDirective(ctx2, stack2, data, callback = null) {
  const props = [];
  const has2 = (items, name) => items && items.some((prop) => prop.key.value === name);
  stack2.openingElement.attributes.forEach((attr) => {
    if (attr.isAttributeXmlns || attr.isAttributeDirective) return;
    const name = attr.name.value();
    const property = ctx2.createProperty(
      ctx2.createIdentifier(name),
      attr.value ? ctx2.createToken(attr.value) : ctx2.createLiteral(true)
    );
    if (attr.isMemberProperty) {
      if (!has2(data.props, name)) {
        property.isInheritDirectiveProp = true;
        data.props.push(property);
      }
    } else {
      if (!has2(data.attrs, name)) {
        property.isInheritDirectiveAttr = true;
        data.attrs.push(property);
      }
    }
    if (callback) {
      callback(property);
    }
  });
  const object = ctx2.createObjectExpression(props);
  const node = ctx2.createCallExpression(
    createStaticReferenceNode(ctx2, stack2, "web.components.Component", "resolveDirective"),
    [
      object,
      ctx2.createThisExpression()
    ]
  );
  node.isInheritComponentDirective = true;
  return node;
}
function createSlotElementNode(ctx2, stack2, children) {
  const openingElement = ctx2.createToken(stack2.openingElement);
  const args = [ctx2, stack2];
  let props = null;
  let params = [];
  if (stack2.isSlotDeclared) {
    args.push(ctx2.createLiteral(stack2.openingElement.name.value()));
    if (openingElement.attributes.length > 0) {
      const properties = openingElement.attributes.map((attr) => {
        return ctx2.createProperty(
          attr.name,
          attr.value
        );
      });
      props = ctx2.createObjectExpression(properties);
    } else {
      props = ctx2.createObjectExpression();
    }
    args.push(props);
  } else if (stack2.openingElement.attributes.length > 0) {
    const attribute = stack2.openingElement.attributes[0];
    if (attribute.value) {
      const stack3 = attribute.parserSlotScopeParamsStack();
      params.push(
        ctx2.createAssignmentExpression(
          ctx2.createToken(stack3),
          ctx2.createObjectExpression()
        )
      );
    }
  }
  if (children) {
    if (Array.isArray(children) && children.length === 0) {
      children = null;
    } else if (children.type === "ArrayExpression" && children.elements.length === 0) {
      children = null;
    }
    if (children) {
      args.push(ctx2.createArrowFunctionExpression(children, params));
    }
  }
  return createSlotNode(...args);
}
function createDirectiveElementNode(ctx2, stack2, children) {
  const openingElement = stack2.openingElement;
  const name = openingElement.name.value().toLowerCase();
  switch (name) {
    case "custom":
    case "show":
      return children;
    case "if":
    case "elseif": {
      const condition = ctx2.createToken(stack2.attributes[0].parserAttributeValueStack());
      const node = ctx2.createNode("ConditionalExpression");
      node.test = condition;
      node.consequent = children;
      return node;
    }
    case "else":
      return children;
    case "for":
    case "each": {
      const attrs = stack2.openingElement.attributes;
      const argument = {};
      attrs.forEach((attr) => {
        if (attr.name.value() === "name") {
          argument["refs"] = ctx2.createToken(attr.parserAttributeValueStack());
        } else {
          argument[attr.name.value()] = ctx2.createIdentifier(attr.value.value());
        }
      });
      let item = argument.item || ctx2.createIdentifier("item");
      let key = argument.key || ctx2.createIdentifier("key");
      let node = name === "for" ? createForMapNode(ctx2, argument.refs, children, item, key, argument.index, stack2) : createForEachNode(ctx2, argument.refs, children, item, key);
      node.isForNode = true;
      return node;
    }
  }
  return null;
}
function createHandleNode(ctx2, stack2, ...args) {
  let handle = ctx2.createIdentifier(
    ctx2.getLocalRefName(
      stack2,
      ctx2.options.esx.handle || "createVNode"
    )
  );
  return ctx2.createCallExpression(handle, args);
}
function createElementNode(ctx2, stack2, data, children) {
  let name = null;
  if (stack2.isComponent) {
    if (stack2.jsxRootElement === stack2 && stack2.parentStack.isProgram) {
      name = ctx2.createLiteral("div");
    } else {
      const desc2 = stack2.description();
      if ((0, import_Utils7.isModule)(desc2)) {
        ctx2.addDepend(desc2, stack2.module);
        name = ctx2.createIdentifier(
          ctx2.getModuleReferenceName(desc2, stack2.module)
        );
      } else {
        name = ctx2.createIdentifier(
          stack2.openingElement.name.value(),
          stack2.openingElement.name
        );
      }
    }
  } else {
    name = ctx2.createLiteral(stack2.openingElement.name.value());
  }
  data = mergeElementPropsNode(ctx2, data, stack2);
  if (children) {
    return createHandleNode(ctx2, stack2, name, data || ctx2.createLiteral(null), children);
  } else if (data) {
    return createHandleNode(ctx2, stack2, name, data);
  } else {
    return createHandleNode(ctx2, stack2, name);
  }
}
function getDepth(stack2) {
  let parentStack = stack2.parentStack;
  while (parentStack) {
    if (parentStack.isJSXElement || parentStack.isJSXExpressionContainer || parentStack.isMethodDefinition || parentStack.isProgram) break;
    parentStack = parentStack.parentStack;
  }
  if (parentStack && (parentStack.isDirective || parentStack.isSlot || parentStack.isJSXExpressionContainer)) {
    const index = stack2.childIndexAt;
    const prefix = getDepth(parentStack);
    return prefix ? prefix + "." + index : index;
  }
  return stack2.childIndexAt;
}
function getChildren(stack2) {
  return stack2.children.filter((child) => {
    return !(child.isJSXScript && child.isScriptProgram || child.isJSXStyle);
  });
}
function createElement(ctx2, stack2) {
  let data = {
    directives: [],
    slots: {},
    attrs: [],
    props: []
  };
  let isRoot = stack2.jsxRootElement === stack2;
  let children = getChildren(stack2);
  let childNodes = createChildren(ctx2, children, data, stack2);
  let desc2 = stack2.description();
  let componentDirective = getComponentDirectiveAnnotation(desc2);
  let nodeElement = null;
  if (stack2.isDirective && stack2.openingElement.name.value().toLowerCase() === "custom") {
    componentDirective = true;
  } else if (stack2.isComponent && isDirectiveInterface(desc2)) {
    componentDirective = true;
  }
  if (componentDirective) {
    return childNodes;
  }
  if (stack2.parentStack && stack2.parentStack.isDirective) {
    let dName = stack2.parentStack.openingElement.name.value().toLowerCase();
    if (dName === "show") {
      const condition = stack2.parentStack.openingElement.attributes[0];
      data.directives.push(
        createDirectiveArrayNode(
          ctx2,
          "vShow",
          ctx2.createToken(condition.parserAttributeValueStack())
        )
      );
    } else if (dName === "custom") {
      createCustomDirectiveProperties(ctx2, stack2.parentStack, data);
    }
  } else {
    createComponentDirectiveProperties(ctx2, stack2.parentStack, data);
  }
  if (!stack2.isJSXFragment) {
    if (!(isRoot && stack2.openingElement.name.value() === "root")) {
      createAttributes(ctx2, stack2, data);
    }
  }
  const isWebComponent = stack2.isWebComponent && !(stack2.compilation.JSX && stack2.parentStack.isProgram);
  if (isWebComponent) {
    const properties = [];
    if (childNodes) {
      properties.push(ctx2.createProperty(
        ctx2.createIdentifier("default"),
        createWithCtxNode(
          ctx2.createArrowFunctionExpression(childNodes)
        )
      ));
      childNodes = null;
    }
    if (data.slots) {
      for (let key in data.slots) {
        properties.push(
          ctx2.createProperty(
            ctx2.createIdentifier(key),
            data.slots[key]
          )
        );
      }
    }
    if (properties.length > 0) {
      childNodes = ctx2.createObjectExpression(properties);
    }
  }
  if (stack2.isSlot) {
    nodeElement = createSlotElementNode(ctx2, stack2, childNodes);
  } else if (stack2.isDirective) {
    nodeElement = createDirectiveElementNode(ctx2, stack2, childNodes);
  } else {
    if (stack2.isJSXFragment || isRoot && !isWebComponent && stack2.openingElement.name.value() === "root") {
      if (Array.isArray(childNodes) && childNodes.length === 1) {
        nodeElement = childNodes[0];
      } else {
        nodeElement = createFragmentVNode(ctx2, childNodes);
      }
    } else {
      nodeElement = createElementNode(ctx2, stack2, data, childNodes);
    }
  }
  if (nodeElement && data.directives && data.directives.length > 0) {
    nodeElement = createWithDirectives(ctx2, nodeElement, data.directives);
  }
  return nodeElement;
}

// lib/tokens/JSXElement.js
function JSXElement(ctx2, stack2) {
  if (!ctx2.options.esx.enable) return;
  return createElement(ctx2, stack2);
}

// lib/tokens/JSXEmptyExpression.js
function JSXEmptyExpression_default(ctx2, stack2) {
  return null;
}

// lib/tokens/JSXExpressionContainer.js
function JSXExpressionContainer_default(ctx2, stack2) {
  return ctx2.createToken(stack2.expression);
}

// lib/tokens/JSXFragment.js
var JSXFragment_default = JSXElement;

// lib/tokens/JSXIdentifier.js
function JSXIdentifier_default(ctx2, stack2) {
  var name = stack2.value();
  if (stack2.parentStack.parentStack.isJSXAttribute) {
    if (name.includes("-")) {
      return ctx2.createIdentifier(toCamelCase(name), stack2);
    }
  }
  const node = ctx2.createNode(stack2, "Identifier");
  node.value = name;
  node.raw = name;
  return node;
}

// lib/tokens/JSXMemberExpression.js
function JSXMemberExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.object = ctx2.createToken(stack2.object);
  node.property = ctx2.createToken(stack2.property);
  return node;
}

// lib/tokens/JSXNamespacedName.js
function JSXNamespacedName_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.name = ctx2.createToken(stack2.name);
  node.namespace = ctx2.createToken(stack2.namespace);
  const xmlns = stack2.getXmlNamespace();
  if (xmlns) {
    node.value = xmlns.value.value();
  } else {
    const ops2 = stack2.compiler.options;
    node.value = ops2.jsx.xmlns.default[stack2.namespace.value()] || null;
  }
  node.raw = node.value;
  return node;
}

// lib/tokens/JSXOpeningElement.js
function JSXOpeningElement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.attributes = stack2.attributes.map((attr) => ctx2.createToken(attr));
  node.selfClosing = !!stack2.selfClosing;
  if (stack2.parentStack.isComponent) {
    const desc2 = stack2.parentStack.description();
    if (desc2) {
      if (stack2.hasNamespaced && desc2.isFragment) {
        node.name = ctx2.createIdentifier(desc2.id, stack2.name);
      } else {
        node.name = ctx2.createIdentifier(ctx2.getModuleReferenceName(desc2, stack2.module), stack2.name);
      }
    } else {
      node.name = ctx2.createIdentifier(stack2.name.value(), stack2.name);
    }
  } else {
    node.name = ctx2.createLiteral(stack2.name.value(), void 0, stack2.name);
  }
  return node;
}

// lib/tokens/JSXOpeningFragment.js
function JSXOpeningFragment_default(ctx2, stack2) {
  return ctx2.createNode(stack2);
}

// lib/tokens/JSXScript.js
function JSXScript_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.openingElement = ctx2.createToken(stack2.openingElement);
  node.closingElement = ctx2.createToken(stack2.closingElement);
  node.body = (stack2.body || []).map((child) => ctx2.createToken(child));
}

// lib/tokens/JSXSpreadAttribute.js
function JSXSpreadAttribute_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.argument = ctx2.createToken(stack2.argument);
  return node;
}

// lib/tokens/JSXStyle.js
function JSXStyle_default(ctx2, stack2) {
  return null;
}

// lib/tokens/JSXText.js
function JSXText_default(ctx2, stack2) {
  let value = stack2.value();
  if (value) {
    value = value.replace(/\s+/g, " ").replace(/(\u0022|\u0027)/g, "\\$1");
    if (value) {
      return ctx2.createLiteral(value);
    }
  }
  return null;
}

// lib/tokens/LabeledStatement.js
function LabeledStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.label = ctx2.createIdentifier(stack2.label.value(), stack2.label);
  node.body = ctx2.createToken(stack2.body);
  return node;
}

// lib/tokens/Literal.js
function Literal_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.raw = stack2.raw();
  const code = node.raw.charCodeAt(0);
  if (code === 34 || code === 39) {
    node.value = node.raw.slice(1, -1);
  } else {
    node.value = stack2.value();
  }
  return node;
}

// lib/tokens/LogicalExpression.js
function LogicalExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.left = ctx2.createToken(stack2.left);
  node.right = ctx2.createToken(stack2.right);
  node.operator = stack2.operator;
  return node;
}

// lib/tokens/MemberExpression.js
var import_Utils8 = __toESM(require("easescript/lib/core/Utils"));
function addImportReference(ctx2, desc2) {
  if (desc2 && desc2.isStack && desc2.imports) {
    const isDecl = desc2.isDeclaratorVariable || desc2.isDeclaratorFunction;
    if (isDecl && Array.isArray(desc2.imports)) {
      desc2.imports.forEach((item) => {
        if (item.source.isLiteral) {
          ctx2.createToken(item);
        }
      });
    }
  }
}
function MemberExpression(ctx2, stack2) {
  const refsName = stack2.getReferenceName();
  if (refsName) {
    return ctx2.createIdentifier(refsName, stack2);
  }
  const module2 = stack2.module;
  const description = stack2.descriptor();
  const objectType = stack2.object.type();
  if (description && description.isModule && objectType && !objectType.isLiteralObjectType && import_Utils8.default.isTypeModule(description)) {
    ctx2.addDepend(description, stack2.module);
  } else {
    const objectDescriptor = stack2.object.descriptor();
    if (import_Utils8.default.isTypeModule(objectDescriptor)) {
      ctx2.addDepend(objectDescriptor, stack2.module);
    } else {
      addImportReference(ctx2, objectDescriptor);
      addImportReference(ctx2, description);
    }
  }
  if (!description || import_Utils8.default.isType(description) && description.isAnyType && !stack2.optional) {
    let isReflect = true;
    if (description) {
      isReflect = false;
      let hasDynamic = description.isComputeType && description.isPropertyExists();
      if (!hasDynamic && !import_Utils8.default.isLiteralObjectType(objectType)) {
        isReflect = true;
      }
    }
    if (isReflect) {
      return ctx2.createCallExpression(
        createStaticReferenceNode(ctx2, stack2, "Reflect", "get"),
        [
          module2 ? ctx2.createIdentifier(module2.id) : ctx2.createLiteral(null),
          ctx2.createToken(stack2.object),
          stack2.computed ? ctx2.createToken(stack2.property) : ctx2.createLiteral(stack2.property.value())
        ],
        stack2
      );
    }
  }
  const resolveName = getMethodOrPropertyAlias(ctx2, description);
  const privateChain = ctx2.options.privateChain;
  if (privateChain && description && description.isMethodDefinition && !(description.static || description.module.static)) {
    const modifier = import_Utils8.default.getModifierValue(description);
    const refModule = description.module;
    if (modifier === "private" && refModule.children.length > 0) {
      let property = resolveName ? ctx2.createIdentifier(resolveName, stack2.property) : ctx2.createToken(stack2.property);
      return ctx2.createMemberExpression(
        [
          ctx2.createIdentifier(module2.id),
          ctx2.createIdentifier("prototype"),
          property
        ],
        stack2
      );
    }
  }
  if (objectType && !objectType.isLiteralObjectType && import_Utils8.default.isClassType(description)) {
    ctx2.addDepend(description, stack2.module);
    if (!stack2.hasMatchAutoImporter) {
      return ctx2.createIdentifier(
        ctx2.getModuleReferenceName(description, module2),
        stack2
      );
    }
  }
  if (stack2.object.isSuperExpression) {
    let property = resolveName ? ctx2.createIdentifier(resolveName, stack2.property) : ctx2.createToken(stack2.property);
    if (description && description.isMethodGetterDefinition) {
      if (property.type === "Identifier") {
        property = ctx2.createLiteral(
          property.value,
          void 0,
          stack2.property
        );
      }
      const args = [
        ctx2.createIdentifier(module2.id),
        ctx2.createThisExpression(),
        property
      ];
      return ctx2.createCallExpression(
        createStaticReferenceNode(ctx2, stack2, "Class", "callSuperGetter"),
        args
      );
    } else if (description && description.isMethodSetterDefinition) {
      if (property.type === "Identifier") {
        property = ctx2.createLiteral(
          property.value,
          void 0,
          stack2.property
        );
      }
      const args = [
        ctx2.createIdentifier(module2.id),
        ctx2.createThisExpression(),
        property
      ];
      return ctx2.createCallExpression(
        createStaticReferenceNode(ctx2, stack2, "Class", "callSuperSetter"),
        args
      );
    } else {
      return ctx2.createMemberExpression([
        ctx2.createToken(stack2.object),
        ctx2.createIdentifier("prototype"),
        property
      ]);
    }
  }
  let propertyNode = resolveName ? ctx2.createIdentifier(resolveName, stack2.property) : ctx2.createToken(stack2.property);
  if (privateChain && description && description.isPropertyDefinition && !(description.static || description.module.static)) {
    const modifier = import_Utils8.default.getModifierValue(description);
    if ("private" === modifier) {
      const object = ctx2.createMemberExpression([
        ctx2.createToken(stack2.object),
        ctx2.createIdentifier(
          ctx2.getGlobalRefName(stack2, PRIVATE_NAME, stack2.module)
        )
      ]);
      object.computed = true;
      return ctx2.createMemberExpression([
        object,
        propertyNode
      ]);
    }
  }
  if (description && (!description.isAccessor && description.isMethodDefinition)) {
    const pStack = stack2.getParentStack((stack3) => !!(stack3.jsxElement || stack3.isBlockStatement || stack3.isCallExpression || stack3.isExpressionStatement));
    if (pStack && pStack.jsxElement) {
      return ctx2.createCallExpression(
        ctx2.createMemberExpression([
          ctx2.createToken(stack2.object),
          propertyNode,
          ctx2.createIdentifier("bind")
        ]),
        [ctx2.createThisExpression()]
      );
    }
  }
  const node = ctx2.createNode(stack2);
  node.computed = !!stack2.computed;
  node.optional = !!stack2.optional;
  node.object = ctx2.createToken(stack2.object);
  node.property = propertyNode;
  return node;
}
var MemberExpression_default = MemberExpression;

// lib/tokens/MethodDefinition.js
var import_Utils9 = __toESM(require("easescript/lib/core/Utils"));
function MethodDefinition_default(ctx2, stack2, type) {
  const node = FunctionDeclaration_default(ctx2, stack2, type);
  node.async = stack2.expression.async ? true : false;
  node.static = !!stack2.static;
  node.modifier = import_Utils9.default.getModifierValue(stack2);
  node.kind = "method";
  node.isAbstract = !!stack2.isAbstract;
  node.isFinal = !!stack2.isFinal;
  return node;
}

// lib/tokens/MethodGetterDefinition.js
function MethodGetterDefinition_default(ctx2, stack2, type) {
  const node = MethodDefinition_default(ctx2, stack2, type);
  node.kind = "get";
  return node;
}

// lib/tokens/MethodSetterDefinition.js
function MethodSetterDefinition_default(ctx2, stack2, type) {
  const node = MethodDefinition_default(ctx2, stack2, type);
  node.kind = "set";
  return node;
}

// lib/tokens/NewExpression.js
var import_Utils10 = __toESM(require("easescript/lib/core/Utils"));
function NewExpression_default(ctx2, stack2) {
  let desc2 = stack2.callee.type();
  desc2 = import_Utils10.default.getOriginType(desc2);
  if (desc2 !== stack2.module && import_Utils10.default.isTypeModule(desc2)) {
    ctx2.addDepend(desc2, stack2.module);
  }
  const node = ctx2.createNode(stack2);
  node.callee = ctx2.createToken(stack2.callee);
  node.arguments = stack2.arguments.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/ObjectExpression.js
function ObjectExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.properties = stack2.properties.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/ObjectPattern.js
function ObjectPattern_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.properties = stack2.properties.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/PackageDeclaration.js
function PackageDeclaration_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.body = [];
  ctx2.setNode(stack2, node);
  stack2.body.forEach((item) => {
    if (item.isClassDeclaration || item.isDeclaratorDeclaration || item.isEnumDeclaration || item.isInterfaceDeclaration || item.isStructTableDeclaration) {
      let child = ctx2.createToken(item);
      if (child) {
        node.body.push(child);
      }
    }
  });
  ctx2.removeNode(stack2);
  return node;
}

// lib/tokens/ParenthesizedExpression.js
function ParenthesizedExpression_default(ctx2, stack2) {
  if (stack2.parentStack.isExpressionStatement) {
    return ctx2.createToken(stack2.expression);
  }
  const node = ctx2.createNode(stack2);
  node.expression = ctx2.createToken(stack2.expression);
  return node;
}

// lib/tokens/Property.js
function Property_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.computed = !!stack2.computed;
  node.key = ctx2.createToken(stack2.key);
  node.init = ctx2.createToken(stack2.init);
  return node;
}

// lib/tokens/PropertyDefinition.js
var import_Utils11 = __toESM(require("easescript/lib/core/Utils"));
function PropertyDefinition_default(ctx2, stack2) {
  let init = null;
  if (stack2.annotations && stack2.annotations.length > 0) {
    let items = [];
    stack2.annotations.forEach((annot) => {
      const name = annot.getLowerCaseName();
      if (name === "readfile") {
        items.push(
          createReadfileAnnotationNode(ctx2, annot) || ctx2.createLiteral(null)
        );
      } else if (name === "embed") {
        items.push(
          createEmbedAnnotationNode(ctx2, annot)
        );
      } else if (name === "env") {
        items.push(
          createEnvAnnotationNode(ctx2, annot)
        );
      } else if (name === "url") {
        items.push(
          createUrlAnnotationNode(ctx2, annot)
        );
      }
    });
    if (items.length > 0) {
      init = items.length > 1 ? ctx2.createArrayExpression(items) : items[0];
    }
  }
  const node = ctx2.createNode(stack2);
  const decl = ctx2.createToken(stack2.declarations[0]);
  node.modifier = import_Utils11.default.getModifierValue(stack2);
  node.static = !!stack2.static;
  node.kind = stack2.kind;
  node.key = decl.id;
  node.init = init || decl.init;
  node.dynamic = stack2.dynamic;
  node.isAbstract = !!stack2.isAbstract;
  node.isFinal = !!stack2.isFinal;
  return node;
}

// lib/tokens/RestElement.js
function RestElement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.value = stack2.value();
  node.raw = node.value;
  return node;
}

// lib/tokens/ReturnStatement.js
function ReturnStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.argument = ctx2.createToken(stack2.argument);
  return node;
}

// lib/tokens/SequenceExpression.js
function SequenceExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.expressions = stack2.expressions.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/SpreadElement.js
function SpreadElement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.argument = ctx2.createToken(stack2.argument);
  return node;
}

// lib/tokens/StructTableColumnDefinition.js
function StructTableColumnDefinition_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.key = ctx2.createIdentifier("`" + stack2.key.value() + "`", stack2.key);
  node.properties = [];
  const type = stack2.typename ? ctx2.createToken(stack2.typename) : ctx2.createIdentifier("varchar(255)");
  const unsigned = stack2.unsigned ? ctx2.createIdentifier("unsigned") : null;
  const notnull = !stack2.question ? ctx2.createIdentifier("not null") : null;
  node.properties.push(type);
  if (unsigned) {
    node.properties.push(unsigned);
  }
  if (notnull) {
    node.properties.push(notnull);
  }
  {
    (stack2.properties || []).forEach((item) => {
      node.properties.push(createIdentNode(ctx2, item));
    });
  }
  return node;
}

// lib/core/TableBuilder.js
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));

// lib/core/Generator.js
var import_source_map = __toESM(require("source-map"));
var disabledNewLine = false;
var Generator2 = class {
  #file = null;
  #context = null;
  #sourceMap = null;
  #code = "";
  #line = 1;
  #column = 0;
  #indent = 0;
  constructor(context = null, disableSourceMaps = false) {
    if (context) {
      this.#context = context;
      if (disableSourceMaps !== true) {
        this.#file = context.target.file;
        this.#sourceMap = context.options.sourceMaps ? this.createSourceMapGenerator() : null;
      }
    }
  }
  get file() {
    return this.#file;
  }
  get context() {
    return this.#context;
  }
  get sourceMap() {
    return this.#sourceMap;
  }
  get code() {
    return this.#code;
  }
  get line() {
    return this.#line;
  }
  createSourceMapGenerator() {
    let compilation = this.context.compilation;
    let generator = new import_source_map.default.SourceMapGenerator();
    if (compilation.source) {
      generator.setSourceContent(compilation.file, compilation.source);
    }
    return generator;
  }
  addMapping(node) {
    if (this.sourceMap) {
      const loc = node.loc;
      if (loc) {
        this.sourceMap.addMapping({
          generated: {
            line: this.#line,
            column: this.getStartColumn()
          },
          source: this.#file,
          original: {
            line: loc.start.line,
            column: loc.start.column
          },
          name: node.type === "Identifier" ? node.value : null
        });
      }
    }
  }
  newBlock() {
    this.#indent++;
    return this;
  }
  endBlock() {
    this.#indent--;
    return this;
  }
  newLine() {
    const len = this.#code.length;
    if (!len) return;
    const char = this.#code.charCodeAt(len - 1);
    if (char === 10 || char === 13) {
      return this;
    }
    this.#line++;
    this.#code += "\r\n";
    this.#column = 0;
    return this;
  }
  getStartColumn() {
    if (this.#column === 0) {
      return this.#indent * 4 + 1;
    }
    return this.#column;
  }
  withString(value) {
    if (!value) return;
    if (this.#column === 0) {
      this.#column = this.getStartColumn();
      this.#code += "    ".repeat(this.#indent);
    }
    this.#code += value;
    this.#column += value.length || 0;
  }
  withEnd(expr) {
    if (expr) {
      this.withString(expr);
      this.withSemicolon();
    }
    this.newLine();
  }
  withParenthesL() {
    this.withString("(");
  }
  withParenthesR() {
    this.withString(")");
  }
  withBracketL() {
    this.withString("[");
  }
  withBracketR() {
    this.withString("]");
  }
  withBraceL() {
    this.withString("{");
  }
  withBraceR() {
    this.withString("}");
  }
  withSpace() {
    this.withString(" ");
  }
  withDot() {
    this.withString(".");
  }
  withColon() {
    this.withString(":");
  }
  withOperator(value) {
    this.withString(` ${value} `);
  }
  withComma() {
    this.withString(",");
  }
  withSemicolon() {
    const code = this.#code;
    const char = code.charCodeAt(code.length - 1);
    if (char === 59 || char === 10 || char === 13 || char === 32 || char === 125) {
      return this;
    }
    this.withString(";");
    return this;
  }
  withSequence(items, newLine) {
    if (!items) return this;
    const len = items.length - 1;
    items.forEach((item, index) => {
      this.make(item);
      if (index < len) {
        this.withString(",");
        if (newLine || item.newLine) this.newLine();
      }
    });
    return this;
  }
  make(token) {
    if (!token) return;
    switch (token.type) {
      case "ArrayExpression":
      case "ArrayPattern":
        this.withBracketL();
        this.addMapping(token);
        if (token.elements.length > 0) {
          if (token.newLine === true) {
            this.newLine();
            this.newBlock();
          }
          this.withSequence(token.elements, !!token.newLine);
          if (token.newLine === true) {
            this.newLine();
            this.endBlock();
          }
        }
        this.withBracketR();
        break;
      case "ArrowFunctionExpression":
        if (token.async) {
          this.withString("async");
          this.withSpace();
        }
        this.withParenthesL();
        this.withSequence(token.params);
        this.withParenthesR();
        this.withString("=>");
        this.make(token.body);
        break;
      case "AssignmentExpression":
      case "AssignmentPattern":
        this.make(token.left);
        this.addMapping(token);
        if (token.operator) {
          this.withString(token.operator);
        } else {
          this.withString("=");
        }
        this.make(token.right);
        break;
      case "AwaitExpression":
        this.withString("await ");
        this.make(token.argument);
        break;
      case "BinaryExpression":
        this.addMapping(token);
        this.make(token.left);
        this.withOperator(token.operator);
        this.make(token.right);
        break;
      case "BreakStatement":
        this.newLine();
        this.addMapping(token);
        this.withString("break");
        if (token.label) {
          this.withSpace();
          this.make(token.label);
        }
        this.withSemicolon();
        break;
      case "BlockStatement":
        if (token.isWhenStatement) {
          token.body.forEach((item) => this.make(item));
        } else {
          this.withBraceL();
          this.newBlock();
          token.body.length > 0 && this.newLine();
          token.body.forEach((item) => this.make(item));
          this.endBlock();
          token.body.length > 0 && this.newLine();
          this.withBraceR();
        }
        break;
      case "ChunkExpression":
        if (token.value) {
          if (token.newLine !== false) {
            this.newLine();
          }
          this.withString(token.value);
          const result = token.value.match(/[\r\n]+/g);
          if (result) {
            this.#line += result.length;
          }
          if (token.newLine !== false) {
            this.newLine();
          }
        }
        break;
      case "CallExpression":
        this.addMapping(token);
        this.make(token.callee);
        if (token.isChainExpression) {
          this.withString("?.");
        }
        this.withParenthesL();
        if (token.newLine) this.newLine();
        if (token.indentation) this.newBlock();
        this.withSequence(token.arguments, token.newLine);
        if (token.indentation) this.endBlock();
        if (token.newLine) this.newLine();
        this.withParenthesR();
        break;
      case "ClassStatement":
        this.withString("class");
        this.withSpace();
        this.make(token.key);
        if (token.extends) {
          this.withSpace();
          this.withString("extends");
          this.withSpace();
          this.make(token.extends);
        }
        this.make(token.body);
        this.newLine();
        break;
      case "ConditionalExpression":
        this.addMapping(token);
        if (token.newLine) this.newLine();
        this.make(token.test);
        this.withOperator("?");
        this.make(token.consequent);
        this.withOperator(":");
        this.make(token.alternate);
        if (token.newLine) this.newLine();
        break;
      case "ContinueStatement":
        this.newLine();
        this.addMapping(token);
        this.withString("continue");
        if (token.label) {
          this.withSpace();
          this.make(token.label);
        }
        this.withSemicolon();
        break;
      case "ChainExpression":
        this.make(token.expression);
        break;
      case "DoWhileStatement":
        this.newLine();
        this.withString("do");
        this.make(token.body);
        this.withString("while");
        this.withParenthesL();
        this.make(token.condition);
        this.withParenthesR();
        this.withSemicolon();
        break;
      case "ExpressionStatement":
        this.newLine();
        this.make(token.expression);
        this.withSemicolon();
        break;
      case "MultipleStatement":
        token.expressions.forEach((exp) => this.make(exp));
        this.newLine();
        break;
      case "ExportDefaultDeclaration":
        this.newLine();
        this.addMapping(token);
        this.withString("export default ");
        if (token.declaration.type === "ExpressionStatement") {
          this.make(token.declaration.expression);
        } else {
          this.make(token.declaration);
        }
        this.withSemicolon();
        break;
      case "ExportAllDeclaration":
        this.addMapping(token);
        this.newLine();
        this.withString("export");
        this.withSpace();
        this.withString("*");
        this.withSpace();
        if (token.exported) {
          this.withString("as");
          this.withSpace();
          this.make(token.exported);
          this.withSpace();
        }
        this.withString("from");
        this.withSpace();
        this.make(token.source);
        this.withSemicolon();
        break;
      case "ExportNamedDeclaration":
        this.newLine();
        this.addMapping(token);
        this.withString("export");
        this.withSpace();
        if (token.specifiers && token.specifiers.length > 0) {
          this.withBraceL();
          this.newLine();
          this.newBlock();
          this.withSequence(token.specifiers, true);
          this.endBlock();
          this.newLine();
          this.withBraceR();
        } else if (token.declaration) {
          disabledNewLine = true;
          this.make(token.declaration);
          disabledNewLine = false;
        }
        if (token.source) {
          this.withSpace();
          this.withString("from");
          this.withSpace();
          this.make(token.source);
        }
        this.withSemicolon();
        break;
      case "ExportSpecifier":
        this.addMapping(token);
        this.make(token.local);
        if (token.exported.value !== token.local.value) {
          this.withString(" as ");
          this.make(token.exported);
        }
        break;
      case "ForInStatement":
        this.newLine();
        this.withString("for");
        this.withParenthesL();
        this.make(token.left);
        this.withOperator("in");
        this.make(token.right);
        this.withParenthesR();
        this.make(token.body);
        if (token.body.type !== "BlockStatement") {
          this.withSemicolon();
        }
        break;
      case "ForOfStatement":
        this.newLine();
        this.withString("for");
        this.withParenthesL();
        this.make(token.left);
        this.withOperator("of");
        this.make(token.right);
        this.withParenthesR();
        this.make(token.body);
        if (token.body.type !== "BlockStatement") {
          this.withSemicolon();
        }
        break;
      case "ForStatement":
        this.newLine();
        this.withString("for");
        this.withParenthesL();
        this.make(token.init);
        this.withSemicolon();
        this.make(token.condition);
        this.withSemicolon();
        this.make(token.update);
        this.withParenthesR();
        this.make(token.body);
        if (token.body.type !== "BlockStatement") {
          this.withSemicolon();
        }
        break;
      case "FunctionDeclaration":
      case "MethodDefinition":
      case "MethodGetterDefinition":
      case "MethodSetterDefinition":
        {
          let isNewLine = token.type === "FunctionDeclaration" || token.kind === "method" || token.kind === "get" || token.kind === "set";
          if (isNewLine && !disabledNewLine && !token.disabledNewLine) this.newLine();
          if (token.async) {
            this.withString("async");
            this.withSpace();
          }
          if (token.static && token.kind === "method") {
            this.withString("static");
            this.withSpace();
          }
          if (token.kind === "method") {
            this.make(token.key);
          } else {
            this.withString("function");
            if (token.key && !token.key.computed) {
              this.withSpace();
              this.make(token.key);
            }
          }
          this.withParenthesL();
          this.withSequence(token.params);
          this.withParenthesR();
          this.make(token.body);
          if (isNewLine && !disabledNewLine && !token.disabledNewLine) this.newLine();
        }
        break;
      case "FunctionExpression":
        this.addMapping(token);
        if (token.async) {
          this.withString("async");
          this.withSpace();
        }
        this.withString("function");
        this.withParenthesL();
        this.withSequence(token.params);
        this.withParenthesR();
        this.make(token.body);
        break;
      case "Identifier":
        this.addMapping(token);
        this.withString(token.value);
        break;
      case "IfStatement":
        this.newLine();
        this.withString("if");
        this.withParenthesL();
        this.make(token.condition);
        this.withParenthesR();
        this.make(token.consequent);
        if (token.condition.type !== "BlockStatement") {
          this.withSemicolon();
        }
        if (token.alternate) {
          this.withString("else");
          if (token.alternate.type === "IfStatement") {
            this.withSpace();
          }
          this.make(token.alternate);
          if (token.alternate.type !== "BlockStatement") {
            this.withSemicolon();
          }
        }
        break;
      case "ImportDeclaration":
        this.withString("import");
        this.withSpace();
        let lefts = [];
        let rights = [];
        token.specifiers.forEach((item) => {
          if (item.type === "ImportDefaultSpecifier" || item.type === "ImportNamespaceSpecifier") {
            lefts.push(item);
          } else {
            rights.push(item);
          }
        });
        if (rights.length > 0) {
          if (lefts.length > 0) {
            this.make(lefts[0]);
            this.withComma();
          }
          this.withBraceL();
          this.withSequence(rights);
          this.withBraceR();
          this.withSpace();
          this.withString("from");
          this.withSpace();
        } else if (lefts.length > 0) {
          this.make(lefts[0]);
          this.withSpace();
          this.withString("from");
          this.withSpace();
        }
        this.make(token.source);
        this.withSemicolon();
        this.newLine();
        break;
      case "ImportSpecifier":
        if (token.imported && token.local.value !== token.imported.value) {
          this.make(token.imported);
          this.withOperator("as");
        }
        this.make(token.local);
        break;
      case "ImportNamespaceSpecifier":
        this.withString(" * ");
        this.withOperator("as");
        this.make(token.local);
        break;
      case "ImportDefaultSpecifier":
        this.make(token.local);
        break;
      case "ImportExpression":
        this.withString("import");
        this.withParenthesL();
        this.make(token.source);
        this.withParenthesR();
        break;
      case "LabeledStatement":
        this.newLine();
        this.addMapping(token);
        this.make(token.label);
        this.withString(":");
        this.make(token.body);
        break;
      case "Literal":
        this.addMapping(token);
        if (this.foreSingleQuotationMarks) {
          this.withString(token.raw.replace(/\u0022/g, "'"));
        } else {
          this.withString(token.raw);
        }
        break;
      case "LogicalExpression":
        this.make(token.left);
        this.withOperator(token.operator);
        this.make(token.right);
        break;
      case "MemberExpression":
        this.addMapping(token);
        this.make(token.object);
        if (token.computed) {
          if (token.optional) {
            this.withString("?.");
          }
          this.withBracketL();
          this.make(token.property);
          this.withBracketR();
        } else {
          if (token.optional) {
            this.withString("?.");
          } else {
            this.withString(".");
          }
          this.make(token.property);
        }
        break;
      case "NewExpression":
        this.addMapping(token);
        this.withString("new");
        this.withSpace();
        this.make(token.callee);
        this.withParenthesL();
        this.withSequence(token.arguments);
        this.withParenthesR();
        break;
      case "ObjectExpression":
        this.addMapping(token);
        this.withBraceL();
        if (token.properties.length > 0) {
          this.newBlock();
          this.newLine();
          this.withSequence(token.properties, true);
          this.newLine();
          this.endBlock();
        }
        this.withBraceR();
        break;
      case "ObjectPattern":
        this.withBraceL();
        this.addMapping(token);
        token.properties.forEach((property, index) => {
          if (property) {
            if (property.type === "RestElement") {
              this.make(property);
            } else {
              this.make(property.key);
              if (property.init && (property.init.type === "AssignmentPattern" || property.key.value !== property.init.value)) {
                this.withColon();
                this.make(property.init);
              }
            }
            if (index < token.properties.length - 1) {
              this.withComma();
            }
          }
        });
        this.withBraceR();
        break;
      case "ParenthesizedExpression":
        if (token.newLine) this.newLine();
        this.withParenthesL();
        this.make(token.expression);
        this.withParenthesR();
        if (token.newLine) this.newLine();
        break;
      case "Property":
        this.addMapping(token);
        if (token.computed) {
          this.withBracketL();
          this.make(token.key);
          this.withBracketR();
        } else {
          this.make(token.key);
        }
        if (token.init) {
          this.withColon();
          this.make(token.init);
        }
        break;
      case "PropertyDefinition":
        this.addMapping(token);
        this.newLine();
        if (token.static) {
          this.withString("static");
          this.withSpace();
        }
        this.make(token.key);
        if (token.init) {
          this.withOperator("=");
          this.make(token.init);
        }
        this.newLine();
        break;
      case "RestElement":
        this.addMapping(token);
        this.withString("...");
        this.withString(token.value);
        break;
      case "ReturnStatement":
        this.addMapping(token);
        this.newLine();
        this.withString("return");
        this.withSpace();
        this.make(token.argument);
        this.withSemicolon();
        break;
      case "SequenceExpression":
        this.withSequence(token.expressions);
        break;
      case "SpreadElement":
        this.withString("...");
        this.addMapping(token);
        this.make(token.argument);
        break;
      case "SuperExpression":
        this.addMapping(token);
        if (token.value) {
          this.withString(token.value);
        } else {
          this.withString("super");
        }
        break;
      case "SwitchCase":
        this.newLine();
        if (token.condition) {
          this.withString("case");
          this.withSpace();
          this.make(token.condition);
        } else {
          this.withString("default");
        }
        this.withSpace();
        this.withColon();
        this.newBlock();
        token.consequent.forEach((item) => this.make(item));
        this.endBlock();
        break;
      case "SwitchStatement":
        this.newLine();
        this.withString("switch");
        this.withParenthesL();
        this.make(token.condition);
        this.withParenthesR();
        this.withBraceL();
        this.newBlock();
        token.cases.forEach((item) => this.make(item));
        this.newLine();
        this.endBlock();
        this.withBraceR();
        break;
      case "TemplateElement":
        this.withString(token.value);
        break;
      case "TemplateLiteral":
        const expressions = token.expressions;
        this.withString("`");
        token.quasis.map((item, index) => {
          const has3 = item.value;
          if (has3) {
            this.make(item);
          }
          if (index < expressions.length) {
            this.withString("$");
            this.withBraceL();
            this.make(expressions[index]);
            this.withBraceR();
          }
        });
        this.withString("`");
        break;
      case "ThisExpression":
        this.addMapping(token);
        this.withString(token.value || "this");
        break;
      case "ThrowStatement":
        this.newLine();
        this.withString("throw");
        this.withSpace();
        this.make(token.argument);
        this.withSemicolon();
        break;
      case "TryStatement":
        this.newLine();
        this.withString("try");
        this.make(token.block);
        this.withString("catch");
        this.withParenthesL();
        this.make(token.param);
        this.withParenthesR();
        this.make(token.handler);
        if (token.finalizer) {
          this.withString("finally");
          this.make(token.finalizer);
        }
        break;
      case "UnaryExpression":
        this.addMapping(token);
        if (token.prefix) {
          this.withString(token.operator);
          if (![33, 43, 45, 126].includes(token.operator.charCodeAt(0))) {
            this.withSpace();
          }
          this.make(token.argument);
        } else {
          this.make(token.argument);
          this.withSpace();
          this.withString(token.operator);
        }
        break;
      case "UpdateExpression":
        this.addMapping(token);
        if (token.prefix) {
          this.withString(token.operator);
          this.make(token.argument);
        } else {
          this.make(token.argument);
          this.withString(token.operator);
        }
        break;
      case "VariableDeclaration":
        this.addMapping(token);
        if (!token.inFor && !disabledNewLine) this.newLine();
        this.withString(token.kind);
        this.withSpace();
        this.withSequence(token.declarations);
        if (!token.inFor) {
          this.withSemicolon();
          this.newLine();
        }
        break;
      case "VariableDeclarator":
        this.addMapping(token);
        this.make(token.id);
        if (token.init) {
          this.withOperator("=");
          this.make(token.init);
        }
        break;
      case "WhileStatement":
        this.withString("while");
        this.withParenthesL();
        this.make(token.condition);
        this.withParenthesR();
        this.make(token.body);
        if (token.body.type !== "BlockStatement") {
          this.withSemicolon();
        }
        break;
      case "ClassDeclaration": {
        this.newLine();
        this.addMapping(token);
        this.withString("class");
        this.withSpace();
        this.make(token.id);
        if (token.extends) {
          this.withSpace();
          this.withString("extends");
          this.make(token.extends);
        }
        this.make(token.body);
        break;
      }
      case "InterfaceDeclaration":
      case "EnumDeclaration":
      case "DeclaratorDeclaration":
      case "PackageDeclaration":
      case "Program":
        token.body.forEach((item) => this.make(item));
        break;
      /**
       * table
       */
      case "StructTableDeclaration":
        this.genSql(token);
        break;
      case "StructTableMethodDefinition":
        this.make(token.key);
        this.withParenthesL();
        this.withSequence(token.params);
        this.withParenthesR();
        break;
      case "StructTablePropertyDefinition":
        this.withString(" ");
        this.make(token.key);
        if (token.init) {
          if (token.assignment) {
            this.withOperator("=");
            this.make(token.init);
          } else {
            this.withString(" ");
            this.make(token.init);
          }
        }
        break;
      case "StructTableKeyDefinition":
        this.make(token.key);
        this.withString(" ");
        if (token.prefix) {
          this.make(token.prefix);
          this.withString(" ");
        }
        this.make(token.local);
        token.properties.forEach((item) => {
          this.withString(" ");
          this.make(item);
        });
        break;
      case "StructTableColumnDefinition":
        this.make(token.key);
        this.withString(" ");
        token.properties.forEach((item, index) => {
          if (index > 0) this.withString(" ");
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
          if (esx.raw) {
            this.addMapping(token);
            this.withSpace();
            this.make(token.name);
            if (token.value) {
              this.withString("=");
              this.withString(esx.delimit.attrs.left);
              if (token.value) {
                this.foreSingleQuotationMarks = ops.delimit.attrs.left === '"';
                this.make(token.value);
                this.foreSingleQuotationMarks = false;
              }
              this.withString(ops.delimit.attrs.right);
            }
          } else {
            if (token.parent && token.parent.type === "ObjectExpression") {
              this.make(token.name);
              this.withColon();
              this.make(token.value);
            }
          }
        }
        break;
      case "JSXSpreadAttribute":
        this.addMapping(token);
        this.withString("{...");
        this.make(token.argument);
        this.withString("}");
        break;
      case "JSXNamespacedName":
        this.addMapping(token);
        this.make(token.name);
        break;
      case "JSXExpressionContainer":
        this.addMapping(token);
        if (token.expression) {
          this.withString(token.left || "{");
          this.make(token.expression);
          this.withString(token.right || "}");
        }
        break;
      case "JSXOpeningFragment":
      case "JSXOpeningElement":
        this.addMapping(token);
        this.withString("<");
        this.make(token.name);
        token.attributes.forEach((attribute) => {
          this.make(attribute);
        });
        if (token.selfClosing) {
          this.withString(" />");
        } else {
          this.withString(">");
        }
        break;
      case "JSXClosingFragment":
      case "JSXClosingElement":
        this.addMapping(token);
        this.withString("</");
        this.make(token.name);
        this.withString(">");
        break;
      case "JSXElement":
        this.addMapping(token);
        let has2 = token.children.length > 0;
        this.make(token.openingElement);
        if (has2) this.newLine();
        this.newBlock();
        token.children.forEach((child, index) => {
          if (index > 0) this.newLine();
          this.make(child);
        });
        this.endBlock();
        if (has2) this.newLine();
        this.make(token.closingElement);
        this.newLine();
        break;
      case "JSXFragment":
        this.withString("<>");
        this.newLine();
        token.children.forEach((child) => {
          this.make(child);
        });
        this.newLine();
        this.withString("</>");
        this.newLine();
        break;
      case "JSXText":
        this.withString(token.value);
        break;
    }
  }
  genSql(token) {
    this.newLine();
    if (token.comments) {
      this.make(token.comments);
      this.newLine();
    }
    this.withString("create table");
    this.withString(" ");
    this.make(token.id);
    this.withParenthesL();
    this.newLine();
    this.newBlock();
    token.body.forEach((item, index) => {
      if (item.type === "StructTableKeyDefinition" || item.type === "StructTableColumnDefinition") {
        if (index > 0) {
          this.withComma(",");
          this.newLine();
        }
      }
      this.make(item);
    });
    this.endBlock();
    this.newLine();
    this.withParenthesR();
    token.properties.forEach((item) => this.make(item));
    this.withSemicolon();
    this.newLine();
  }
  toString() {
    return this.#code;
  }
};
var Generator_default = Generator2;

// lib/core/TableBuilder.js
function normalName(name) {
  return name.replace(/([A-Z])/g, (a, b, i) => {
    return i > 0 ? "_" + b.toLowerCase() : b.toLowerCase();
  });
}
var TableBuilder = class {
  #type = "";
  #changed = true;
  #outfile = "";
  #records = /* @__PURE__ */ new Map();
  constructor(type) {
    this.#type = type;
  }
  createTable(ctx2, stack2) {
    if (!stack2.body.length) return false;
    const module2 = stack2.module;
    if (this.hasTable(module2.id)) return false;
    const node = ctx2.createNode(stack2);
    node.id = ctx2.createIdentifier("`" + normalName(stack2.id.value()) + "`", stack2.id);
    node.properties = [];
    node.body = [];
    stack2.body.forEach((item) => {
      const token = createIdentNode(ctx2, item);
      if (token) {
        if (item.isStructTablePropertyDefinition) {
          node.properties.push(token);
        } else {
          node.body.push(token);
        }
      }
    });
    let gen = new Generator_default();
    gen.make(node);
    this.#records.set(module2.id, gen.toString());
    this.#changed = true;
    this.build(ctx2);
    return true;
  }
  get type() {
    return this.#type;
  }
  get outfile() {
    return this.#outfile;
  }
  set outfile(value) {
    this.#outfile = value;
  }
  getTable(name) {
    return this.#records.get(name);
  }
  hasTable(name) {
    return this.#records.has(name);
  }
  removeTable(name) {
    this.#records.delete(name);
  }
  getTables() {
    return Array.from(this.#records.values());
  }
  async build(ctx2) {
    if (!this.#changed) return;
    this.#changed = false;
    let file = this.type + ".sql";
    let code = this.getTables().join("\n");
    file = this.outfile || (this.outfile = ctx2.getOutputAbsolutePath(file));
    import_fs.default.mkdirSync(import_path.default.dirname(file), { recursive: true });
    import_fs.default.writeFileSync(file, code);
  }
};
var records2 = /* @__PURE__ */ new Map();
function getBuilder(type) {
  if (!records2.has(type)) {
    throw new Error(`The '${type}' table builder is not exists.`);
  }
  return records2.get(type);
}
function addBuilder(type, builder) {
  if (builder instanceof TableBuilder) {
    records2.set(type, builder);
  } else {
    throw new Error("Table builder must is extends TableBuilder.");
  }
}
function getAllBuilder() {
  return Array.from(records2.values());
}
addBuilder("mysql", new TableBuilder("mysql"));

// lib/tokens/StructTableDeclaration.js
function StructTableDeclaration_default(ctx2, stack2) {
  getBuilder("mysql").createTable(ctx2, stack2);
}

// lib/tokens/StructTableKeyDefinition.js
function StructTableKeyDefinition_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.key = createIdentNode(ctx2, stack2.key);
  const key = stack2.key.value().toLowerCase();
  node.prefix = key === "primary" || key === "key" ? null : ctx2.createIdentifier("key");
  node.local = ctx2.createToken(stack2.local);
  node.properties = (stack2.properties || []).map((item) => createIdentNode(ctx2, item));
  return node;
}

// lib/tokens/StructTableMethodDefinition.js
var import_Namespace6 = __toESM(require("easescript/lib/core/Namespace"));
function createNode(ctx2, item, isKey = false, toLower = false, type = null) {
  if (!item) return null;
  if (type === "enum") {
    if (item.isIdentifier || item.isMemberExpression) {
      const type2 = import_Namespace6.default.globals.get(item.value());
      const list = [];
      if (type2 && type2.isModule && type2.isEnum) {
        Array.from(type2.descriptors.keys()).forEach((key) => {
          const items = type2.descriptors.get(key);
          const item2 = items.find((item3) => item3.isEnumProperty);
          if (item2) {
            list.push(ctx2.createLiteral(item2.init.value()));
          }
        });
      }
      return list;
    }
  }
  if (item.isIdentifier) {
    let value = item.value();
    if (toLower) value = value.toLowerCase();
    return ctx2.createIdentifier(isKey ? "`" + value + "`" : value, item);
  }
  return item.isLiteral ? ctx2.createLiteral(item.value()) : ctx2.createToken(item);
}
function StructTableMethodDefinition_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  const name = stack2.key.value().toLowerCase();
  if (name === "text" || name === "longtext" || name === "tinytext" || name === "mediumtext") {
    return ctx2.createIdentifier(stack2.key.value(), stack2.key);
  }
  const key = stack2.key.isMemberExpression ? stack2.key.property : stack2.key;
  node.key = createNode(ctx2, key, false);
  const isKey = stack2.parentStack.isStructTableKeyDefinition;
  node.params = (stack2.params || []).map((item) => createNode(ctx2, item, isKey, false, name)).flat().filter(Boolean);
  return node;
}

// lib/tokens/StructTablePropertyDefinition.js
function StructTablePropertyDefinition_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.assignment = !!stack2.assignment;
  node.key = createIdentNode(ctx2, stack2.key);
  node.init = createIdentNode(ctx2, stack2.init);
  return node;
}

// lib/tokens/SuperExpression.js
function SuperExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  const parent = stack2.module.inherit;
  node.value = ctx2.getModuleReferenceName(parent, stack2.module);
  node.raw = node.value;
  return node;
}

// lib/tokens/SwitchCase.js
function SwitchCase_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.condition = ctx2.createToken(stack2.condition);
  node.consequent = stack2.consequent.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/SwitchStatement.js
function SwitchStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.condition = ctx2.createToken(stack2.condition);
  node.cases = stack2.cases.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/TemplateElement.js
function TemplateElement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.raw = stack2.raw();
  node.value = node.raw;
  node.tail = stack2.tail;
  return node;
}

// lib/tokens/TemplateLiteral.js
function TemplateLiteral_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.quasis = stack2.quasis.map((item) => ctx2.createToken(item));
  node.expressions = stack2.expressions.map((item) => ctx2.createToken(item));
  return node;
}

// lib/tokens/ThisExpression.js
function ThisExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  return node;
}

// lib/tokens/ThrowStatement.js
function ThrowStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.argument = ctx2.createToken(stack2.argument);
  return node;
}

// lib/tokens/TryStatement.js
function TryStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.block = ctx2.createToken(stack2.block);
  node.param = ctx2.createToken(stack2.param);
  node.handler = ctx2.createToken(stack2.handler);
  node.finalizer = ctx2.createToken(stack2.finalizer);
  return node;
}

// lib/tokens/TypeAssertExpression.js
function TypeAssertExpression_default(ctx2, stack2) {
  return ctx2.createToken(stack2.left);
}

// lib/tokens/TypeTransformExpression.js
function TypeTransformExpression_default(ctx2, stack2) {
  return ctx2.createToken(stack2.expression);
}

// lib/tokens/UnaryExpression.js
var import_Utils12 = __toESM(require("easescript/lib/core/Utils"));
function UnaryExpression_default(ctx2, stack2) {
  const operator = stack2.operator;
  const prefix = stack2.prefix;
  if (operator === "delete" && stack2.argument.isMemberExpression) {
    const desc2 = stack2.argument.description();
    if (desc2 && desc2.isAnyType) {
      const hasDynamic = desc2 && desc2.isComputeType && desc2.isPropertyExists();
      if (!hasDynamic && !import_Utils12.default.isLiteralObjectType(stack2.argument.object.type())) {
        const property = stack2.argument.computed ? ctx2.createToken(stack2.argument.property) : ctx2.createLiteral(
          stack2.argument.property.value(),
          void 0,
          stack2.argument.property
        );
        return ctx2.createCallExpression(
          createStaticReferenceNode(ctx2, stack2, "Reflect", "deleteProperty"),
          [
            ctx2.createToken(stack2.argument.object),
            property
          ]
        );
      }
    }
  }
  const node = ctx2.createNode(stack2);
  node.argument = ctx2.createToken(stack2.argument);
  node.operator = operator;
  node.prefix = prefix;
  return node;
}

// lib/tokens/UpdateExpression.js
var import_Utils13 = __toESM(require("easescript/lib/core/Utils"));
function UpdateExpression_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  const operator = stack2.operator;
  const prefix = stack2.prefix;
  const isMember = stack2.argument.isMemberExpression;
  if (isMember) {
    const desc2 = stack2.argument.description();
    const module2 = stack2.module;
    const scopeId = module2 ? module2.id : null;
    let isReflect = false;
    if (stack2.argument.computed) {
      const hasDynamic = desc2 && desc2.isComputeType && desc2.isPropertyExists();
      if (!hasDynamic && !import_Utils13.default.isLiteralObjectType(stack2.argument.object.type())) {
        isReflect = true;
      }
    } else if (desc2 && desc2.isAnyType) {
      isReflect = !import_Utils13.default.isLiteralObjectType(stack2.argument.object.type());
    }
    if (isReflect) {
      const method = operator === "++" ? "incre" : "decre";
      const callee = createStaticReferenceNode(ctx2, stack2, "Reflect", method);
      return ctx2.createCallExpression(callee, [
        ctx2.createIdentifier(scopeId),
        ctx2.createToken(stack2.argument.object),
        ctx2.createLiteral(stack2.argument.property.value()),
        ctx2.createLiteral(!!prefix)
      ], stack2);
    }
  }
  node.argument = ctx2.createToken(stack2.argument);
  node.operator = operator;
  node.prefix = prefix;
  return node;
}

// lib/tokens/VariableDeclaration.js
function VariableDeclaration_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.inFor = stack2.flag;
  node.kind = stack2.kind;
  node.declarations = [];
  stack2.declarations.forEach((item) => {
    const variable = ctx2.createToken(item);
    if (variable) {
      node.declarations.push(variable);
    }
  });
  if (!node.declarations.length) {
    return null;
  }
  return node;
}

// lib/tokens/VariableDeclarator.js
function VariableDeclarator_default(ctx2, stack2) {
  if (!stack2.flag && !stack2.parentStack.isPropertyDefinition && !(stack2.id.isArrayPattern || stack2.id.isObjectPattern)) {
    const pp = stack2.parentStack.parentStack;
    if (pp && !(pp.isExportNamedDeclaration || pp.isExportDefaultDeclaration || pp.isExportSpecifier || pp.isForInStatement || pp.isForStatement || pp.isForOfStatement) && !stack2.useRefItems.size) {
      if (!stack2.init) return null;
    }
  }
  const node = ctx2.createNode(stack2);
  node.inFor = stack2.flag;
  if (stack2.id.isIdentifier) {
    let name = stack2.id.value();
    if (stack2.parentStack && stack2.parentStack.isPropertyDefinition) {
      name = getMethodOrPropertyAlias(ctx2, stack2.parentStack) || name;
    }
    node.id = ctx2.createIdentifier(name, stack2.id);
  } else {
    node.id = ctx2.createToken(stack2.id);
  }
  node.init = ctx2.createToken(stack2.init);
  return node;
}

// lib/tokens/WhenStatement.js
function WhenStatement_default(ctx2, stack2) {
  const check = (stack3) => {
    if (stack3.isLogicalExpression) {
      if (stack3.isAndOperator) {
        return check(stack3.left) && check(stack3.right);
      } else {
        return check(stack3.left) || check(stack3.right);
      }
    } else if (!stack3.isCallExpression) {
      throw new Error(`Macro condition must is an call expression`);
    }
    const name = stack3.value();
    const lower = name.toLowerCase();
    const argument = parseMacroMethodArguments(stack3.arguments, lower);
    if (!argument) {
      ctx2.error(`The '${name}' macro is not supported`, stack3);
      return;
    }
    switch (lower) {
      case "runtime":
        return isRuntime(argument.value, ctx2.options.metadata) === argument.expect;
      case "syntax":
        return isSyntax(ctx2.plugin.name, argument.value) === argument.expect;
      case "env":
        {
          if (argument.name && argument.value) {
            return isEnv(argument.name, argument.value, ctx2.options) === argument.expect;
          } else {
            ctx2.error(`Missing name or value arguments. the '${name}' annotations.`, stack3);
          }
        }
        break;
      case "version":
        {
          if (argument.name && argument.version) {
            let versions = ctx2.options.metadata.versions || {};
            let left = argument.name === ctx2.plugin.name ? ctx2.plugin.version : versions[argument.name];
            let right = argument.version;
            return compareVersion(left, right, argument.operator) === argument.expect;
          } else {
            ctx2.error(`Missing name or value arguments. the '${name}' annotations.`, stack3);
          }
        }
        break;
      default:
    }
  };
  const node = ctx2.createToken(check(stack2.condition) ? stack2.consequent : stack2.alternate);
  node && (node.isWhenStatement = true);
  return node;
}

// lib/tokens/WhileStatement.js
function WhileStatement_default(ctx2, stack2) {
  const node = ctx2.createNode(stack2);
  node.condition = ctx2.createToken(stack2.condition);
  node.body = ctx2.createToken(stack2.body);
  return node;
}

// lib/core/ImportSource.js
var import_Utils14 = __toESM(require("easescript/lib/core/Utils"));
var ImportManage = class {
  #records = /* @__PURE__ */ new Map();
  #locals = /* @__PURE__ */ new Map();
  createImportSource(sourceId, local = null, imported = null, stack2 = null) {
    let key = sourceId;
    if (imported === "*") {
      key += ":*";
    }
    let importSource = this.#records.get(key);
    if (!importSource) {
      this.#records.set(key, importSource = new ImportSource(sourceId));
    }
    if (local) {
      const source = this.#locals.get(local);
      if (source) {
        if (source !== importSource) {
          throw new Error(`declare '${local}' is not redefined`);
        }
      } else {
        this.#locals.set(local, importSource);
      }
      importSource.addSpecifier(local, imported, stack2);
    }
    return importSource;
  }
  hasImportSource(sourceId, local = null, isNamespace = false) {
    let key = sourceId;
    if (isNamespace) {
      key += ":*";
    }
    let importSource = this.#records.get(key);
    if (!importSource) return false;
    if (local) {
      const source = this.#locals.get(local);
      return importSource === source;
    }
    return true;
  }
  getImportSource(sourceId, isNamespace = false) {
    let key = sourceId;
    if (isNamespace) {
      key += ":*";
    }
    return this.#records.get(key);
  }
  getAllImportSource() {
    return Array.from(this.#records.values()).sort((a, b) => {
      let m1 = a.getSourceTarget();
      let m2 = b.getSourceTarget();
      let a1 = import_Utils14.default.isModule(m1) && m1.getName() === "Class" ? 0 : 1;
      let b1 = import_Utils14.default.isModule(m2) && m2.getName() === "Class" ? 0 : 1;
      return a1 - b1;
    });
  }
};
var ImportSource = class {
  #sourceId = null;
  #specifiers = [];
  #fields = null;
  #stack = null;
  #isExportSource = false;
  #sourceTarget = null;
  #sourceContext = null;
  constructor(sourceId) {
    this.#sourceId = sourceId;
    this.#fields = /* @__PURE__ */ Object.create(null);
  }
  get sourceId() {
    return this.#sourceId;
  }
  get specifiers() {
    return this.#specifiers;
  }
  get stack() {
    return this.#stack;
  }
  set stack(value) {
    this.#stack = value;
  }
  get isExportSource() {
    return this.#isExportSource;
  }
  setSourceTarget(value) {
    if (value) {
      this.#sourceTarget = value;
    }
  }
  getSourceTarget() {
    return this.#sourceTarget;
  }
  setSourceContext(value) {
    if (value) {
      this.#sourceContext = value;
    }
  }
  getSourceContext() {
    return this.#sourceContext;
  }
  setExportSource() {
    this.#isExportSource = true;
  }
  getSpecifier(imported) {
    return this.#fields[imported];
  }
  addSpecifier(local, imported = null, stack2 = null) {
    if (local) {
      let type = imported ? "specifier" : "default";
      if (imported === "*") {
        type = "namespace";
      }
      let key = local;
      let old = this.#fields[key];
      if (old) {
        if (old.type !== type) {
          console.error("import specifier has inconsistent definitions");
        }
        old.type = type;
        return true;
      }
      let spec = {
        type,
        local,
        imported,
        stack: stack2
      };
      this.#fields[key] = spec;
      this.#specifiers.push(spec);
      return true;
    }
  }
};

// lib/core/ExportSource.js
init_Node();
function getExportType(exported, local) {
  let type = local && typeof local === "string" ? "specifier" : "named";
  if (exported === "default") type = "default";
  if (local === "*" || !exported) {
    type = "namespace";
  }
  return type;
}
var ExportManage = class {
  #records = /* @__PURE__ */ new Map();
  #exporteds = /* @__PURE__ */ new Map();
  createExportSource(exported, local = null, importSource = null, stack2 = null) {
    let key = exported;
    if (!key) {
      key = importSource;
    }
    let old = this.#exporteds.get(key);
    if (old) {
      let oLocal = old.getSpecifier(exported).local;
      let left = Node_default.is(oLocal) && oLocal.type === "Identifier" ? oLocal.value : oLocal;
      let right = Node_default.is(local) && local.type === "Identifier" ? local.value : local;
      if (left !== right || importSource != old.importSource) {
        throw new Error(`Multiple exports with the same name "${exported}"`);
      }
    }
    let exportSource = null;
    if (importSource) {
      exportSource = this.#records.get(importSource);
      if (!exportSource) {
        this.#records.set(importSource, exportSource = new ExportSource(importSource, this));
      }
      this.#exporteds.set(key, exportSource);
    } else {
      exportSource = this.#exporteds.get(key);
      if (!exportSource) {
        this.#exporteds.set(key, exportSource = new ExportSource(null, this));
      }
    }
    exportSource.addSpecifier(exported, local, stack2);
    return exportSource;
  }
  bindSource(exported, exportSource) {
    this.#exporteds.set(exported, exportSource);
  }
  hasExportSource(exported) {
    return this.#exporteds.has(exported);
  }
  getExportSource(exported) {
    return this.#exporteds.get(exported);
  }
  getAllExportSource() {
    return Array.from(this.#exporteds.values());
  }
};
var ExportSource = class {
  #importSource = null;
  #specifiers = [];
  #fields = null;
  #stack = null;
  #exportManage = null;
  constructor(importSource, exportManage) {
    this.#importSource = importSource;
    this.#fields = /* @__PURE__ */ Object.create(null);
    this.#exportManage = exportManage;
  }
  get importSource() {
    return this.#importSource;
  }
  get specifiers() {
    return this.#specifiers;
  }
  get stack() {
    return this.#stack;
  }
  set stack(value) {
    this.#stack = value;
  }
  bindExport(exporteds) {
    if (Array.isArray(exporteds)) {
      exporteds.forEach((exported) => {
        this.#exportManage.bindSource(exported, this);
      });
    } else if (typeof exporteds === "string") {
      this.#exportManage.bindSource(exporteds, this);
    }
  }
  getSpecifier(exported) {
    return this.#fields[exported];
  }
  addSpecifier(exported, local = null, stack2 = null) {
    let type = getExportType(exported, local);
    let old = this.#fields[exported];
    if (old) {
      if (old.type !== type) {
        console.error("export specifier has inconsistent definitions");
      }
      old.type = type;
      return true;
    }
    let spec = {
      type,
      local,
      exported,
      stack: stack2
    };
    this.#fields[exported] = spec;
    this.#specifiers.push(spec);
    return true;
  }
};

// lib/core/BuildGraph.js
var BuildGraph = class {
  #code = "";
  #sourcemap = null;
  #module = null;
  #dependencies = null;
  #imports = null;
  #assets = null;
  #exports = null;
  #children = null;
  #parent = null;
  #outfile = null;
  constructor(module2) {
    this.#module = module2;
  }
  get module() {
    return this.#module;
  }
  get code() {
    return this.#code;
  }
  set code(value) {
    this.#code = value;
  }
  get sourcemap() {
    return this.#sourcemap;
  }
  set sourcemap(value) {
    this.#sourcemap = value;
  }
  get dependencies() {
    return this.#dependencies;
  }
  get imports() {
    return this.#imports;
  }
  get exports() {
    return this.#exports;
  }
  get assets() {
    return this.#assets;
  }
  get children() {
    return this.#children;
  }
  get parent() {
    return this.#parent;
  }
  get outfile() {
    return this.#outfile;
  }
  set outfile(value) {
    this.#outfile = value;
  }
  addChild(child) {
    if (child.#parent) return;
    let children = this.#children;
    if (!children) {
      this.#children = children = /* @__PURE__ */ new Set();
    }
    children.add(child);
    child.#parent = this;
  }
  addImport(importSource) {
    let imports = this.#imports;
    if (!imports) {
      this.#imports = imports = /* @__PURE__ */ new Set();
    }
    imports.add(importSource);
  }
  addExport(exportSource) {
    let exports2 = this.#exports;
    if (!exports2) {
      this.#exports = exports2 = /* @__PURE__ */ new Set();
    }
    exports2.add(exportSource);
  }
  addDepend(module2) {
    let deps = this.#dependencies;
    if (!deps) {
      this.#dependencies = deps = /* @__PURE__ */ new Set();
    }
    deps.add(module2);
  }
  addAsset(asset) {
    let assets = this.#assets;
    if (!assets) {
      this.#assets = assets = /* @__PURE__ */ new Set();
    }
    assets.add(asset);
  }
  findAsset(filter) {
    let assets = this.#assets;
    if (assets) {
      for (let asset of assets) {
        if (filter(asset)) {
          return asset;
        }
      }
    }
    return null;
  }
};
var records3 = /* @__PURE__ */ new Map();
function createBuildGraph(moduleOrCompilation, module2 = null) {
  let old = records3.get(moduleOrCompilation);
  if (old) return old;
  let graph = new BuildGraph(module2);
  records3.set(moduleOrCompilation, graph);
  return graph;
}
function hasBuildGraph(moduleOrCompilation) {
  return records3.has(moduleOrCompilation);
}

// lib/core/VirtualModule.js
var import_Namespace7 = __toESM(require("easescript/lib/core/Namespace"));
var VirtualModule = class {
  #id = "";
  #ns = [];
  #file = null;
  #content = "";
  #ext = ".virtual";
  #exports = [];
  #imports = [];
  #changed = true;
  #references = /* @__PURE__ */ new Map();
  constructor(id, ns, file) {
    this.#id = id;
    this.#ns = Array.isArray(ns) ? ns : String(ns).split(".");
    this.#file = file;
  }
  get id() {
    return this.#id;
  }
  get bindModule() {
    return import_Namespace7.default.globals.get(this.getName());
  }
  get file() {
    return this.#file || this.getName("/") + this.#ext;
  }
  set file(value) {
    this.#file = value;
  }
  get ext() {
    return this.#ext;
  }
  set ext(value) {
    this.#ext = value;
  }
  get changed() {
    return this.#changed;
  }
  addExport(exported, local = null, importSource = null, stack2 = null) {
    let has2 = this.#exports.some((item) => item[0] === exported);
    if (!has2) {
      this.#exports.push([exported, local, importSource, stack2]);
    }
  }
  addImport(source, local = null, imported = null) {
    let has2 = this.#imports.some((item) => item[0] === source && item[1] === local);
    if (!has2) {
      this.#imports.push([source, local, imported]);
    }
  }
  addReference(className, local = null) {
    local = local || String(className).split(".").pop();
    this.#references.set(className, local);
  }
  getReferences() {
    return this.#references;
  }
  getName(seg = ".") {
    return this.#ns.concat(this.#id).join(seg);
  }
  getSourcemap() {
    return null;
  }
  getContent() {
    return this.#content;
  }
  setContent(content) {
    this.#content = content;
    this.#changed = true;
  }
  createImports(ctx2) {
    this.#imports.forEach((args) => {
      ctx2.addImport(...args);
    });
  }
  createExports(ctx2) {
    let exportName = this.id;
    this.#exports.forEach(([exported, local, importSource, stack2]) => {
      if (exported === "default") {
        if (typeof local === "string") {
          exportName = local;
        } else if (local.type === "Identifier") {
          exportName = local.value;
        }
      }
      if (typeof local === "string") {
        local = ctx2.createIdentifier(local);
      }
      ctx2.addExport(exported, local, importSource, stack2);
    });
    return exportName;
  }
  createReferences(ctx2, graph) {
    this.getReferences().forEach((local, classname) => {
      let module2 = import_Namespace7.default.globals.get(classname);
      if (module2) {
        let dep = null;
        if (module2.isDeclaratorModule) {
          dep = getVModule(module2.getName());
        } else {
          dep = module2;
        }
        if (dep) {
          let importSource = ctx2.addImport(
            ctx2.getModuleImportSource(dep, this),
            local
          );
          importSource.setSourceTarget(dep);
          importSource.setSourceContext(this);
          graph.addImport(importSource);
          graph.addDepend(dep);
        }
      }
    });
  }
  gen(ctx2, body = []) {
    let imports = [];
    let exports2 = [];
    let exportNodes = null;
    let importNodes = null;
    if (ctx2.options.module === "cjs") {
      importNodes = createCJSImports(ctx2, ctx2.imports);
      exportNodes = createCJSExports(ctx2, ctx2.exports);
    } else {
      importNodes = createESMImports(ctx2, ctx2.imports);
      exportNodes = createESMExports(ctx2, ctx2.exports);
    }
    imports.push(...importNodes, ...exportNodes.imports);
    body.push(...exportNodes.declares);
    exports2.push(...exportNodes.exports);
    const generator = new Generator_default(ctx2, false);
    const layout = [
      ...imports,
      ctx2.createChunkExpression(this.getContent()),
      ...body,
      ...exports2
    ];
    layout.forEach((item) => generator.make(item));
    return generator;
  }
  async build(ctx2) {
    const graph = createBuildGraph(this, this.bindModule);
    if (!this.#changed && graph.code) return graph;
    this.#changed = false;
    this.createImports(ctx2);
    this.createReferences(ctx2, graph);
    let body = [];
    let exportName = this.createExports(ctx2);
    if (this.id === "Class" && this.#ns.length === 0) {
      let properties = Object.keys(Constant_exports).map((key) => {
        if (key === "PRIVATE_NAME") return;
        return ctx2.createProperty(
          ctx2.createIdentifier(key),
          ctx2.createLiteral(Constant_exports[key])
        );
      }).filter(Boolean);
      properties.sort((a, b) => {
        return a.init.value - b.init.value;
      });
      body.push(
        ctx2.createExpressionStatement(
          ctx2.createAssignmentExpression(
            ctx2.createMemberExpression([
              ctx2.createIdentifier("Class"),
              ctx2.createIdentifier("constant")
            ]),
            ctx2.createObjectExpression(properties)
          )
        )
      );
    } else {
      body.push(
        this.createClassDescriptors(ctx2, exportName, this.id)
      );
    }
    ctx2.createAllDependencies();
    graph.code = this.gen(ctx2, body).code;
    graph.sourcemap = this.getSourcemap();
    if (ctx2.options.emitFile) {
      graph.outfile = ctx2.getOutputAbsolutePath(this);
    }
    return graph;
  }
  createClassDescriptors(ctx2, exportName, className) {
    return ctx2.createCallExpression(
      createStaticReferenceNode(ctx2, null, "Class", "creator"),
      [
        ctx2.createIdentifier(exportName),
        ctx2.createObjectExpression([
          ctx2.createProperty(
            ctx2.createIdentifier("m"),
            ctx2.createLiteral(KIND_CLASS | MODIFIER_PUBLIC)
          ),
          ctx2.createProperty(
            ctx2.createIdentifier("name"),
            ctx2.createLiteral(className)
          )
        ])
      ]
    );
  }
};
var virtualization = /* @__PURE__ */ new Map();
function createVModule(sourceId, file = null) {
  sourceId = Array.isArray(sourceId) ? sourceId.join(".") : String(sourceId);
  let old = virtualization.get(sourceId);
  if (old) return old;
  let segs = sourceId.split(".");
  let vm = new VirtualModule(segs.pop(), segs, file);
  virtualization.set(sourceId, vm);
  return vm;
}
function getVModule(sourceId) {
  return virtualization.get(sourceId);
}
function hasVModule(sourceId) {
  return virtualization.has(sourceId);
}
function isVModule(value) {
  return value ? value instanceof VirtualModule : false;
}

// lib/core/Variable.js
var import_Utils15 = __toESM(require("easescript/lib/core/Utils"));
var import_Scope = __toESM(require("easescript/lib/core/Scope"));
var REFS_All = 31;
var REFS_TOP = 16;
var REFS_UP_CLASS = 8;
var REFS_UP_FUN = 4;
var REFS_UP = 2;
var REFS_DOWN = 1;
var records4 = /* @__PURE__ */ new Map();
var Manage = class {
  #ctxScope = null;
  #cache = /* @__PURE__ */ new Map();
  constructor(ctxScope) {
    this.#ctxScope = ctxScope;
  }
  get(name) {
    return this.#cache.get(name);
  }
  has(name) {
    return this.#cache.has(name);
  }
  get ctxScope() {
    return this.#ctxScope;
  }
  check(name, scope, flags = REFS_All) {
    if (this.#cache.has(name)) return true;
    if (!import_Scope.default.is(scope)) {
      return false;
    }
    if (flags === REFS_All) {
      return scope.checkDocumentDefineScope(name, ["class"]);
    }
    if (scope.isDefine(name)) {
      return true;
    }
    let index = 0;
    let flag = 0;
    while (flag < (flags & REFS_All)) {
      flag = Math.pow(2, index++);
      switch (flags & flag) {
        case REFS_DOWN:
          if (scope.declarations.has(name) || scope.hasChildDeclared(name)) return true;
        case REFS_UP:
          if (scope.isDefine(name)) return true;
        case REFS_TOP:
          if (scope.isDefine(name) || scope.hasChildDeclared(name)) return true;
        case REFS_UP_FUN:
          if (scope.isDefine(name, "function")) return true;
        case REFS_UP_CLASS:
          if (scope.isDefine(name, "class")) return true;
      }
    }
    return false;
  }
  gen(name, scope, flags = REFS_All) {
    let index = 0;
    let value = name;
    while (this.check(value = name + index, scope, flags)) {
      index++;
    }
    this.#cache.set(name, value);
    this.#cache.set(value, value);
    return value;
  }
  getRefs(name, scope, flags = REFS_All) {
    if (scope) {
      if (this.check(name, scope, flags)) {
        return this.gen(name, scope, flags);
      } else {
        this.#cache.set(name, name);
      }
    } else {
      this.#cache.set(name, name);
    }
    return name;
  }
};
function _getVariableManage(ctxScope) {
  let manage = records4.get(ctxScope);
  if (!manage) {
    records4.set(ctxScope, manage = new Manage(ctxScope));
  }
  return manage;
}
function hasRefs(context, name, isTop = false) {
  let manage = getVariableManage(context, isTop);
  return manage.has(name);
}
function getRefs(context, name, isTop = false, flags = REFS_All) {
  let manage = null;
  let ctxScope = context;
  let scope = null;
  if (import_Utils15.default.isStack(context)) {
    scope = context.scope;
    if (!import_Scope.default.is(scope)) {
      throw new Error("Variable.getRefs scope invalid");
    }
    manage = _getVariableManage(
      isTop ? scope.getScopeByType("top") : scope.getScopeByType("function") || scope.getScopeByType("top")
    );
  } else {
    manage = _getVariableManage(ctxScope);
  }
  if (manage.has(name)) {
    return manage.get(name);
  }
  return manage.getRefs(name, scope, flags);
}
function getVariableManage(context, isTop = false) {
  if (import_Utils15.default.isStack(context)) {
    let scope = context.scope;
    if (!import_Scope.default.is(scope)) {
      throw new Error("Variable.getRefs scope invalid");
    }
    return _getVariableManage(
      isTop ? scope.getScopeByType("top") : scope.getScopeByType("function") || scope.getScopeByType("top")
    );
  } else {
    return _getVariableManage(context);
  }
}
function getGlobalRefs(context, name) {
  return getRefs(context, name, true, REFS_All);
}
function getLocalRefs(context, name) {
  return getRefs(context, name, false, REFS_DOWN | REFS_UP_FUN);
}
function genRefs(context, name, isTop = false, flags = REFS_DOWN | REFS_UP_FUN) {
  let manage = getVariableManage(context, isTop);
  if (import_Utils15.default.isStack(context)) {
    return manage.gen(name, context.scope, flags);
  } else {
    return manage.gen(name, null, flags);
  }
}
function genGlobalRefs(context, name) {
  return genRefs(context, name, true, REFS_All);
}
function genLocalRefs(context, name) {
  return genRefs(context, name, false, REFS_DOWN | REFS_UP_FUN);
}

// lib/core/Context.js
var import_Utils16 = __toESM(require("easescript/lib/core/Utils"));
var import_Range = __toESM(require("easescript/lib/core/Range"));
var import_crypto2 = require("crypto");
var Context = class _Context extends import_Token.default {
  static is(value) {
    return value ? value instanceof _Context : false;
  }
  #createToken = null;
  #tokens = null;
  #target = null;
  #dependencies = /* @__PURE__ */ new Map();
  #plugin = null;
  #nodes = /* @__PURE__ */ new Map();
  #imports = new ImportManage();
  #exports = new ExportManage();
  #afterBody = [];
  #beforeBody = [];
  #buildOptions = {};
  #fragments = null;
  constructor(plugin2, compiOrVModule = null) {
    super();
    this.#plugin = plugin2;
    this.#target = compiOrVModule;
    const _createToken = this.options.transform.createToken;
    const _tokens = this.options.transform.tokens;
    if (_tokens && typeof _tokens === "object" && Object.keys(_tokens).length > 0) {
      this.#tokens = (type) => {
        if (Object.prototype.hasOwnProperty.call(_tokens, type)) {
          return _tokens[type];
        }
        return tokens_exports[type];
      };
    } else {
      this.#tokens = (type) => {
        return tokens_exports[type];
      };
    }
    if (_createToken && typeof _createToken === "function") {
      this.#createToken = (token, stack2, type) => {
        try {
          return _createToken(this, token, stack2, type);
        } catch (e) {
          console.error(e);
        }
      };
    } else {
      this.#createToken = (token, stack2, type) => {
        if (!token) {
          throw new Error(`Token '${type}' is not exists.`);
        }
        try {
          return token(this, stack2, type);
        } catch (e) {
          console.error(e);
        }
      };
    }
  }
  get plugin() {
    return this.#plugin;
  }
  get compiler() {
    return this.#plugin.getComplier();
  }
  get target() {
    return this.#target;
  }
  get options() {
    return this.#plugin.options;
  }
  get imports() {
    return this.#imports;
  }
  get exports() {
    return this.#exports;
  }
  get afterBody() {
    return this.#afterBody;
  }
  get beforeBody() {
    return this.#beforeBody;
  }
  setBuildOptions(options = {}) {
    this.#buildOptions = options;
  }
  getBuildOptions() {
    return this.#buildOptions;
  }
  createAsset(source) {
    return this.plugin.assets.createAsset(source);
  }
  createStyleAsset(source, index) {
    return this.plugin.assets.createStyleAsset(source, index);
  }
  createToken(stack2) {
    if (!stack2) return null;
    const type = stack2.toString();
    if (type === "TypeStatement") return null;
    if (type === "NewDefinition") return null;
    if (type === "CallDefinition") return null;
    if (type === "TypeDefinition") return null;
    if (type === "TypeGenericDefinition") return null;
    if (type === "DeclaratorDeclaration") return null;
    const token = this.#tokens(type);
    return this.#createToken(token, stack2, type);
  }
  addNodeToAfterBody(node) {
    if (node) {
      let afterBody = this.#afterBody || (this.#afterBody = []);
      afterBody.push(node);
    }
    return node;
  }
  addNodeToBeforeBody(node) {
    if (node) {
      let beforeBody = this.#beforeBody || (this.#beforeBody = []);
      beforeBody.push(node);
    }
    return node;
  }
  addImport(source, local = null, imported = null, stack2 = null) {
    return this.#imports.createImportSource(source, local, imported, stack2);
  }
  getImport(source, isNamespace = false) {
    return this.#imports.getImportSource(source, isNamespace);
  }
  hasImport(source, local = null, isNamespace = false) {
    return this.#imports.hasImportSource(source, local, isNamespace);
  }
  addExport(exported, local = null, importSource = null, stack2 = null) {
    return this.#exports.createExportSource(exported, local, importSource, stack2);
  }
  hasExport(exported) {
    return this.#exports.hasExportSource(exported);
  }
  addFragment(compilation) {
    let fragments = this.#fragments || (this.#fragments = /* @__PURE__ */ new Set());
    fragments.add(compilation);
  }
  getFragments() {
    return this.#fragments;
  }
  addDepend(dep, context = null) {
    context = context || this.target;
    let deps = this.#dependencies.get(context);
    if (!deps) {
      this.#dependencies.set(context, deps = /* @__PURE__ */ new Set());
    }
    deps.add(dep);
  }
  getDependencies(context = null) {
    context = context || this.target;
    return this.#dependencies.get(context);
  }
  getAllDependencies() {
    const deps = /* @__PURE__ */ new Set();
    this.#dependencies.forEach((dataset) => {
      dataset.forEach((dep) => deps.add(dep));
    });
    return deps;
  }
  isUsed(module2, context = null) {
    if (!module2) return false;
    context = context || this.target;
    let deps = this.#dependencies.get(context);
    if (deps && deps.has(module2)) {
      return true;
    }
    if (isVModule(module2)) return true;
    return module2.compilation === this.target;
  }
  isVModule(module2) {
    if (module2) {
      if (module2.isDeclaratorModule) {
        return hasVModule(module2.getName());
      } else if (isVModule(module2)) {
        return module2;
      }
    }
    return false;
  }
  isActiveModule(depModule, context = null) {
    if (!depModule) return false;
    context = context || this.target;
    if (!this.isUsed(depModule, context)) return false;
    if (depModule.isDeclaratorModule) {
      if (hasVModule(depModule.getName())) {
        return true;
      }
      if (this.isDeclaratorModuleDependency(depModule)) {
        return true;
      }
      return false;
    } else {
      if (isVModule(depModule)) return true;
      if (context) {
        return !import_Utils16.default.checkDepend(context, depModule);
      }
      return true;
    }
  }
  isNeedBuild(module2) {
    if (!module2) return false;
    if (isVModule(module2)) return true;
    if (has(module2, "isNeedBuild")) {
      return has(module2, "isNeedBuild");
    }
    let result = this.compiler.isPluginInContext(this.plugin, module2);
    if (result) {
      const annots = getModuleAnnotations(module2, ["runtime", "syntax"]);
      if (annots.length > 0) {
        result = annots.every((annot) => {
          const data = parseMacroAnnotation(annot);
          if (!data) {
            throw new Error("Annotations parse data exception.");
          }
          const name = annot.getLowerCaseName();
          switch (name) {
            case "runtime":
              return isRuntime(data.value, this.options.metadata || {}) === data.expect;
            case "syntax":
              return isSyntax(data.value, this.plugin.version) === data.expect;
          }
          return false;
        });
      }
    }
    has(module2, "isNeedBuild", result);
    return result;
  }
  hasDeclareModule(module2) {
    if (import_Utils16.default.isCompilation(this.target)) {
      if (this.target.modules.has(module2.getName())) {
        return true;
      }
      return this.target.importModuleNameds.has(module2);
    }
    return false;
  }
  setNode(stack2, node) {
    this.#nodes.set(stack2, node);
  }
  getNode(stack2) {
    return this.#nodes.get(stack2);
  }
  removeNode(stack2) {
    this.#nodes.delete(stack2);
  }
  getModuleReferenceName(module2, context = null) {
    let name = null;
    if (isVModule(module2)) {
      name = module2.getName("_");
    } else {
      if (!import_Utils16.default.isModule(module2)) return null;
      if (!context) context = this.target;
      if (import_Utils16.default.isModule(context)) {
        if (context.isDeclaratorModule) {
          const vm = getVModule(context.getName());
          if (vm) {
            const references = vm.getReferences();
            if (references) {
              const className = module2.getName();
              if (references.has(className)) {
                name = references.get(className);
              }
            }
          }
        }
        if (!name) {
          name = context.getReferenceNameByModule(module2);
        }
      } else if (import_Utils16.default.isCompilation(context)) {
        name = context.getReferenceName(module2);
      }
      if (this.hasDeclareModule(module2)) {
        return name;
      }
      if (!name) {
        name = module2.getName("_");
      }
    }
    return this.getGlobalRefName(null, name);
  }
  isDeclaratorModuleDependency(module2) {
    if (!import_Utils16.default.isClassType(module2)) return false;
    if (module2.required && module2.isAnnotationCreated) {
      return true;
    } else if (module2.isDeclaratorModule) {
      return module2.getStacks().some((stack2) => {
        if (!Array.isArray(stack2.imports)) return false;
        return stack2.imports.some((item) => {
          if (item.isImportDeclaration && item.source.isLiteral) {
            return item.specifiers.some((spec) => spec.value() === module2.id);
          }
          return false;
        });
      });
    }
    return false;
  }
  isES6ClassModule(module2) {
    const annots = getModuleAnnotations(module2, ["define"], false);
    return annots.some((annot) => {
      const data = parseDefineAnnotation(annot);
      return data.es6class;
    });
  }
  isLoadAssetsRawCode(stack2, resolveFile) {
    if (!stack2 || !resolveFile) return false;
    if (!stack2.isAnnotationDeclaration) return false;
    if (stack2.getLowerCaseName() !== "embed") return false;
    if (/\.[m|c]?js$/i.test(resolveFile)) return true;
    return this.compiler.isExtensionFile(resolveFile);
  }
  createDeclaratorModuleImportReferences(module2, context, graph = null) {
    if (!graph && context) {
      graph = this.getBuildGraph(context);
    }
    this.createRequires(module2, graph);
    this.createModuleImportReferences(module2, graph);
  }
  createModuleImportReferences(module2, graph = null) {
    if (!import_Utils16.default.isModule(module2)) return;
    if (!graph) {
      graph = this.getBuildGraph(module2);
    }
    module2.getImportDeclarations().forEach((item) => {
      if (item.source.isLiteral) {
        parseImportDeclaration(this, item, module2, graph);
      }
    });
  }
  createAssets(context, graph) {
    const assets = context.assets;
    if (assets && assets.size > 0) {
      assets.forEach((asset) => {
        if (asset.file) {
          let source = asset.resolve;
          let external = isExternalDependency(this.options.dependences.externals, source, context);
          let specifiers = null;
          if (!external) {
            if (asset.assign) {
              specifiers = [
                {
                  local: asset.assign,
                  stack: asset.stack
                }
              ];
            }
            if (this.isLoadAssetsRawCode(asset.stack, source)) {
              source = `${source}?type=rawcode`;
            }
            source = this.getImportAssetsMapping(source, {
              group: "imports",
              source,
              specifiers,
              ctx: this,
              context
            });
            if (source) {
              let _asset = this.createAsset(source);
              _asset.file = asset.resolve;
              _asset.local = asset.assign;
              graph.addAsset(_asset);
              source = this.getAssetsImportSource(_asset, context);
            }
          }
          if (source) {
            let importSource = null;
            if (specifiers && specifiers.length > 0) {
              specifiers.forEach((spec) => {
                importSource = this.addImport(source, spec.local, spec.imported, spec.stack);
              });
            } else {
              importSource = ctx.addImport(source, null, null, stack.source);
            }
            importSource.setSourceTarget(asset);
            importSource.setSourceContext(context);
            if (graph) {
              graph.addImport(importSource);
            }
          }
        } else if (asset.type === "style") {
          const { index, type, attrs = {} } = asset;
          const lang = attrs.lang || attrs.type || "css";
          const suffix = "file." + lang;
          let source = this.getModuleResourceId(context, { ...attrs, index, type, lang, [suffix]: "" });
          let _asset = this.createStyleAsset(source, index);
          _asset.code = asset.content;
          source = this.getAssetsImportSource(_asset, context);
          let importSource = this.addImport(source);
          importSource.setSourceTarget(asset);
          importSource.setSourceContext(context);
          graph.addImport(importSource);
          graph.addAsset(_asset);
        }
      });
    }
  }
  createRequires(context, graph) {
    const requires = context.requires;
    if (requires && requires.size > 0) {
      requires.forEach((item) => {
        this.createRequire(
          context,
          graph,
          item.from,
          item.name,
          item.namespaced ? "*" : item.key
        );
      });
    }
  }
  createRequire(context, graph, source, local, imported = null) {
    if (source && !isExternalDependency(this.options.dependences.externals, source, context)) {
      let specifiers = [{
        local,
        imported
      }];
      let target = source;
      source = this.getImportAssetsMapping(source, {
        group: "imports",
        source,
        specifiers,
        context: this,
        owner: context
      });
      if (source) {
        let importSource = null;
        if (specifiers.length > 0) {
          specifiers.forEach((spec) => {
            importSource = this.addImport(source, spec.local, spec.imported);
          });
        } else {
          importSource = this.addImport(source);
        }
        if (importSource) {
          importSource.setSourceTarget(target);
          importSource.setSourceContext(context);
        }
        if (importSource && graph) {
          graph.addImport(importSource);
        }
      }
    }
  }
  crateModuleAssets(module2) {
    if (!import_Utils16.default.isModule(module2)) return;
    const graph = this.getBuildGraph(module2);
    this.createAssets(module2, graph);
    this.createRequires(module2, graph);
  }
  crateRootAssets() {
    const compilation = this.target;
    if (compilation) {
      const graph = this.getBuildGraph(compilation);
      this.createAssets(compilation, graph);
      this.createRequires(compilation, graph);
    }
  }
  createAllDependencies() {
    const target = this.target;
    const compilation = import_Utils16.default.isCompilation(target) ? target : null;
    this.#dependencies.forEach((deps, moduleOrCompi) => {
      const graph = this.getBuildGraph(moduleOrCompi);
      deps.forEach((depModule) => {
        if (depModule === target || compilation && compilation.modules.has(depModule.getName())) {
          return;
        }
        if (moduleOrCompi !== depModule && this.isNeedBuild(depModule)) {
          graph.addDepend(depModule);
          if (!depModule.isDeclaratorModule || this.isVModule(depModule)) {
            const name = this.getModuleReferenceName(depModule, moduleOrCompi);
            const source = this.getModuleImportSource(depModule, moduleOrCompi);
            const importSource = this.addImport(source, name);
            importSource.setSourceTarget(depModule);
            importSource.setSourceContext(moduleOrCompi);
            graph.addImport(importSource);
          } else if (depModule.isDeclaratorModule) {
            this.createDeclaratorModuleImportReferences(depModule, moduleOrCompi, graph);
          }
        }
      });
    });
  }
  createModuleDependencies(module2) {
    if (!import_Utils16.default.isModule(module2)) return;
    let deps = this.getDependencies(module2);
    if (!deps) return;
    const graph = this.getBuildGraph(module2);
    const compilation = module2.compilation;
    deps.forEach((depModule) => {
      if (compilation && compilation.modules && compilation.modules.has(depModule.getName())) {
        return;
      }
      if (module2 !== depModule && this.isNeedBuild(depModule)) {
        graph.addDepend(depModule);
        if (!depModule.isDeclaratorModule || this.isVModule(depModule)) {
          const name = this.getModuleReferenceName(depModule, module2);
          const source = this.getModuleImportSource(depModule, module2);
          const importSource = this.addImport(source, name);
          importSource.setSourceTarget(depModule);
          importSource.setSourceContext(module2);
          graph.addImport(importSource);
        } else if (depModule.isDeclaratorModule) {
          this.createDeclaratorModuleImportReferences(depModule, module2, graph);
        }
      }
    });
  }
  hasBuildGraph(module2) {
    return hasBuildGraph(module2 || this.target);
  }
  getBuildGraph(module2 = null) {
    let compilation = this.target;
    if (!module2 || compilation === module2) {
      return createBuildGraph(compilation);
    }
    if (import_Utils16.default.isModule(module2)) {
      let mainModule = compilation.mainModule;
      if (module2 === mainModule) {
        return createBuildGraph(compilation, module2);
      }
      if (module2.isDeclaratorModule) {
        const vm = getVModule(module2.getName());
        if (vm) {
          return createBuildGraph(vm);
        }
      }
      let graph = createBuildGraph(module2, module2);
      if (mainModule) {
        let parent = createBuildGraph(compilation, mainModule);
        parent.addChild(graph);
      }
      return graph;
    } else {
      if (isVModule(module2)) {
        return createBuildGraph(module2, module2);
      } else {
        throw new Error("Exception module params");
      }
    }
  }
  getGlobalRefName(stack2, name, group = null) {
    if (!stack2) {
      stack2 = import_Utils16.default.isCompilation(this.target) ? this.target.stack : this;
    }
    if (group) {
      let key = "getGlobalRefName:" + name;
      if (has(group, key)) {
        return get(group, key);
      } else {
        let value = hasRefs(stack2, name, true) ? genGlobalRefs(stack2, name) : getGlobalRefs(stack2, name);
        set(group, key, value);
        return value;
      }
    }
    return getGlobalRefs(stack2, name);
  }
  getLocalRefName(stack2, name, group = null) {
    if (!stack2) {
      stack2 = import_Utils16.default.isCompilation(this.target) ? this.target.stack : this;
    }
    if (group) {
      let key = "getLocalRefName:" + name;
      if (has(group, key)) {
        return get(group, key);
      } else {
        let value = hasRefs(stack2, name) ? genLocalRefs(stack2, name) : getLocalRefs(stack2, name);
        set(group, key, value);
        return value;
      }
    }
    return getLocalRefs(stack2, name);
  }
  getImportAssetsMapping(file, options = {}) {
    if (!options.group) {
      options.group = "imports";
    }
    if (!options.delimiter) {
      options.delimiter = "/";
    }
    return this.plugin.resolveImportSource(file, options);
  }
  getSourceFileMappingFolder(file, flag) {
    const result = this.resolveSourceFileMappingPath(file, "folders");
    return flag && !result ? file : result;
  }
  getModuleMappingFolder(module2) {
    if (import_Utils16.default.isModule(module2)) {
      return this.resolveSourceFileMappingPath(module2.getName("/") + ".module", "folders");
    } else if (module2 && module2.file) {
      return this.resolveSourceFileMappingPath(module2.file, "folders");
    }
    return null;
  }
  getAssetsImportSource(asset, context) {
    let source = asset.sourceId;
    if (this.options.emitFile) {
      source = this.getRelativePath(
        asset.getOutFile(this),
        this.getOutputAbsolutePath(context)
      );
    }
    return source;
  }
  getModuleImportSource(source, context, sourceId = null) {
    const config = this.options;
    const isString = typeof source === "string";
    if (isString && isExternalDependency(this.options.dependences.externals, source, context)) {
      return source;
    }
    if (isString && source.includes("${__filename}")) {
      const owner = import_Utils16.default.isModule(context) ? context.compilation : context;
      source = source.replace("${__filename}", import_Utils16.default.isCompilation(owner) ? owner.file : this.target.file);
    }
    if (isString && source.includes("/node_modules/")) {
      if (import_path2.default.isAbsolute(source)) return source;
      if (!sourceId) {
        return this.resolveSourceFileMappingPath(source, "imports") || source;
      }
      return sourceId;
    }
    if (isString && !import_path2.default.isAbsolute(source)) {
      return source;
    }
    if (config.emitFile) {
      return this.getOutputRelativePath(source, context);
    }
    return isString ? source : this.getModuleResourceId(source);
  }
  getModuleResourceId(module2, query = {}) {
    return this.compiler.parseResourceId(module2, query);
  }
  resolveSourceFileMappingPath(file, group, delimiter = "/") {
    return this.plugin.resolveSourceId(file, group, delimiter);
  }
  genUniFileName(source, suffix = null) {
    source = String(source);
    let query = source.includes("?");
    if (import_path2.default.isAbsolute(source) || query) {
      let file = source;
      if (query) {
        file = source.split("?")[0];
      }
      let ext = import_path2.default.extname(file);
      suffix = suffix || ext;
      return import_path2.default.basename(file, ext) + "-" + (0, import_crypto2.createHash)("sha256").update(source).digest("hex").substring(0, 8) + suffix;
    }
    return source;
  }
  getOutputDir() {
    return this.options.output || ".output";
  }
  getOutputExtName() {
    return this.options.outext || ".js";
  }
  getOutputAbsolutePath(source, context) {
    const isStr = typeof source === "string";
    const output = this.getOutputDir();
    const suffix = this.getOutputExtName();
    if (!source) return output;
    if (has(source, "Context.getOutputAbsolutePath")) {
      return get(source, "Context.getOutputAbsolutePath");
    }
    let folder = isStr ? this.getSourceFileMappingFolder(source) : this.getModuleMappingFolder(source);
    let filename = null;
    if (isStr) {
      filename = folder ? import_path2.default.basename(source) : this.compiler.getRelativeWorkspacePath(source, true) || this.genUniFileName(source);
    } else {
      if (import_Utils16.default.isModule(source)) {
        if (source.isDeclaratorModule) {
          const vm = getVModule(source.getName()) || source;
          filename = folder ? vm.id : vm.getName("/");
        } else {
          filename = folder ? source.id : source.getName("/");
        }
      } else if (isVModule(source)) {
        filename = folder ? source.id : source.getName("/");
      } else if (source.file) {
        filename = folder ? import_path2.default.basename(source.file) : this.compiler.getRelativeWorkspacePath(source.file) || this.genUniFileName(source.file);
      }
    }
    if (!filename) {
      throw new Error("File name not resolved correctly");
    }
    let info = import_path2.default.parse(filename);
    if (!info.ext || this.compiler.isExtensionName(info.ext)) {
      filename = import_path2.default.join(info.dir, info.name + suffix);
    }
    let result = null;
    if (folder) {
      result = import_Utils16.default.normalizePath(
        import_path2.default.resolve(
          import_path2.default.isAbsolute(folder) ? import_path2.default.join(folder, filename) : import_path2.default.join(output, folder, filename)
        )
      );
    } else {
      result = import_Utils16.default.normalizePath(
        import_path2.default.resolve(
          import_path2.default.join(output, filename)
        )
      );
    }
    if (result.includes("?")) {
      result = import_path2.default.join(import_path2.default.dirname(result), this.genUniFileName(result, import_path2.default.extname(result)));
    }
    set(source, "Context.getOutputAbsolutePath", result);
    return result;
  }
  getOutputRelativePath(source, context) {
    return this.getRelativePath(
      this.getOutputAbsolutePath(source),
      this.getOutputAbsolutePath(context)
    );
  }
  getRelativePath(source, context) {
    return "./" + import_Utils16.default.normalizePath(
      import_path2.default.relative(
        import_path2.default.dirname(context),
        source
      )
    );
  }
  getVNodeApi(name) {
    let local = this.getGlobalRefName(null, name);
    this.addImport("vue", local, name);
    return local;
  }
  async emit(buildGraph) {
    let outfile = buildGraph.outfile;
    import_fs2.default.mkdirSync(import_path2.default.dirname(outfile), { recursive: true });
    import_fs2.default.writeFileSync(outfile, buildGraph.code);
    let sourcemap = buildGraph.sourcemap;
    if (sourcemap) {
      import_fs2.default.writeFileSync(outfile + ".map", JSON.stringify(sourcemap.toJSON()));
    }
  }
  error(message, stack2 = null) {
    if (this.target) {
      let range = stack2 && stack2 instanceof import_Range.default ? stack2 : null;
      if (!range && import_Utils16.default.isStack(stack2)) {
        range = this.target.getRangeByNode(stack2.node);
      }
      const file = this.target.file;
      if (range) {
        message += ` (${file}:${range.start.line}:${range.start.column})`;
      } else {
        message += `(${file})`;
      }
    }
    import_Utils16.default.error(message);
  }
  warn(message, stack2 = null) {
    if (this.target) {
      let range = stack2 && stack2 instanceof import_Range.default ? stack2 : null;
      if (!range && import_Utils16.default.isStack(stack2)) {
        range = this.target.getRangeByNode(stack2.node);
      }
      const file = this.target.file;
      if (range) {
        message += ` (${file}:${range.start.line}:${range.start.column})`;
      } else {
        message += `(${file})`;
      }
    }
    import_Utils16.default.warn(message);
  }
};
var Context_default = Context;

// lib/core/Builder.js
async function buildProgram(ctx2, compilation) {
  let root = compilation.stack;
  if (!root) {
    throw new Error("Build program failed");
  }
  let body = [];
  let externals = [];
  let imports = [];
  let exports2 = [];
  root.body.forEach((item) => {
    if (item.isClassDeclaration || item.isEnumDeclaration || item.isInterfaceDeclaration || item.isStructTableDeclaration || item.isPackageDeclaration) {
      const child = ctx2.createToken(item);
      if (child) {
        body.push(child);
      }
    }
  });
  if (root.imports && root.imports.length > 0) {
    root.imports.forEach((item) => {
      if (item.isImportDeclaration) {
        ctx2.createToken(item);
      }
    });
  }
  if (root.externals.length > 0) {
    root.externals.forEach((item) => {
      if (item.isImportDeclaration) {
        ctx2.createToken(item);
      } else {
        const node = ctx2.createToken(item);
        if (node) {
          externals.push(node);
        }
      }
    });
  }
  if (root.exports.length > 0) {
    root.exports.forEach((item) => {
      ctx2.createToken(item);
    });
  }
  ctx2.crateRootAssets();
  ctx2.createAllDependencies();
  let exportNodes = null;
  let importNodes = null;
  if (ctx2.options.module === "cjs") {
    importNodes = createCJSImports(ctx2, ctx2.imports);
    exportNodes = createCJSExports(ctx2, ctx2.exports);
  } else {
    importNodes = createESMImports(ctx2, ctx2.imports);
    exportNodes = createESMExports(ctx2, ctx2.exports);
  }
  imports.push(...importNodes, ...exportNodes.imports);
  body.push(...exportNodes.declares);
  exports2.push(...exportNodes.exports);
  let generator = new Generator_default(ctx2);
  let graph = ctx2.getBuildGraph(compilation);
  let layout = [
    ...imports,
    ...ctx2.beforeBody,
    ...body,
    ...ctx2.afterBody,
    ...externals,
    ...exports2
  ];
  if (layout.length > 0) {
    layout.forEach((item) => generator.make(item));
    graph.code = generator.code;
    graph.sourcemap = generator.sourceMap;
    if (ctx2.options.emitFile) {
      graph.outfile = ctx2.getOutputAbsolutePath(compilation.mainModule || compilation);
    }
  }
  return graph;
}
async function buildAssets(ctx2, buildGraph) {
  let assets = buildGraph.assets;
  if (!assets) return;
  await Promise.all(
    Array.from(assets.values()).map((asset) => asset.build(ctx2))
  );
}
function createBuilder(plugin2) {
  const buildContext = (records5 = /* @__PURE__ */ new Map(), options = {}) => {
    const builder = async (compiOrVModule) => {
      if (records5.has(compiOrVModule)) {
        return records5.get(compiOrVModule);
      }
      let buildGraph = null;
      let ctx2 = new Context_default(plugin2, compiOrVModule);
      ctx2.setBuildOptions(options);
      if (isVModule(compiOrVModule)) {
        buildGraph = await compiOrVModule.build(ctx2);
      } else {
        if (!compiOrVModule.parserDoneFlag) {
          await compiOrVModule.ready();
        }
        buildGraph = await buildProgram(ctx2, compiOrVModule);
      }
      records5.set(compiOrVModule, buildGraph);
      if (ctx2.options.emitFile) {
        const deps = ctx2.getAllDependencies();
        const vms = /* @__PURE__ */ new Set();
        const compilations = /* @__PURE__ */ new Set();
        deps.forEach((dep) => {
          if (ctx2.isVModule(dep)) {
            if (dep.isDeclaratorModule) {
              dep = getVModule(dep.getName());
            }
            if (dep) {
              buildGraph.addDepend(dep);
              vms.add(dep);
            }
          } else if (import_Utils17.default.isModule(dep)) {
            if (dep.isStructTable) {
              dep.getStacks().forEach((stack2) => {
                ctx2.createToken(stack2);
              });
            } else if (!dep.isDeclaratorModule) {
              buildGraph.addDepend(dep);
              compilations.add(dep.compilation);
            }
          }
        });
        const fragments = ctx2.getFragments();
        if (fragments) {
          fragments.forEach((compi) => compilations.add(compi));
        }
        await Promise.all(
          Array.from(compilations.values()).map((compi) => builder(compi))
        );
        await Promise.all(
          Array.from(vms.values()).map((vm) => builder(vm))
        );
        await ctx2.emit(buildGraph);
      } else {
        const deps = ctx2.getAllDependencies();
        deps.forEach((dep) => {
          if (ctx2.isVModule(dep)) {
            if (dep.isDeclaratorModule) {
              dep = getVModule(dep.getName());
            }
            if (dep) {
              buildGraph.addDepend(dep);
            }
          } else if (import_Utils17.default.isModule(dep)) {
            if (dep.isStructTable) {
              dep.getStacks().forEach((stack2) => {
                ctx2.createToken(stack2);
              });
            } else if (!dep.isDeclaratorModule) {
              buildGraph.addDepend(dep);
            }
          }
        });
      }
      await buildAssets(ctx2, buildGraph);
      return buildGraph;
    };
    return builder;
  };
  return buildContext;
}

// lib/core/Asset.js
var import_path3 = __toESM(require("path"));
var import_fs3 = __toESM(require("fs"));
var Asset = class {
  #code = "";
  #type = "";
  #file = null;
  #sourcemap = null;
  #local = null;
  #imported = null;
  #sourceId = null;
  #outfile = null;
  #id = null;
  #changed = true;
  constructor(sourceFile, type, id = null) {
    this.#type = type;
    this.#file = sourceFile;
    this.#sourceId = sourceFile;
    this.#id = id;
  }
  get code() {
    let code = this.#code;
    if (code) return code;
    let file = this.file;
    if (file && import_fs3.default.existsSync(file)) {
      this.#code = import_fs3.default.readFileSync(file).toString("utf8");
    }
    return this.#code;
  }
  set code(value) {
    this.#code = value;
    this.#changed = true;
  }
  get id() {
    return this.#id;
  }
  set id(value) {
    this.#id = value;
  }
  get local() {
    return this.#local;
  }
  set local(value) {
    this.#local = value;
  }
  get imported() {
    return this.#imported;
  }
  set imported(value) {
    this.#imported = value;
  }
  get file() {
    return this.#file;
  }
  set file(value) {
    this.#file = value;
  }
  get sourceId() {
    return this.#sourceId;
  }
  set sourceId(value) {
    this.#sourceId = value;
  }
  get type() {
    return this.#type;
  }
  get sourcemap() {
    return this.#sourcemap;
  }
  set sourcemap(value) {
    this.#sourcemap = value;
  }
  getOutFile(ctx2) {
    if (this.#outfile) return this.#outfile;
    let source = ctx2.getOutputAbsolutePath(this.sourceId);
    let ext = ctx2.getOutputExtName();
    if (!source.endsWith(ext)) {
      source += ext;
    }
    this.#outfile = source;
    return source;
  }
  async build(ctx2) {
    if (!this.#changed) return;
    this.#changed = false;
    if (ctx2.options.emitFile) {
      let code = this.code;
      if (ctx2.options.module === "cjs") {
        code = `module.exports=${JSON.stringify(code)};`;
      } else {
        code = `export default ${JSON.stringify(code)};`;
      }
      let outfile = this.getOutFile(ctx2);
      import_fs3.default.mkdirSync(import_path3.default.dirname(outfile), { recursive: true });
      import_fs3.default.writeFileSync(outfile, code);
    }
  }
};
function createAssets(AssetFactory) {
  const records5 = /* @__PURE__ */ new Map();
  function createAsset(sourceFile, id = null, type = null) {
    if (!type) {
      type = import_path3.default.extname(sourceFile);
      if (type.startsWith(".")) {
        type = type.substring(1);
      }
    } else {
      type = String(type);
    }
    let key = sourceFile + ":" + type;
    if (id != null) {
      key = sourceFile + ":" + id + ":" + type;
    }
    let asset = records5.get(key);
    if (!asset) {
      records5.set(sourceFile, asset = new AssetFactory(sourceFile, type, id));
    }
    return asset;
  }
  function createStyleAsset(sourceFile, id = null) {
    return createAsset(sourceFile, id, "style");
  }
  function getAsset(sourceFile, id = null, type = "") {
    let key = sourceFile + ":" + type;
    if (id) {
      key = sourceFile + ":" + id + ":" + type;
    }
    return records5.get(key);
  }
  function getStyleAsset(sourceFile, id = null) {
    return getAsset(sourceFile, id, "style");
  }
  function getAssets() {
    return Array.from(records5.values());
  }
  return {
    createAsset,
    createStyleAsset,
    getStyleAsset,
    getAsset,
    getAssets
  };
}

// lib/core/Plugin.js
function defineError(complier) {
  if (defineError.loaded || !complier || !complier.diagnostic) return;
  defineError.loaded = true;
  let define = complier.diagnostic.defineError;
  define(1e4, "", [
    "\u7ED1\u5B9A\u7684\u5C5E\u6027(%s)\u5FC5\u987B\u662F\u4E00\u4E2A\u53EF\u8D4B\u503C\u7684\u6210\u5458\u5C5E\u6027",
    "Binding the '%s' property must be an assignable members property"
  ]);
  define(10101, "", [
    "\u8DEF\u7531\u53C2\u6570(%s)\u7684\u9ED8\u8BA4\u503C\u53EA\u80FD\u662F\u4E00\u4E2A\u6807\u91CF",
    "Route params the '%s' defalut value can only is a literal type."
  ]);
}
var plugins = /* @__PURE__ */ new Set();
var Plugin = class _Plugin {
  static is(value) {
    return value ? value instanceof _Plugin : false;
  }
  #name = null;
  #version = "0.0.0";
  #records = /* @__PURE__ */ new Map();
  #options = null;
  #initialized = false;
  #builder = null;
  #complier = null;
  #assets = null;
  #glob = new import_glob_path.default();
  constructor(name, version, options = {}) {
    plugins.add(this);
    this.#name = name;
    this.#version = version;
    this.#options = options;
    this.resolveRules();
    this.#builder = createBuilder(this);
    this.#assets = createAssets(Asset);
    if (options.mode) {
      options.metadata.env.NODE_ENV = options.mode;
    }
  }
  get name() {
    return this.#name;
  }
  get options() {
    return this.#options;
  }
  get version() {
    return this.#version;
  }
  get assets() {
    return this.#assets;
  }
  getComplier() {
    return this.#complier;
  }
  resolveRules() {
    const resolve = this.options.resolve || {};
    const imports = resolve?.imports || {};
    Object.keys(imports).forEach((key) => {
      this.#glob.addRuleGroup(key, imports[key], "imports");
    });
    const folders = resolve?.folders || {};
    Object.keys(folders).forEach((key) => {
      this.#glob.addRuleGroup(key, folders[key], "folders");
    });
  }
  resolveImportSource(id, ctx2 = {}) {
    const scheme = this.#glob.scheme(id, ctx2);
    let source = this.#glob.parse(scheme, ctx2);
    let rule = scheme.rule;
    if (!rule) {
      source = id;
    }
    return source;
  }
  resolveSourceId(id, group, delimiter = "/") {
    let data = { group, delimiter, failValue: null };
    if (typeof group === "object") {
      data = group;
    }
    return this.#glob.dest(id, data);
  }
  init(complier) {
    if (!this.#initialized) {
      this.#initialized = true;
      defineError(complier);
      if (this.options.mode === "development") {
        let tableBuilders = null;
        complier.on("onChanged", (compilation) => {
          this.#records.delete(compilation);
          let mainModule = compilation.mainModule;
          if (mainModule.isStructTable) {
            tableBuilders = tableBuilders || getAllBuilder();
            compilation.modules.forEach((module2) => {
              if (module2.isStructTable) {
                tableBuilders.forEach((builder) => {
                  builder.removeTable(module2.id);
                });
              }
            });
          }
        });
      }
      this.#complier = complier;
    }
  }
  done() {
  }
  async build(compilation, options = {}) {
    if (!import_Compilation.default.is(compilation)) {
      throw new Error("compilation is invalid");
    }
    if (!this.#initialized) {
      this.init(compilation.complier);
    }
    const builder = this.#builder(this.#records, options);
    if (options.moduleId) {
      compilation = getVModule(options.moduleId);
      if (!compilation) {
        throw new Error(`The '${options.moduleId}' virtual module does not exists.`);
      }
    }
    return await builder(compilation);
  }
};
var Plugin_default = Plugin;

// lib/core/Loader.js
var import_Utils18 = __toESM(require("easescript/lib/core/Utils"));
var import_path4 = __toESM(require("path"));
var sortedKey = Symbol("sorted");
var extensions = [".css", ".sass", ".scss"];
var Loader = class {
  #options = null;
  constructor(options = {}) {
    this.#options = options;
  }
  resolveId(ctx2, source, asset) {
    let ext = import_path4.default.extname(source);
    if (extensions.includes(ext)) {
      let folder = ctx2.getSourceFileMappingFolder(source + ".assets");
      if (folder) {
        if (import_path4.default.isAbsolute(folder)) {
          return import_Utils18.default.normalizePath(import_path4.default.join(folder, ctx2.genUniFileName(source) + ".js"));
        } else {
          return import_Utils18.default.normalizePath("./" + import_path4.default.join(folder, ctx2.genUniFileName(source) + ".js"));
        }
      }
      return import_Utils18.default.normalizePath("./" + ctx2.genUniFileName(source) + ".js");
    } else {
      return source;
    }
  }
  async build(ctx2, source, asset) {
    let code = asset.code;
    let map = null;
    if (ctx2.options.module === "cjs") {
      code = `module.exports=${JSON.stringify(code)};`;
    } else {
      code = `export default ${JSON.stringify(code)};`;
    }
    return {
      code,
      map
    };
  }
};
function createLoader(options = {}) {
  return new Loader(options);
}

// package.json
var package_default = {
  name: "@easescript/transform",
  version: "0.0.4",
  description: "Code Transform Based For EaseScript Plugin",
  main: "dist/index.js",
  scripts: {
    dev: "npm run build && jasmine ./test/index.js",
    run: "jasmine ./test/.output/Test.js",
    test: "npm run dev & npm run run",
    build: "node ./scripts/build.js"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/51breeze/es-transform.git"
  },
  keywords: [
    "EaseScript"
  ],
  author: "Jun Ye",
  license: "MIT",
  bugs: {
    url: "https://github.com/51breeze/es-transform/issues"
  },
  homepage: "https://github.com/51breeze/es-transform#readme",
  dependencies: {
    easescript: "latest",
    "glob-path": "latest",
    lodash: "^4.17.21",
    "source-map": "^0.7.4"
  },
  devDependencies: {
    easescript: "latest",
    "easescript-cli": "^0.1.3",
    esbuild: "^0.24.0",
    "esbuild-plugin-copy": "^2.1.1",
    jasmine: "^3.10.0"
  }
};

// lib/core/Polyfill.js
var import_fs4 = __toESM(require("fs"));
var import_path5 = __toESM(require("path"));
var TAGS_REGEXP = /(?:[\r\n]+|^)\/\/\/(?:\s+)?<(references|namespaces|export|import)\s+(.*?)\/>/g;
var ATTRS_REGEXP = /(\w+)(?:[\s+]?=[\s+]?([\'\"])([^\2]*?)\2)?/g;
var _createVModule = createVModule;
function parsePolyfillModule(file, createVModule2) {
  let content = import_fs4.default.readFileSync(file).toString();
  let references = [];
  let namespace = "";
  let requires = [];
  let exportName = null;
  content = content.replace(TAGS_REGEXP, function(a, b, c) {
    const items = c.matchAll(ATTRS_REGEXP);
    const attr = {};
    if (items) {
      for (let item of items) {
        let [, key, , value] = item;
        if (value) value = value.trim();
        attr[key] = value || true;
      }
    }
    switch (b) {
      case "references":
        if (attr["from"]) {
          references.push({
            from: attr["from"],
            local: attr["name"]
          });
        }
        break;
      case "namespaces":
        if (attr["name"]) {
          namespace = attr["name"];
        }
        break;
      case "export":
        if (attr["name"]) {
          exportName = attr["name"];
        }
        break;
      case "import":
        if (attr["from"]) {
          requires.push({
            local: attr["name"],
            from: attr["from"],
            imported: !!attr["imported"]
          });
        }
        break;
    }
    return "";
  });
  const info = import_path5.default.parse(file);
  let id = namespace ? `${namespace}.${info.name}` : info.name;
  let vm = createVModule2(id);
  requires.forEach((item) => {
    const local = item.local ? item.local : import_path5.default.parse(item.from).name;
    vm.addImport(item.from, local, item.imported);
  });
  references.forEach((item) => {
    const from = String(item.from);
    const local = item.local ? item.local : from.split(".").pop();
    vm.addReference(from, local);
  });
  if (exportName) {
    vm.addExport("default", exportName);
  } else {
    vm.addExport("default", vm.id);
  }
  vm.setContent(content);
}
function createPolyfillModule(dirname) {
  if (!import_path5.default.isAbsolute(dirname)) {
    dirname = import_path5.default.join(__dirname, dirname);
  }
  if (!import_fs4.default.existsSync(dirname)) {
    throw new Error(`Polyfills directory does not exists. on '${dirname}'`);
  }
  import_fs4.default.readdirSync(dirname).forEach((filename) => {
    const filepath2 = import_path5.default.join(dirname, filename);
    if (import_fs4.default.statSync(filepath2).isFile()) {
      parsePolyfillModule(filepath2, _createVModule);
    } else if (import_fs4.default.statSync(filepath2).isDirectory()) {
      createPolyfillModule(filepath2);
    }
  });
}

// lib/index.js
var defaultConfig = {
  webpack: false,
  module: "esm",
  emitFile: false,
  outext: ".js",
  strict: true,
  babel: false,
  ns: "core",
  hot: false,
  sourceMaps: false,
  routePathWithNamespace: {
    server: false,
    client: true
  },
  mode: "production",
  metadata: {
    env: {
      NODE_ENV: "production"
    },
    versions: {}
  },
  transform: {
    createToken: null,
    tokens: null
  },
  formation: {
    route: null
  },
  loaders: {
    enable: true,
    rules: [
      {
        test: [".css", ".sass", ".less", ".postcss", ".scss", ".gif", ".svg", ".png", ".jpg", ".jpeg"],
        loader: createLoader()
      }
    ]
  },
  context: {
    include: null,
    exclude: null,
    only: false
  },
  hooks: {
    createJSXAttrValue: ({ ctx: ctx2, type, jsxAttrNode, descriptor, annotation }) => null
  },
  esx: {
    enable: true,
    raw: false,
    handle: "createVNode",
    complete: {
      //['for','each','condition','*']
      keys: false
    },
    delimit: {
      expression: {
        left: "{{",
        right: "}}"
      },
      attrs: {
        left: '"',
        right: '"'
      }
    },
    component: {
      prefix: "",
      resolve: null
    }
  },
  privateChain: true,
  resolve: {
    imports: {},
    folders: {
      "*.css": "assets"
    }
  },
  dependences: {
    externals: [],
    includes: [],
    excludes: []
  }
};
function getOptions(options = {}) {
  return (0, import_merge.default)(
    {},
    defaultConfig,
    options
  );
}
var initialized = false;
function plugin(options = {}) {
  if (!initialized) {
    initialized = true;
    createPolyfillModule(import_path6.default.join(__dirname, "./polyfills"));
  }
  return new Plugin_default(
    package_default.name,
    package_default.version,
    getOptions(options)
  );
}
var lib_default = plugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getOptions,
  plugin
});
