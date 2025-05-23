package com{
    public interface TestInterface {
        get name():string
        set name(val:string):void
        avg<T extends string,B>(a:T,b?:B):T
        method( name:string, age:int):any
        [keys:string]:string
    }

    public interface TestInterface2 {
      
    }
}