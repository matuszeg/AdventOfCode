document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= function() {

        let counters = [];
        let bFirstTime = true;
        for (const input of reader.result.split(/\r|\n/)) {
            if (bFirstTime) {
                for (let i = 0; i < input.length; i++) {
                    counters.push(0);
                }
                bFirstTime = false;
            }
            for (let i = 0; i < input.length; i++) {
                if (Number(input.charAt(i)) === 0) {
                    counters[i]--;
                } else if(Number(input.charAt(i)) === 1) {
                    counters[i]++;
                }
            }
        }

        let gamma = "";
        let epsilon = "";

        for (let i = 0; i < counters.length; i++) {
            if (counters[i] > 0) {
                gamma += "1";
                epsilon += "0";
            } else if (counters[i] < 0) {
                gamma += "0";
                epsilon += "1";
            } else {
                alert("I dont think this is supposed to happen");
            }
        }

        const gammaNumber = parseInt(gamma, 2);
        const epsilonNumber = parseInt(epsilon, 2);
        const powerConsumption = gammaNumber * epsilonNumber;


        document.getElementById("answer").innerText = powerConsumption + "";
    }

    reader.readAsText(this.files[0]);
});