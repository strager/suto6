define(function () {
    var objectPrototype = Object.prototype;
    var hasOwnProperty = objectPrototype.hasOwnProperty;
    function hasOwn(obj, prop) {
        return hasOwnProperty.call(obj, prop);
    }

    return {
        hasOwn: hasOwn
    };
});
