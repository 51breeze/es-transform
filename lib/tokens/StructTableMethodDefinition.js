import Namespace from 'easescript/lib/core/Namespace'
function createNode(ctx, item, isKey=false, toLower=false, type=null){
    if(!item)return null;
    if(type ==='enum'){
        if(item.isIdentifier || item.isMemberExpression){
            const type =Namespace.globals.get(item.value())
            const list = []
            if(type && type.isModule && type.isEnum){
                Array.from(type.descriptors.keys()).forEach( key=>{
                    const items = type.descriptors.get(key)
                    const item = items.find(item=>item.isEnumProperty)
                    if(item){
                        list.push(ctx.createLiteral(item.init.value()))
                    }
                })
            }
            return list;
        }
    }
    if(item.isIdentifier){
        let value = item.value();
        if(toLower)value = value.toLowerCase();
        return ctx.createIdentifier(isKey? '`'+value+'`' : value, item);
    }
    return  item.isLiteral ? ctx.createLiteral(item.value()) : ctx.createToken(item);
}
export default function(ctx, stack){
    const node = ctx.createNode(stack);
    const name = stack.key.value().toLowerCase();
    if(name ==='text' || name==='longtext' || name==='tinytext' || name==='mediumtext'){
        return ctx.createIdentifier(stack.key.value(), stack.key);
    }
    const key = stack.key.isMemberExpression ? stack.key.property : stack.key;
    node.key = createNode(ctx, key, false);
    const isKey = stack.parentStack.isStructTableKeyDefinition;
    node.params = (stack.params||[]).map(item=>createNode(ctx, item, isKey, false, name)).flat().filter(Boolean)
    return node;
};