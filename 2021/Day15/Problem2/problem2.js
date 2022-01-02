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
        let descendants = [];

        if (this.x-1 >= 0) {
            const x = this.x-1;
            const y = this.y;
            if (!this.isBackTrack(x + "," + y)) {
                descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        if (this.x+1 < map.length) {
            const x = this.x+1;
            const y = this.y;
            if (!this.isBackTrack(x + "," + y)) {
                descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        if (this.y-1 >= 0) {
            const x = this.x;
            const y = this.y-1;
            if (!this.isBackTrack(x + "," + y)) {
                descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        if (this.y+1 < map.length) {
            const x = this.x;
            const y = this.y+1;
            if (!this.isBackTrack(x + "," + y)) {
                descendants.push(new TreeNode(map[x][y],x,y, this));
            }
        }

        const finalX = map.length - 1;
        const finalY = map[0].length - 1;

        descendants.sort((a,b) => {
            const depthDelta = b.getPathCost() - a.getPathCost();
            if (depthDelta === 0) {
                const distanceA = (finalX - a.x)^2 + (finalY - a.y)^2;
                const distanceB = (finalX - b.x)^2 + (finalY - b.y)^2;
                return distanceB - distanceA;
            }
            return depthDelta;
        });

        return descendants;
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

function InsertDependantsSorted(descendants, finalX, finalY) {
    let index = descendants.length-1;

    for (let i = leaves.length-1; i >=0 ; i--) {
        if ( index < 0) {
            break;
        }
        for (let j = index; j >= 0; j--) {
            if (descendants[j].getPathCost() < leaves[i]?.getPathCost()) {
                leaves.splice(i+1, 0, descendants[j]);
                index--;
            } else if (descendants[j].getPathCost() === leaves[i]?.getPathCost()) {
                const distanceA = (finalX - descendants[j].x)^2 + (finalY - descendants[j].y)^2;
                const distanceB = (finalX - leaves[i].x)^2 + (finalY - leaves[i].y)^2;

                if (distanceA < distanceB) {
                    leaves.splice(i+1, 0, descendants[j]);
                    index--;

                }
            } else {
                break;
            }
        }
    }

    for (let j = index; j >= 0; j--) {
        leaves.splice(0, 0, descendants[j]);
    }
}

function AddOne(num) {
    return num === 9 ? 1 : num+1;
}

function GenerateInput(startingInput) {
    const oneInput = startingInput.split(/\r|\n/).filter(line => line.length > 0).map(line => {
        const oneLine = line.split('').map(num => Number(num));
        const twoLine = oneLine.map(AddOne);
        const threeLine = twoLine.map(AddOne);
        const fourLine = threeLine.map(AddOne);
        const fiveLine = fourLine.map(AddOne);
        return oneLine.concat(twoLine).concat(threeLine).concat(fourLine).concat(fiveLine);
    });

    const twoInput = oneInput.map(line => line.map(AddOne));
    const threeInput = twoInput.map(line => line.map(AddOne));
    const fourInput = threeInput.map(line => line.map(AddOne));
    const fiveInput = fourInput.map(line => line.map(AddOne));

    return oneInput.concat(twoInput).concat(threeInput).concat(fourInput).concat(fiveInput);
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = GenerateInput(reader.result);

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
            let descendants = leaf.findDescendants(inputs);

            descendants = descendants.filter(descendant => {
                for (let i = leaves.length-1; i>=0; i--) {
                    if (leaves[i].getId() === descendant.getId()) {
                        if (descendant.getPathCost() < leaves[i].getPathCost()) {
                            leaves.splice(i,1);
                            i--;
                            return true;
                        }
                        return false;
                    }
                }
                return true;
            });

            if (descendants.length > 0) {
                InsertDependantsSorted(descendants, finalX, finalY);
            }

            if (leaves.length > 1000) {
                let bestDistance = 9999999999999;
                for (let distLeaf of leaves) {
                    const distance = (finalX - distLeaf.x)*(finalX - distLeaf.x) + (finalY - distLeaf.y)*(finalY - distLeaf.y);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                    }
                }

                leaves = leaves.filter(leaf => {
                    const distance = (finalX - leaf.x)*(finalX - leaf.x) + (finalY - leaf.y)*(finalY - leaf.y);
                    return (distance - bestDistance) <= 10000;
                });
            }


        }
        await PrintMap(inputs, leaves[leaves.length-1]);

        const answer = leaves[leaves.length-1].getPathCost();

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});