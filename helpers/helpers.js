const VOTING_SPORTS = [
    'baseball',
    'football',
    'tennis',
    'other'
]

const fs = require('fs');

function handleBasketball(scores) {
    let games = [];

    scores.games.forEach(game => {
        games.push({
            'home': game.hTeam.triCode,
            'homeScore': randomBasketballScore(), // Making these up, for some reason API not returning scores
            'away': game.vTeam.triCode,
            'awayScore': randomBasketballScore()
        });
    });

    return games;
}

function handleHockey(scores) {
    let games = [];

    scores.games.forEach(game => {
        let home = game.teams.home.abbreviation;
        let away = game.teams.away.abbreviation;

        games.push({
            'home': home,
            'homeScore': game.scores[home],
            'away': away,
            'awayScore': game.scores[away]
        });
    });
    return games;
}

function handleSoccer(scores) {
    let games = [];

    scores.teams.Match.forEach(game => {
        games.push({
            'home': game.HomeTeam,
            'homeScore': game.HomeGoals,
            'away': game.AwayTeam,
            'awayScore': game.AwayGoals
        });
    });
    return games;
}

function randomBasketballScore() {
    return Math.floor(Math.random() * (130 - 80) + 80); // https://www.geeksforgeeks.org/how-to-generate-random-number-in-given-range-using-javascript/
}

module.exports = {
    formatScores: function(sport, scores) {
        switch(sport) {
            case 'basketball':
                return handleBasketball(scores);
            case 'hockey':
                return handleHockey(scores);
            case 'soccer':
                return handleSoccer(scores);
            default:
                throw('Unknown Sport');
        }
    },

    votingResults: function() {
        var results = [];

        VOTING_SPORTS.forEach(sport => {
            let voteFile = `./votes/${sport}.txt`;
            let votes    = fs.readFileSync(voteFile, {encoding: 'utf8', flag: 'r'});
            let capSport = sport.charAt(0).toUpperCase() + sport.slice(1); // https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript

            results.push({sport: capSport, votes: parseInt(votes)});
        });

        return results;
    }
}