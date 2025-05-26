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

    async draw(leftSide, rightSide, connections, math) {
        const heightSpacer = Math.floor(this.board.height / leftSide.length);

        for (let i = 0; i < connections.length; i++) {
            const leftHeight = connections[i][0] * heightSpacer + 50;
            const rightHeight = connections[i][1] * heightSpacer + 50;
            this.boardContext.moveTo(110, leftHeight);
            this.boardContext.lineTo(299, rightHeight);
            this.boardContext.strokeStyle = 'red';
            this.boardContext.stroke();
        }

        for (let i = 0; i < math.length; i++) {
            this.boardContext.fillText(`${math[i]} = `, 50, i * heightSpacer + 50);
        }

        await delay(document.getElementById("moveSpeed").value);
    }
}

document.getElementById('inputfile').addEventListener('change', function () {
    const bShowProgress = document.getElementById("showProgress").checked;
    console.log(bShowProgress);

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

        leftSide.sort();
        rightSide.sort();

        const height = Math.min(10000-50,leftSide.length * 50);

        const canvas = new Canvas(height,600);

        let bFinished = false;

        let connections = [];
        let math = [];
        await canvas.draw(leftSide, rightSide, connections, math);

        let leftIndex = 0;
        let rightIndex = 0;
        math[leftIndex] = 0;

        const heightSpacer = Math.floor(canvas.board.height / leftSide.length);
        canvas.boardContext.clearRect(0, 0, canvas.board.width, canvas.board.height);

        for (let i = 0; i < leftSide.length; i++) {
            canvas.boardContext.fillText(leftSide[i], 100, i * heightSpacer + 50);
        }

        for (let i = 0; i < rightSide.length; i++) {
            canvas.boardContext.fillText(rightSide[i], 300, i * heightSpacer + 50);
        }

        while (!bFinished) {
            if (leftSide[leftIndex] === rightSide[rightIndex]) {
               connections.push([leftIndex, rightIndex]);
               math[leftIndex] = math[leftIndex]+leftSide[leftIndex];
               rightIndex++;
           } else {
                if (leftSide[leftIndex] > rightSide[rightIndex] || leftSide.length === leftIndex + 1) {
                    rightIndex++
                } else {
                    const nextMath = leftSide[leftIndex] === leftSide[leftIndex + 1] ? math[leftIndex] : 0;
                    leftIndex++;
                    if (leftIndex >= leftSide.length) {
                        leftIndex = leftSide.length - 1;
                    }

                    math[leftIndex] = nextMath;
                }
            }

            let totalMath = 0;
            for (let i = 0; i < math.length; i++) {
                totalMath+= math[i];
            }

            bFinished = leftIndex >= leftSide.length-1 && rightIndex >= rightSide.length-1;

            console.log(`LeftIndex: ${leftIndex}   RightIndex: ${rightIndex}`);
            console.log(`LeftSide Length: ${leftSide.length}   RightSide Length: ${rightSide.length}`);


            if (bShowProgress || bFinished) {
                console.log("finished");
                await canvas.draw(leftSide, rightSide, connections, math);
                document.getElementById("answer").innerText = bFinished ? `Final: ${totalMath}` : `Processing: ${totalMath}`;
            }
        }
    }

    reader.readAsText(this.files[0]);
});