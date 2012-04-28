define([
    'util',
    'zinnia'
], function (
    util,
    zinnia
) {
    var modelBasePath = 'models/';
    var modelFiles = {
        hiragana: 'ja-hiragana.model.json'
    };

    function loadModel(modelName, callback) {
        if (!util.hasOwn(modelFiles, modelName)) {
            throw new Error("Invalid model name: " + modelName);
        }

        var modelFilePath = modelBasePath + modelFiles[modelName];
        zinnia.model.loadFromJSONFile(modelFilePath, callback);
    }

    return {
        load: loadModel
    };
});
