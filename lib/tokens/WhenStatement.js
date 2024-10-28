import * as Common from '../core/Common'
export default function(ctx,stack){
    const check = (stack)=>{
        if(stack.isLogicalExpression){
            if(stack.isAndOperator){
                return check(stack.left) && check(stack.right)
            }else{
                return check(stack.left) || check(stack.right)
            }
        }else if(!stack.isCallExpression){
            throw new Error(`Macro condition must is an call expression`)
        }
        const name = stack.value();
        const lower = name.toLowerCase();
        const argument = Common.parseMacroMethodArguments(stack.arguments, lower)
        if(!argument){
            ctx.error(`The '${name}' macro is not supported`, stack)
            return;
        }
        switch( lower ){
            case 'runtime' :
                return Common.isRuntime(argument.value, ctx.options.metadata) === argument.expect;
            case 'syntax' :
                return Common.isSyntax(ctx.plugin.name, argument.value) === argument.expect;
            case 'env' :{
                if(argument.name && argument.value){
                    return Common.isEnv(argument.name, argument.value, ctx.options) === argument.expect;
                }else{
                    ctx.error(`Missing name or value arguments. the '${name}' annotations.`, stack);
                }
            }
            break;
            case 'version' :{
                if(argument.name && argument.version){
                    let versions = ctx.options.metadata.versions || {}
                    let left = argument.name === ctx.plugin.name ? ctx.plugin.version : versions[argument.name];
                    let right = argument.version;
                    return Common.compareVersion(left, right, argument.operator) === argument.expect
                }else{
                    ctx.error(`Missing name or value arguments. the '${name}' annotations.`, stack);
                }
            }
            break;
            default:
        }
    }
    const node = ctx.createToken( check(stack.condition) ? stack.consequent : stack.alternate );
    node && (node.isWhenStatement = true);
    return node;
}