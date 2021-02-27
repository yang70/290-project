const PORT = 3000;
const SCORE_URL = 'https://www.thesportsdb.com/api/v1/json/1/latest'
const TEAM_URL = 'https://www.thesportsdb.com/api/v1/json/1/lookupleague.php?id='
const SPORT_MAP = {
    'basketball': {
        'id': 4387,
        'leagueLink': 'https://www.nba.com'
    },
    'hockey': {
        'id': 4380,
        'leagueLink': 'https://www.nhl.com'
    },
    'soccer': {
        'id': 4332,
        'leagueLink': 'https://www.legaseriea.it/en'
    }
};

var express = require('express');
var request = require('request');
var helpers = require('./helpers/helpers');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:'YouWillNeverGuessThis'}));
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', PORT);

app.get('/',function(req,res,next){
    var context = {};

    if(!req.session.vote){
    }

    res.render('home',context);
});

app.post('/',function(req,res){
    var context = {};
});

app.get('/:page',function(req,res,next){
    let page = req.params.page;
    let context = {};

    switch(page) {
        case 'basketball':
        case 'hockey':
        case 'soccer':
            let sport = page;
            context.sport  = sport[0].toUpperCase() + sport.slice(1); // https://stackoverflow.com/a/7224605
            context.leagueLink = SPORT_MAP[sport].leagueLink;

            let url = SCORE_URL + (sport == 'hockey' ? 'icehockey' : sport) + '.php';
            request(url, function(err, response, body) {
                if (!err && response.statusCode < 400) {
                    let scores = JSON.parse(body);

                    context.scores = helpers.formatScores(sport, scores);

                    request(TEAM_URL + SPORT_MAP[sport].id, function(err, response, body) {
                        if (!err && response.statusCode < 400) {
                            res.render('sport', context);
                        }
                        else {
                            console.log(err);
                            next(err);
                        }
                    });
                }
                else {
                    console.log(err);
                    next(err);
                }
            });
            break;
        case 'about':
            res.render('about', context);
            break;
        default:
            next();
    }
});

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
