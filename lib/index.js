import merge from "lodash/merge";
import Plugin from "./core/Plugin";
import pkg from "../package.json";
const defaultConfig ={
    webpack:false,
    module:'esm',
    emitFile:false,
    outext:'.js',
    strict:true,
    babel:false,
    hot:false,
    sourceMaps:false,
    routePathWithNamespace:{
        server:false,
        client:true,
    },
    mode:'production',
    metadata:{
        env:{
            NODE_ENV:process.env.NODE_ENV || 'production'
        },
        versions:{}
    },
    transform:{
        createToken:null,
        tokens:null
    },
    formation:{
        route:null
    },
    context:{
        include:null,
        exclude:null,
        only:false
    },
    hooks:{
        createJSXAttrValue:({ctx, type, jsxAttrNode, descriptor, annotation})=>null
    },
    esx:{
        enable:true,
        raw:false,
        handle:'createVNode',
        complete:{
            //['for','each','condition','*']
            keys:false
        },
        delimit:{
            expression:{
                left:'{{',
                right:'}}'
            },
            attrs:{
                left:'"',
                right:'"'
            }
        },
        component:{
            prefix:'',
            resolve:null
        }
    },
    privateChain:true,
    resolve:{
        imports:{},
        folders:{}
    },
    dependences:{
        externals:[],
        includes:[],
        excludes:[],
    }
}

function getOptions(options={}){
    return merge(
        {},
        defaultConfig,
        options
    )
}

function plugin(options={}){
    return new Plugin(
        pkg.name,
        pkg.version,
        getOptions(options)
    )
}

export {getOptions, Plugin};
export default plugin;