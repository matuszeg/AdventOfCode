const delay = ms => new Promise(res => setTimeout(res, ms));

const caveMap = new Map();
let cy = undefined;

function IsSmallCave(cave) {
    return cave === cave.toLowerCase();
}

function IsLargeCave(cave) {
    return !IsSmallCave(cave);
}

function DrawGraph(graphData) {
    let style = [
        {
            selector: 'node',
            style: {
                'height': 20,
                'width': 20,
                'background-color': '#000000',
                'label': 'data(id)'
            }
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'haystack',
                'haystack-radius': 0,
                'width': 5,
                'opacity': 0.5,
                'line-color': '#000000'
            }
        },
    ];

    cy = cytoscape({

        container: document.getElementById('cy'), // container to render in

        elements: graphData,
        style: style,
        layout: {
            name: 'cose',
        }

    });
}

function CanExploreCave(name, path) {
    if (IsLargeCave(name)) {
        return true;
    }

    if (name === 'start') {
        return false;
    }

    if (!path.includes(name)) {
        return true;
    }

    const onlySmall = path.filter(element => IsSmallCave(element) && element !== 'start');

    const foundCaves = [];
    for (const cave of onlySmall) {
        if (foundCaves.includes(cave)) {
            return false;
        }
        foundCaves.push(cave);
    }
    return true;
}

function FindAllPaths(startName, existingPath) {
    const startConnections = caveMap.get(startName);
    let paths = [];
    const newPath = [...existingPath];
    newPath.push(startName);
    for (const connection of startConnections) {
        if (connection === "end") {
            paths.push(newPath.join(',') + ',' + connection);
        } else if (CanExploreCave(connection, newPath)) {
            paths = paths.concat(FindAllPaths(connection, newPath, caveMap));
        }
    }

    return paths;
}

function BuildGraphData() {
    let nodes = [];
    let edges = [];

    for (const [caveName, caveConnections] of caveMap) {
        nodes.push({ data: { id: caveName} });

        for (const connection of caveConnections) {
            edges.push({ data: { id: caveName+"-"+connection, source: caveName, target: connection} });
        }
    }

    return {
        nodes: nodes,
        edges: edges,
    };
}

function HighlightNode(id, bDuplicate) {
    if (bDuplicate) {
        cy.getElementById(id).style('background-color', "#00eaff");
    } else {
        cy.getElementById(id).style('background-color', "#7efa3b");
    }
}

function HighlightEdge(id, bDuplicate) {
    if (bDuplicate) {
        cy.getElementById(id).style('line-color', "#ff0090");
    } else {
        cy.getElementById(id).style('line-color', "#7efa3b");
    }
}

function HighlightPath(path) {
    const pathArray = path.split(',');
    if (pathArray.length <= 1) {
        return;
    }
    DrawGraph(BuildGraphData());

    const alreadyProcessed = {};
    alreadyProcessed[pathArray[0]] = 1;
    HighlightNode(pathArray[0]);

    for (let i = 0; i < pathArray.length-1; i++) {
        const edge = pathArray[i]+"-"+pathArray[i+1];
        const reverseEdge = pathArray[i+1]+"-"+pathArray[i];
        const edgeDupe = alreadyProcessed[edge] || alreadyProcessed[reverseEdge];
        HighlightEdge(edge, edgeDupe);
        HighlightNode(pathArray[i+1], alreadyProcessed[pathArray[i+1]]=== 1);
        alreadyProcessed[pathArray[i+1]] = 1;
        alreadyProcessed[edge] = 1;
        alreadyProcessed[reverseEdge] = 1;
    }
}



document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\r|\n/).map(line => {
            return line.split('-');
        }).filter(line => line[0].length > 0);

        for (let i = 0; i < inputs.length; i++) {
            const start = inputs[i][0];
            const end = inputs[i][1];
            if (!caveMap.has(start)) {
                caveMap.set(start, [end])
            } else {
                caveMap.get(start).push(end);
            }

            if (!caveMap.has(end)) {
                caveMap.set(end, [start])
            } else {
                caveMap.get(end).push(start);
            }
        }


        DrawGraph(BuildGraphData());

        const paths = FindAllPaths("start", []);



        const answer = paths.length;

        document.getElementById("paths").innerHTML = paths.map(path=> `<div class="path" onclick="HighlightPath('${path}')">${path}</div>`).join('');
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});