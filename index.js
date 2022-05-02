const LENGTH = 400;
const INTERVAL = 400;
const SLOPE = 0; // for nice sound 0.015
const THICKNESS = 2;
const LINE_HEIGHT = 7;

const context = new AudioContext();
const master = context.createGain();
master.connect(context.destination);

document.querySelector('#start').addEventListener('click', async () => {
    const SETTINGS = getInputSettings();

    for (let letter of Array.from(SETTINGS.text)) {
        // const LETTER = getLetter(letter); // for vertical Text
        const LETTER = transpose(mirror(getLetter(letter))); // for Horizontal Text

        // printLetter(LETTER);
        for (let row = LETTER.length - 1; row >= 0; row--) {
            const TONES = [];
            for (let i = 0; i < LETTER[row].length; i++) {
                if (LETTER[row][i] === 1) {
                    const LBASE = LETTER[row].length <= LINE_HEIGHT ? SETTINGS.base : SETTINGS.base - (LETTER[row].length - LINE_HEIGHT) * INTERVAL;
                    TONES.push(LBASE + (INTERVAL * i));
                }
            }

            let j = 0;
            if (TONES.length > 0) {
                for (let i = 0; i < TONES.length * THICKNESS; i++) {
                    const ACTUAL_LENGTH = LENGTH / (TONES.length * THICKNESS);
                    playFrequency(TONES[j], ACTUAL_LENGTH);
                    await wait(ACTUAL_LENGTH);
                    j = j < (TONES.length - 1) ? j + 1 : 0;
                }
            } else {
                await wait(LENGTH);
            }

        }

        await wait(LENGTH);
    }

});

document.querySelector('#stop').addEventListener('click', () => {
    master.gain.setTargetAtTime(0, context.currentTime, 0.015);
});

const playFrequency = (frequency, duration) => {
    const oscillator = context.createOscillator();
    const channel = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.connect(channel);
    channel.connect(master);

    oscillator.start(0);

    setTimeout(() => { channel.gain.setTargetAtTime(0, context.currentTime, SLOPE); }, duration);
};

const wait = (time) => new Promise(res => setTimeout(res, time));

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
        base: parseInt(document.querySelector('#base').value) || 18000
    };
};

