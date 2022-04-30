const WIDTH = 10;
const HEIGHT = 10;

const LENGTH = 400;
const INTERVAL = 400;
const BASE = 18000;
const SLOPE = 0; // for nice sound 0.015

const context = new AudioContext();
const master = context.createGain();
master.connect(context.destination);

document.querySelector('#start').addEventListener('click', async ()=>{
    const STRING = "HALLO HANNAH";
    for(let letter of STRING.split("")){
        switch(letter){
            case " ": letter = "SPACE"
        }

        const LETTER = LETTERS[letter];
        for(let row = LETTER.length - 1; row >= 0; row--){
            const TONES = [];
            for(let i = 0; i < LETTER[row].length; i++){
                if(LETTER[row][i] === 1){
                    TONES.push(BASE + (INTERVAL * i));
                }
            }
    
            let j = 0;
            if(TONES.length > 0){
                for(let i = 0; i < TONES.length * 2; i++){
                    const ACTUAL_LENGTH = LENGTH / (TONES.length * 2);
                    playFrequency(TONES[j], ACTUAL_LENGTH);
                    await wait(ACTUAL_LENGTH);
                    j = j < (TONES.length - 1) ? j+1 : 0;
                }
            }else{
                await wait(LENGTH);
            }
            
        }

        await wait(LENGTH);
    }

});

document.querySelector('#stop').addEventListener('click', ()=>{
    master.gain.setTargetAtTime(0, context.currentTime, 0.015);
});

const playFrequency = (frequency, duration) => {
    const oscillator = context.createOscillator();
    const channel = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.connect(channel);
    channel.connect(master);

    oscillator.start(0);
    
    setTimeout(()=>{channel.gain.setTargetAtTime(0, context.currentTime, SLOPE);}, duration);
}

const wait = (time) => new Promise(res=>setTimeout(res,time));
