// global variables
var ws = new WebSocket('ws://aurora.local:7446', 'nlcp');
var zero_ang_vel = 0.001;
var num_sides = 3;
var width = window.innerWidth
    ,height = window.innerHeight;
var BALL_LIFE = 10000;
var gameActive = true;
var instantFeedback = true;


var physicsEngine = Physics(function (world) {
    var piano = new Piano();

    piano.setDimension(S(200), S(100));
    piano.setPosition(width / 2, height - 150);

    var gameModel = new GameModel(piano, world);
    var input = new InputHandler(gameModel);

    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight)
    ,edgeBounce
    ,renderer
    ;

    /////////////////////////////////////////////MIDI PROCESSING///////////////////////////////////////////
    // request MIDI access
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
            sysex: false // this defaults to 'false' and we won't be covering sysex in this article. 
        }).then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("No MIDI support in your browser.");
    }

    // midi functions
    function onMIDISuccess(midiAccess) {
        // when we get a succesful response, run this code
        console.log('MIDI Access Object', midiAccess);
        // when we get a succesful response, run this code
         midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

         var inputs = midi.inputs.values();
         // loop over all available inputs and listen for any MIDI input
         for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
             // each time there is a midi message call the onMIDIMessage function
             input.value.onmidimessage = onMIDIMessage;
         }
    }

    function onMIDIFailure(e) {
        // when we get a failed response, run this code
        console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
    }

    function onMIDIMessage(message) {
        data = message.data; // this gives us our [command/channel, note, velocity] data.
        // console.log(message);
        var channel = data[0] & 0xf;
        var type = data[0] & 0xf0;
        // // console.log('channel:' + channel);
        // // console.log('type:' + type);
        var note = data[1];
        // console.log(note);
        var velocity = data[2];
        if (velocity > 0) {
            switch(type) {
                case 144: //noteon
                    // janky because all the handlers expect 0-12 for 13 notes
                    // since we have low and high C
                    input.midikeydown(note - 48);
                    // console.log('???');
                    break;
                case 128:
                    input.midikeyup(note - 48);
                    break;
                default:
                    break
            }    
        }
        if (velocity == 0) {
            input.midikeyup(note - 48);
        }
    }


    ///////////////////////////////////////////////////PHYSICS////////////////////////////////////////////////////////////
    // Plz give me a number > 3
    var regularPolygon = function (N, r, width, mass) {

        width || (width = 2.5);
        mass || (mass = 20);

        var angle = 2 * Math.PI / N;
        var sideLength = 2 * r * Math.sin(angle / 2);
        var sideDist = r * Math.cos(angle / 2);

        var angles = [];
        for (var i = 0; i < N; i++) {
            angles.push(angle * i);
        }

        return angles.map(function (angle) {
            var x = sideDist * Math.cos(angle);
            var y = sideDist * Math.sin(angle);
            var rotation = angle;

            return Physics.body('rectangle', {    //right side
                x: S(x)
                , y: S(y)
                , width: S(width)
                , height: S(sideLength + width / 2)
                , mass: mass
                , angle: rotation
            })
        })
    };

    var spawnCircle = function (x, y, r, color, note) {
        var circle = Physics.body('circle', {
            x: x
            , y: y
            , mass: 1
            , radius: r
            , styles: {
                fillStyle: color
            },
            note: note,
            life: BALL_LIFE,
            vol: 1,
            opacity: 1
        });
        world.add(circle);
    };

    // scale relative to window width
    function S(n) {
        return n * window.innerWidth / 600;
    }

    // some fun colors
    var colors = {
        blue: '0x1d6b98',
        blueDark: '0x14546f',
        red: '0xdc322f',
        darkRed: '0xa42222',
        white: '#ffffff'
    };
    // create a renderer
    renderer = Physics.renderer('canvas', {
        el: 'viewport'
    });

    // add the renderer
    world.add(renderer);
    // render on each step
    world.on('step', function () {
        world.render();
    });

    // constrain objects to these bounds

    window.addEventListener('resize', function () {

        // as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
        viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
        // update the boundaries
        // edgeBounce.setAABB(viewportBounds);

    }, true);


    // add some gravity
    var gravity = Physics.behavior('constant-acceleration', {
        acc: { x: 0, y: 0.0004 } // this is the default
    });
    world.add(gravity);

    // add things to the world
    world.add([
        Physics.behavior('body-impulse-response', {check: 'collisions:desired'})
        , Physics.behavior('body-collision-detection')
        , Physics.behavior('sweep-prune')
        , edgeBounce
    ]);

    piano.draw(world);

    world.on('collisions:detected', function(data) {
        data.collisions = data.collisions.filter(function(c) {
            return c.bodyA.collision != false && c.bodyB.collision != false;
        });

        if (data.collisions.length == 0) return;

        var bodyA = data.collisions[0].bodyA;
        var bodyB = data.collisions[0].bodyB;

        world.emit('collisions:desired', data);
    });

    world.on('collisions:desired', function(data) {

        var bodyA = data.collisions[0].bodyA;
        var bodyB = data.collisions[0].bodyB;

        if (bodyA.note && !bodyB.note) {
            midiHandler.receiveMidiNumber(bodyA.note, bodyA.vol);
        }
        if (bodyB.note && !bodyA.note) {
            midiHandler.receiveMidiNumber(bodyB.note, bodyB.vol);
        }
    });

    var laskTick = null;
    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function (time) {
        world.step(time);
        // world.findOne({ 'treatment': 'kinematic' }).state.angular.vel = zero_ang_vel;

        if (!laskTick) {
            laskTick = time;
            return;
        }
        var dt = time - laskTick;
        laskTick = time;
        
        gameModel.update(dt, world);

        world.find({despawn:true}).forEach(function(p) {
            if (!p.life || p.life <= 0) {
                world.remove(p);
            }
            p.life -= dt;
            if (p.onTick)
                p.onTick(dt, p, world);
        })
    });
});
