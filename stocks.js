var request = require('request')

var ticker = process.argv[2]
var option = process.argv[3]

var getStockData = function(ticker, option) {

    var firstReq = {
        url: 'http://dev.markitondemand.com/Api/v2/Quote/json?symbol=' + ticker
    }

    var secondReqParams = {
        normalized: false,
        numberOfDays: 25,
        dataPeriod: "Day",
        Elements: [{
            "Symbol": ticker,
            "Type": "price",
            "Params": ["ohlc"]
        }]
    }


    var params = encodeURIComponent(JSON.stringify(secondReqParams))

    var secondReq = {
        url: 'http://dev.markitondemand.com/Api/v2/InteractiveChart/json?parameters=' + params
    }

    var cleanedResponse = {
        currentPrice: null,
        lastTenDays: []
    }

    request.get(firstReq, function(err, response, body) {

        var body = JSON.parse(body)

        cleanedResponse.currentPrice = body.LastPrice

        request.get(secondReq, function(err, response, body) {
            var body = JSON.parse(body)
            console.log(body)
            console.log(body.Elements[0].DataSeries.open)

            for (var i = 0; i < body.Dates.length; i++) {
                var dayObject = {
                    date: body.Dates[i]
                }
                cleanedResponse.lastTenDays.push(dayObject);
            }

            var dailyStockData;

            if (option === 'open') {
                dailyStockData = body.Elements[0].DataSeries.open;
            } else if (option === 'close') {
                dailyStockData = body.Elements[0].DataSeries.close;
            }
            for (var i = 0; i < dailyStockData.values.length; i++) {
                cleanedResponse.lastTenDays[i].stockPrice = dailyStockData.values[i];
            };

            var truncatedResults = cleanedResponse.lastTenDays.slice(cleanedResponse.lastTenDays.length - 10)

            cleanedResponse.lastTenDays = truncatedResults

            console.log(cleanedResponse)

        })

    })

}

getStockData(ticker, option)

