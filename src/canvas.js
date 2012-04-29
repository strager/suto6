define([
    'input',
    'geom',
    'EventEmitter'
], function (
    input,
    geom,
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
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            var s = strokes[id].slice();

            var i;

            var controlPoints = [ ];
            var p1Bisector = [ ];
            var p2Bisector = [ ];

            for (i = 0; i + 6 < s.length; i += 2) {
                var v1X = s[i + 0] - s[i + 2];
                var v1Y = s[i + 1] - s[i + 3];

                var v2X = s[i + 2] - s[i + 4];
                var v2Y = s[i + 3] - s[i + 5];

                var v3X = s[i + 4] - s[i + 6];
                var v3Y = s[i + 5] - s[i + 7];

                var c12 = geom.cross(v1X, v1Y, v2X, v2Y);
                var c23 = geom.cross(v2X, v2Y, v3X, v3Y);
                if (c12 * c23 < 0) {
                    s.splice(
                        i + 4, 0,
                        (s[i + 2] + s[i + 4]) / 2,
                        (s[i + 3] + s[i + 5]) / 2
                    );
                }
            }

            geom.linesBisector_(
                s[0], s[1],  // p0
                s[2], s[3],  // p1
                s[4], s[5],  // p2
                p1Bisector
            );

            var p0cX = (s[0] + s[2]) / 2;
            var p0cY = (s[1] + s[3]) / 2;
            var p0dX = s[0] - s[2];
            var p0dY = s[1] - s[3];

            var p = geom.lineIntersection(
                p0cX, p0cY,
                p0cX - p0dY, p0cY + p0dX,

                s[2], s[3],
                s[2] - p1Bisector[1], s[3] + p1Bisector[0]
            );
            controlPoints.push(p);

            for (i = 2; i + 4 < s.length; i += 2) {
                geom.linesBisector_(
                    s[i + 0], s[i + 1],  // p1
                    s[i + 2], s[i + 3],  // p2
                    s[i + 4], s[i + 5],  // p3
                    p2Bisector
                );

                var p = geom.lineIntersection(
                    s[i + 0] - p1Bisector[1], s[i + 1] + p1Bisector[0],
                    s[i + 0], s[i + 1],  // p1

                    s[i + 2], s[i + 3],  // p2
                    s[i + 2] - p2Bisector[1], s[i + 3] + p2Bisector[0]
                );
                controlPoints.push(p);

                // Swap
                var tmpX = p1Bisector[0];
                p1Bisector[0] = p2Bisector[0];
                p2Bisector[0] = tmpX;

                var tmpY = p1Bisector[1];
                p1Bisector[1] = p2Bisector[1];
                p2Bisector[1] = tmpY;
            }

            var p2cX = (s[i + 0] + s[i + 2]) / 2;
            var p2cY = (s[i + 1] + s[i + 3]) / 2;
            var p2dX = s[i + 0] - s[i + 2];
            var p2dY = s[i + 1] - s[i + 3];

            controlPoints.push(geom.lineIntersection(
                p2cX, p2cY,
                p2cX - p2dY, p2cY + p2dX,

                s[i + 0], s[i + 1],
                s[i + 0] - p1Bisector[1], s[i + 1] + p1Bisector[0]
            ));

            ctx.beginPath();
            ctx.moveTo(s[0], s[1]);
            for (i = 2; i < s.length; i += 2) {
                var control = controlPoints[i / 2 - 1];
                ctx.quadraticCurveTo(
                    control[0], control[1],
                    s[i + 0], s[i + 1]
                );
            }
            ctx.stroke();
        }

        touchInput.on('down', function on_down(id, x, y) {
            strokes[id] = [ ];
            render(id);
        });

        touchInput.on('move', function on_move(id, x, y) {
            var s = strokes[id];
            var sLength = s.length;

            var isDuplicate = s[sLength - 2] === x && s[sLength - 1] === y;
            if (!isDuplicate) {
                strokes[id].push(x, y);
                render(id);
            }
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
