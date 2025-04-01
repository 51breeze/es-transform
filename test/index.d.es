package web.components{

    import Component from 'webComponent'
    @WebComponent
    declare class Component {
        static getAttribute<T>(target:Component,name:string):T;
        static getPolyfillValue(value:any, name:string, classModule:class<any>):any;
        public constructor(props?:{[key:string]:any});
        protected onInitialized():void;
        protected onBeforeMount():void;
        protected onMounted():void;
        protected onBeforeUpdate():void;
        protected onUpdated():void;
        protected onBeforeUnmount():void;
        protected onUnmounted():void;
        protected onActivated():void;
        protected onDeactivated():void;
        protected onErrorCaptured():void;
        protected receivePropValue<T>(value:T,name:string):T;
        protected beforeReceiveProp(value:any,name:string):boolean;
        protected render():VNode | Component;
        public get parent():Component;
        public get children():Component[];
        public get element():any;
        public getParentComponent( filter:boolean | (child?:Component)=>boolean ):Component;
        public getConfig():object;
        public slot( name:string , scope?:boolean, called?:boolean, params?:object ):VNode|Component[];
        public createVNode(name:string|Component,data?:VNodeDataConfig,children?:VNode|Component[]):VNode;
        public getRefs<T=NodeElementType | NodeElementType[]>(name:string):T;
        public provide(name:string, provider:()=>any):void;
        public inject<T=any>(name:string, from?:string, defaultValue?:T):T;
        public forceUpdate();
        public on(type: string, listener:(...args)=>void):void;
        public off(type: string, listener?:(...args)=>void):void;
        public emit(type: string, ...args?:any[]):void;
        public watch(name: string, callback:(uewVlaue?,oldValue?)=>void, options?:boolean | {immediate?:boolean,deep?:boolean}):void;
        public reactive<T>(name:string, value?:T, initValue?:any):T;
        public observable<T extends object>(target:T):T;
        public nextTick(callback:()=>void):void;
        /**
        * 获取原始对象中的属性
        */
        public getAttribute<T>(name:string):T;
    }

    declare type NodeElementType = Component;
    
    declare type VNodeDataConfig = {
        props?:{},
        data?:()=>{},
        on?:{},
        style?:{},
        className?:string,
        ref?:string
    };
}
 
 

declare interface Matchers {
       
    message(): any;

    /**
        * Expect the actual value to be `===` to the expected value.
        *
        * @param expected The expected value to compare against.
        * @param expectationFailOutput
        * @example
        * expect(thing).toBe(realThing);
        */
    toBe(expected:any, expectationFailOutput?:any): boolean;

    /**
        * Expect the actual value to be equal to the expected, using deep equality comparison.
        * @param expected Expected value.
        * @param expectationFailOutput
        * @example
        * expect(bigObject).toEqual({ "foo": ['bar', 'baz'] });
        */
    toEqual(expected:any, expectationFailOutput?:any): boolean;

    /**
        * Expect the actual value to match a regular expression.
        * @param expected Value to look for in the string.
        * @example
        * expect("my string").toMatch(/string$/);
        * expect("other string").toMatch("her");
        */
    toMatch(expected: string | RegExp, expectationFailOutput?:any): boolean;

    toBeDefined(expectationFailOutput?:any): boolean;
    toBeUndefined(expectationFailOutput?:any): boolean;
    toBeNull(expectationFailOutput?:any):boolean;
    toBeNaN(): boolean;
    toBeTruthy(expectationFailOutput?:any): boolean;
    toBeFalsy(expectationFailOutput?:any): boolean;
    toBeTrue(): boolean;
    toBeFalse(): boolean;
    toHaveBeenCalled(): boolean;
    toHaveBeenCalledBefore(expected): boolean;
    toHaveBeenCalledWith(...params:any[]): boolean;
    toHaveBeenCalledOnceWith(...params:any[]): boolean;
    toHaveBeenCalledTimes(expected: number): boolean;
    toContain(expected: any, expectationFailOutput?:any): boolean;
    toBeLessThan(expected: number, expectationFailOutput?:any): boolean;
    toBeLessThanOrEqual(expected: number, expectationFailOutput?:any): boolean;
    toBeGreaterThan(expected: number, expectationFailOutput?:any): boolean;
    toBeGreaterThanOrEqual(expected: number, expectationFailOutput?:any): boolean;
    toBeCloseTo(expected: number, precision:any, expectationFailOutput?:any): boolean;
    toThrow(expected: any): boolean;
    toThrowError(expected, message:string | RegExp): boolean;
    toThrowMatching(predicate: (thrown: any) => boolean): boolean;
    toBeNegativeInfinity(expectationFailOutput?:any): boolean;
    toBePositiveInfinity(expectationFailOutput?:any): boolean;
    toBeInstanceOf(expected:class): boolean;

    /**
        * Expect the actual value to be a DOM element that has the expected class.
        * @since 3.0.0
        * @param expected The class name to test for.
        * @example
        * var el = document.createElement('div');
        * el.className = 'foo bar baz';
        * expect(el).toHaveClass('bar');
        */
    toHaveClass(expected: string, expectationFailOutput?:any): boolean;

    /**
        * Expect the actual size to be equal to the expected, using array-like
        * length or object keys size.
        * @since 3.6.0
        * @param expected The expected size
        * @example
        * array = [1,2];
        * expect(array).toHaveSize(2);
        */
    toHaveSize(expected: number): boolean;

    /**
        * Add some context for an expect.
        * @param message Additional context to show when the matcher fails
        */
    withContext(message: string): Matchers;

    /**
        * Invert the matcher following this expect.
        */
    var not: Matchers;
}


declare function it(title:string,callback:(done?:()=>void)=>void):int;
declare function describe(title:string,callback:(done?:()=>void)=>void):void;

declare function expect(result:any):Matchers;

declare class jasmine {
   public static var DEFAULT_TIMEOUT_INTERVAL:int
}

declare interface Window {

    expectApi:{
        call:()=>void
        
    }

}



declare interface ClassDescriptorConfig{
    type:number
    class:class<any>
    className:string
    namespace:string
    dynamic:boolean
    isStatic:boolean
    privateKey:string
    implements:class<any>[]
    inherit:class<any>
    members:{[key:string]:any}
    methods:{[key:string]:any}
}


declare interface ClassMemberDescriptorConfig{
    type?:number
    class?:class<any>
    isStatic?:boolean
    privateKey?:string
    modifier?:number
    enumerable:boolean
    writable:boolean
    configurable:boolean
    //get:Function
    //set:Function
    value:any
    method?:Function
}

declare Reflect{
    static apply<T>(fun:()=>T, thisArgument?:object, argumentsList?:any[]):T;
    static call<T>(scope:class<any>,target:object,propertyKey:string,argumentsList?:any[],thisArgument?:object):T;
    static construct<T>(classTarget:class<T>, args?:any[]):T;
    static deleteProperty<T=object>(target:T, propertyKey:string):boolean;
    static has<T>(target:T, propertyKey:string):boolean;
    static get<T>(scope:class<any>,target:object,propertyKey:string,thisArgument?:object):T;
    static set<T>(scope:class<any>,target:object,propertyKey:string,value:any,thisArgument?:object):T;
    static incre(scope:class<any>,target:object,propertyKey:string,flag?:boolean):number;
    static decre(scope:class<any>,target:object,propertyKey:string,flag?:boolean):number;
    static getDescriptor(target:object):ClassDescriptorConfig | null;
    static getDescriptor(target:object, propertyKey?:string):null | ClassMemberDescriptorConfig | ClassMemberDescriptorConfig[];
}