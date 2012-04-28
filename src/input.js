define([
    'EventEmitter'
], function (
    EventEmitter
) {
    function attachTouch(element) {
        var emitter = new EventEmitter();

        var isDown = { };

        function anyDown() {
            return Object.keys(isDown) > 0;
        }

        function each(arr, fn, ctx) {
            Array.prototype.forEach.call(arr, fn, ctx);
        }

        function getID(pseudoEvent) {
            return pseudoEvent.identifier || 0;
        }

        function getX(pseudoEvent) {
            return pseudoEvent.clientX - element.offsetLeft;
        }

        function getY(pseudoEvent) {
            return pseudoEvent.clientY - element.offsetTop;
        }

        function downE(e) {
            var id = getID(e);
            isDown[id] = true;
            emitter.emit(
                'down', 
                id,
                getX(e),
                getY(e)
            );
        }

        function moveE(e) {
            var id = getID(e);
            if (isDown[id]) {
                emitter.emit(
                    'move',
                    id,
                    getX(e),
                    getY(e)
                );
            }
        }

        function upE(e) {
            var id = getID(e);
            if (isDown[id]) {
                delete isDown[id];
                emitter.emit(
                    'up',
                    id,
                    getX(e),
                    getY(e)
                );
            }
        }

        function on_mousedown(event) {
            downE(event);
            event.preventDefault();

            document.addEventListener('mousemove', on_mousemove, false);
            document.addEventListener('mouseup', on_mouseup, false);
        }

        function on_mousemove(event) {
            moveE(event);
            event.preventDefault();
        }

        function on_mouseup(event) {
            upE(event);
            event.preventDefault();

            if (!anyDown()) {
                document.removeEventListener('mousemove', on_mousemove, false);
                document.removeEventListener('mouseup', on_mouseup, false);
            }
        }

        function on_touchdown(event) {
            each(event.changedTouches, downE);
            event.preventDefault();

            document.addEventListener('touchmove', on_touchmove, false);
            document.addEventListener('touchend', on_touchup, false);
        }

        function on_touchmove(event) {
            each(event.changedTouches, moveE);
            event.preventDefault();
        }

        function on_touchup(event) {
            each(event.changedTouches, upE);
            event.preventDefault();

            if (!anyDown()) {
                document.removeEventListener('touchmove', on_touchmove, false);
                document.removeEventListener('touchend', on_touchup, false);
            }
        }

        function detach() {
            element.removeEventListener('mousedown', on_mousedown, false);
            document.removeEventListener('mousemove', on_mousemove, false);
            document.removeEventListener('mouseup', on_mouseup, false);

            element.removeEventListener('touchstart', on_touchdown, false);
            document.removeEventListener('touchmove', on_touchmove, false);
            document.removeEventListener('touchend', on_touchup, false);

            Object.keys(isDown).forEach(function (id) {
                delete isDown[id];
            });
        }

        element.addEventListener('mousedown', on_mousedown, false);
        element.addEventListener('touchstart', on_touchdown, false);

        emitter.detach = detach;
        return emitter;
    }

    return {
        attachTouch: attachTouch
    };
});
