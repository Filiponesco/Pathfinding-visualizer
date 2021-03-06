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
var active = false;
var activeItem = null;
var speedDrawNewNode = 0
var speedDrawNeighbours = 0;
var speedDrawPath = 20;
var firstEmpty = false;
var firstWall = false;
var isTranslateStart = false;
var isTranslateTarget = false;
var prevMoveEl = null;
var previousClass = "empty_cell";

var grid = [];

function init() {
    document.body.onmousedown = function () {
        mouseDown = 1;
    }
    document.body.onmouseup = function () {
        mouseDown = 0;
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        CreateGridForPhones();
        console.log("device");
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

async function AStar() {
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
        await Sleep(speedDrawNewNode);
        ColorNode(current, "closed");

        let index = open.indexOf(current); // remove current node from open set
        open.splice(index, 1);

        if (current.Equals(target)) { // if current node is target node, we found path
            DrawPath(current);
            resetNodes();
            return;
        }

        let neighbours = Neighbours(current); // look for niegbours of current node

        //the same like this but ascync neighbours.forEach(n => {});
        //async with await function because i need to wait for colorNode
        await asyncForEach(neighbours, async (n) => {
            await Sleep(speedDrawNeighbours);
            if (n.type != "wall" && closed.indexOf(n) < 0) { // if neighbour is not wall and is not already calculated
                let temp = current.gCost + Distance(current, n); // calculate g_cost of neighbour
                if (temp < n.gCost || open.indexOf(n) < 0) { // if neighbour has lower g_cost or its not in open set
                    n.gCost = temp; // set g and f costs
                    n.hCost = Distance(n, target);
                    n.parent = current; // set parent as current node

                    if (open.indexOf(n) < 0) { // if its not in opne set, add it there
                        open.push(n);
                        await Sleep(speedDrawNeighbours);
                        ColorNode(n, "open");
                    }
                }
            }
        })

    }
    resetNodes();
    alert("There is no path");
    //slowDrawOpenPath(closed, null);
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
async function Dijkstra() {
    Clear("visualization");
    //let open = []; //item from Q with priority < Infinity
    let start = grid[start_y][start_x];
    let target = grid[target_y][target_x];

    resetNodes();
    start.priority = 0; //odległość od źródła, wszystkie pozostale mają infinity
    let Q = new PriorityQueue(); //it is create for fast get vertex with min distance (priority close 0)

    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            Q.enqueue(grid[i][j]);
        }
    }
    let minNode;

    //while Q.front == Infinity it does not exist neigbour vertex of all previous vertex, 
    while (Q.front().priority < Infinity) { //when infinity: it does not exist neigbour vertex of all previous vertex
        minNode = Q.dequeue(); //i dont want that minNode has propably that his priority is infinity
        await Sleep(speedDrawNewNode);
        ColorNode(minNode, "closed"); //first node is start, I close node which will have his neighbors counted in a moment

        //later we can remove this if and wait when alghoritm finish work for all vertex,
        //because we will be able to drag end point
        if (minNode.Equals(target)) { //the end working alghorith when vertex with minDistance(priority close 0) is target
            DrawPath(minNode);
            resetNodes();
            return;
        }
        let neighbours = Neighbours(minNode);

        //async with await function because i need to wait for colorNode
        await asyncForEach(neighbours, async (n) => {
            await Sleep(speedDrawNeighbours);
            if (n.type != "wall") {
                if (minNode.priority + 1 < n.priority) {
                    n.priority = minNode.priority + 1;
                    Q.refresh(n); //insert node in correct place
                    n.parent = minNode; //every vertex (without start) has previous vertex which path from start to him is shortest
                    ColorNode(n, "open");
                }
            }
        })
        //ColorNode(minNode, "closed"); //is closed before counting neigbours(look better)
    }
    resetNodes();
    alert("Brak ścieżki");
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
    var size = 60;
    width = document.documentElement.clientWidth
    height = document.documentElement.clientHeight;

    width = Math.floor(width / size);
    height = height - 590; //590 is size of topBar and space for footer
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

    if (activeItem.className == "wall") {
        firstEmpty = false;
        firstWall = true;
        var node = IdToNode(activeItem.id);
        node.type = "empty_cell";
        ColorNode(node, "empty_cell");
        active = true;
    }
    else if (activeItem.className != "start" || activeItem.className != "target") {
        firstEmpty = true;
        firstWall = false;
        var node = IdToNode(activeItem.id);
        node.type = "wall";
        ColorNode(node, "wall");
        active = true;
    }

    if (activeItem.className == "start" || activeItem.className == "target") {
        active = true;
        prevMoveEl = activeItem;
        if (activeItem.className == "start") {
            isTranslateStart = true;
        }
        if (activeItem.className == "target") {
            isTranslateTarget = true;
        }
    }
}
function dragEnd(e) { //only to set start or target
    active = false;
    activeItem = null;
    isTranslateStart = false;
    isTranslateTarget = false;
    previousClass = "empty_cell";
    firstWall = false;
    firstEmpty = false;
    prevMoveEl = null;
}
function drag(e) {
    if (active) {
        if (e.type == "touchmove") {
            e.preventDefault();
            var el = document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY);
            if (el != null) {
                if (el.nodeName == "TD" && el != prevMoveEl && el.className != "start" && el.className != "target") { //if finger is on another node
                    if (!isTranslateStart && !isTranslateTarget) {
                        var node = IdToNode(el.id);
                        //draw wall
                        if (firstEmpty) {
                            node.type = "wall";
                            ColorNode(node, "wall");
                        }
                        //draw empty_cell
                        if (firstWall && el.className != "open" && el.className != "closed" && el.className != "path") {
                            node.type = "empty_cell";
                            ColorNode(node, "empty_cell"); //change class
                        }
                    }
                    //drag start or target
                    if (isTranslateStart || isTranslateTarget) {
                        prevMoveEl.className = previousClass;
                        IdToNode(prevMoveEl.id).type = previousClass;
                        var tempClass = el.className;
                        previousClass = tempClass; //because it later change so i need to make local var

                        if (isTranslateStart) {
                            el.className = "start"
                            //zapisz do grid (nody)
                            SetStartTarget(el.id, "start");
                        }
                        if (isTranslateTarget) {
                            el.className = "target"
                            //zapisz do grid (nody)
                            SetStartTarget(el.id, "target");
                        }
                    }
                    prevMoveEl = el; //only change prev when other is diff than start or target
                }
            }
        }
    }
}
function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}