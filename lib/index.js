import path from 'path';
import merge from "lodash/merge";
import Plugin from "./core/Plugin";
import pkg from "../package.json";
import {createPolyfillModule} from './core/Polyfill';
const defaultConfig ={
    webpack:false,
    module:'esm',
    emitFile:false,
    outext:'.js',
    strict:true,
    babel:false,
    ns:'core',
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

let initialized = false;
function plugin(options={}){
    if(!initialized){
        initialized = true;
        createPolyfillModule(path.join(__dirname, "./polyfills"))
    }
    return new Plugin(
        pkg.name,
        pkg.version,
        getOptions(options)
    )
}

export {getOptions, plugin};
export default plugin;