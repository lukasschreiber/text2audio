var AudioContext = window.AudioContext || window.webkitAudioContext;

const context = new AudioContext();
const master = context.createGain();
master.connect(context.destination);

document.querySelector('#start').addEventListener('click', async (e) => {
    if (context.state === 'suspended') {
        context.resume();
    }

    e.target.disabled = true;
    const SETTINGS = getInputSettings();
    master.gain.setValueAtTime(1.0, 0);

    let offset = 0;
    for (let letter of Array.from(SETTINGS.text)) {
        // const LETTER = getLetter(letter); // for vertical Text
        const LETTER = transpose(mirror(getLetter(letter))); // for Horizontal Text

        // printLetter(LETTER);
        for (let row = LETTER.length - 1; row >= 0; row--) {
            const TONES = [];
            for (let i = 0; i < LETTER[row].length; i++) {
                if (LETTER[row][i] === 1) {
                    const LBASE = LETTER[row].length <= SETTINGS.lineHeight ? SETTINGS.base : SETTINGS.base - (LETTER[row].length - SETTINGS.lineHeight) * SETTINGS.interval;
                    TONES.push(LBASE + (SETTINGS.interval * i));
                }
            }

            let j = 0;
            if (TONES.length > 0) {
                for (let i = 0; i < TONES.length * SETTINGS.thickness; i++) {
                    let actualLength = SETTINGS.length / (TONES.length * SETTINGS.thickness);
                    playFrequency(TONES[j], offset, actualLength, SETTINGS.slope, SETTINGS.supressClick);
                    offset += actualLength;
                    j = j < (TONES.length - 1) ? j + 1 : 0;
                }
            } else {
                offset += SETTINGS.length;
            }

        }

        offset += SETTINGS.length;
    }

    setTimeout(()=>{e.target.disabled = false}, offset*1000);
});

document.querySelector('#stop').addEventListener('click', () => {
    master.gain.setTargetAtTime(0, context.currentTime, 0.015);
});

document.querySelector('#test').addEventListener('click', () => {
    if (context.state === 'suspended') {
        context.resume();
    }

    playFrequency(20000, 0, 1, 0);
});


const playFrequency = (frequency, start, duration, slope, supressClick = true) => {
    duration = Math.floor(duration*frequency)/frequency;
    start = context.currentTime + start;

    const oscillator = context.createOscillator();
    const channel = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.connect(channel);
    channel.connect(master);

    if(supressClick){
        channel.gain.setValueAtTime(0, start);
        channel.gain.linearRampToValueAtTime(1.0, start + duration / 8);
        channel.gain.linearRampToValueAtTime(0.00001, start + duration);
    }

    oscillator.start(start);

    oscillator.stop(start + duration);
};

const transpose = (array) => array[0].map((_, colIndex) => array.map(row => row[colIndex]));
const mirror = (array) => array.map(row => row.reverse());

const printLetter = (letter) => {
    let out = "";
    for (let row of letter) {
        out += row.map(c => c === 0 ? " " : "O").join("") + "\n";
    }

    if (out !== "") console.log(out);
};

const getLetter = (letter) => {
    let letters = JSON.parse(JSON.stringify(LETTERS)); // hack to copy object
    // translate letters
    switch (letter) {
        case " ": letter = "SPACE"; break;
        case "🤖": letter = "ROBOT"; break;
        case "🖤": letter = "FILLED_HEART"; break;
        case "🤍": letter = "STROKED_HEART"; break;
    }

    if (!letters[letter]) letter = "?";

    return letters[letter];
};

const getInputSettings = () => {
    return {
        text: document.querySelector('#input').value,
        base: parseInt(document.querySelector('#base').value) || 18000,
        length: parseFloat(document.querySelector('#length').value) || 0.4,
        interval: parseInt(document.querySelector('#interval').value) || 400,
        slope: parseFloat(document.querySelector('#slope').value) || 0.0, // for nice sound 0.015
        thickness: parseInt(document.querySelector('#thickness').value) || 2,
        lineHeight: parseInt(document.querySelector('#lineHeight').value) || 7,
        supressClick: true
    };
};

