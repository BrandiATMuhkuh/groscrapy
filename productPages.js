/*
//http://shop.countdown.co.nz/Shop/Browse/liquor-beer-cider?page=1

$(".details-container").each(function(){
console.log($(this).children().first().children().first().attr("href"))
})
*/

var phantom = require('phantom');
var fs = require('fs');
var domain = "http://shop.countdown.co.nz";
var startLink = domain+"/Shop/Browse/liquor-beer-cider?page=1";
var phCount = -1;
var mxRequests = 0;
var pagesPlusEnd = [];

phantom.create(function(ph) {
    return countDownLevel1(ph);
});

function countDownLevel1(ph){
    return ph.createPage(function(page) {

    return page.open(startLink, function(status) {
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
                        console.log(result);
                        //ph.exit();

                        //decPh(ph);
                        ph.exit();
                        
                    });
                }, 3000);
 
            });
    });
    });
}