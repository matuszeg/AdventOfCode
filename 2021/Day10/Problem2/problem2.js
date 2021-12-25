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

function getNeededOperator(openOperator) {
    switch(openOperator) {
        case "(":
            return ")";
        case "[":
            return "]";
        case "{":
            return "}";
        case "<":
            return ">";
        default:
            break;
    }
    return "";
}

function getAutocompleteValue(operators) {
    let value = 0;
    for (const operator of operators) {
        value *= 5;
        switch(operator) {
            case ")":
                value += 1;
                break;
            case "]":
                value += 2;
                break;
            case "}":
                value += 3;
                break;
            case ">":
                value +=4;
                break;
            default:
                break;
        }
    }

    return value;
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

        let autoCompleteValues = [];

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
                        lineClasses.push("line-corrupt");
                        bIsCorrupt = true;
                    }
                }
                htmlContents += `<div class="${classes.join(' ')}">${operator}</div>`;
                if (bIsCorrupt) {
                    break;
                }
            }

            if (!bIsCorrupt && operatorStack.length > 0) {
                let neededOperators = "";
                while (operatorStack.length > 0) {
                    neededOperators += getNeededOperator(operatorStack.pop());
                }
                const autoCompleteValue = getAutocompleteValue(neededOperators);
                autoCompleteValues.push(autoCompleteValue);
                htmlContents += `<div class="auto-complete">${neededOperators}</div><div>Score: ${autoCompleteValue}</div>`;
            }

            html += `<div class="${lineClasses.join(' ')}">${htmlContents}</div>`;
        }

        autoCompleteValues.sort((a,b) => {
            return a-b;
        });

        const answer = autoCompleteValues[Math.floor(autoCompleteValues.length/2)];


        document.getElementById("map").innerHTML = html;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});