const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

function drawImage(image) {
    let html = '';

    for (const row of image) {
        for (const entry of row) {
            html += entry === 1 ? '#' : '.';
        }
        html += '<br />';
    }

    document.getElementById("legend").innerHTML = html;
}

async function processImage(inputImage, algo, bFlipInfinitePlane = false, passNum = 0) {

    const blankChar = bFlipInfinitePlane && passNum % 2 === 1 ? 1 : 0;
    const blankLine = Array(inputImage[0].length).fill(blankChar);
    let paddedInputImage = [[...blankLine]];
    paddedInputImage.push(...inputImage);
    paddedInputImage.push([...blankLine]);
    paddedInputImage = paddedInputImage.map(row => [blankChar,...row,blankChar]);

    drawImage(paddedInputImage);
    await delay(document.getElementById("moveSpeed").value);

    const outputImage = [];
    for (let rowIndex = 0; rowIndex < paddedInputImage.length; rowIndex++) {
        const newRow = [];
        for (let entryIndex = 0; entryIndex < paddedInputImage[rowIndex].length; entryIndex++) {
            let binary = '';
            for (let subRow = -1; subRow <= 1; subRow++) {
                for (let subCol = -1; subCol <= 1; subCol++) {
                    const realRow = subRow + rowIndex;
                    const realCol = subCol + entryIndex;

                    if (realRow < 0 || realRow >= paddedInputImage.length) {
                        binary += blankChar;
                        continue;
                    }

                    if (realCol < 0 || realCol >= paddedInputImage[realRow].length) {
                        binary += blankChar;
                        continue;
                    }

                    binary += paddedInputImage[realRow][realCol];
                }
            }

            const decimal = parseInt(binary, 2);

            newRow.push(algo[decimal]);
        }

        outputImage.push(newRow);
    }

    return outputImage;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputData = reader.result.split(/\n\n/);
        const imageEnhancementAlgorithm = inputData[0].split('').map(entry => entry === '#' ? 1 : 0);
        const inputImage = inputData[1].split(/\n/).map(row => row.split('').map(entry => entry === '#' ? 1 : 0));

        let bInfinitePlaneFlip = false;

        //If binary 000000000 is 1 and binary 111111111 is 0,
        //then we need to flip the infinite plane back and forth from . to # or 0 to 1
        if (imageEnhancementAlgorithm[0] === 1
            && imageEnhancementAlgorithm[imageEnhancementAlgorithm.length-1] === 0
        )
        {
            bInfinitePlaneFlip = true;
        }

        drawImage(inputImage);
        await delay(document.getElementById("moveSpeed").value);

        const numPasses = document.getElementById("numPasses").value;
        let outputImage = inputImage;
        for (let i = 0; i < numPasses; i++) {
            outputImage = await processImage([...outputImage], imageEnhancementAlgorithm, bInfinitePlaneFlip, i);
            drawImage(outputImage);
            await delay(document.getElementById("moveSpeed").value);
        }

        let numLitUp = 0;

        for (const row of outputImage) {
            for (const entry of row) {
                numLitUp += entry;
            }
        }

        const answer = numLitUp;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});