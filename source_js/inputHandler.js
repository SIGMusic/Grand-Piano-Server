/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global PitchClassMapping */

function InputHandler(world, regularPolygon, width, height, piano, gameModel) {

    var baseOctave = 60;
    var heldNotes = [];
    //var midiHandler = new MidiHandler(Pizzicato);

    getKeyboardInput();

    function receiveInput(midiNumber, vol) {
        midiHandler.receiveMidiNumber(midiNumber, vol);
    }

    this.receiveInput = receiveInput;

    function getKeyboardInput() {
        defaultKey();
    }

    function defaultKey() {

        var zero = world.findOne({ 'treatment': 'kinematic' });

        window.onkeydown = function (e) {
            var keyPressed = String.fromCharCode(e.keyCode).toLowerCase();
            if (keyPressed in PitchClassMapping.keyboardCharToPitchClass) {
                var map = PitchClassMapping.keyboardCharToPitchClass[keyPressed];

                var midiNumber = baseOctave + parseInt(map["pitch"]);
                var circle = Physics.body('circle', {
                    x: width / 2
                    , y: height / 2
                    , mass: 1
                    , radius: 10
                    , styles: {
                        fillStyle: map["color"]
                    },
                    note: midiNumber,
                    vol: 1,
                    opacity: 1,
                    despawn: true
                });

                circle.note = midiNumber;
                circle.life = BALL_LIFE;
                // world.add(circle);

                var pianoKey = parseInt(map["pitch"]);
                piano.setKeysActive([pianoKey]);

                gameModel.spawnProjectile(world, pianoKey);
                background.noteAdded(midiNumber);
                if (instantFeedback) {
                    synth.noteOn(midiNumber, 100);
                }
            }
            if (keyPressed == "p") {
                gameActive = !gameActive;
            }
            if (keyPressed == "m") {
                instantFeedback = !instantFeedback;
            }
            if (keyPressed == "n") {
                background.clearAllSounds();
            }
        };

        window.onkeyup = function (e) {
            var keyPressed = String.fromCharCode(e.keyCode).toLowerCase();
            if (keyPressed in PitchClassMapping.keyboardCharToPitchClass) {
                var map = PitchClassMapping.keyboardCharToPitchClass[keyPressed];
                piano.setKeysNormal([parseInt(map["pitch"])]);
            }

            else if (e.keyCode == 187) { // = key
                // add a side
                num_sides += 1;
                world.remove(zero);
                zero = Physics.body('compound', {
                    x: width / 2
                    , y: height / 2
                    , treatment: 'kinematic'
                    , styles: {
                        fillStyle: '#ffffff'
                        , lineWidth: 1
                        , strokeStyle: '#ffffff'

                    }
                    , children: regularPolygon(num_sides, 100)
                });

                world.add(zero);
            }
            else if (e.keyCode == 189) { // - key
                // remove a side
                if (num_sides > 3) {
                    num_sides -= 1;
                    world.remove(zero);
                    zero = Physics.body('compound', {
                        x: width / 2
                        , y: height / 2
                        , treatment: 'kinematic'
                        , styles: {
                            fillStyle: '#ffffff'
                            , lineWidth: 1
                            , strokeStyle: '#ffffff'
                        }
                        , children: regularPolygon(num_sides, 100)
                    });

                    world.add(zero);
                }
            }
            else if (e.keyCode == 219) { // [ key
                // decrease rotation
                zero_ang_vel -= 0.00015;
            }
            else if (e.keyCode == 221) { // ] key
                // increase rotation
                zero_ang_vel += 0.00015;
            }
        };
    }
}

const midiHandler = new MidiHandler(Pizzicato);
