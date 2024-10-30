package;

import com.TestInterface;

import com.Skin;

public class Person<T> extends Object implements TestInterface , Add
{

    public var addressName:string = `the Person properyt "addressName"`;

    private var _name:string = '';

    private var _type:T = null;

    constructor( name:string ){
        super();
        this._name = name;
        when( Runtime(server) ){
            const skin = new Skin()
        }
    }

    get target(){
        return this;
    }

    public setType(a:T):T{
        this._type = a;
         var _private = 1;
        return a;
    }

    @Post('method');
    method( name:string, age?:int):any
    {
        var str:string[] = ["a","1"];
        var b:[string, [string,int] ] = ["", ["1",1] ];

        var cc:[number] = [1];
        var x:[number,int,string,...object] = [1,1,'2222',[{}]];

        b.push( '1' )
        b.push( ['1',1] )

       var c:int = -1968;
       var bs:float = 22.366
       var bssd:number = -22.366
        this.target.address();
        return "sssss";
    }


    public get name():string{
        return this._name;
    }

    public set name(val:string){
        this._name = val;
    }

    avg<T extends string,B>(a:T,b?:B):T{
        return a;
    }

    private address(data?){
        
        //const res =  @Http(Person, method, params={name:'sss', ag:this.name, avg:this.avg(1) }, data=data )

    }

    protected addressNamesss(){
        arguments.length
    }

    testWhen(){
        when( Env(NODE_ENV, development) ){
            return 1;
        }
        return 2;
     }

}


<style>

body{
    background: red;
}


</style>

    

