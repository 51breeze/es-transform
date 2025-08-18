import Utils from "easescript/lib/core/Utils";

function createNode(ctx, item, isKey=false, toLower=false, type=null){
    if(!item)return null;
    if(type ==='enum'){
        if(item.isIdentifier || item.isMemberExpression){
            const type = item.type()
            const list = [];
            const make = (type) =>{
                if(!type)return;
                if(type.isIntersectionType){
                    make(type.left.type());
                    make(type.right.type());
                }else if(type.isUnionType){
                    type.elements.forEach(item=>make(item.type()))
                }else if(type.isLiteralType && type.value != null){
                    list.push(ctx.createLiteral(String(type.value)))
                }else if(Utils.isModule(type) && type.isEnum){
                    Array.from(type.descriptors.keys()).forEach( key=>{
                        const items = type.descriptors.get(key)
                        const item = items.find(item=>item.isEnumProperty)
                        if(item){
                            list.push(ctx.createLiteral(String(item.init.value())))
                        }
                    })
                }else{
                    item.error(10115, item.value())
                }
            }
            make(type);
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