define([
    'model',
    'canvas',
    'zinnia'
], function (
    model,
    canvas,
    zinnia
) {
    function main() {
        model.load('hiragana', function (err, zmodel) {
            if (err) throw err;

            var recognizer = zinnia.recognizer.fromModel(zmodel);

            var strokes = [ ];
            function on_stroke(stroke) {
                strokes.push(stroke);

                var c = recognizer.classify({
                    width: canvasEl.width,
                    height: canvasEl.height,
                    strokes: strokes
                }, 10);

                console.log(
                    "Classified:\n  " +
                    c.map(function (o) {
                        return o.code + "  (" + o.bias + ")";
                    }).join("\n  ")
                );
            }

            var canvasEl = document.getElementById('canvas');
            var drawable = null;
            function initCanvas() {
                if (drawable) {
                    drawable.detach();
                }
                canvasEl.width = canvasEl.width;

                var ctx = canvasEl.getContext('2d');
                drawable = canvas.drawable(canvasEl);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.lineCap = 'butt';
                drawable.on('stroke', on_stroke);
            }

            document.getElementById('clear').addEventListener('click', function on_clear_click() {
                initCanvas();
                strokes = [ ];
            }, false);

            initCanvas();
        });
    }

    return main;
});
