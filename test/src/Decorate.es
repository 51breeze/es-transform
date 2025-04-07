import com.Decorator;

import Fun, {checkParam} from 'com/Fun.es';

@Decorator('name', '张三', 30)
class Decorate {

    private age:int;
    private name:string;

    @Fun
    address:string;
    
    constructor(
        name?:string,
        age?:int 
    ){
        this.age = age;
        this.name = name;
    }

    @Fun
    person(@checkParam name:string){
       this.name = name;
       return name;
    }

    getInfo(){
        return {age, name};
    }

}