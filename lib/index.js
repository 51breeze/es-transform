import merge from "lodash/merge";
import {Plugin, execute, getAllPlugin} from "./core/Plugin";
import pkg from "../package.json";
const defaultConfig ={
    webpack:{
        enable:false,
        inlineStyleLoader:[]
    },
    //esm cjs
    module:'esm',
    emitFile:false,
    outExt:'.js',
    outDir:'.output',
    publicDir:'asstes',
    strict:true,
    babel:false,
    sourceMaps:false,
    hot:false,
    routePathWithNamespace:true,
    mode:process.env.NODE_ENV || 'production',
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
        //(path, {isRouterModule,path,complete, action, params, defaultValue, method, module})=>path
        routePathFormat:null,
        //(name, optional=false)=>optional ? `:${name}?` : `:${name}`
        routeParamFormat:null
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
        handleName:'createVNode',
        handleIsThis:false,
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
    comments:false,
    manifests:{
        comments:false,
        annotations:false,
    },
    privateChain:true,
    resolve:{
        imports:{},
        folders:{}
    },
    dependency:{
        externals:[],
        includes:[],
        excludes:[],
    }
}

function getOptions(...options){
    return merge(
        {},
        defaultConfig,
        ...options
    )
}

function plugin(options={}){
    return new Plugin(
        pkg.name,
        pkg.version,
        getOptions(options)
    )
}

export {getOptions, Plugin, getAllPlugin, execute};
export default plugin;