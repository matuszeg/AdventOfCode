const delay = ms => new Promise(res => setTimeout(res, ms));

function BinaryToDecimal(binary) {
    return parseInt(binary, 2);
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split('').map(hex => {
            return (parseInt(hex,16).toString(2)).padStart(4,'0');
        }).join('').split('');

        let i = 0;
        let versionSum = 0;

        class Packet {
            constructor(version, type) {
                this.version = BinaryToDecimal(inputs[i] + inputs[i+1] + inputs[i+2]);
                versionSum += this.version;
                i += 3;
                this.type = BinaryToDecimal(inputs[i] + inputs[i+1] + inputs[i+2]);
                i += 3;
                this.numBits = 6;
                this.subPackets = [];
                this.value = 0;
                this.operator = null;

                if (this.isLiteral()) {
                    let literal = '';
                    while (true) {
                        const bLastOne = inputs[i] === '0';
                        literal += inputs[i+1] + inputs[i+2] + inputs[i+3] + inputs[i+4];
                        i += 5;
                        this.numBits += 5;
                        if (bLastOne) {
                            break;
                        }
                    }
                    this.value = BinaryToDecimal(literal);
                } else {
                    //Operator
                    const lengthTypeId = inputs[i];
                    i++;
                    this.numBits++;
                    if (lengthTypeId === '0') {
                        let subPacketsLength = '';
                        for (let j = 0; j < 15; j++) {
                            subPacketsLength += inputs[i+j];
                            this.numBits++;
                        }
                        i+= 15;
                        subPacketsLength = BinaryToDecimal(subPacketsLength);

                        let count = 0;
                        while (count < subPacketsLength) {
                            const subPacket = new Packet();
                            this.subPackets.push(subPacket);
                            this.numBits += subPacket.numBits;
                            count += subPacket.numBits;
                        }
                    } else {
                        let numSubPackets = '';
                        for (let j = 0; j < 11; j++) {
                            numSubPackets += inputs[i+j];
                            this.numBits++;
                        }
                        i+= 11;
                        numSubPackets = BinaryToDecimal(numSubPackets);
                        for (let j = 0; j < numSubPackets; j++) {
                            const subPacket = new Packet();
                            this.subPackets.push(subPacket);
                            this.numBits += subPacket.numBits;
                        }
                    }

                    switch (this.type) {
                        case 0:
                            this.value = this.subPackets.length > 1 ? this.subPackets.map(p=> p.value).reduce((a,b) => a + b) : this.subPackets[0].value;
                            this.operator = '+';
                            break;
                        case 1:
                            this.value = this.subPackets.length > 1 ? this.subPackets.map(p=> p.value).reduce((a,b) => a * b) : this.subPackets[0].value;
                            this.operator = '*';
                            break;
                        case 2:
                            this.value = Math.min(...(this.subPackets.map(a => a.value)));
                            this.operator = 'min';
                            break;
                        case 3:
                            this.value = Math.max(...(this.subPackets.map(a => a.value)));
                            this.operator = 'max';
                            break;
                        case 5:
                            this.value = this.subPackets[0].value > this.subPackets[1].value ? 1 : 0;
                            this.operator = '>';
                            break;
                        case 6:
                            this.value = this.subPackets[0].value < this.subPackets[1].value ? 1 : 0;
                            this.operator = '<';
                            break;
                        case 7:
                            this.value = this.subPackets[0].value === this.subPackets[1].value ? 1 : 0;
                            this.operator = '==';
                            break;
                    }
                }

                this.print();
            }

            isLiteral() {
                return this.type === 4;
            }

            print(bIsSubpacket) {
                let html = '';

                if (!bIsSubpacket){
                    html += `<div class='packet'>`;
                }

                if (this.isLiteral()) {
                    html += `${this.value}`;
                }

                if (this.subPackets.length > 0) {
                    if (this.type === 2 || this.type === 3) {
                        let subHtml = '';
                        for (let j = 0; j < this.subPackets.length; j++) {
                            subHtml += this.subPackets[j].print(true) + (j<this.subPackets.length-1 ? ',' : '');
                        }

                        html += `${this.operator}(${subHtml})`;
                    } else {
                        html += '(';
                        for (let j = 0; j < this.subPackets.length; j++) {
                            html += this.subPackets[j].print(true) + (j<this.subPackets.length-1 ? this.operator : '');
                        }
                        html += ')';
                    }
                }

                if (!bIsSubpacket){
                    html += "</div>";
                }
                return html;
            }
        }

        let numBits = 0;
        const packet = new Packet();
        numBits += packet.numBits;
        document.getElementById('data').innerHTML += packet.print(false);

            //Skip zeroes
        i += 8 - (numBits % 8);

        const answer = packet.value;

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});