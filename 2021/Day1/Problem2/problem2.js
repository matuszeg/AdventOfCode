function findAnswer() {
    const inputs = document.getElementById("input").value.split(/\r|\n/);

    let numGreater = 0;

    let previousValues = ["","", ""];

    for (const input of inputs) {
        const inputNumber = Number(input);
        if (previousValues[0] !== "" && previousValues[1] !=="" && previousValues[2] !== "") {
            const previousSum = previousValues[0] + previousValues[1] + previousValues[2];
            const currentSum = previousValues[2] + previousValues[1] + inputNumber;

            if (currentSum > previousSum) {
                numGreater++;
            }
        }


        if (previousValues[1] !== "") {
            previousValues[0] = previousValues[1];
        }

        if (previousValues[2] !== "") {
            previousValues[1] = previousValues[2];
        }

        previousValues[2] = inputNumber;
    }

    document.getElementById("answer").innerText = numGreater+"";
}