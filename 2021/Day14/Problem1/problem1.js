const delay = ms => new Promise(res => setTimeout(res, ms));

function ProcessStep(startPolymer, instructionMap) {
    let inserts = [];
    const startPolymerArray = startPolymer.split('');
    for (let i = 0; i < (startPolymerArray.length-1); i++) {
        const pair = startPolymerArray[i] + startPolymerArray[i+1];
        inserts.push(instructionMap.get(pair));
    }

    for (let i = 0; i < inserts.length; i++) {
        startPolymerArray.splice((i*2)+1, 0, inserts[i]);
    }

    return startPolymerArray.join('');
}

function PrintStep(num, polymer) {
    document.getElementById('polymers').innerHTML += `<div class="polymer">Step ${num}: ${polymer}</div>`;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        const inputs = reader.result.split(/\n\n/);
        const startingPolymer = inputs[0];
        const instructions = inputs[1].split(/\r|\n/).filter(line=> line.length > 0).map(line => {
            return line.split(' -> ');
        });

        let instructionMap = new Map();

        for (const instruction of instructions) {
            instructionMap.set(instruction[0], instruction[1]);
        }

        const numSteps = document.getElementById('numSteps').value;

        let currentPolymer = startingPolymer;
        PrintStep(0, currentPolymer);

        for (let i = 0; i < numSteps; i++) {
             currentPolymer = ProcessStep(currentPolymer, instructionMap);
             PrintStep(i+1, currentPolymer);
        }

        const elementMap = new Map();
        for (const element of currentPolymer.split('')) {
            if (!elementMap.has(element)) {
                elementMap.set(element, 1)
            } else {
                elementMap.set(element, elementMap.get(element) + 1) ;
            }
        }

        let least = 99999999999999;
        let most = 0;

        elementMap.forEach(count => {
            if (count > most) {
                most = count;
            }
            if (count < least) {
                least = count;
            }
        });

        const answer = most - least;

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});