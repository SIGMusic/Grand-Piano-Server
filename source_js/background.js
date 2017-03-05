

function background() {
    var currentSounds = {};

    this.noteAdded = function (midiNumber) {
        if (!findSound(midiNumber)) {
            var sound = new Pizzicato.Sound({
                source: "wave",
                options: {
                    type: "square",
                    frequency: toFrequency(midiNumber),
                    volume: 0.01
                }
            });

            /*
                Add effects here?
             */

            currentSounds[midiNumber] = sound;
            preventDissonance(midiNumber);

            sound.play();
        }
    }

    this.clearAllSounds = function () {
        Object.values(currentSounds).forEach(function (sound) {
            sound.stop();
        });
        currentSounds = {};
    }

    function clearSound(midiNumber) {
        var sound = findSound(midiNumber);
        if (sound) {
            sound.stop();
            delete currentSounds[midiNumber];
        }
    }

    function findSound(midiNumber) {
        return currentSounds[midiNumber];
    }

    function preventDissonance(midiNumber) {
        var dissonances = [1, -1, 6, -6];
        dissonances.forEach(function (diss) {
            if (findSound(midiNumber + diss)) {
                clearSound(midiNumber + diss);
            }
        })
    }

    function toFrequency(midiNumber) {
        return Math.floor(220 * Math.pow(2, (midiNumber - 57) / 12));
    }
}