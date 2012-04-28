define([
    'input',
    'EventEmitter'
], function (
    input,
    EventEmitter
) {
    function drawable(canvas) {
        var ctx = canvas.getContext('2d');
        var emitter = new EventEmitter();

        var touchInput = input.attachTouch(canvas);

        // Map InputID (FlatArray (x, y))
        var strokes = { };

        function detach() {
            touchInput.detach();

            Object.keys(strokes).forEach(function (id) {
                delete strokes[id];
            });
        }

        function render(id) {
            var stroke = strokes[id];
            var i = stroke.length - 2;

            var x = stroke[i];
            var y = stroke[i + 1];

            var lastX;
            var lastY;
            if (i <= 0) {
                lastX = x;
                lastY = y;
            } else {
                lastX = stroke[i - 2];
                lastY = stroke[i - 1];
            }

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        }

        touchInput.on('down', function on_down(id, x, y) {
            strokes[id] = [ ];
            render(id);
        });

        touchInput.on('move', function on_move(id, x, y) {
            strokes[id].push(x, y);
            render(id);
        });

        touchInput.on('up', function on_end(id, x, y) {
            strokes[id].push(x, y);
            render(id);

            var stroke = strokes[id];
            emitter.emit('stroke', stroke);
            delete strokes[id];
        });

        emitter.detach = detach;
        return emitter;
    }

    return {
        drawable: drawable
    };
});
