/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global PitchClassMapping */

function InputHandler(Physics, Pizzicato, world, regularPolygon, width, height) {

    var baseOctave = 60;
    var heldNotes = [];

    var that = this;

    var midiHandler = new MidiHandler(Pizzicato);

    getKeyboardInput();

    function receiveInput(midiNumber) {
        midiHandler.receiveMidiNumber(midiNumber);
    }

    this.receiveInput = receiveInput;

    function getKeyboardInput() {
        defaultKey();
        // sustain();
    }

    function sustain() {
        window.onkeydown = function (e) {
            var keyPressed = String.fromCharCode(e.keyCode).toLowerCase();
            rapidFire(keyPressed);

            if (keyPressed in PitchClassMapping.keyboardCharToPitchClass) {
                var midiNumber = baseOctave + parseInt(PitchClassMapping.keyboardCharToPitchClass[keyPressed]);

                var index = heldNotes.indexOf(midiNumber);
                if (index === -1) {
                    heldNotes.push(midiNumber);
                }
                
                /* Maybe only create on new pitch class? 
                 * As opposed to every instance regardless of pitch class
                 * */

                midiHandler.play(midiNumber);
            }
        };

        window.onkeyup = function (e) {
            var keyPressed = String.fromCharCode(e.keyCode).toLowerCase();
            if (keyPressed in PitchClassMapping.keyboardCharToPitchClass) {
                var midiNumber = baseOctave + parseInt(PitchClassMapping.keyboardCharToPitchClass[keyPressed]);
                var index = heldNotes.indexOf(midiNumber);
                if (index > -1) {
                    heldNotes.splice(index, 1);
                }

                midiHandler.stop(midiNumber);
            }
        };
    }

    function defaultKey() {
        window.onkeyup = function (e) {

            console.log(e.key);
            var zero = world.findOne({'treatment':'kinematic'});
            var keyPressed = String.fromCharCode(e.keyCode).toLowerCase();

            if (that.keyBindings[e.key]) {
                that.keyBindings[e.key].forEach(function(f) {f()});
            }

            if (keyPressed in PitchClassMapping.keyboardCharToPitchClass) {
                var midiNumber = baseOctave + parseInt(PitchClassMapping.keyboardCharToPitchClass[keyPressed]);

                receiveInput(midiNumber);
            }

            else if (e.keyCode == 187) { // = key
                // add a side
                num_sides += 1;
                world.remove(zero);
                zero = Physics.body('compound', {
                        x: width/2
                        ,y: height/2
                        ,treatment: 'kinematic'
                        ,styles: {
                            fillStyle: '#ffffff'
                            ,lineWidth: 1
                            ,strokeStyle: '#ffffff'

                        }
                        ,children: regularPolygon(num_sides, 100)
                    });

                world.add(zero);
            }
            else if (e.keyCode == 189) { // - key
                // remove a side
                if ( num_sides > 3 ) {
                    num_sides -= 1;
                    world.remove(zero);
                    zero = Physics.body('compound', {
                            x: width/2
                            ,y: height/2
                            ,treatment: 'kinematic'
                            ,styles: {
                                fillStyle: '#ffffff'
                                ,lineWidth: 1
                                ,strokeStyle: '#ffffff'

                            }
                            ,children: regularPolygon(num_sides, 100)
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


            rapidFire(keyPressed);
        };
    }

    function rapidFire(keyPressed) {
        if (keyPressed === "q") {
            var rand = baseOctave + Math.ceil(Math.random() * 12);

            receiveInput(rand);
        }
    }

    this.keyBindings = {};

    this.addKeyBinding = function(key, callback) {
        if (this.keyBindings[key]) {
            this.keyBindings[key].push(callback);
        }
        else
            this.keyBindings[key] = [callback];
    };
}
