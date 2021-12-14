const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

function RemoveAllCharacters(word, toRemove) {
    let newWord = word;
    for (let i = 0; i < toRemove.length; i++) {
        newWord = newWord.replace(toRemove[i], '');
    }
   return newWord;
}

function CommonCharacterCount(word1, word2) {
    let commonCount = 0;
    for (let i of word1){
        for(let j of word2){
            if( i === j){
                commonCount++;
            }
        }
    }
    return commonCount;
}

function CommonCharacters2(word1, word2) {
    let resultString = '';
    for (let i of word1){
        for(let j of word2){
            if( i === j){
                resultString += j;
            }
        }
    }
    return resultString;
}

function CommonCharacters3(word1, word2, word3) {
    let resultString = '';
    for (let i of word1){
        for(let j of word2){
            for(let k of word3) {
                if( i === j && i === k){
                    resultString += j;
                }
            }
        }
    }
    return resultString;
}

async function DisplayCorrectPositions(positions) {
    document.getElementById('workzone').innerText = `${positions.join('     ')}`;
    await delay(document.getElementById("moveSpeed").value);
}

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

        let totalOutputValue = 0;

        let html = '';

        for (const line of inputs) {
            const leftSide = line[0];
            const rightSide = line[1];

            if (!rightSide) {
                continue;
            }
            let correctPositions = ['abcdefg','abcdefg','abcdefg','abcdefg','abcdefg','abcdefg','abcdefg'];

            const sortedLeftSide = leftSide.sort((first, second) => {
                if (first.length < second.length) {
                    return -1;
                } else if (first.length > second.length) {
                    return 1;
                }
                return 0;
            });

            await DisplayCorrectPositions(correctPositions);

            const SetCorrectPositions = async (index, newValue) => {
                correctPositions[index] = newValue;
                await DisplayCorrectPositions(correctPositions);
            };

            await SetCorrectPositions(2, sortedLeftSide[0]); //1
            await SetCorrectPositions(5, sortedLeftSide[0]); //1
            await SetCorrectPositions(0, RemoveAllCharacters(sortedLeftSide[1], sortedLeftSide[0])); // 7 remove what we know of 1 gives us the first slot.
            await SetCorrectPositions(1, RemoveAllCharacters(sortedLeftSide[2], sortedLeftSide[0]));
            await SetCorrectPositions(3, RemoveAllCharacters(sortedLeftSide[2], sortedLeftSide[0]));

            //at this point we know for sure what 0 position is

            //what is common from 2,3,5 tells us what pos 0,3,7 could be
            //but we already know 0 so remove that option
            const common235 = CommonCharacters3(sortedLeftSide[3],sortedLeftSide[4],sortedLeftSide[5]).replace(correctPositions[0],'');
            await SetCorrectPositions(3, CommonCharacters2(correctPositions[3], common235)); // only insert the commons because the others have been eliminated
            await SetCorrectPositions(6, common235.replace(correctPositions[3],''));

            //at this point we know index 0,3,6 so just remove them from everyone else for good measure
            const charsAt036 = correctPositions[0] + correctPositions[3] + correctPositions[6];
            await SetCorrectPositions(1, RemoveAllCharacters(correctPositions[1], charsAt036));
            await SetCorrectPositions(2, RemoveAllCharacters(correctPositions[2], charsAt036));
            await SetCorrectPositions(4, RemoveAllCharacters(correctPositions[4], charsAt036));
            await SetCorrectPositions(5, RemoveAllCharacters(correctPositions[5], charsAt036));

            //we now know index 1. do the same ting again
            await SetCorrectPositions(2, RemoveAllCharacters(correctPositions[2], correctPositions[1]));
            await SetCorrectPositions(4, RemoveAllCharacters(correctPositions[4], correctPositions[1]));
            await SetCorrectPositions(5, RemoveAllCharacters(correctPositions[5], correctPositions[1]));

            //we can remove index 2 or index 5 (the number 1 ones) from index 4 to give us the answer to that
            await SetCorrectPositions(4, RemoveAllCharacters(correctPositions[4], correctPositions[2]));

            //now we just need to figure out the order of 1
            //we can do this by looking at all the codes with 6 total,
            //two of them will have both characters from 1
            //the other one will only have 1 character that will be index 5
            if (CommonCharacterCount(sortedLeftSide[6], correctPositions[5]) === 1) {
                await SetCorrectPositions(2, RemoveAllCharacters(correctPositions[5], sortedLeftSide[6]));
            } else if (CommonCharacterCount(sortedLeftSide[7], correctPositions[5]) === 1) {
                await SetCorrectPositions(2, RemoveAllCharacters(correctPositions[5], sortedLeftSide[7]));
            } else if (CommonCharacterCount(sortedLeftSide[8], correctPositions[5]) === 1) {
                await SetCorrectPositions(2, RemoveAllCharacters(correctPositions[5], sortedLeftSide[8]));
            }

            //lastly just figure out the top half of number 1
            await SetCorrectPositions(5, RemoveAllCharacters(correctPositions[5], correctPositions[2]));


            const number0Word = correctPositions[0] + correctPositions[1] + correctPositions[2] + correctPositions[4] + correctPositions[5] + correctPositions[6];
            const number2Word = correctPositions[0] + correctPositions[2] + correctPositions[3] + correctPositions[4] + correctPositions[6];
            const number3Word = correctPositions[0] + correctPositions[2] + correctPositions[3] + correctPositions[5] + correctPositions[6];

            const number5Word = correctPositions[0] + correctPositions[1] + correctPositions[3] + correctPositions[5] + correctPositions[6];
            const number6Word = correctPositions[0] + correctPositions[1] + correctPositions[3] + correctPositions[4] + correctPositions[5] + correctPositions[6];
            const number9Word = correctPositions[0] + correctPositions[1] + correctPositions[2] + correctPositions[3] + correctPositions[5] + correctPositions[6];

            let outputWord = '';

            for (const outputValue of rightSide) {
                const numCharacters = outputValue.length;
                switch (numCharacters) {
                    case 2:
                        outputWord += '1';
                        break;
                    case 3:
                        outputWord += '7';
                        break;
                    case 4:
                        outputWord += '4';
                        break;
                    case 5:
                        if (CommonCharacterCount(number2Word, outputValue) === 5) {
                            outputWord += '2';
                        } else if (CommonCharacterCount(number3Word, outputValue) === 5) {
                            outputWord += '3';
                        } else if (CommonCharacterCount(number5Word, outputValue) === 5) {
                            outputWord += '5';
                        }
                        break;
                    case 6:
                        console.log(outputValue + ' ' + number6Word + ' ' + CommonCharacterCount(number6Word, outputValue));
                        if (CommonCharacterCount(number0Word, outputValue) === 6) {
                            outputWord += '0';
                        } else if (CommonCharacterCount(number6Word, outputValue) === 6) {
                            outputWord += '6';
                        } else if (CommonCharacterCount(number9Word, outputValue) === 6) {
                            outputWord += '9';
                        }
                        break;
                    case 7:
                        outputWord += '8';
                        break;
                    default:
                        break;
                }

            }


            totalOutputValue += Number(outputWord);


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
        document.getElementById("answer").innerText = totalOutputValue + "";
    }

    reader.readAsText(this.files[0]);
});