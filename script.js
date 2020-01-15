var mouseDown = 0;
var style = "wall";
var start_x = 0;
var start_y = 0;
var target_x = 0;
var target_y = 0;
var previous;
var previousStyleStart1 = "empty_cell";
var previousStyleStart2 = "empty_cell";
var previousStyleTarget1 = "empty_cell";
var previousStyleTarget2 = "empty_cell";
var width;
var height;
var activeItem = null;
var active = false;
var endTouchElement = null;
var speedDrawPath = 100;
var speedDrawOpen = 10;

var grid = [];

function init() {
    document.body.onmousedown = function () {
        mouseDown = 1;
    }
    document.body.onmouseup = function () {
        mouseDown = 0;
    }
    document.body.ontouchstart = function () {
        mouseDown = 1;
    }
    document.body.ontouchmove = function () {
        mouseDown = 0;
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        CreateGridForPhones();
    }
    else {
        CreateGrid();
    }
}

function CreateGrid() {
    var size = 30;
    width = window.screen.availWidth;
    height = window.screen.availHeight;

    width = Math.floor(width / size);

    height = height - 200;
    height = Math.floor(height / size);

    var element = document.getElementById("grid");

    for (i = 0; i < height; i++) {
        var tr = document.createElement("tr");
        var temp = [];
        for (j = 0; j < width; j++) {
            var td = document.createElement("td");
            td.className = "empty_cell";
            td.id = j + "-" + i;

            td.addEventListener('mousedown', function () {
                BuildWall("mousedown", this.id);
            });

            td.addEventListener('mouseover', function () {
                BuildWall("mouseover", this.id);
            });

            tr.appendChild(td);

            temp.push(new Node(j, i));
        }
        element.appendChild(tr);
        grid.push(temp);
    }

    start_x = Math.floor(width / 4);
    start_y = Math.floor(height / 2);
    grid[start_y][start_x].type = "start";

    target_x = Math.floor(3 * width / 4);
    target_y = Math.floor(height / 2);
    grid[target_y][target_x].type = "target";

    var start = document.getElementById(start_x + "-" + start_y);
    start.className = "start";

    var target = document.getElementById(target_x + "-" + target_y);
    target.className = "target";
}

function BuildWall(type, id) {
    //wykonuje sie zawsze gdy myszka jest na grid
    var element = document.getElementById(id);
    var temp = element.className;

    if (type == "mousedown") {
        style = element.className;
        if (temp != "start" && temp != "target") {

            if (style == "empty_cell" || style == "closed" || style == "open" || style == "path")
                element.className = "wall";
            else if (style == "wall")
                element.className = "empty_cell";
        }
        previous = element;
    }
    else {
        previousStyleStart1 = element.className;
        previousStyleTarget1 = element.className;
        if (mouseDown) {
            if ((style != "wall" && style != "start" && style != "target") && temp != "start" && temp != "target") {
                element.className = "wall";
            }
            else if (style == "wall" && temp != "start" && temp != "target") {
                element.className = "empty_cell";
            }
            else if (previous.className == "start" && temp != "target" || previous.className == "target" && temp != "start") {
                element.className = previous.className;
                if (previous.className == "start") {
                    previous.className = previousStyleStart2;
                    previousStyleStart2 = previousStyleStart1;
                    IdToNode(previous.id).type = previousStyleStart2;
                }
                else if (previous.className == "target") {
                    previous.className = previousStyleTarget2;
                    previousStyleTarget2 = previousStyleTarget1;
                    IdToNode(previous.id).type = previousStyleTarget2;
                }
                previous = element;

                SetStartTarget(element.id, previous.className);
            }
        }
    }

    IdToNode(id).type = element.className;
}

function SetStartTarget(id, type) {
    var str = id.split("-");
    if (type == "start") {
        start_x = parseInt(str[0]);
        start_y = parseInt(str[1]);
        grid[start_y][start_x].type = "start";
    }
    else if (type == "target") {
        target_x = parseInt(str[0]);
        target_y = parseInt(str[1]);
        grid[target_y][target_x].type = "target";
    }
}

function IdToNode(id) {
    var str = id.split("-");
    var x = parseInt(str[0]);
    var y = parseInt(str[1]);

    return grid[y][x];
}

function NodeToId(n) {
    return n.x + "-" + n.y;
}

function Distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function Neighbours(n) {
    result = [];
    if (n.y - 1 >= 0) {
        result.push(grid[n.y - 1][n.x]);
    }
    if (n.y + 1 < height) {
        result.push(grid[n.y + 1][n.x]);
    }
    if (n.x - 1 >= 0) {
        result.push(grid[n.y][n.x - 1]);
    }
    if (n.x + 1 < width) {
        result.push(grid[n.y][n.x + 1]);
    }

    return result;
}

function LowestFCost(nodes) {
    var lowest = nodes[0];

    nodes.forEach(n => {
        if (n.fCost() < lowest.fCost() || (n.fCost() == lowest.fCost() && n.hCost < lowest.hCost)) {
            lowest = n;
        }
    });
    return lowest;
}

function AStar() {
    Clear("visualization");
    let open = []; // list with all not calculated nodes
    let closed = []; // list with all already calculated
    let start = grid[start_y][start_x]; // starting node
    let target = grid[target_y][target_x]; // target node

    start.gCost = 0; //set g cost of staring node
    start.hCost = Distance(start, target); // set h cost of starting node
    open.push(start); // add staring node to open set

    while (open.length > 0) { // while there are still nodes that weren't calculated
        let current = LowestFCost(open); // search for node with lowest f_cost from open set
        closed.push(current); // add current node to closed set

        let index = open.indexOf(current); // remove current node from open set
        open.splice(index, 1);

        if (current.Equals(target)) { // if current node is target node, we found path
            slowDrawOpenPath(closed, current);
            return;
        }

        let neighbours = Neighbours(current); // look for niegbours of current node

        neighbours.forEach(n => {
            if (n.type != "wall" && closed.indexOf(n) < 0) { // if neighbour is not wall and is not already calculated
                let temp = current.gCost + Distance(current, n); // calculate g_cost of neighbour
                if (temp < n.gCost || open.indexOf(n) < 0) { // if neighbour has lower g_cost or its not in open set
                    n.gCost = temp; // set g and f costs
                    n.hCost = Distance(n, target);
                    n.parent = current; // set parent as current node

                    if (open.indexOf(n) < 0) { // if its not in opne set, add it there
                        open.push(n);
                    }
                }
            }
        });
    }

    alert("There is no path");
    slowDrawOpenPath(closed, null);
    return null;
}

function Clear(mode) {
    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            if (mode == "full") {
                if (grid[i][j].type != "start" && grid[i][j].type != "target") {
                    grid[i][j].type = "empty_cell";
                    document.getElementById(j + "-" + i).className = "empty_cell";
                }
            }
            else if (mode == "visualization") {
                if (grid[i][j].type != "start" && grid[i][j].type != "target" && grid[i][j].type != "wall") {
                    grid[i][j].type = "empty_cell";
                    document.getElementById(j + "-" + i).className = "empty_cell";
                }
            }
        }
    }
}

function DrawPath(n) {
    var path = [];
    let temp = n;
    while (temp.parent != null) {
        let id = NodeToId(temp);
        path.push(temp.parent);
        temp = temp.parent;
    }
    var i = path.length - 1;
    function myLoop() {
        setTimeout(function () {
            let id = NodeToId(path[i]);
            let el = document.getElementById(id);
            if (el.className != "start" && el.className != "target") {
                el.className = "path";
            }
            i--;
            if (i >= 0) {
                myLoop();
            }
        }, speedDrawPath)
    }
    myLoop();
}

function ColorNode(node, type) {
    let id = NodeToId(node);
    let el = document.getElementById(id);
    if (el.className != "start" && el.className != "target")
        el.className = type;

}

function Visualize() {
    var algorithm = document.getElementById("algorithm");
    algorithm = algorithm.options[algorithm.selectedIndex].value;

    switch (algorithm) {
        case "A*":
            AStar();
            break;
        case "Dijkstra":
            Dijkstra();
            break;
    }
}
function Dijkstra() {
    Clear("visualization");
    let open = []; //item from Q with priority < Infinity
    let close = [];
    let start = grid[start_y][start_x];
    let target = grid[target_y][target_x];

    resetNodes();
    start.priority = 0; //odległość od źródła, wszystkie pozostale mają infinity
    let Q = new PriorityQueue(); //it is create for fast get vertex with min distance (priority close 0)

    open.push(start);

    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            Q.enqueue(grid[i][j]);
        }
    }
    //it does not exist neigbour vertex of all previous vertex, 
    //when you want count for all vertex change to: "!Q.isEmpty"
    while (open.length > 0) { //when infinity: it does not exist neigbour vertex of all previous vertex
        let minNode;
        if (Q.front().priority < Infinity) {
            minNode = Q.dequeue(); //i dont want that minNode has propably that his priority is infinity
            open.push(minNode);
            //ColorNode(minNode, "open");

            //later we can remove this if and wait when alghoritm finish work for all vertex,
            //because we will be able to drag end point
            if (minNode.Equals(target)) { //the end working alghorith when vertex with minDistance(priority close 0) is target
                slowDrawOpenPath(close, minNode);
                //DrawPath(minNode);
                alert("Znaleziono ścieżkę open dl: " + open.length + "close dl: " + close.length);
                return;
            }
            let neighbours = Neighbours(minNode);
            neighbours.forEach(n => {
                if (n.type != "wall" && close.indexOf(n) < 0) { //check if vertex was calculate
                    if (minNode.priority + 1 < n.priority) {
                        n.priority = minNode.priority + 1;
                        Q.refresh(n); //insert node in correct place
                        n.parent = minNode; //every vertex (without start) has previous vertex which path from start to him is shortest
                        if (open.indexOf(n) < 0) { // if its not in open set, add it there
                            open.push(n); //new vertex to calculate neigbours in next iterations
                        }
                    }
                }
            });
        }
        //remove open in order to end loop
        //it will be run last time when (if Q.front().priority < Infinity not run) to delete last item in open
        let index = open.indexOf(minNode);
        open.splice(index, 1); //remove this vertex because
        close.push(minNode); //this vertex is done
    }
    alert("Brak ścieżki open dl: " + open.length + "close dl: " + close.length);
    slowDrawOpenPath(close, minNode);
    return null;
}
function resetNodes() {
    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            grid[i][j].parent = null;
            grid[i][j].priority = Infinity;
        }
    }
}
function CreateGridForPhones() {
    var size = 20;
    width = window.screen.availWidth;
    height = window.screen.availHeight;

    width = Math.floor(width / size);
    height = height - 350;
    height = Math.floor(height / size);

    var element = document.getElementById("grid");

    for (i = 0; i < height; i++) {
        var tr = document.createElement("tr");
        var temp = [];
        for (j = 0; j < width; j++) {
            var td = document.createElement("td");
            td.className = "empty_cell";
            td.id = j + "-" + i;
            td.addEventListener("touchstart", dragStart, false);
            td.addEventListener("touchmove", drag, false);
            td.addEventListener("touchend", dragEnd, false);

            tr.appendChild(td);

            temp.push(new Node(j, i));
        }
        element.appendChild(tr);
        grid.push(temp);
    }

    start_x = Math.floor(width / 4);
    start_y = Math.floor(height / 2);
    grid[start_y][start_x].type = "start";

    target_x = Math.floor(3 * width / 4);
    target_y = Math.floor(height / 2);
    grid[target_y][target_x].type = "target";

    var start = document.getElementById(start_x + "-" + start_y);
    start.className = "start";

    var target = document.getElementById(target_x + "-" + target_y);
    target.className = "target";
}
function dragStart(e) {
    activeItem = e.target;

    if ((activeItem.className != "wall" && activeItem.className != "start" && activeItem.className != "target")) {
        activeItem.className = "wall";
        IdToNode(activeItem.id).type = "wall";
    }
    else if (activeItem.className == "wall") {
        activeItem.className = "empty_cell";
        IdToNode(activeItem.id).type = "empty_cell";
    }
    if (activeItem.className == "start" || activeItem.className == "target") {
        active = true; //active drag element only when it is start or target
    }
}
function dragEnd(e) {
    if (active && activeItem !== null && endTouchElement !== null) {
        console.log(endTouchElement.id);

        //ustaw start
        endTouchElement.className = activeItem.className;
        IdToNode(endTouchElement.id).type = activeItem.className;

        //zapisz do grid
        SetStartTarget(endTouchElement.id, activeItem.className);

        //ustaw stary start
        activeItem.className = "empty_cell";
        IdToNode(activeItem.id).type = "empty_cell";
    }
    active = false;
    activeItem = null;
}
function drag(e) {
    if (active) { //when element is start or end
        if (e.type == "touchmove") {
            e.preventDefault();
            var el = document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY);
            if (el !== null) {
                if (el.nodeName == "TD" && el.className !== "target") {
                    endTouchElement = el;
                }
            }
        }
    }
}
function slowDrawOpenPath(open, minNode) {
    var i = 0;
    function myLoop() {
        setTimeout(function () {
            ColorNode(open[i], "open");
            i++;
            if (i < open.length) {
                myLoop();
            }
            else {
                DrawPath(minNode);
            }
        }, speedDrawOpen)
    }
    myLoop();
}
function slowDrawOpenPathClose(open, minNode, close) {
    var i = 0;
    function myLoop() {
        setTimeout(function () {
            ColorNode(open[i], "open");
            i++;
            if (i < open.length) {
                myLoop();
            }
            else {
                DrawPath(minNode);
            }
        }, speedDrawOpen)
    }
    myLoop();
}