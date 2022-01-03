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
                this.literal = null;

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
                    this.literal = BinaryToDecimal(literal);
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
                }

                this.print();
            }

            isLiteral() {
                return this.type === 4;
            }

            print(bIsSubpacket) {
                const cssClass = bIsSubpacket ? 'sub-packet' : 'packet';
                let html = `<div class='${cssClass}'>`;

                if (bIsSubpacket){
                    html += `<div>subPacket</div>`;
                }

                if (this.isLiteral()) {
                    html += `<div>Literal: ${this.literal}</div>`;
                } else {
                    html += `<div>Operator: ${this.type}</div>`;
                }

                if (this.subPackets.length > 0) {
                    html += `<div class="sub-packets">`;
                    for (const subPacket of this.subPackets) {
                        html += subPacket.print(true);
                    }
                    html += `</div>`;
                }



                html += "</div>";
                return html;
            }
        }


        const packets = [];

        while (i < inputs.length) {
            let numBits = 0;

            const packet = new Packet();
            packets.push(packet);
            numBits += packet.numBits;
            document.getElementById('data').innerHTML += packet.print(false);

            //Skip zeroes
            i += 8 - (numBits % 8);
        }

        const answer = versionSum;

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});