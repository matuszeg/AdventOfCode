function findAnswer() {
    const inputs = document.getElementById("input").value.split(/\r|\n/);

    let numGreater = 0;

    let previousValue = "";

    for (const input of inputs) {
        if (previousValue !== "" && input > previousValue ) {
            numGreater++;
        }

        previousValue = Number(input);
    }

    document.getElementById("answer").innerText = numGreater+"";
}