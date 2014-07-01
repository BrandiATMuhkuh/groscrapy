/*
//http://shop.countdown.co.nz/Shop/Browse/liquor-beer-cider?page=1

$(".details-container").each(function(){
console.log($(this).children().first().children().first().attr("href"))
})
*/

var phantom = require('phantom');
var deployd = require('deployd');
var config = require('./config.json');
var internalClient = require('deployd/lib/internal-client');
var dpd = deployd(config.deployd);
var globalSock;
var ic;
var fs = require('fs');
var domain = "http://shop.countdown.co.nz";
var startLink = domain+"/Shop/Browse/liquor-beer-cider?page=1";
var phCount = -1;
var mxRequests = 0;
var pagesPlusEnd = [];
var catgorylist;


dpd.listen();

//start deployd
dpd.sockets.on('connection', function (socket) {
    ic = internalClient.build(process.server);
    globalSock = socket;
    
    getCaterlogList();
});

function getCaterlogList(){
    ic.catgorylist.get(function (result, err) {
        catgorylist= result;
        //console.log(result);
        startPhantom();
    });
}

function startPhantom(){
    phantom.create(function(ph) {

        for(a in catgorylist){
            countDownLevel1(ph, catgorylist[a].link, catgorylist[a].maxpages);
        }

        
    });
}

function incPh(){
    console.log('incPh', phCount);
    phCount = phCount + 1;
    //console.log("incPh:"+phcount);
    //return phCount;
}

function decPh(ph){
    console.log('decPh', phCount);
    phCount = phCount -1;
    //console.log("decPh:"+phcount);

    if(phCount==0){
        ph.exit();
        writeToFile();
    }
    //return phCount;
}

function countDownLevel1(ph, link, maxpages){
    console.log(link, maxpages);
    countDownLevel2(ph, link, 1, maxpages);
    /*
    for(i=1;i<maxpages+1;i=i+1){
        console.log(i);
        countDownLevel2(ph, link, i);

    }*/
}

function saveProductLinkInDb(linkList) {
    for(a in linkList){
        console.log("link", linkList[a], "Stockcode", getParamFromUrl(linkList[a], "Stockcode"));
    
        ic.productlinks.post({
            "company":"countdown",
            "link":linkList[a],
            "stockcode":getParamFromUrl(linkList[a], "Stockcode"),
        },function(result2, err){});
    }
}

function getParamFromUrl(qs, name) {
    qs = qs.split("?")[1];

    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params[name];
}




function countDownLevel2(ph, link, nr, maxpages){

    var sLink = domain+link+"?page="+nr;
    console.log("slink:",sLink);
    
    return ph.createPage(function(page) {

    return page.open(sLink, function(status) {
      //console.log("opened site? ", status);         
 
            page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
                //jQuery Loaded.
                //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                setTimeout(function() {
                    return page.evaluate(function() {
 
 						
                        //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                        var h2Arr = [];

                        $(".details-container").each(function(){
							//console.log($(this).children().first().children().first().attr("href"))
							h2Arr.push($(this).children().first().children().first().attr("href").trim());
						});

                        return h2Arr;
                    }, function(result) {
                        //console.log(link, nr, maxpages, result);
                        saveProductLinkInDb(result);
                        page.close();
                        nr = nr +1;
                        if(nr <= maxpages){
                            countDownLevel2(ph, link, nr, maxpages);
                        }
                        //ph.exit();

                        //decPh(ph);
                        //ph.exit();
                        
                    });
                }, 3000);
 
            });
    });
    });
}