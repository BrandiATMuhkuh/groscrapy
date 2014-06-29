var phantom = require('phantom');
var fs = require('fs');
var domain = "http://shop.countdown.co.nz";
var startLink = domain+"/Shop/Aisle/275?name=unsliced-bread";
var phCount = -1;
var mxRequests = 0;
var pagesPlusEnd = [];

phantom.create(function(ph) {
    return countDownLevel1(ph);
});

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

function writeToFile(){
    fs.writeFile("productListPages.json", JSON.stringify(pagesPlusEnd),null);
}

function countDownLevel1(ph){
    return ph.createPage(function(page) {
        incPh();
    return page.open(startLink, function(status) {
      //console.log("opened site? ", status);         
 
            page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
                //jQuery Loaded.
                //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                setTimeout(function() {
                    return page.evaluate(function() {
 
                        //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                        var h2Arr = [],
                        pArr = [];
                        var i = 0;

                        var ret = "";
                        $("#navigation-panel>.navigation-root>#root>.navigation-category>.navigation-label").each(function(){
                            var _name = $(this).text().trim();
                            var _link = $(this).children().first().attr("href").trim();
                            

                            h2Arr.push({"name":_name, "link":_link});
                        });

                        return h2Arr;
                    }, function(result) {
                        //console.log(result);
                        //ph.exit();

                        for(a in result){
                            countDownLevel2(ph,result[a]);
                        }
                        decPh(ph);
                        //ph.exit();
                        
                    });
                }, 3000);
 
            });
    });
    });
}

function countDownLevel2(ph, newLevel){
    console.log("level2", domain+newLevel.link);
    var nextLink = domain+newLevel.link;
    var _newLevel = newLevel.link;

    return ph.createPage(function(page) {
        incPh();
        return page.open(nextLink, function(status) {
          //console.log("opened site? ", status);         
     
                page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
                    //jQuery Loaded.
                    //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                    setTimeout(function() {
                        return page.evaluate(function() {
                            var h2Arr = [];
                            var _link = $(".open").children().first().attr("href");
                            var _mx = $(".paging").first().find(".page-number").last().children().text().trim();
                            _mx = parseInt(_mx);
                            var ret = {"_link":_link, "_mx":_mx};
                            return ret;
                        }, function(result) {
                            //http://shop.countdown.co.nz/Shop/Browse/frozen-foods?page=1
                            //console.log(result, result._mx, result._link);
                            countDownLevel3(null, result._link, result._mx);
                            //ph.exit();
                            decPh(ph);
                            
                        });
                    }, 3000);
     
                });
        });
    });

}

function countDownLevel3(ph, link, maxNr){
    //http://shop.countdown.co.nz/Shop/Browse/frozen-foods?page=1
    mxRequests = mxRequests+ maxNr;
    pagesPlusEnd.push({"link":link, "end":maxNr});
    console.log("level3", link, maxNr, mxRequests);
}