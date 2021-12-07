const delay = ms => new Promise(res => setTimeout(res, ms));

function DisplayDay(numDay, fish) {

    document.getElementById('days').innerText += `After ${numDay} days: ${fish.join(',')}`;
}


document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        let inputs = reader.result.split(',').map(input => {
            return Number(input);
        });
        const numDays = document.getElementById('numDays').value;
        DisplayDay(0, inputs);

        for (let i = 1; i <= numDays; i++) {
            let newFish = [];
            for (let j = 0; j< inputs.length; j++) {
                if (inputs[j] === 0) {
                    inputs[j] = 6;
                    newFish.push(8);
                } else {
                   inputs[j]--;
                }
            }

            inputs.push(...newFish);
            DisplayDay(i, inputs);
        }

        document.getElementById("answer").innerText = inputs.length + "";
    }


    reader.readAsText(this.files[0]);
});