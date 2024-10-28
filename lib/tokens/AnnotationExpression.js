import * as Common from '../core/Common'
export default function(ctx,stack){
    const name = stack.getLowerCaseName();
    switch( name ){
        case 'http':{
            return Common.createHttpAnnotationNode(ctx,stack) || ctx.createLiteral(null);
        }
        case 'router':{
            return Common.createRouterAnnotationNode(ctx,stack) || ctx.createLiteral(null);
        }
        case 'url':{
            return Common.createUrlAnnotationNode(ctx, stack)
        }
        case 'env':{
           return Common.createEnvAnnotationNode(ctx, stack)
        }
        case 'readfile' :{
            return Common.createReadfileAnnotationNode(ctx, stack) || ctx.createLiteral(null);
        }
        default :
            ctx.error( `The '${name}' annotations is not supported.` );
    }
    return null;
};