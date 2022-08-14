const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

const paths = new Map();
let leastMap = '';
let leastPath = [];

function isEmpty(cost) {
    return cost === 0;
}

function isDone(location) {
    return location.cost > 0 && location.finished;
}

function isMovable(location) {
    if (location.cost <= 0) {
        return false;
    }

    if (location.finished) {
        return false;
    }

    return true;
}

function isSolved(map) {
    let numDone = 0;
    for (let line of map) {
        for (let loc of line) {
            if (isDone(loc)) {
                numDone++;
            }
        }
    }

    return numDone === 8;
}

function characterMap(character) {
    let mapped = {
        finished: false,
        stoppable: false,
        cost: -1,
    };

    if (character === '.') {
        mapped.cost =  0;
    } else if (character === 'A') {
        mapped.cost = 1;
    } else if (character === 'B') {
        mapped.cost = 10;
    } else if (character === 'C') {
        mapped.cost = 100;
    } else if (character === 'D') {
        mapped.cost = 1000;
    }
    return mapped;
}

function reverseCharacterMap(number) {
    if (number === 0) {
        return '.';
    }
    if (number === 1) {
        return 'A';
    }
    if (number === 10) {
        return 'B';
    }
    if (number === 100) {
        return 'C';
    }
    if (number === 1000) {
        return 'D';
    }
    return '#';
}

function calculateMoveCost(i, j, possibleI, possibleJ, cost) {
    let steps = Math.abs(j-possibleJ);

    if (i === 2 && possibleI === 2) {
        steps += 2;
    } else if (i === 2 && possibleI === 3) {
        steps += 3;
    } else if (i === 3 && possibleI === 2) {
        steps += 3;
    } else if (i === 3 && possibleI === 3) {
        steps += 4;
    } else {
        steps += Math.abs(i-possibleI);
    }

    return (cost * steps);
}

function isPathClear(map, i, j, possibleJ) {
    const start = Math.min(j,possibleJ);
    const stop = Math.max(j,possibleJ);

    for (let inbetween = start+1; inbetween < stop; inbetween++) {
        if (!isEmpty(map[1][inbetween].cost)) {
            return false;
        }
    }

    return true;
}

function findFinalMoves(map, i, j, currentCost) {
    const moves = [];
    if (i !== 2 && i !== 3) {
        return moves;
    }

    let possibleJ = 0;
    if (map[i][j].cost === 1) {
        possibleJ = 3;
    } else if (map[i][j].cost === 10) {
        possibleJ = 5;
    } else if (map[i][j].cost === 100) {
        possibleJ = 7;
    } else if (map[i][j].cost === 1000) {
        possibleJ = 9;
    }

    if (possibleJ === 0) {
        console.log("NEVER SHOULD HIT THIS");
        return moves;
    }

    let possibleI = 0;
    const isLowerFinalClear = map[3][possibleJ].cost === 0;
    const isUpperFinalClear = map[2][possibleJ].cost === 0;
    const isLowerFinalFinished = map[3][possibleJ].cost === map[i][j].cost;
    if (isLowerFinalClear && isUpperFinalClear) {
        possibleI = 3;
    } else if (isUpperFinalClear && isLowerFinalFinished) {
        possibleI = 2;
    }

    if (possibleI === 0) {
        return moves;
    }

    if (!isPathClear(map, i, j, possibleJ)) {
        return moves;
    }

    //At this point we can move directly to our final destination
    moves.push([possibleI, possibleJ, possibleI===3 ? 2 : 1]);

    return moves;
}

function findAllMoves(map, i, j, currentCost) {
    const moves = findFinalMoves(map, i, j, currentCost);
    if (moves.length > 0) {
        return moves;
    }

    for (let vertical = 0; vertical < map.length; vertical++) {
        const possibleI = vertical;
        if (i === 1 && possibleI ===1) {
            continue;
        }
        if (i=== 3 && possibleI === 2) {
            continue;
        }


        for (let horizontal = 0; horizontal < map[vertical].length; horizontal++) {
            const possibleJ = horizontal;
            const possibleMove = map[possibleI][possibleJ];

            const start = Math.min(j,possibleJ);
            const stop = Math.max(j,possibleJ);
            let bClear = true;
            for (let inbetween = start+1; inbetween < stop; inbetween++) {
                if (!isEmpty(map[1][inbetween].cost)) {
                    bClear = false;
                    break;
                }
            }

            if (isEmpty(possibleMove.cost) && bClear) {
                if (possibleI === 1) {

                    if (possibleMove.stoppable) {
                        moves.push([possibleI, possibleJ, 0]);
                    }

                } else {
                    if (map[i][j].cost === 1) {
                        if (possibleJ !== 3) {
                            continue;
                        }
                    } else if (map[i][j].cost === 10) {
                        if (possibleJ !== 5) {
                            continue;
                        }
                    } else if (map[i][j].cost === 100) {
                        if (possibleJ !== 7) {
                            continue;
                        }
                    } else if (map[i][j].cost === 1000) {
                        if (possibleJ !== 9) {
                            continue;
                        }
                    }

                    if (possibleI === 2) {
                        const belowMove = map[possibleI + 1][possibleJ];
                        if (!isEmpty(belowMove.cost)) {
                            if (belowMove.cost === currentCost) {
                                moves.push([possibleI, possibleJ, 1]);
                            }
                        } else {
                            moves.push([possibleI + 1, possibleJ, 2]);
                        }
                        // }
                    } else if (possibleI === 3) {
                        moves.push([possibleI, possibleJ, 1]);
                    }
                }
            }
        }
    }

    return moves;
}

async function draw(map, onGoing, moveCost, bFinal = false) {
    if (!document.getElementById("showProgress").checked && !bFinal) {
        return;
    }

    let html = "";
    let bOther = false;
    for (let line of map) {
        html += "<div class='line'>"
        for (let location of line) {
            let subHtml = reverseCharacterMap(location.cost);
            if (bOther) {
                subHtml = "<div class='diffBackground'>" + subHtml + "</div>";
            }
            html += subHtml;
            bOther = !bOther;
        }
        html += "</div>";
    }

    if (bFinal) {
        html = `<div>TotalCost: ${onGoing} MoveCost: ${moveCost}</div>` + html;
        document.getElementById("finalMap").innerHTML += "<br />" + html + "<br />";
    } else {
        document.getElementById("map").innerHTML = html;
        document.getElementById("ongoing").innerText = onGoing;
        document.getElementById("score").innerText = moveCost;
    }
    await delay(document.getElementById("moveSpeed").value);
}

async function tryChildren(startingCost, map, incomingLeastSolution) {
    const mapKey = map.map(line => line.map(item => item.cost).join(' ')).join(' ');
    //console.log(mapKey);
    if (paths.has(mapKey)) {
        if (incomingLeastSolution !== -1) {
           // return Math.min(incomingLeastSolution, paths.get(mapKey));
        }
        return paths.get(mapKey);
    }


    let leastSubPath = [];
    let leastSolution = incomingLeastSolution;
    let onGoingCost = startingCost;
    let movableIndexes = [];
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (isMovable(map[i][j])) {
                if (i !== 3 || map[i-1][j].cost === 0) {
                   // if (onGoingCost + map[i][j].cost < leastSolution || leastSolution === -1) {
                        movableIndexes.push([map[i][j].cost, [i, j]]);
                   // }
                }
            }
        }
    }

    if (movableIndexes.length <= 0) {
        //dead end
        //console.log("dead end");
        // return leastSolution;
    }

    //console.log(movableIndexes);

    movableIndexes.sort((a,b) => { return a[0] - b[0]; } );

    for (const movableIndex of movableIndexes) {
        const [cost,index] = movableIndex;
        const [i,j] = index;
        const possibleMoves = findAllMoves(map, i, j, cost);

        for (let possibleMove of possibleMoves) {
            onGoingCost = startingCost;
            const newMap = [];
            for (let line of map) {
                const newLine = [];
                for (let spot of line) {
                    newLine.push(Object.assign({}, spot));
                }
                newMap.push([...newLine]);
            }
            const [possibleI, possibleJ, successCount] = possibleMove;

            const moveCost = calculateMoveCost(i, j, possibleI, possibleJ, cost);

            onGoingCost += moveCost;

            if (leastSolution !== -1 && onGoingCost > leastSolution) {
                continue;
            }
            newMap[possibleI][possibleJ].cost = cost;
            newMap[i][j].cost = 0;

            if (successCount > 0) {
                newMap[possibleI][possibleJ].finished = true;
                if (successCount === 1) {
                    newMap[possibleI+1][possibleJ].finished = true;
                }

                if (isSolved(newMap)) {
                    console.log("solved");

                    if (onGoingCost < leastSolution || leastSolution === -1) {
                        leastSolution = onGoingCost;
                        leastPath = [[newMap, onGoingCost, moveCost]];
                        leastMap = newMap;
                        console.log(leastSolution);
                    }

                    await draw(newMap, onGoingCost, moveCost);
                    //const key = newMap.map(line => line.map(item => item.cost).join('')).join('');
                    //paths.set(key, leastSolution);
                    continue;
                }

            }

            await draw(newMap, onGoingCost, moveCost);

           // const key = newMap.map(line => line.map(item => item.cost).join('')).join('');
            //console.log(key);

            const newLevel = await tryChildren(onGoingCost, newMap, leastSolution);


            if (leastSolution === -1 || newLevel < leastSolution) {
               // console.log(newLevel);
                leastSubPath = [newMap, onGoingCost, moveCost];

                leastSolution = newLevel;
                //return newLevel;
            }
        }
    }

    if (leastSubPath.length > 0) {
        leastPath.push(leastSubPath);
    }

    paths.set(mapKey, leastSolution);

    //console.log(leastSolution);
    return leastSolution;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const startingMap = reader.result.split(/\n/).map(line => line.split('').map(character => characterMap(character)));

        await draw(startingMap, 0, 0);

        startingMap[1][1].stoppable = true;
        startingMap[1][2].stoppable = true;
        startingMap[1][4].stoppable = true;
        startingMap[1][6].stoppable = true;
        startingMap[1][8].stoppable = true;
        startingMap[1][10].stoppable = true;
        startingMap[1][11].stoppable = true;


        if (startingMap[3][3].cost === 1) {
            startingMap[3][3].finished = true;
            if (startingMap[2][3].cost === 1) {
                startingMap[2][3].finished = true;
            }
        } else if (startingMap[3][5].cost === 10) {
            startingMap[3][5].finished = true;
            if (startingMap[2][5].cost === 10) {
                startingMap[2][5].finished = true;
            }
        } else if (startingMap[3][7].cost === 100) {
            startingMap[3][7].finished = true;
            if (startingMap[2][7].cost === 100) {
                startingMap[2][7].finished = true;
            }
        } else if (startingMap[3][9].cost === 1000) {
            startingMap[3][9].finished = true;
            if (startingMap[2][9].cost === 1000) {
                startingMap[2][9].finished = true;
            }
        }

        const answer = await tryChildren(0, startingMap, 999999999999);

        await draw(leastMap, answer, 0);

        leastPath.push([startingMap,0,0]);

        for (let finalPiece of leastPath) {
            //console.log(finalPiece);
            await draw(finalPiece[0], finalPiece[1],finalPiece[2], true);
        }


        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});