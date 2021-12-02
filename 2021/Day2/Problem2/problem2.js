document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= function() {
        let horizontal = 0;
        let depth = 0;
        let aim = 0;

        for (const input of reader.result.split(/\r|\n/)) {
            const inputPieces = input.split(' ');
            const command = inputPieces[0];
            const magnitude = Number(inputPieces[1]);

            if (command === "forward") {
                horizontal += magnitude;
                depth += aim * magnitude;
            } else if (command === "up") {
                aim -= magnitude;
            } else if (command === "down") {
                aim += magnitude;
            }
        }

        const finalProduct = horizontal * depth;

        document.getElementById("answer").innerText = finalProduct + "";
    }

    reader.readAsText(this.files[0]);
});