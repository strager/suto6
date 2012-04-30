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

        function addPoint(id, x, y) {
            var s = strokes[id];
            var sLength = s.length;

            var isDuplicate = s[sLength - 2] === x && s[sLength - 1] === y;
            if (!isDuplicate) {
                strokes[id].push(x, y);
                render(id);
            }
        }

        function detach() {
            touchInput.detach();

            Object.keys(strokes).forEach(function (id) {
                delete strokes[id];
            });
        }

        // Interpolates a line p2p3 based on
        // p1 and p4 and yields a control point.
        var interpolatedControl_p2Bisector = [ ];
        var interpolatedControl_p3Bisector = [ ];
        function interpolatedControl_(
            x1, y1,  // p1
            x2, y2,  // p2
            x3, y3,  // p3
            x4, y4,  // p4
            out
        ) {
            geom.linesBisector_(
                x1, y1,
                x2, y2,
                x3, y3,
                interpolatedControl_p2Bisector
            );
            geom.linesBisector_(
                x2, y2,
                x3, y3,
                x4, y4,
                interpolatedControl_p3Bisector
            );

            return geom.lineIntersection_(
                x2 - interpolatedControl_p2Bisector[1], y2 + interpolatedControl_p2Bisector[0],
                x2, y2,

                x3, y3,
                x3 - interpolatedControl_p3Bisector[1], y3 + interpolatedControl_p3Bisector[0],

                out
            );
        }

        // Interpolates a line p1p2 based on
        // p3 and yields a control point.
        var interpolatedControlEdge_p2Bisector = [ ];
        function interpolatedControlEdge_(
            x1, y1,  // p1
            x2, y2,  // p2
            x3, y3,  // p3
            out
        ) {
            geom.linesBisector_(
                x1, y1,
                x2, y2,
                x3, y3,
                interpolatedControlEdge_p2Bisector
            );

            // Centre of first segment
            var s1cX = (x1 + x2) / 2;
            var s1cY = (y1 + y2) / 2;

            // Vector of first segment
            var s1dX = x1 - x2;
            var s1dY = y1 - y2;

            // We draw a line from the bisector of the
            // first segment and intersect it with the
            // perpendicular bisector of p2.
            return geom.lineIntersection_(
                s1cX, s1cY,
                s1cX - s1dY, s1cY + s1dX,

                x2, y2,
                x2 - interpolatedControlEdge_p2Bisector[1], y2 + interpolatedControlEdge_p2Bisector[0],

                out
            );
        }

        // Draws a line p2p3 interpolating based on
        // p1 and p4.
        var drawInterpolated_control = [ ];
        function drawInterpolated(
            x1, y1,  // p1
            x2, y2,  // p2
            x3, y3,  // p3
            x4, y4   // p4
        ) {
            var hasControl = interpolatedControl_(
                x1, y1,
                x2, y2,
                x3, y3,
                x4, y4,
                drawInterpolated_control
            );

            if (hasControl) {
                ctx.quadraticCurveTo(
                    drawInterpolated_control[0], drawInterpolated_control[1],
                    x3, y3
                );
            } else {
                ctx.lineTo(x3, y3);
            }
        }

        var render_scratch = [ ];
        function render(id) {
            var s = strokes[id].slice();
            var sLength = s.length;

            // We need at least three points (two segments)
            // to interpolate the first segment.
            if (sLength < 6) {
                return;
            }

            ctx.beginPath();
            ctx.moveTo(s[sLength - 6], s[sLength - 5]);

            // First segment (special case)
            if (sLength === 6) {
                var hasControl = interpolatedControlEdge_(
                    s[0], s[1],
                    s[2], s[3],
                    s[4], s[5],
                    render_scratch
                );

                if (hasControl) {
                    ctx.quadraticCurveTo(
                        render_scratch[0], render_scratch[1],
                        s[2], s[3]
                    );
                } else {
                    ctx.lineTo(s[2], s[3]);
                }
            } else {
                // If the direction changes,
                // we need to insert a new point.
                var i = sLength - 8;

                var x1 = s[i + 0], y1 = s[i + 1];
                var x2 = s[i + 2], y2 = s[i + 3];
                var x3 = s[i + 4], y3 = s[i + 5];
                var x4 = s[i + 6], y4 = s[i + 7];

                var v2X = x2 - x3;
                var v2Y = y2 - y3;

                var c12 = geom.cross(
                    x1 - x2, y1 - y2,
                    v2X, v2Y
                );
                var c23 = geom.cross(
                    v2X, v2Y,
                    x3 - x4, y3 - y4
                );

                if (c12 * c23 < 0) {
                    var xC = (x2 + x3) / 2;
                    var yC = (y2 + y3) / 2;

                    drawInterpolated(
                        x1, y1,
                        x2, y2,
                        xC, yC,
                        x3, y3
                    );

                    drawInterpolated(
                        x2, y2,
                        xC, yC,
                        x3, y3,
                        x4, y4
                    );
                } else {
                    drawInterpolated(
                        x1, y1,
                        x2, y2,
                        x3, y3,
                        x4, y4
                    );
                }
            }

            ctx.stroke();
        }

        touchInput.on('down', function on_down(id, x, y) {
            strokes[id] = [ ];
            render(id);
        });

        touchInput.on('move', function on_move(id, x, y) {
            addPoint(id, x, y);
        });

        touchInput.on('up', function on_end(id, x, y) {
            addPoint(id, x, y);

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
