var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors       = require('cors');
var fs         = require('fs');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 3001;        // set our port
var router = express.Router();              // get an instance of the express Router

router.get('/', function(req, res) {
    res.json({ message: 'Hello from api' });
});

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Request params:', req.params);
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/:fileName')
    .get(function (req, res) {
        const fileName = __dirname + '/data/' + req.params.fileName + '.json';

        fs.exists(fileName, function (exists) {
            if(exists) {
                res.json(require(fileName));
            } else {
                res.json({error: 'file \'' + req.params.fileName  + '\' not found'});
            }
        });
    });


app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Backend server is now listening on port ' + port);