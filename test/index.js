
const compiler = require("./compiler");

describe('compile file', function() {

    const creator = new compiler.Creator();
    let compilation = null;
    let errors = [];
    let module = null;
    beforeAll(async function() {
        compilation = await creator.factor('./Test.es');
        errors = compilation.compiler.errors;
    });

    afterAll(()=>{
        errors.forEach( item=>{
            if( item.kind == 0 || item.kind===1){
                fail( item.toString() )
            }
        });
        compilation = null;
    })

    it('should compile success and build', function() {
        const errors = compilation.compiler.errors;
        expect('Expected 0 errors').toContain( errors.filter(e=>e.kind===0 || e.kind===1).length );
        creator.build(compilation);
    });

});