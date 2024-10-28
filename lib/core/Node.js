class Node{

    static is(value){
        return value ? value instanceof Node : false;
    }

    static create(type, stack){
        return new Node(type, stack);
    }

    constructor(type, stack=null){
        this.type = type;
        if(stack && stack.node && stack.node.loc){
            this.loc = stack.node.loc
        }
    }
}

export default Node;