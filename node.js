class Node{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.type = "empty_cell";
        this.gCost = 0;
        this.hCost = 0;
        this.parent = null;
        this.priority = Infinity;
    }

    fCost(){
        return this.gCost + this.hCost;
    }

    Equals(n){
        if(this.x == n.x && this.y == n.y)
            return true;
        return false;
    }
}