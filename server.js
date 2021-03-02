const PORT      = 3000;
const SCORE_URL = 'https://www.thesportsdb.com/api/v1/json/1/latest'
const TEAM_URL  = 'https://www.thesportsdb.com/api/v1/json/1/lookupleague.php?id='
const SPORT_MAP = {
    'basketball': {
        'id': 4387,
        'displayName': 'Basketball',
        'leagueLink': 'https://www.nba.com',
        'logo': 'https://www.thesportsdb.com/images/media/league/logo/ypuryw1421971236.png/preview'
    },
    'hockey': {
        'id': 4380,
        'displayName': 'Hockey',
        'leagueLink': 'https://www.nhl.com',
        'logo': 'https://www.thesportsdb.com/images/media/league/logo/qguaew1557140752.png/preview'
    },
    'soccer': {
        'id': 4332,
        'displayName': 'Soccer',
        'leagueLink': 'https://www.legaseriea.it/en',
        'logo': 'https://www.thesportsdb.com/images/media/league/logo/r7q96i1557058508.png/preview'
    }
};

const express = require('express');
const request = require('request');
const fs      = require('fs');
const helpers = require('./helpers/helpers');

var app        = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session    = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:'YouWillNeverGuessThis'}));
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', PORT);

app.get('/',function(req,res,next){
    var context = {};

    if(req.session.vote){
        context.vote = true;
        context.votingResults = helpers.votingResults();
    }

    res.render('home',context);
});

app.post('/',function(req,res){
    var context = {};

    if (req.body.newSport) {
        context.vote = req.session.vote = true;

        let voteFile = `./votes/${req.body.newSport}.txt`;

        // https://www.geeksforgeeks.org/node-js-fs-readfilesync-method/
        let votes = fs.readFileSync(voteFile, {encoding: 'utf8', flag: 'r'});

        let updatedVotes = parseInt(votes) + 1;

        // https://www.geeksforgeeks.org/node-js-fs-writefilesync-method/
        fs.writeFileSync(voteFile, updatedVotes.toString());
    }

    context.votingResults = helpers.votingResults();

    res.render('home', context);
});

app.get('/:page',function(req,res,next){
    let page = req.params.page;
    let context = {};

    switch(page) {
        case 'basketball':
        case 'hockey':
        case 'soccer':
            let sport = page;
            context.title      = SPORT_MAP[sport].displayName;
            context.leagueLink = SPORT_MAP[sport].leagueLink;
            context.logo       = SPORT_MAP[sport].logo;
            context.sport      = sport;

            let url = SCORE_URL + (sport == 'hockey' ? 'icehockey' : sport) + '.php';

            request(url, function(err, response, body) {
                if (!err && response.statusCode < 400) {
                    let scores = JSON.parse(body);

                    context.scores = helpers.formatScores(sport, scores);

                    request(TEAM_URL + SPORT_MAP[sport].id, function(err, response, body) {
                        if (!err && response.statusCode < 400) {
                            context.description = JSON.parse(body).leagues[0].strDescriptionEN;
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

app.get('/scores/:sport', function(req, res, next) {
    let sport = req.params.sport;
    let url   = SCORE_URL + (sport == 'hockey' ? 'icehockey' : sport) + '.php';

    request(url, function(err, response, body) {
        if (!err && response.statusCode < 400) {
            let scores = helpers.formatScores(sport, JSON.parse(body));

            let content = `${SPORT_MAP[sport].displayName} Scores\n\n`;

            scores.forEach(game => {
                content += `${game.away} - ${game.awayScore}\n`
                content += "@\n"
                content += `${game.home} - ${game.homeScore}\n`
                content += "-------\n"
            });

            // https://gist.github.com/davidbanham/1186032
            res.status(200).attachment(`${sport}-scores.txt`).send(content);
        }
        else {

            console.log(err);
            next(err);
        }
    });
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
