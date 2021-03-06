const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

const colors = [
    "#e64b14",
    "#adf310",
    "#e2447c",
    "#408d7c",
    "#decd4f",
    "#5ba8a7",
    "#773bb2",
    "#b1ae2d",
    "#faa24a",
    "#63c96d",
    "#adcf0b",
    "#50faa3",
    "#ed3e96",
    "#e7352e",
    "#8ae5c7",
    "#622d7e",
    "#20b8ee",
    "#1a9838",
    "#167489",
    "#39a248",
    "#0ca7a0",
    "#0886f3",
    "#974a6c",
    "#6e6c6c",
    "#607a51",
    "#96b4ac",
    "#08198d",
    "#6e728a",
    "#da5d7f",
    "#5b732b",
]

const rotations = [
    [1,1,1], // normal
    [1,1,-1],
    [1,-1,1],
    [1,-1,-1],
    [-1,1,1],
    [-1,1,-1],
    [-1,-1,1],
    [-1,-1,-1]
];

function drawLegend(num) {
    let html = "";
    for (let i = 0; i < num; i++) {
        html += `<div style="color: ${colors[i]};background-color: black">Number: ${i}</div>`;
    }
    document.getElementById("legend").innerHTML = html;
}

function unshift(array, nums) {
    let newArray = array;

    for (const num of nums) {
        switch (num) {
            case 0:
                break;
            case 1:
                newArray = [newArray[0], newArray[2], newArray[1]]; // same
                break;
            case 2:
                newArray = [newArray[1], newArray[0], newArray[2]]; //same
                break;
            case 3:
                newArray = [newArray[2], newArray[0], newArray[1]]; //
                break;
            case 4:
                newArray = [newArray[1], newArray[2], newArray[0]]; //
                break;
            case 5:
                newArray = [newArray[2], newArray[1], newArray[0]]; //same
                break;
        }
    }
    return newArray;
}

function shift(array, nums) {
    let newArray = array;

    for (let i = nums.length-1; i>=0; i--) {
        const num = nums[i];
        switch (num) {
            case 0:
                break;
            case 1:
                newArray = [newArray[0], newArray[2], newArray[1]];
                break;
            case 2:
                newArray = [newArray[1], newArray[0], newArray[2]];
                break;
            case 3:
                newArray = [newArray[1], newArray[2], newArray[0]];
                break;
            case 4:
                newArray = [newArray[2], newArray[0], newArray[1]];
                break;
            case 5:
                newArray = [newArray[2], newArray[1], newArray[0]];
                break;
        }
    }
    return newArray;
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

function arraySubtract(a,b) {
    return a.map((num,index)=> num - b[index]);
}

function arrayAdd(a,b) {
    const newA = [...a];
    return newA.map((num,index)=> num + b[index]);
}

function arrayMultiply(a,b) {
    const newA = [...a];
    return newA.map((num,index)=> num * b[index]);
}

function arrayDivide(a,b) {
    return a.map((num,index)=> num / b[index]);
}

function arrayAddUnique(array, newItem) {
    if(array.findIndex((element) => arrayEquals(element, newItem)) === -1) {
        array.push(newItem);
    }
}

function manhattanDistance(location1, location2) {
    return Math.abs(location1[0] - location2[0]) + Math.abs(location1[1] - location2[1]) + Math.abs(location1[2] - location2[2]);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
const axesHelper = new THREE.AxesHelper( 1200 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
document.body.appendChild( renderer.domElement );

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function drawScanner(scanner, size) {
    for (const cube of scanner.cubes) {
        scene.remove(cube);
    }
    scanner.clearCubes();
    for (const beacon of scanner.beacons) {
        const geo = new THREE.BoxGeometry(size,size,size);
        const material = new THREE.MeshBasicMaterial( {color: scanner.color} );
        const cube = new THREE.Mesh(geo, material);
        scene.add(cube);
        scanner.addCube(cube);

        cube.position.set(...beacon.getRealPosition(scanner));
    }
}

function resetScene() {
    scene.clear();
    scene.add(axesHelper);
}

function FindBounds(scanners) {
    let xBounds = [9999999999,-9999999999];
    let yBounds = [9999999999,-9999999999];
    let zBounds = [9999999999,-9999999999];
    for (const scanner of scanners) {
        for (const beacon of scanner.beacons) {
            if (beacon.coordinates[0] < xBounds[0]) {
                xBounds[0] = beacon.coordinates[0];
            }
            if (beacon.coordinates[0] > xBounds[1]) {
                xBounds[1] = beacon.coordinates[0];
            }

            if (beacon.coordinates[1] < yBounds[0]) {
                yBounds[0] = beacon.coordinates[1];
            }
            if (beacon.coordinates[1] > yBounds[1]) {
                yBounds[1] = beacon.coordinates[1];
            }

            if (beacon.coordinates[2] < zBounds[0]) {
                zBounds[0] = beacon.coordinates[2];
            }
            if (beacon.coordinates[2] > zBounds[1]) {
                zBounds[1] = beacon.coordinates[2];
            }
        }
    }

    return [xBounds,yBounds,zBounds];
}

class Beacon {
    constructor(id, coordinates) {
        this.id = id
        this.coordinates = coordinates;
        this.otherBeaconDistances = {};
        this.potentialOtherBeaconDistances = {};
    }

    addOtherBeaconDistance(otherBeacon) {
        this.otherBeaconDistances[otherBeacon.id] = this.distanceTo(otherBeacon, [1,1,1], [0], {shiftNum:[0], rotation: [1,1,1]});

        let options = [];
        for (let currentShift = 0; currentShift < 6; currentShift++) {
            let subOptions = [];
            for (let currentRotation = 0; currentRotation < rotations.length; currentRotation++) {
                subOptions.push(arrayMultiply(shift(this.otherBeaconDistances[otherBeacon.id], [currentShift]), rotations[currentRotation]));
            }

            options.push(subOptions);
        }

        this.potentialOtherBeaconDistances[otherBeacon.id] = options;
    }

    distanceTo(otherBeacon, rotation, shiftNum, otherScanner) {
        const shiftedCoords = [...arrayMultiply(shift(this.coordinates, shiftNum), rotation)];
        const otherShiftedCoords = [...arrayMultiply(shift(otherBeacon.coordinates, otherScanner.shiftNum), otherScanner.rotation)];

        return [
            otherShiftedCoords[0] - shiftedCoords[0],
            otherShiftedCoords[1] - shiftedCoords[1],
            otherShiftedCoords[2] - shiftedCoords[2]
        ];
    }

    getRealPosition(scanner) {
        const shiftedCoords = [...arrayMultiply(shift(this.coordinates, scanner.shiftNum), scanner.rotation)];
        return [
            shiftedCoords[0] + scanner.origin[0],
            shiftedCoords[1] + scanner.origin[1],
            shiftedCoords[2] + scanner.origin[2]
        ];
    }
}

class Scanner {
    constructor(rawBeacons, color, id) {
        this.beacons = rawBeacons.map((beacon, index) => new Beacon(index, beacon));
        this.origin = [0,0,0];
        this.rotation = [1,1,1];
        this.shiftNum = [0];
        this.color = color;
        this.cubes = [];
        this.failedList = [];
        this.id = id;
        this.solved = false;

        for (let i = 0; i < this.beacons.length; i++) {
            for (let j = 0; j < this.beacons.length; j++) {
                if (i === j) {
                    continue;
                }
                this.beacons[i].addOtherBeaconDistance(this.beacons[j]);
            }
        }
    }

    saveAdjustedOtherBeaconDistance() {
        for (const beacon of this.beacons) {
            for (const otherDistanceId in beacon.otherBeaconDistances) {
                beacon.otherBeaconDistances[otherDistanceId] = arrayMultiply(shift(beacon.otherBeaconDistances[otherDistanceId], this.shiftNum), this.rotation);
            }
        }
    }

    addCube(cube) {
        this.cubes.push(cube);
    }

    clearCubes() {
        this.cubes = [];
    }



    findSharedBeacons(otherScanner) {
        let numShared = 0;

        for (let currentShift = 0; currentShift < 6; currentShift++) {
            for (let currentRotation = 0; currentRotation < rotations.length; currentRotation++) {
                for (let myBeaconIndex = 0; myBeaconIndex < this.beacons.length; myBeaconIndex++) {
                    for (let otherBeaconIndex = 0; otherBeaconIndex < otherScanner.beacons.length; otherBeaconIndex++) {
                        numShared = 0;
                        let numChecked = 0;
                        for (const myDistanceId in this.beacons[myBeaconIndex].otherBeaconDistances) {
                            for (const otherDistanceId in otherScanner.beacons[otherBeaconIndex].otherBeaconDistances) {
                                const myDistance = this.beacons[myBeaconIndex].potentialOtherBeaconDistances[myDistanceId][currentShift][currentRotation];
                                const otherCoordDistance = otherScanner.beacons[otherBeaconIndex].otherBeaconDistances[otherDistanceId];

                                if (arrayEquals(otherCoordDistance, myDistance)) {
                                    numShared++;
                                    if (numShared >= 11) {
                                        return [this.beacons[myBeaconIndex].distanceTo(otherScanner.beacons[otherBeaconIndex], rotations[currentRotation], [currentShift], otherScanner), rotations[currentRotation], currentShift];
                                    }
                                }
                                numChecked++;
                            }
                            if (this.beacons[myBeaconIndex].otherBeaconDistances.length - numChecked + numShared <11) {
                                break;
                            }
                        }
                    }
                }
            }
        }

        return 0;
    }
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const scanners = reader.result.split(/\n\n/).map(scanner=>{
            return scanner.split(/\n/).slice(1).map(coord => coord.split(',').map(num => Number(num)));
        }).map((scanner, index) => new Scanner(scanner, colors[index], index));

        const bounds = FindBounds(scanners);
        const pointSize = Math.max(Math.abs(bounds[0][1]-bounds[0][0])/25,1);

        scene.add( axesHelper );

        camera.position.x = bounds[0][1]*1.5+10;
        camera.position.y = bounds[1][1]*1.5+10;
        camera.position.z = bounds[2][1]*1.5+10;
        camera.lookAt(0,0,0);

        animate();
        drawScanner(scanners[0], pointSize);
        animate();
        await delay(document.getElementById("moveSpeed").value);
        scanners[0].solved = true;

        let allSolved = false;
        let allFailed = true;
        while (!allSolved) {
            allSolved = true;
            allFailed = true;
            for (let i = 0; i < scanners.length; i++) {
                if (scanners[i].solved) {
                    continue;
                }

                let hit = false;
                for (let j = 0; j < scanners.length; j++) {
                    if (i === j) {
                        continue;
                    }

                    if (!scanners[j].solved) {
                        continue;
                    }

                    if (scanners[i].failedList.includes(scanners[j].id)) {
                        continue;
                    }

                    await delay(document.getElementById("moveSpeed").value);

                    const offsets = scanners[i].findSharedBeacons(scanners[j]);
                    if (offsets !== 0) {
                        scanners[i].shiftNum = [offsets[2]];
                        scanners[i].rotation = [...offsets[1]];

                        scanners[i].origin = arrayAdd(offsets[0], scanners[j].origin);
                        scanners[i].solved = true;
                        console.log(i + " " + j);

                        scanners[i].saveAdjustedOtherBeaconDistance();

                        drawScanner(scanners[i], pointSize);

                        animate();
                        await delay(document.getElementById("moveSpeed").value);
                        hit = true;
                        allFailed = false;
                        break;
                    } else {
                        scanners[i].failedList.push(scanners[j].id);
                        scanners[j].failedList.push(scanners[i].id);
                    }

                }
                if (!hit) {
                    allSolved = false;
                }
            }

            if (allFailed) {
                console.log("Failed to find any matches");
                break;
            }
        }

        let maxDistance = 0;

        for (const scanner1 of scanners) {
            for (const scanner2 of scanners) {
                const distance = manhattanDistance(scanner1.origin, scanner2.origin);
                if (distance > maxDistance) {
                    maxDistance = distance;
                }
            }
        }

        drawLegend(scanners.length);

        const answer = maxDistance;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});