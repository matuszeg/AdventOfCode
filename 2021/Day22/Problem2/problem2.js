const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

function arrayCompare(array1, array2) {
    return array1[0] === array2[0] && array1[1] === array2[1] && array1[2] === array2[2];
}

function rangeOverlap(onRange, otherOnRange) {
    //[0,10] [5,15] = { overlap:[5,10], less:[0,4], greater:[11,15] }
    //[5,10] [0,4] = {}
    //[0,10] [0,10]

    if (onRange[0] < otherOnRange[0] && onRange[1] < otherOnRange[0]) {
        return {};
    }

    if (onRange[0] > otherOnRange[1] && onRange[1] > otherOnRange[1]) {
        return {};
    }

    const minOfTheMins = Math.min(onRange[0], otherOnRange[0]);
    const maxOfTheMins = Math.max(onRange[0], otherOnRange[0]);
    const maxOfTheMaxes = Math.max(onRange[1],otherOnRange[1]);
    const minOfTheMaxes = Math.min(onRange[1], otherOnRange[1]);

    let overlapData = {
        overlap: [maxOfTheMins, minOfTheMaxes]
    }

    if (minOfTheMins !== maxOfTheMins) {
        overlapData['less'] = [minOfTheMins, maxOfTheMins-1];
    }

    if (minOfTheMaxes !== maxOfTheMaxes) {
        overlapData['greater'] = [minOfTheMaxes-1, maxOfTheMaxes];
    }

    return overlapData;
}

function combineRange(onRange, otherOnRange) {
    //[0,10] [5,15] = [0,15]
    //[5,10] [0,4] = [5,10] [0,4]

    if (onRange[0] < otherOnRange[0] && onRange[1] < otherOnRange[0]) {
        return [onRange, otherOnRange];
    }

    if (onRange[0] > otherOnRange[1] && onRange[1] > otherOnRange[1]) {
        return [onRange, otherOnRange];
    }

    const newRange = [...onRange];


    if (otherOnRange[0] < newRange[0]) {
        newRange[0] = otherOnRange[0];
    }

    if (otherOnRange[1] > newRange[1]) {
        newRange[1] = otherOnRange[1];
    }

    return [newRange];
}

function splitRange(onRange, offRange) {
    //[0,10] [0,5] = [6,10]
    //[0,10] [2,5] = [0,1] [6,10]
    //[0,10] [5,10] = [0,4]

    // [0,10] [10,20] = [0,9]

    // [2,12] [2,10] = [11,12]
    // [2,4] [0,2] = [3,4]
    // [2,4] [4,4] = [2,3]

    // [1,3] [3,3] = [1,2]

    if (onRange[0] < offRange[0] && onRange[1] < offRange[0]) {
        return [onRange];
    }

    if (onRange[0] > offRange[1] && onRange[1] > offRange[1]) {
        return [onRange];
    }

    const newRanges = [];
    if (offRange[1] < onRange[1]) {
        newRanges.push([offRange[1]+1, onRange[1]]);
    }

    if (offRange[0] > onRange[0]) {
        newRanges.push([onRange[0], offRange[0]-1]);
    }

    if (newRanges.length === 0) {
        if (offRange[0] <= onRange[0] && offRange[1] >= onRange[1]) {
            return newRanges;
        }
        else {
            newRanges.push(onRange);
        }
    }

    return newRanges;
}

function processSplit(onRange, offRange) {
    const newXRange = splitRange(onRange[0], offRange[0]);
    const newYRange = splitRange(onRange[1], offRange[1]);
    const newZRange = splitRange(onRange[2], offRange[2]);

    if (newXRange.length <= 0 && newYRange.length <= 0 && newZRange.length <= 0) {
        return [];
    }

    const xOrig = newXRange.length > 0 && newXRange[0] === onRange[0];
    const yOrig = newYRange.length > 0 && newYRange[0] === onRange[1];
    const zOrig = newZRange.length > 0 && newZRange[0] === onRange[2];
    if (xOrig || yOrig || zOrig) {
        return [onRange];
    }

    const newRanges = [];

    const xRemainder = newXRange.length > 0 ? splitRange(onRange[0], newXRange[0]) : [onRange[0]];
    const yRemainder = newYRange.length > 0 ? splitRange(onRange[1], newYRange[0]) : [onRange[1]];
    const zRemainder = newZRange.length > 0 ? splitRange(onRange[2], newZRange[0]) : [onRange[2]];

    for (const newX of newXRange) {
        newRanges.push([newX, yRemainder[0], zRemainder[0]]);
    }

    for (const newY of newYRange) {
        newRanges.push([onRange[0], newY, zRemainder[0]]);
    }

    for (const newZ of newZRange) {
        newRanges.push([onRange[0], onRange[1], newZ]);
    }

    return newRanges;
}


document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\n/).map(row=> {
            const splitRow = row.split(' ');
            splitRow[0] = splitRow[0] === 'on';
            splitRow[1] = splitRow[1].split(',').map(coordPair =>
                coordPair.split('=')[1].split('..').map(coord => Number(coord))
            );
            return splitRow;
        });

        let ranges = [];
        for (const [bOnOff, coordinates] of inputs ) {
            let newRanges = [];

            if (bOnOff) {
                ranges.push(coordinates);
                continue;
            }

            for (const onRange of ranges) {
                const subRanges = processSplit(onRange, coordinates);
                if (subRanges.length === 0) {
                    continue;
                }

                newRanges = newRanges.concat(subRanges);
            }

            ranges = newRanges;
        }

        const preCombineRanges = [...ranges];
        console.log(preCombineRanges);

        for (let i = 0; i < ranges.length; i++) {
            let newRanges = [];
            let numOverlaps = 0;
            let coordinates = ranges[i];

            for (let j = i+1; j < ranges.length; j++) {
                let onRange = ranges[j];

                const overlapX = rangeOverlap(coordinates[0], onRange[0]);
                const overlapY = rangeOverlap(coordinates[1], onRange[1]);
                const overlapZ = rangeOverlap(coordinates[2], onRange[2]);

                if (Object.keys(overlapX).length === 0 || Object.keys(overlapY).length === 0 || Object.keys(overlapZ).length === 0) {
                    newRanges.push(onRange);
                    continue;
                }

                numOverlaps++

                const overlap = [overlapX.overlap,overlapY.overlap,overlapZ.overlap];
                const overlapCoords = [
                    [...overlap],
                ];

                const coordDiff = processSplit(coordinates, overlap);
                if (coordDiff.length > 0) {
                    overlapCoords.push(...coordDiff);
                }

                const onRangeDiff = processSplit(onRange, overlap);
                if (onRangeDiff.length > 0) {
                    overlapCoords.push(...onRangeDiff);
                }

                coordinates = overlapCoords[0];
                for (const overlap of overlapCoords.slice(1)) {
                    newRanges.push(overlap);
                }
            }

            if (numOverlaps !== 0) {
                newRanges.unshift([...coordinates]);
                ranges.splice(i, ranges.length-i, ...newRanges);
            }
        }


        console.log([...ranges]);

        let onCount = 0;
        for (const onRange of ranges) {
            const minX = onRange[0][0];
            const maxX = onRange[0][1];

            const minY = onRange[1][0];
            const maxY = onRange[1][1];

            const minZ = onRange[2][0];
            const maxZ = onRange[2][1];

            const numX = maxX - minX + 1;
            const numY = maxY - minY + 1;
            const numZ = maxZ - minZ + 1;

            onCount += numX * numY * numZ;
        }

        const answer = onCount;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});