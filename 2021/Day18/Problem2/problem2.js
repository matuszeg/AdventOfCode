const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

class Pair {
    constructor(line, parent) {
        this.parent = parent;
        let pairLine = line;

        if (pairLine.charAt(0) === '[') {
            pairLine = line.slice(1);
        }

        this.first = this.processInput(pairLine);

        if (this.first.remainder) {
            this.firstReal = false;
            this.second = this.processInput(this.first.remainder);
            if (this.second.remainder) {
                this.secondReal = false;
                this.remainder = this.second.remainder;
            } else {
                this.secondReal = true;
                this.remainder = this.first.remainder.slice(3);
            }
        } else {
            this.firstReal = true;
            this.second = this.processInput(pairLine.slice(1));
            if (this.second.remainder) {
                this.secondReal = false;
                this.remainder = this.second.remainder;
            } else {
                this.secondReal = true;
                this.remainder = pairLine.slice(4);
            }
        }
    }

    toString() {
        const firstString = this.firstReal ? this.first : this.first.toString();
        const secondString = this.secondReal ? this.second : this.second.toString();
        return `[${firstString},${secondString}]`;
    }

    processInput(line) {
        let processLine = line;

        while (processLine.charAt(0) === ']') {
            processLine = processLine.slice(1);
        }

        if (processLine.charAt(0) === '[') {
            return new Pair(processLine, this);
        } else if (processLine.charAt(0) === ',') {
            return this.processInput(processLine.slice(1));
        } else {
            return Number(processLine.charAt(0));
        }
    }

    parentCount() {
        if (!this.parent) {
           return 0;
        }

        return 1 + this.parent.parentCount();
    }

    findLeftMostReal(toAdd,reducePair) {
        if (this.first === reducePair) {
            if (this.parent) {
                this.parent.findLeftMostReal(toAdd, this);
            }
            return;
        }
        if (this.firstReal) {
            this.first += toAdd;
        } else {
            this.first.addRightMostReal(toAdd);
        }
    }

    addLeftMostReal(toAdd) {
        if (this.firstReal) {
            this.first += toAdd;
        } else {
            this.first.addLeftMostReal(toAdd);
        }
    }

    findRightMostReal(toAdd, reducePair) {
        if (this.second === reducePair) {
            if (this.parent) {
                this.parent.findRightMostReal(toAdd, this);
            }
            return;
        }
        if (this.secondReal) {
            this.second += toAdd;
        } else {
            this.second.addLeftMostReal(toAdd);
        }
    }

    addRightMostReal(toAdd) {
        if (this.secondReal) {
            this.second += toAdd;
        } else {
            this.second.addRightMostReal(toAdd);
        }
    }

    checkReduce() {
        if (this.checkExplode()) {
            return true;
        }

        return this.checkSplit();
    }

    checkExplode() {
        if (!this.firstReal && this.first.checkExplode()) {
            return true;
        }

        if (!this.secondReal && this.second.checkExplode()) {
            return true;
        }

        if (this.parentCount() >= 4 && this.firstReal && this.secondReal) {
            this.explode();
            return true;
        }
        return false;
    }

    explode() {
        this.parent.findLeftMostReal(this.first, this);
        this.parent.findRightMostReal(this.second, this);
        if (this.parent.first === this) {
            this.parent.first = 0;
            this.parent.firstReal = true;

        } else {
            this.parent.second = 0;
            this.parent.secondReal = true;
        }
    }

    checkSplit() {
        if (this.firstReal && this.first >= 10) {
            this.first = this.splitInPair(this.first);
            this.firstReal = false;
            return true;
        }
        if (!this.firstReal && this.first.checkSplit()) {
            return true;
        }

        if (this.secondReal && this.second >= 10) {
            this.second = this.splitInPair(this.second);
            this.secondReal = false;
            return true;
        }
        if (!this.secondReal && this.second.checkSplit()) {
            return true;
        }
        return false;
    }

    splitInPair(value) {
        const newFirst = Math.floor(Number(value) / 2.0);
        const newSecond = Math.round(Number(value) / 2.0);
        const newPair = new Pair(`[${newFirst},${newSecond}]`, this);
        newPair.firstReal = true;
        newPair.secondReal = true;
        newPair.first = newFirst;
        newPair.second = newSecond;
        return newPair;
    }

    add(otherPair) {
        return new Pair(`[${this.toString()},${otherPair.toString()}]`, this.parent);
    }

    getMagnitude() {
        const firstMag = 3 * (this.firstReal ? this.first : this.first.getMagnitude());
        const secondMag = 2 * (this.secondReal ? this.second : this.second.getMagnitude());
        return firstMag + secondMag;
    }
}

async function PrintData(html, bWait = true, bForceDraw = false) {
    if (!bForceDraw && !(document.getElementById('show').checked)) {
        return;
    }

    document.getElementById('data').innerHTML +=html;
    if (bWait) {
        await delay(document.getElementById("moveSpeed").value);
    }
}

async function GetMagFromPairAdd(pair1, pair2, bForceDraw = false) {
    await PrintData(`<div class="line">${pair1.toString()}</div>`, false, bForceDraw);
    await PrintData(`<div class="line add">+  ${pair2.toString()}</div>`, false, bForceDraw);
    const addedPair = pair1.add(pair2);
    await PrintData(`<div class="line">=  ${addedPair.toString()}</div>`, true, bForceDraw);
    while (addedPair.checkReduce()) {
        await PrintData(`<div class="reduce">${addedPair.toString()}</div>`, true, bForceDraw);
    }
    await PrintData('<br />', false, bForceDraw);

    return addedPair.getMagnitude();
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const lines = reader.result.split("\n");

        let largestMag = 0;
        let largestPair = [0,0];

        for (let i = 0; i < lines.length; i++) {
            const newPair1 = new Pair(lines[i], null);
            for (let j = 0; j < lines.length; j++) {
                if (i === j) {
                    continue;
                }
                const newPair2 = new Pair(lines[j], null);

                const mag = await GetMagFromPairAdd(newPair1, newPair2);
                if (mag > largestMag) {
                    largestMag = mag;
                    largestPair[0] = newPair1;
                    largestPair[1] = newPair2;
                }
            }
        }

        const answer = largestMag;

        document.getElementById("answer").innerText = answer + "";
        await GetMagFromPairAdd(largestPair[0], largestPair[1], true);
    }

    reader.readAsText(this.files[0]);
});