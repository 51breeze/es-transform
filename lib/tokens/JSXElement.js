import {createElement} from '../core/ESX.js';
export default function JSXElement(ctx, stack){
    if(!ctx.options.esx.enable)return;
    return createElement(ctx, stack)
}