define(function () {
    // Returns false if the lines are parallel.
    //
    // Returns true and populates the given output array
    // otherwise.
    function lineIntersection_(
        // Line 1
        x1, y1,
        x2, y2,

        // Line 2
        x3, y3,
        x4, y4,

        // Output array
        out
    ) {
        var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) {
            return false;
        }

        var m = (x1 * y2 - y1 * x2);
        var n = (x3 * y4 - y3 * x4);

        var x = (m * (x3 - x4) - n * (x1 - x2)) / den;
        var y = (m * (y3 - y4) - n * (y1 - y2)) / den;

        out[0] = x;
        out[1] = y;
        return true;
    }

    function lineIntersection(
        x1, y1, x2, y2,
        x3, y3, x4, y4
    ) {
        var out = [ ];
        lineIntersection_(
            x1, y1, x2, y2,
            x3, y3, x4, y4,
            out
        );

        return out;
    }

    function normalize_(x, y, out) {
        var length = Math.sqrt(x * x + y * y);
        out[0] = x / length;
        out[1] = y / length;
    }

    var linesBisector_scratch = [ ];
    function linesBisector_(
        // Line 1 start
        x1, y1,

        // Shared intersection point
        x2, y2,

        // Line 2 end
        x3, y3,

        // Output array
        out
    ) {
        normalize_(x1 - x2, y1 - y2, linesBisector_scratch);
        var dx1 = linesBisector_scratch[0];
        var dy1 = linesBisector_scratch[1];

        normalize_(x3 - x2, y3 - y2, linesBisector_scratch);
        var dx2 = linesBisector_scratch[0];
        var dy2 = linesBisector_scratch[1];

        var sx = dx1 + dx2;
        var sy = dy1 + dy2;
        if (sx === 0 || sy === 0) {
            out[0] = -linesBisector_scratch[1];
            out[1] = linesBisector_scratch[0];
        } else {
            normalize_(sx, sy, out);
        }
    }

    function cross(x1, y1, x2, y2) {
        return x1 * y2 - y1 * x2;
    }

    function functional(fn) {
        return function (/* ... */) {
            var args = Array.prototype.slice.call(arguments);
            var out = [ ];
            args.push(out);
            fn.apply(this, args);
            return out;
        };
    }

    return {
        lineIntersection_: lineIntersection_,
        linesBisector_: linesBisector_,
        normalize_: normalize_,

        lineIntersection: functional(lineIntersection_),
        linesBisector: functional(linesBisector_),
        normalize: functional(normalize_),

        cross: cross
    };
});
