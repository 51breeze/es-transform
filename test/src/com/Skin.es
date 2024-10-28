package com;
import web.components.Component;
import com.State;

@Runtime(server)
class Skin extends Component{

    public set state(vlaue:State){

    }

    public get state():State{
        return new State('name');
    }

    public set stateGroup( value:State[] ){

    }

    public get stateGroup():State[]{
         return [ this.state  ];
    }

    public set states(vlaue:State[]){

    }

    @override
    protected render(){
        return <div>
             <slot:foot />
             <slot:default />
        </div>;
    }
}