const delay = ms => new Promise(res => setTimeout(res, ms));

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        const inputs = reader.result.split(/\r|\n/).map(line => {
            return line.split('|').map(side => {
                return side.split(' ').filter(word => {
                    return word !=='';
                });
            })
        })

        let total_1_4_7_8 = 0;

        let html = '';

        for (const line of inputs) {
            const rightSide = line[1];
            if (!rightSide) {
                continue;
            }
            html += `<div class='row'>${line[0].join('  ')}  |`;
            for (const outputValue of rightSide) {
                const numCharacters = outputValue.length;
                let bHighlight = false;
                switch (numCharacters) {
                    case 2:
                        //1
                    case 4:
                        //4
                    case 3:
                        //7
                    case 7:
                        //8
                        total_1_4_7_8++;
                        bHighlight=true;
                        break;
                    default:
                        break;
                }

                if (bHighlight) {
                    html += `  <span style="color: saddlebrown;font-weight: bolder">${outputValue}</span>`;
                } else {
                    html += "  " + outputValue;
                }
            }
            html += `</div>`;
        }

        document.getElementById("numbers").innerHTML = html;
        document.getElementById("answer").innerText = total_1_4_7_8 + "";
    }

    reader.readAsText(this.files[0]);
});