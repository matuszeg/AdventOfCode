const delay = ms => new Promise(res => setTimeout(res, ms));

function checkClose(openOperator, closeOperator) {
    switch(closeOperator) {
        case ")":
            return openOperator === "(";
        case "]":
            return openOperator === "[";
        case "}":
            return openOperator === "{";
        case ">":
            return openOperator === "<";
        default:
            break;
    }
    return false;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\r|\n/).map(line => {
            return line.split('');
        }).filter(line => line.length > 0);

        const openOperators = "([{<";
        let corruptOperators = "";
        let html = "";

        for (const line of inputs) {
            let lineClasses = ["line"];
            let operatorStack = [];
            let htmlContents = "";
            let bIsCorrupt = false;
            for (const operator of line) {
                let classes = ["operator"];
                if (openOperators.includes(operator)) {
                    operatorStack.push(operator);
                } else {
                    if (!checkClose(operatorStack.pop(), operator)) {
                        //CORRUPT
                        corruptOperators += operator;
                        classes.push("corrupt");
                        lineClasses.push("line-corrupt");
                        bIsCorrupt = true;
                    }
                }
                htmlContents += `<div class="${classes.join(' ')}">${operator}</div>`;
                if (bIsCorrupt) {
                    break;
                }
            }
            html += `<div class="${lineClasses.join(' ')}">${htmlContents}</div>`;
        }
        let answer = 0;
        for (const corruptOperator of corruptOperators) {
            switch (corruptOperator) {
                case ")":
                    answer += 3;
                    break;
                case "]":
                    answer += 57;
                    break;
                case "}":
                    answer += 1197;
                    break;
                case ">":
                    answer += 25137;
                    break;
                default:
                    break;
            }
        }

        document.getElementById("map").innerHTML = html;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});