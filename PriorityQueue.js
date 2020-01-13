
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    // enqueue function to add element 
    // to the queue as per priority 
    enqueue(element) {
        var contain = false;

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > element.priority) {
                // Once the correct location is found it is 
                // enqueued 
                this.items.splice(i, 0, element);
                contain = true;
                break;
            }
        }
        if (!contain) {
            this.items.push(element);
        }
    }
    // dequeue method to remove 
    // element from the queue 
    dequeue() {
        if (this.isEmpty()){
            alert("Underflow");
            return "Underflow";
        }
        return this.items.shift();
    }
    // returns the highest priority element
    // highest means the most highest priority is 0
    // in the Priority queue without removing it. 
    front() {
        if (this.isEmpty())
            return "No elements in Queue";

        for (var i = 0; i < this.items.length; i++) {
            if(this.items[i].type != "wall" && this.items[i].priority < Infinity){
                return this.items[i];
            }
        }
        alert("No path!");
        return "No path!";
    }
    // returns the lowest priorty 
    // element of the queue 
    rear() {
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[this.items.length - 1];
    }
    isEmpty() {
        // return true if the queue is empty. 
        return this.items.length == 0;
    }
    printPQueue() {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i].element + " ";
        return str;
    }
    deleteRear(){
        this.items.pop();
    }
    refresh(node){
        let index = this.items.indexOf(node);
        this.items.splice(index, 1);
        this.enqueue(node);
    }
} 