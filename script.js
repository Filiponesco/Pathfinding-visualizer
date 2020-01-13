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

var grid = [];

function init() {
    document.body.onmousedown = function () {
        mouseDown = 1;
    }
    document.body.onmouseup = function () {
        mouseDown = 0;
    }

    CreateGrid();
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
    return Math.round(Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)));
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
    let open = [];
    let closed = [];
    let start = grid[start_y][start_x];
    let target = grid[target_y][target_x];

    start.gCost = 0;
    start.hCost = Distance(start, target);
    open.push(start);

    while (open.length > 0) {
        let current = LowestFCost(open);
        closed.push(current);
        ColorNode(current, "closed");

        let index = open.indexOf(current);
        open.splice(index, 1);

        if (current.Equals(target)) {
            DrawPath(current);
            return;
        }

        let neighbours = Neighbours(current);

        neighbours.forEach(n => {
            if (n.type != "wall" && closed.indexOf(n) < 0) {
                let temp = current.gCost + Distance(current, n);
                if (temp < n.gCost || open.indexOf(n) < 0) {
                    n.gCost = temp;
                    n.hCost = Distance(n, target);
                    n.parent = current;

                    if (open.indexOf(n) < 0) {
                        open.push(n);
                        ColorNode(n, "open");
                    }
                }
            }
        });
    }

    alert("There is no path");
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
    let temp = n;
    while (temp.parent != null) {
        let id = NodeToId(temp);
        let el = document.getElementById(id);

        if (el.className != "start" && el.className != "target")
            el.className = "path";

        temp = temp.parent;
    }
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
    let open = [];
    let closed = [];
    let start = grid[start_y][start_x];
    let target = grid[target_y][target_x];

    resetNodes();
    //odległość od źródła, wszystkie pozostale mają infinity
    start.priority = 0;
    let Q = new PriorityQueue();

    open.push(start);

    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            Q.enqueue(grid[i][j]);
        }
    }
    while (!Q.isEmpty()) {
        if(Q.front() == "No path!") return;
        let minNode = Q.front();

        open.push(minNode);
        ColorNode(minNode, "open");

        Q.dequeue();

        if (minNode.Equals(target)) {
            DrawPath(minNode);
            return;
        }
        let neighbours = Neighbours(minNode);
        neighbours.forEach(n => {
                if (minNode.priority + 1 < n.priority && n.type != "wall") {
                    n.priority = minNode.priority + 1;
                    //have to update priorityqueue
                    Q.refresh(n);
                    n.parent = minNode;
            }
        });
    }
    return null;
}
function resetNodes(){
    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            grid[i][j].parent = null;
            grid[i][j].priority = Infinity;
        }
    }
}