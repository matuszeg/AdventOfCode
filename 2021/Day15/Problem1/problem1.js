const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

let leaves = [];

class TreeNode {
    constructor(value, x,y, parent) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.id = x + ',' + y;
        this.parent = parent;
        this.descendants = [];
        this.cachedPathCost = this.value + (this.parent !== null ? this.parent.getPathCost() : 0);
    }

    getId() {
        return this.id;
    }

    getPathCost() {
        return this.cachedPathCost;
    }

    isBackTrack(id) {
        if (id === this.getId()) {
            return true;
        }

        let nodeParent = this.parent;
        while (nodeParent !== null) {
            if (nodeParent.getId() === id) {
                return true;
            }
            nodeParent = nodeParent.parent;
        }


        return false;
    }

    findDescendants(map) {
        if (this.descendants.length > 0) {
            return;
        }

        if (this.x-1 >= 0) {
            const x = this.x-1;
            const y = this.y;
            if (!this.isBackTrack(x + "," + y)) {
                this.descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        if (this.x+1 < map.length) {
            const x = this.x+1;
            const y = this.y;
            if (!this.isBackTrack(x + "," + y)) {
                this.descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        if (this.y-1 >= 0) {
            const x = this.x;
            const y = this.y-1;
            if (!this.isBackTrack(x + "," + y)) {
                this.descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        if (this.y+1 < map.length) {
            const x = this.x;
            const y = this.y+1;
            if (!this.isBackTrack(x + "," + y)) {
                this.descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        const finalX = map.length - 1;
        const finalY = map[0].length - 1;

        this.descendants.sort((a,b) => {
            const depthDelta = b.getPathCost() - a.getPathCost();
            if (depthDelta === 0) {
                const distanceA = (finalX - a.x)^2 + (finalY - a.y)^2;
                const distanceB = (finalX - b.x)^2 + (finalY - b.y)^2;
                return distanceB - distanceA;
            }
            return depthDelta;
        });
    }
}

async function PrintMap(map, currentNode) {
    let html = '';

    let gridRows = '';
    let gridColumns = '';

    for (let x = 0; x < map.length; x++) {
        gridRows += '1fr ';
        for (let y = 0; y < map[0].length; y++) {
            if (x===0) {
               gridColumns += '1fr ';
            }
            const id = x + ',' + y;
            let classes = ['location'];

            if (id === currentNode.getId()) {
                classes.push("final");
            } else if (currentNode.isBackTrack(id)) {
                classes.push("active")
            }

            html += `<div class="${classes.join(' ')}">${map[x][y]}</div>`
        }
    }


    document.getElementById("map").style.display = "grid";
    document.getElementById("map").style.gap = "1px";
    document.getElementById("map").style.gridTemplateRows = gridRows;
    document.getElementById("map").style.gridTemplateColumns = gridColumns;

    document.getElementById("map").innerHTML = html;

    await delay(document.getElementById("moveSpeed").value);
}

function FilterLeaves(leaf) {
    leaves = leaves.filter(filterLeaf => {
        return !(leaf.x === filterLeaf.x && leaf.y === filterLeaf.y);
    });
}

function InsertDependantsSorted(leaf, finalX, finalY) {
    let index = leaf.descendants.length-1;

    for (let i = leaves.length-1; i >=0 ; i--) {
        if ( index < 0) {
            break;
        }
        for (let j = index; j >= 0; j--) {
            if (leaf.descendants[j].getPathCost() < leaves[i]?.getPathCost()) {
                leaves.splice(i+1, 0, leaf.descendants[j]);
                index--;
            } else if (leaf.descendants[j].getPathCost() === leaves[i]?.getPathCost()) {
                const distanceA = (finalX - leaf.descendants[j].x)^2 + (finalY - leaf.descendants[j].y)^2;
                const distanceB = (finalX - leaves[i].x)^2 + (finalY - leaves[i].y)^2;

                if (distanceA < distanceB) {
                    leaves.splice(i+1, 0, leaf.descendants[j]);
                    index--;

                }
            } else {
                break;
            }
        }
    }

    for (let j = index; j >= 0; j--) {
        leaves.splice(0, 0, leaf.descendants[j]);
    }
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\r|\n/).filter(line => line.length > 0).map(line => {
            return line.split('').map(num => Number(num));
        });


        leaves.push(new TreeNode(0,0,0, null));

        const finalX = inputs.length - 1;
        const finalY = inputs[0].length - 1;

        let currentPathCost = 0;

        while (leaves[leaves.length-1].x !== finalX || leaves[leaves.length-1].y !== finalY) {

            const leaf = leaves.pop();

            if (document.getElementById('showMap').checked) {
                await PrintMap(inputs, leaf);
            }

            if (currentPathCost < leaf.getPathCost()){
                document.getElementById("currentDistance").innerText = leaf.getPathCost();
                await delay(0);
                currentPathCost = leaf.getPathCost();
            }

            FilterLeaves(leaf);

            leaf.findDescendants(inputs);

            InsertDependantsSorted(leaf, finalX, finalY);
        }
        await PrintMap(inputs, leaves[leaves.length-1]);

        const answer = leaves[leaves.length-1].getPathCost();

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});