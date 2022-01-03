const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

class Shot {
    constructor(startingVelocity, targetXRange, targetYRange) {
        this.startingVelocity = [...startingVelocity];
        this.velocity = startingVelocity;
        this.targetXRange = targetXRange;
        this.targetYRange = targetYRange;
        this.position = [0,0];
        this.trajectory = [[...this.position]];
        this.maxY = -9999999999999;

        document.getElementById('startingVelocity').innerText = `${startingVelocity[0]},${startingVelocity[1]}`;
    }

    async takeShot() {
        let bDone = false;
        while(!bDone) {
            if (this.processStep()) {
                bDone = true;
                this.success = true;
            }

            if (this.isPast()) {
                bDone = true;
                this.success = false;
            }

            if (document.getElementById('show').checked) {
                await this.drawGraph();
            }
        }

        if (this.myChart){
            this.myChart.destroy();
        }

    }

    processStep() {
        if (this.position[1] > this.maxY) {
            this.maxY = this.position[1];
        }

        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];


        this.velocity[0] = this.velocity[0] !== 0 ? this.velocity[0]-1 : 0;
        this.velocity[1] -= 1;
        this.trajectory.push([...this.position]);
        return this.isSuccessful();
    }

    isSuccessful() {
        const goodX = this.position[0] >= this.targetXRange[0] && this.position[0] <= this.targetXRange[1];
        const goodY = this.position[1] >= this.targetYRange[0] && this.position[1] <= this.targetYRange[1];
        return goodX && goodY;
    }

    isPast() {
        const pastX = this.position[0] > this.targetXRange[1]
        const pastY = this.position[1] < this.targetYRange[0]
        return pastX || pastY;
    }


    async drawGraph() {
        const targetData = [];
        for (let x = this.targetXRange[0]; x<= this.targetXRange[1]; x++) {
            for (let y = this.targetYRange[0]; y<= this.targetYRange[1]; y++) {
                targetData.push({
                    x: x,
                    y: y,
                })
            }
        }

        const yCorner = Math.min(100, this.maxY);

        const cornerData = [{x:0,y:yCorner}, {x:this.targetXRange[1]+20,y:this.targetYRange[1]-20}];

        const trajectoryData = [];
        for (let i = 0; i < this.trajectory.length; i++) {
            trajectoryData.push({
                x: this.trajectory[i][0],
                y: this.trajectory[i][1],
            })
        }

        const data = {
            datasets: [
                {
                    label: 'Target',
                    data: targetData,
                    backgroundColor: 'rgb(255,0,53)',
                },
                {
                    label: 'bounds',
                    data: cornerData,
                    backgroundColor: 'rgb(255,255,255)',
                },
                {
                    label: 'Launcher',
                    data: [{x:0,y:0}],
                    backgroundColor: 'rgb(0,0,0)'
                },
                {
                    label: 'Trajectory',
                    data: trajectoryData,
                    backgroundColor: 'rgb(126,250,59)',
                }

            ],
        };

        const config = {
            type: 'scatter',
            data: data,
        };

        if (this.myChart) {
            this.myChart.data = data;
            this.myChart.update();
        } else {
            this.myChart = new Chart(
                document.getElementById('myChart'),
                config
            );
        }


        await delay(document.getElementById("moveSpeed").value);
    }
}


document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const [xRange, yRange] = reader.result.slice(13).split(',').map(part => {
            const splitParts = part.trim().split('=');
            return splitParts[1].split('..').map(num=> Number(num));
        });

        let missedShots = [];
        let successfulShots = [];

        for (let i = 1; i< xRange[1]+2; i++) {
            for (let j = Math.abs(yRange[0])*2; j > yRange[0]-2 ; j--) {
                const shot = new Shot([i,j], xRange, yRange);
                await shot.takeShot();
                if (shot.success) {
                    successfulShots.push(shot);
                } else {
                    missedShots.push(shot);
                }
            }
        }
        console.log(successfulShots.map(shot=> shot.startingVelocity));
        const answer = successfulShots.length;

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});