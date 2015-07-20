/**
 * Created by guanghu on 7/14/15.
 */

var heads               = require('robohydra').heads,
    RoboHydraHead       = heads.RoboHydraHead,
    RoboHydraHeadStatic = heads.RoboHydraHeadStatic;

var fs = require('fs');

exports.getBodyParts = function(conf, modules) {

    var data = JSON.parse(fs.readFileSync(__dirname + '/config' , 'utf8'));
    var heads = [];
    for (var i = 0; i < data.length; ++i) {
        var dir = data[i];
        var config = JSON.parse(fs.readFileSync(__dirname + '/' + dir + '/config'));
        //console.log(config);
        var path = config.url;
        console.log(path);
        var method = config.method;
        var methodFunction = 'queryParams';
        if (method == 'post') methodFunction = 'bodyParams';
        var tests = config.tests;
        console.log(typeof tests);
        //console.log(tests[0]);
        var Head = new RoboHydraHead ({
            path: path,
            method: method,
            handler: function(req, res) {
                res.statusCode = 400;
                var config = JSON.parse(fs.readFileSync(__dirname + '/' + dir + '/config'));
                //console.log(config);
                var method = config.method;
                var methodFunction = 'queryParams';
                if (method == 'post') methodFunction = 'bodyParams';
                var tests = config.tests;
                for (var j = 0; j < tests.length; ++j) {
                    var test = tests[j];
                    var params = test.params;
                    var header = test.header;
                    var scenarios = test.scenarios;
                    //indicate whether the request's params (get or post) match the config file
                    var isValid = true;
                    for (var key in params) {
                        if (params.hasOwnProperty(key)) {
                            if (req[methodFunction][key] != params[key]) {
                                isValid = false;
                                break;
                            }
                        }
                    }
                    if (!isValid) continue;
                    if (typeof req.headers[header] == 'undefined') {
                        res.send('Header not valid');
                        return;
                    }
                    res.statusCode = 200;
                    var realHeader = req.headers[header];
                    var file = __dirname + '/' + dir + '/' + realHeader;
                    //check if the file with the same scenario name exists, if not send the first scenario
                    if (fs.existsSync(file)) {
                        console.log(fs.readFileSync(file));
                        res.send(fs.readFileSync(file));
                    }
                    else {
                        var defaultFile = __dirname + '/' + dir + '/' + scenarios[0];
                        if (!fs.existsSync(defaultFile)) {
                            res.send('At least one default scenario file must exists')
                        }
                        else res.send(fs.readFileSync(defaultFile));
                    }
                    return;
                }
                res.send('invalid parameters');
                return;
            }
        });
        console.log(Head);
        heads.push(Head);
    }

/*
    return {
        heads: [
            new RoboHydraHeadStatic({
                path: '/foo',
                content: {
                    "success": true,
                    "results": [
                        {"url": "http://robohydra.org",
                            "title": "RoboHydra testing tool"},
                        {"url": "http://en.wikipedia.org/wiki/Hydra",
                            "title": "Hydra - Wikipedia"}
                    ]
                }
            })
        ]
    };
    */
    return {
        heads: heads
    }

};