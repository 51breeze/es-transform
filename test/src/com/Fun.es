function addParam(target, key, context){
    if(arguments.length != 3){
        throw new Error('addParam can only bound on method')
    }
    let data = context.data || (context.data={});
    let args:number[] = data.args;
    if(!args || !args.length)return;
    args.sort((a,b)=>a-b);
    let fn =  target.value;
    target.value = function checkParam(){
        let _args = Array.from(arguments);
        args.forEach((val,index)=>{
            if(_args[index]==null){
                _args[index] = `checkParam(${index}) 注入的默认参数`
            }else{
                _args[index] = `checkParam(${index}) 拦截的参数(${_args[index]})`
            }
        });
        return Reflect.apply(fn, this, _args)
    }
    
}

function checkParam(target, key, index, context){
    let data = context.data || (context.data={});
    let args:number[] = data.args || (data.args = []);
    args.push(index); 
    if(context.decorators[0] !== addParam){
        console.log(  context.decorators  )
        throw new Error('需要在方法上绑定 addParam 注解符')
    }
}

export default addParam;

export {checkParam};
