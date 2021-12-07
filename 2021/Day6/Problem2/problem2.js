const delay = ms => new Promise(res => setTimeout(res, ms));

function DisplayDay(numDay, fish) {

    document.getElementById('days').innerText += `After ${numDay} days: ${fish.join(',')}\n`;
}


document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        const inputs = reader.result.split(',').map(input => {
            return Number(input);
        });

        let compressedInputs = [0,0,0,0,0,0,0,0,0];

        for (let input of inputs) {
            compressedInputs[input]++;
        }

        const numDays = document.getElementById('numDays').value;
        DisplayDay(0, compressedInputs);

        for (let i = 1; i <= numDays; i++) {
            const spawners = compressedInputs[0];
            for (let j = 1; j<9; j++) {
                compressedInputs[j-1] = compressedInputs[j];
            }

            compressedInputs[8] = spawners;
            compressedInputs[6] += spawners;

            DisplayDay(i, compressedInputs);
        }

        const answer = compressedInputs.reduce((sum, val) => sum + val);

        document.getElementById("answer").innerText = answer + "";
    }


    reader.readAsText(this.files[0]);
});