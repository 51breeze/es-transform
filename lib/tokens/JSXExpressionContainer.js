import Namespace from 'easescript/lib/core/Namespace';
import Utils from 'easescript/lib/core/Utils'
export default function(ctx, stack){
    let node = ctx.createToken( stack.expression );
    if(node){
        let maybeIsArrayNodes = false;
        let type = stack.expression.type();
        if(!type || !Utils.isScalar(type)){
            maybeIsArrayNodes = true;
            if(type){
                let origin = Utils.getOriginType(type)
                if(origin && Utils.isModule(origin)){
                    if(origin.isWebComponent || Namespace.globals.get('VNode').is(origin)){
                        maybeIsArrayNodes = false;
                    }
                }
            }
        }
        node.maybeIsArrayNodes = maybeIsArrayNodes;
    }
    return node;
}