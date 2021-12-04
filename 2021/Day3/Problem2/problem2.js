document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= function() {

        const inputs = reader.result.split(/\r|\n/);

        let oxygenCandidates = inputs.sort();
        let co2Candidates = oxygenCandidates;

        for (let i = 0; i < inputs[0].length; i++) {
            for ( let j = 0; j < oxygenCandidates.length && oxygenCandidates.length > 1; j++) {
                if (oxygenCandidates[j].charAt(i) === "1") {
                    if (j <= (oxygenCandidates.length/2)) {
                        oxygenCandidates = oxygenCandidates.slice(j);
                    } else {
                        oxygenCandidates = oxygenCandidates.slice(0, j);
                    }
                    break;
                }

            }

            for ( let j = 0; j < co2Candidates.length && co2Candidates.length > 1; j++) {
                if (co2Candidates[j].charAt(i) === "1") {
                    if (j > (co2Candidates.length/2)) {
                        co2Candidates = co2Candidates.slice(j);
                    } else {
                        co2Candidates = co2Candidates.slice(0, j);
                    }
                    break;
                }
            }

            if (oxygenCandidates.length > 1) {
                oxygenCandidates.sort((a,b) => {
                    const aVal = a.charAt(i);
                    const bVal = b.charAt(i);
                    if (aVal < bVal) {
                        return -1;
                    } else if (aVal > bVal) {
                        return 1;
                    }
                    return 0;
                });
            }

            if (co2Candidates.length > 1) {
                co2Candidates.sort((a,b) => {
                    const aVal = a.charAt(i);
                    const bVal = b.charAt(i);
                    if (aVal < bVal) {
                        return -1;
                    } else if (aVal > bVal) {
                        return 1;
                    }
                    return 0;
                });
            }
        }

        const oxygenRating = parseInt(oxygenCandidates[0],2);
        const co2Rating = parseInt(co2Candidates[0], 2);
        const co2ScrubbingRating = oxygenRating * co2Rating;

        document.getElementById("answer").innerText = co2ScrubbingRating + "";
    }

    reader.readAsText(this.files[0]);
});