import Utils from "easescript/lib/core/Utils";

class Node{

    static is(value){
        return value ? value instanceof Node : false;
    }

    static create(type, stack){
        return new Node(type, stack);
    }

    constructor(type, stack=null){
        this.type = type;
        if(Utils.isStack(stack)){
            this.loc = stack.getLocation()
        }
    }
}

export default Node;