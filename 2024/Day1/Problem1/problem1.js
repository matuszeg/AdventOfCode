const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

function swap(arr, index1, index2) {
    [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
}

class Canvas {
    constructor(height, width) {
        this.board = document.getElementById('canvas');
        this.board.height = height;
        this.board.width = width;
        this.board.style.height = height+"px";
        this.board.style.width = width+"px";
        this.boardContext = this.board.getContext('2d');
    }

    async draw(leftSide, rightSide, connections) {
        const heightSpacer = Math.floor(this.board.height / leftSide.length);

        this.boardContext.clearRect(0, 0, this.board.width, this.board.height);

        for (let i = 0; i < leftSide.length; i++) {
            this.boardContext.fillText(leftSide[i], 100, i * heightSpacer + 50);
        }

        for (let i = 0; i < rightSide.length; i++) {
            this.boardContext.fillText(rightSide[i], 300, i * heightSpacer + 50);
        }

        let totalDifference = 0;

        for (let i = 0; i < connections; i++) {
            const height = i * heightSpacer + 50;
            this.boardContext.moveTo(150, height);
            this.boardContext.lineTo(250, height);
            this.boardContext.strokeStyle = 'red';
            this.boardContext.stroke();

            const difference =  Math.abs(leftSide[i] - rightSide[i]);
            totalDifference += difference;

            this.boardContext.fillText(`= ${difference}`, 450, height)
        }

        document.getElementById("answer").innerText = connections === leftSide.length ? `Final: ${totalDifference}` : `Processing: ${totalDifference}`;

        await delay(document.getElementById("moveSpeed").value);
    }
}

document.getElementById('inputfile').addEventListener('change', function () {
    const bShowProgress = document.getElementById("showProgress").checked;

    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\r|\n/);

        const leftSide = [];
        const rightSide = [];

        for (const inputLine of inputs) {
            const lineValues = inputLine.split("   ");
            if (lineValues.length !== 2) {
                continue;
            }

            leftSide.push(Number(lineValues[0]));
            rightSide.push(Number(lineValues[1]));
        }

        const height = Math.min(10000-50,leftSide.length * 50);

        const canvas = new Canvas(height,600);

        let bFinished = false;

        let connections = 0;
        await canvas.draw(leftSide, rightSide, connections);

        while (!bFinished) {
            let leftIndex = connections;
            let rightIndex = connections;

            for (let i = connections+1; i < leftSide.length; i++) {
                if (leftSide[i] < leftSide[leftIndex]) {
                    leftIndex = i;
                }

                if (rightSide[i] < rightSide[rightIndex]) {
                    rightIndex = i;
                }
            }

            swap(leftSide, connections, leftIndex);
            swap(rightSide, connections, rightIndex);
            connections++;

            if (connections === leftSide.length) {
                bFinished = true;
            }

            if (bShowProgress || bFinished) {
                await canvas.draw(leftSide, rightSide, connections);
            }
        }
    }

    reader.readAsText(this.files[0]);
});