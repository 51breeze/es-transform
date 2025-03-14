require("./asstes/assets/style.js");
const Class = require("./Class.js");
const config = Class.getExportDefault(require("./config.js"));
const {name,child_name,child_config,name:php} = require("./config.js");
const System = require("./System.js");
const Person = require("./Person.js");
const TestInterface = require("./com/TestInterface.js");
const Reflect = require("./Reflect.js");
const EventDispatcher = require("./EventDispatcher.js");
const Event = require("./Event.js");
const Param = require("./unit/Param.js");
const Types = require("./Types.js");
const _private0 = Class.getKeySymbols("922d4a80");
/**
* Test a class
* @param name string
**/
/**
* a constructor method
**/
function Test(name,age){
    Person.call(this,name);
    Object.defineProperty(this,_private0,{
        value:{
            bbss:'bbss',
            age:40,
            _increValue:0,
            len:5,
            currentIndex:0
        }
    });
    Person.prototype.setType.call(this,'1');
    const map = new Map();
    map.set('name',[]);
    map.forEach((item)=>{});
}
Class.creator(Test,{
    m:513,
    name:"Test",
    dynamic:true,
    private:_private0,
    imps:[TestInterface],
    inherit:Person,
    methods:{
        getClass:{
            m:800,
            /**
            *  返回一个类的引用
            **/
            value:function getClass(){
                var a = Test;
                var buname = {
                    a:1
                }
                buname.test=a;
                buname.person=Person;
                var {test:test=a} = buname;
                expect(Test).toBe(test);
                expect(Test).toBe(Reflect.call(Test,test,"getClassObject",[]));
                expect(Test).toBe(Reflect.call(Test,test,'getClassObject'));
                var [aa,bb=9] = [1,6];
                expect(aa).toBe(1);
                expect(bb).toBe(6);
                return buname;
            }
        },
        getClassObject:{
            m:800,
            value:function getClassObject(){
                var a = Test;
                var b = {
                    test:a
                }
                b.person=Person;
                return b.test;
            }
        },
        getObject:{
            m:800,
            value:function getObject(){
                return new Test('1','2');
            }
        },
        uuName:{
            m:576,
            enumerable:true,
            /**
            * @public
            * the is static getter
            **/
            get:function uuName(){
                return 'uuName';
            }
        },
        iiu:{
            m:2312,
            writable:true,
            /**
            * @private
            * the is class type.
            **/
            value:Test
        },
        main:{
            m:800,
            value:function main(){
                describe('Test',()=>{
                    (new Test('Test')).start();
                });
            }
        }
    },
    members:{
        bbss:{
            m:2056,
            writable:true
        },
        age:{
            m:2064
        },
        positionName:{
            m:544,
            value:function positionName(){
                return 'postion';
            }
        },
        start:{
            m:544,
            value:function start(){
                it(`base`,()=>{
                    var str = '';
                    str+='a';
                    str+='c';
                    expect('ac').toBe(str);
                    expect(System.is(this,TestInterface)).toBeTrue();
                    expect('function').toBe(typeof this['positionName']);
                    expect('postion').toBe(this.positionName());
                    let isDev = false;
                    isDev=true;
                    expect(true).toBe(isDev);
                });
                it(`static get uuName accessor`,()=>{
                    expect(Test.getClassObject().uuName).toBe("uuName");
                    expect({
                        env:'prod'
                    }).toEqual(config);
                    expect('php').toBe(name);
                    expect('php').toBe(child_name);
                    expect({
                        'default':{
                            env:'prod'
                        },
                        'name':'php'
                    }).toEqual(child_config);
                });
                it(`'this.age' should is true`,()=>{
                    expect(this[_private0].age).toBe(40);
                });
                it(`'System.className' should is true`,()=>{
                    expect('Test').toBe(System.getQualifiedClassName(Test));
                });
                it(`'this instanceof Person' should is true`,()=>{
                    expect(this instanceof Person).toBeTrue();
                });
                it(`"this is Person" should is true`,()=>{
                    expect(System.is(this,Person)).toBeTrue();
                });
                it(`'this instanceof TestInterface' should is false`,()=>{
                    expect(this instanceof TestInterface).toBeFalse();
                });
                it(`'this is TestInterface' should is true`,()=>{
                    expect(System.is(this,TestInterface)).toBeTrue();
                });
                it(`'Test.getClass().test' should is Test`,()=>{
                    expect(Test.getClass().test).toBe(Test);
                });
                it(`'Test.getClass().person' should is Person`,()=>{
                    expect(Test.getClass().person).toBe(Person);
                });
                it(`'new (Test.getClass().person)(\'\')' should is true`,()=>{
                    const o = new (Test.getClass().person)('name');
                    expect(o instanceof Person).toBeTrue();
                });
                it(`'this.bbss="666666"' should is '666666' `,()=>{
                    expect(this[_private0].bbss).toBe('bbss');
                    this[_private0].bbss="666666";
                    expect(this[_private0].bbss).toBe('666666');
                });
                it(`test name accessor `,()=>{
                    expect(this.name).toBe('Test');
                    this.name="test name";
                    expect(this.name).toBe('test name');
                });
                it(`'var bsp = ()=>{}' should is '()=>this' `,()=>{
                    var bsp = ()=>{
                        return this;
                    }
                    expect(bsp()).toBe(this);
                });
                it(`once.two.three should is this or object `,()=>{
                    var bsp = (flag)=>{
                        return this;
                    }
                    var obj = {}
                    bsp=(flag)=>{
                        if(flag){
                            return obj;
                        }else{
                            return this;
                        }
                    }
                    var obds = 1;
                    const three = bsp(false);
                    var once = {
                        two:{
                            three:three,
                            four:bsp
                        }
                    }
                    expect(once.two.three).toBe(this);
                    expect(once.two.four(true)).toBe(obj);
                    once[obds];
                });
                it(`/\d+/.test( "123" ) should is true `,()=>{
                    expect(/\d+/.test("123")).toBe(true);
                    expect(/^\d+/.test(" 123")).toBe(false);
                });
                it("test rest params",()=>{
                    const res = this.restFun(1,"s","test");
                    expect(res).toEqual([1,"s","test"]);
                });
                it("test Event Dispatcher",()=>{
                    const d = new EventDispatcher();
                    d.addEventListener('eee',(e)=>{
                        e.data={
                            name:'event'
                        }
                    });
                    const event = new Event('eee');
                    d.dispatchEvent(event);
                    expect({
                        name:'event'
                    }).toEqual(event.data);
                });
                it("test System.getQualifiedObjectName",()=>{
                    expect('Test').toEqual(System.getQualifiedObjectName(this));
                    expect('String').toEqual(System.getQualifiedObjectName(new String('')));
                    expect('Test').toEqual(System.getQualifiedClassName(Test));
                    expect('[Class Test]').toEqual(Test + '');
                });
                it("private property",()=>{
                    var _bss = this[_private0].bbss;
                    var bs = _bss;
                    expect(_bss === this[_private0].bbss).toEqual(true);
                    _bss=_bss + 'name';
                    this[_private0].bbss=_bss;
                    expect(_bss === this[_private0].bbss).toEqual(true);
                    this[_private0].bbss=bs;
                    expect({
                        bbss:bs
                    }).toEqual({
                        bbss:this[_private0].bbss
                    });
                });
                const objs = {
                    setup:async function(){}
                }
                objs.setup();
                this.testEnumerableProperty();
                this.testComputeProperty();
                this.testLabel();
                this.testEnum();
                this.testIterator();
                this.testGenerics();
                this.testAwait();
                this.testTuple();
                this.next();
                this.testAssignment();
                var param = new Param();
                param.start();
                this.chian();
            }
        },
        testAssignment:{
            m:2080,
            value:function testAssignment(){
                it(`testAssignment `,()=>{
                    let init = 1;
                    init+=1;
                    expect(2).toEqual(init);
                    init*=2;
                    expect(4).toEqual(init);
                    init/=2;
                    expect(2).toEqual(init);
                    init-=1;
                    expect(1).toEqual(init);
                    init<<=1;
                    expect(2).toEqual(init);
                    init>>=1;
                    init%=1;
                    expect(0).toEqual(init);
                    init++;
                    expect(1).toEqual(init);
                    --init;
                    expect(0).toEqual(init);
                    var data = {}
                    Reflect.set(Test,data,"init",1);
                    Reflect.set(Test,data,"init",Reflect.get(Test,data,"init") + 1);
                    expect(2).toEqual(Reflect.get(Test,data,"init"));
                    Reflect.set(Test,data,"init",Reflect.get(Test,data,"init") * 2);
                    expect(4).toEqual(Reflect.get(Test,data,"init"));
                    Reflect.set(Test,data,"init",Reflect.get(Test,data,"init") / 2);
                    expect(2).toEqual(Reflect.get(Test,data,"init"));
                    Reflect.set(Test,data,"init",Reflect.get(Test,data,"init") - 1);
                    expect(1).toEqual(Reflect.get(Test,data,"init"));
                    Reflect.set(Test,data,"init",Reflect.get(Test,data,"init") << 1);
                    expect(2).toEqual(Reflect.get(Test,data,"init"));
                    Reflect.set(Test,data,"init",Reflect.get(Test,data,"init") >> 1);
                    Reflect.set(Test,data,"init",Reflect.get(Test,data,"init") % 1);
                    expect(0).toEqual(Reflect.get(Test,data,"init"));
                    Reflect.incre(Test,data,"init",false);
                    expect(1).toEqual(Reflect.get(Test,data,"init"));
                    var res = Reflect.decre(Test,data,"init",true);
                    expect(1).toEqual(res);
                    expect(0).toEqual(Reflect.get(Test,data,"init"));
                    this.increValue++;
                    expect(1).toEqual(this.increValue);
                    var tar = this;
                    Reflect.incre(Test,tar,"increValue",false);
                    expect(2).toEqual(this.increValue);
                    const items6666 = [1,5,6];
                    const clone = [...items6666];
                    expect(items6666).toEqual(clone);
                });
            }
        },
        _increValue:{
            m:2056,
            writable:true
        },
        increValue:{
            m:2112,
            get:function increValue(){
                return this[_private0]._increValue;
            },
            set:function increValue(value){
                this[_private0]._increValue=value;
            }
        },
        testEnumerableProperty:{
            m:2080,
            value:function testEnumerableProperty(){
                it(`for( var name in this) should is this or object `,()=>{
                    var labels = ["name","data","target","addressName","iuuu",'dynamic','dynamicName'];
                    for(var key in this){
                        expect(key).toBe(labels[labels.indexOf(key)]);
                        expect(this[key]).toBe(this[key]);
                    }
                });
            }
        },
        testComputeProperty:{
            m:2080,
            value:function testComputeProperty(){
                var bname = "123";
                var o = {
                    [bname]:1,
                    "sssss":2,
                    uuu:{
                        [bname]:3
                    }
                }
                this['dynamicName']='name';
                it(`compute property should is true `,()=>{
                    expect(o[bname]).toBe(1);
                    expect(this['dynamicName']).toBe('name');
                    expect(o.uuu[bname]).toBe(3);
                    expect(o.uuu["123"]).toBe(3);
                    o["uuu"][bname]=true;
                    expect(o["uuu"][bname]).toBe(true);
                });
            }
        },
        testLabel:{
            m:2080,
            value:function testLabel(){
                var num = 0;
                start:
                for(var i = 0;i < 5;i++){
                    for(var j = 0;j < 5;j++){
                        if(i == 3 && j == 3){
                            break start;
                        }
                        num++;
                    }
                }
                it(`label for should is loop 18`,()=>{
                    expect(num).toBe(18);
                });
            }
        },
        testEnum:{
            m:2080,
            value:function testEnum(){
                var Type = (Type={},Type[Type["address"]=5]="address",Type[Type["name"]=6]="name",Type);
                const s = Types;
                const t = Type.address;
                const b = Types.ADDRESS;
                it(`Type local enum should is true`,()=>{
                    expect(t).toBe(5);
                    expect(Type.name).toBe(6);
                });
                it(`Type local enum should is true`,()=>{
                    expect(b).toBe(0);
                    expect(Types.NAME).toBe(1);
                });
                it(`enum module`,()=>{
                    expect('ADDRESS').toEqual(Types.valueOf(0)?.name);
                    let len = 0;
                    Types.values().forEach((item)=>{
                        len++;
                        expect(item).toEqual(Types.valueOf(item.value));
                    });
                    expect(len).toEqual(Types.values().length);
                    expect('地址').toEqual(Types.valueOf(0)?.label?.());
                });
            }
        },
        testIterator:{
            m:2080,
            value:function testIterator(){
                var array = [];
                for(var val,_v,_i=System.getIterator(this);_i && (_v=_i.next()) && !_v.done;){
                    val=_v.value;
                    array.push(val);
                }
                it(`impls iterator should`,()=>{
                    expect(5).toBe(array.length);
                    for(var i = 0;i < 5;i++){
                        expect(i).toBe(array[i]);
                    }
                    const obj = {
                        'name':'zh',
                        'address':666
                    }
                    const res = [];
                    for(const [key,value] of Object.entries(obj)){
                        res.push([key,value]);
                    }
                    expect([['name','zh'],['address',666]]).toEqual(res);
                    const obj2 = obj;
                    const res2 = [];
                    for(const [key,value] of Object.entries(obj2)){
                        res2.push([key,value]);
                    }
                    expect([['name','zh'],['address',666]]).toEqual(res2);
                });
            }
        },
        testGenerics:{
            m:2080,
            value:function testGenerics(){
                const ddee = this.map();
                const dd = ddee;
                var ccc = ddee.name({
                    name:1,
                    age:1
                },"123");
                var cccww = dd.name({
                    name:1,
                    age:30
                },666);
                var types = '333';
                var bds = {
                    name:123,
                    [types]:1
                }
                bds[types]=99;
                var Reflect = 555;
                it(`Generics should is true`,()=>{
                    expect(typeof this.avg("test")).toBe('string');
                    expect(ccc.name.toFixed(2)).toBe("1.00");
                    expect(cccww.age).toBe(30);
                    expect(ccc.name.toFixed(4)).toBe("1.0000");
                });
                it(`class Generics`,()=>{
                    let obj = this.getTestObject(true);
                    var bd = obj;
                    var bs = obj.getNamess(1);
                    expect(bs.toFixed(2)).toBe("1.00");
                    expect(bs.toFixed(1)).toBe("1.0");
                });
                var bsint = this.getTestGenerics('sssss');
                var bsstring = this.getTestGenerics("ssss",'age');
                var bd = bsstring;
                let obj = this.getTestObject(true);
                var bsddd = obj.getNamess(1);
                var sss = obj.getClassTestGenerics(1,1);
                var type = this;
                type instanceof Number;
                type instanceof Number;
                type;
                var bb = {
                    a:'',
                    b:1
                }
                var bc = 'label';
                var bj = 3;
                var bt = {
                    a:'sss',
                    b:99
                }
                var be = 'a';
                var bf = 'b';
                var bg = [];
                bg.push('b');
                var v12 = {}
                var v13 = v12[1];
                var v14 = [1];
                var v15 = v14[0];
                it('keyof',()=>{
                    this['dynamic']='[1]';
                    var v16 = this['dynamic'];
                    expect('[1]').toEqual(v16);
                    var bh = this.testKeyof(bt,'a');
                    var fs = this.testKeyof(bt,'b');
                    expect('sss').toEqual(bh);
                    expect(99).toEqual(fs);
                    var bfd = {
                        name:'6699'
                    }
                    var fdb = this.testKeyof(bfd,'name');
                    expect('6699').toEqual(fdb);
                    var getNamessFun = this.testKeyof(this,'getNamess');
                    expect(this.getNamess).toEqual(getNamessFun);
                    var bdfs4 = getNamessFun('sssss');
                });
                var b9 = function(name,callback){
                    var b = callback;
                    var n = b(1);
                    var v = callback(1);
                    return '';
                }
                it('keyof',()=>{
                    function tNames(){
                        return 1;
                    }
                    var b10 = tNames;
                    var b11 = b10();
                    expect(1).toEqual(1);
                    var bst9 = new Test('111','11111');
                    expect('111').toEqual(bst9.getNamess('111'));
                });
            }
        },
        testKeyof:{
            m:2080,
            value:function testKeyof(t,k){
                var Reflect = 555;
                var Reflect1 = 555;
                let obj = this.getTestObject(true);
                var bs = obj.getNamess(1);
                var _private = 666;
                return t[k];
            }
        },
        getClassTestGenerics:{
            m:2080,
            value:function getClassTestGenerics(name,age){
                var a = [age,name];
                return a;
            }
        },
        getTestGenerics:{
            m:2080,
            value:function getTestGenerics(name,age){
                var t = new Test('name',name);
                return age;
            }
        },
        getTestObject:{
            m:2080,
            value:function getTestObject(flag){
                const factor = ()=>{
                    const o = {
                        test:new Test('name',1),
                        name:'test'
                    }
                    return o.test;
                }
                var o = factor();
                return o;
            }
        },
        getNamess:{
            m:544,
            value:function getNamess(s){
                return s;
            }
        },
        testAwait:{
            m:2080,
            value:function testAwait(){
                it(`test Await`,(done)=>{
                    const res = this.loadRemoteData(1);
                    res.then((data)=>{
                        expect(Reflect.get(Test,data,0)).toEqual(['one',1]);
                        expect(Reflect.get(Test,data,1)).toEqual({
                            bss:['two',2],
                            cc:['three',3]
                        });
                        expect(Reflect.get(Test,data,2)).toEqual(['three',3]);
                        done();
                    });
                });
                it(`test for Await`,(done)=>{
                    const res = this.loadRemoteData(2);
                    res.then((data)=>{
                        expect(Reflect.get(Test,data,0)).toEqual(['0',0]);
                        expect(Reflect.get(Test,data,1)).toEqual(['1',1]);
                        expect(Reflect.get(Test,data,2)).toEqual(['2',2]);
                        expect(Reflect.get(Test,data,3)).toEqual(['3',3]);
                        expect(Reflect.get(Test,data,4)).toEqual(['4',4]);
                        done();
                    });
                });
                it(`test switch Await`,(done)=>{
                    const res = this.loadRemoteData(3);
                    res.then((data)=>{
                        expect(data).toEqual(['four',4]);
                        done();
                    });
                });
                it(`test switch and for Await`,(done)=>{
                    const res = this.loadRemoteData(4);
                    res.then((data)=>{
                        expect(data).toEqual([['five',5],['0',0],['1',1],['2',2],['3',3],['4',4]]);
                        done();
                    });
                });
                it(`test switch and for Await`,(done)=>{
                    const res = this.loadRemoteData(5,1);
                    res.then((data)=>{
                        expect(data).toEqual(['one-9999',1]);
                        done();
                    });
                });
                it(`test switch and for Await`,(done)=>{
                    const res = this.loadRemoteData(5,2);
                    res.then((data)=>{
                        expect(data).toEqual(['two-9999',2]);
                        done();
                    });
                });
                it(`test switch and for Await`,(done)=>{
                    const res = this.loadRemoteData(6,1);
                    res.then((data)=>{
                        expect(data).toEqual(['one-9999',1]);
                        done();
                    });
                });
                it(`test switch and for Await`,(done)=>{
                    const res = this.loadRemoteData(6,2);
                    res.then((data)=>{
                        expect(data).toEqual(['two-9999',2]);
                        done();
                    });
                });
                it(`test switch and for Await`,(done)=>{
                    const res = this.loadRemoteData3(1);
                    res.then((data)=>{
                        expect(data).toEqual(['one-9999',1]);
                        done();
                    });
                });
                it(`test switch and for Await`,(done)=>{
                    const res = this.loadRemoteData3(4);
                    res.then((data)=>{
                        expect(data).toEqual('Invalid index 4');
                        done();
                    });
                });
                Reflect.get(Test,this.getJson(),"name");
            }
        },
        getJson:{
            m:544,
            value:function getJson(){
                return {
                    name:123
                }
            }
        },
        testTuple:{
            m:544,
            value:function testTuple(){
                const data = this.method("end",9);
                it(`test tuple`,()=>{
                    expect(data).toEqual([['a','b'],[1],[1,1,'one'],['one',['one',1],'three','four',['end',9]]]);
                });
            }
        },
        len:{
            m:2064
        },
        currentIndex:{
            m:2056,
            writable:true
        },
        next:{
            m:544,
            value:function next(){
                if(!(this[_private0].currentIndex < this[_private0].len)){
                    return {
                        value:null,
                        done:true
                    }
                }
                const d = {
                    value:this[_private0].currentIndex++,
                    done:false
                }
                return d;
            }
        },
        rewind:{
            m:544,
            value:function rewind(){
                this[_private0].currentIndex=0;
            }
        },
        restFun:{
            m:544,
            value:function restFun(...types){
                return types;
            }
        },
        tetObject:{
            m:544,
            value:function tetObject(){
                var t = new Test('1',1);
                var b = t;
                var ii = {
                    bb:b
                }
                return ii.bb;
            }
        },
        loadData:{
            m:544,
            value:function loadData(){}
        },
        iuuu:{
            m:576,
            enumerable:true,
            get:function iuuu(){
                var ii = this.name;
                if(6){
                    ii=[];
                }
                ii=true;
                return ii;
            }
        },
        data:{
            m:576,
            enumerable:true,
            get:function data(){
                var b = [];
                if(4){
                    b=this.avg;
                }
                b=this.avg;
                const dd = ()=>{
                    var bs = new Promise((resolve,reject)=>{
                        setTimeout(()=>{
                            resolve([]);
                        },100);
                    });
                    return bs;
                }
                return b;
            }
        },
        fetchApi:{
            m:544,
            value:function fetchApi(name,data,delay){
                return new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        resolve([name,data]);
                    },delay);
                });
            }
        },
        loadRemoteData2:{
            m:544,
            value:async function loadRemoteData2(){
                return await this.fetchApi("one",1,800);
            }
        },
        loadRemoteData:{
            m:544,
            value:async function loadRemoteData(type,index=1){
                if(type === 5){
                    try{
                        return index == 1 ? await this.fetchApi("one-9999",1,800) : index == 2 ? ["two-9999",2] : await this.fetchApi("three-9999",3,800);
                    }catch(e){
                        console.log(e);
                    }
                }
                if(type === 6){
                    return index >= 2 ? index == 2 ? ["two-9999",2] : await this.fetchApi("three-9999",3,800) : await this.fetchApi("one-9999",1,800);
                }
                if(type === 1){
                    var a = await this.fetchApi("one",1,800);
                    var bs = {
                        bss:await this.fetchApi("two",2,500)
                    }
                    var c = await this.fetchApi("three",3,900);
                    bs.cc=c;
                    return [a,bs,c];
                }else{
                    var list = [];
                    switch(type){
                        case 3 :
                            const b = await this.fetchApi("four",4,300);
                            return b;
                        case 4 :
                            const bb = await this.fetchApi("five",5,1200);
                            list.push(bb);
                    }
                    for(var i = 0;i < 5;i++){
                        list.push(await this.fetchApi(i + '',i,100));
                    }
                    list.entries();
                    return list;
                }
            }
        },
        method:{
            m:544,
            value:function method(name,age){
                Person.prototype.method.call(this,name,age);
                var str = ["a","b"];
                var b = ["one",["one",1]];
                var cc = [1];
                var x = [1,1,'one'];
                b.push('three');
                b.push('four');
                b.push([name,age]);
                return [str,cc,x,b];
            }
        },
        name:{
            m:576,
            enumerable:true,
            get:function name(){
                return Class.callSuperGetter(Test,this,"name");
            },
            set:function name(value){
                Class.callSuperSetter(Test,this,"name",value);
            }
        },
        avg:{
            m:544,
            value:function avg(yy,bbc){
                var ii = ()=>1;
                var bb = ['1'];
                function name(i){
                    var b = i;
                    i.avg('');
                    i.method('',1);
                    return b;
                }
                const person = new Person('');
                name(person);
                const bbb = name(person);
                name(person);
                var dd = [1,1,"2222","66666","8888"];
                var [a1,a2,a3] = dd;
                if(a1 !== 1)
                return null;
                if(a3 !== "2222")
                return null;
                return yy;
            }
        },
        map:{
            m:544,
            value:function map(){
                const ddss = {
                    name:function(c,b){
                        var id = b;
                        return c;
                    }
                }
                return ddss;
            }
        },
        address:{
            m:2080,
            value:function address(){
                const dd = [];
                const bb = {
                    global:1,
                    private:1
                }
                dd.push(1);
                return dd;
            }
        },
        loadRemoteData3:{
            m:544,
            value:async function loadRemoteData3(index=1){
                if(index < 5){
                    try{
                        if(index == 4){
                            throw new Error(`Invalid index ${index}`);
                        }
                        return index == 1 ? await this.fetchApi("one-9999",1,800) : await this.fetchApi("two-9999",2,300);
                    }catch(e){
                        return e.message;
                    }finally{}
                }else{
                    return null;
                }
            }
        },
        chian:{
            m:544,
            value:function chian(){
                const obj = {
                    index:1,
                    test:function(){
                        return true;
                    },
                    child:{
                        1:'own',
                        name:'string',
                        child:{
                            name:'zh'
                        }
                    }
                }
                it(`test chian expression`,()=>{
                    expect(void 0).toBe(obj.child2?.name);
                    expect(void 0).toBe(obj.test2?.());
                    obj.index2??='index two';
                    expect('index two').toBe(obj.index2 ?? null);
                    expect(null).toBe(obj.index3 ?? null);
                    obj.index??=2;
                    expect(1).toBe(obj.index);
                    expect('zh').toBe(obj.child?.child?.name);
                    expect('zh').toBe(obj.child?.child?.name ?? 'null');
                    expect('null').toBe(obj.child?.chil?.name ?? 'null');
                    expect(void 0).toBe(obj.chil?.child?.name);
                    expect(false).toBe(obj.chil?.child?.name ?? false);
                    let x = 0;
                    expect(void 0).toBe(obj.chil?.[++x]);
                    expect(0).toBe(x);
                    expect('own').toBe(obj.child?.[++x]);
                    expect(1).toBe(x);
                    expect('own').toBe(obj.child?.[x++]);
                    expect(2).toBe(x);
                });
            }
        },
        [Symbol.iterator]:{
            m:544,
            value:function(){
                return this;
            }
        }
    }
});
Test.main();
const test = new Test('test');
describe('Test.externals',()=>{
    it(`externals expression`,()=>{
        expect('object').toEqual(typeof test.map());
        expect('php').toEqual(php);
        expect('Test').toEqual(System.getQualifiedObjectName(test));
        expect('Person').toEqual(System.getQualifiedClassName(Person));
    });
});
module.exports=Test;