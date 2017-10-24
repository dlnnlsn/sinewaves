var dirty = false;

function midiSuccess(midiAccess) {
    let inputs = midiAccess.inputs.values();

    let hasInputDevice = false;

    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        console.log(input);
        input.value.onmidimessage = handleMidiInputEvent;
        hasInputDevice = true;
    }

    if (!hasInputDevice) {
        console.warn("No MIDI input devices found.");
    }
}

function midiFail(message) {
    console.log(message);
}

function handleMidiInputEvent(event) {
    let message = event.data;

    if (message[0] == 0x90) {
        //Key pressed (or sometimes released; see below)
        let key = message[1];

        // Some midi controllers send a 0x90 with a volume of 0, instead of 0x80, to stop a note playing
        keyDown[key] = message[2] > 0;

        dirty = true;
    }

    if (message[0] == 0x80) {
        //Key released
        let key = message[1];

        keyDown[key] = false;

        dirty = true;
    }
}

function setup() {

    colorMode(HSB);

    navigator.requestMIDIAccess().then(midiSuccess, midiFail);

    createCanvas(windowWidth, windowHeight);

    noFill();
    strokeWeight(2);

    keyDown = [];
    for (let i = 0; i < 127; ++i) {
        keyDown[i] = false;
    }

    dirty = true;

}

function draw() {

    if (!dirty) return;

    background(0, 0, 0);

    let amplitude = height / 8;
    let centerY = height / 2;

    for (let k = 0; k < 127; ++k) {

        if (!keyDown[k]) continue;

        let col = map(k % 12, 0, 12, 0, 360);
        stroke(col, 100, 100);

        let period = 15 * PI * (2 ** ((k - 60) / 12.0));

        beginShape();

            vertex(0, centerY - amplitude);
            for (let x = 1; x < width; x += 1) {
                let theta = map(x, 0, width, PI/2, period + PI/2);
                let y = centerY - amplitude * sin(theta);
                bezierVertex(x, y, x, y - 1, x, y);
            }

        endShape();
    }

    dirty = false;

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    dirty = true;
}
