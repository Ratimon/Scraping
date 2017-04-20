/****************************************************************
* use captureSelector()
*****************************************************************/

var casper = require("casper").create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadPlugins: false
  }
});

var fs = require('fs');
var url = 'http://www.bestbuy.com/site/dji-phantom-3-standard-quadcopter-white/4406800.p?id=1219743453736&skuId=4406800';

var currentPage = 1;
var ratings = [];
var dates = [];
var startPage = '';

function terminate() {
  this.echo('thats all folks. ').exit();
}

function startPageFn() {
  var startPage = document.querySelector('span.BVRRSelectedPageNumber');
  return Array.prototype.map.call(startPage, function(e) {
    return e.innerText;
  });
};

function getRatings() {
  var ratings = document.querySelectorAll('.BVRRNumber.BVRRRatingNumber')
  return Array.prototype.map.call(ratings, function(e){
    return e.innerText;
  });
};

function getDates() {
  var dates = document.querySelectorAll('.BVRRValue.BVRRReviewDate');
  return Array.prototype.map.call(dates, function(e) {
    return e.innerText;
  });
};

var processPage = function() {
  casper.wait(1000, function() {
    console.log('waited 1 second');
  });
  this.echo("capturing page " + currentPage);
  this.captureSelector("drone-results-p" + currentPage + ".png", '#customer-reviews');

  // don't go too far down the rabbit hole
  if (currentPage > 2 || !this.exists(".BVRRRatingNormalImage")) {
    return terminate.call(casper);
  }

  currentPage++;
  this.echo("requesting next page: " + currentPage);
  this.thenClick('span.BVRRPageLink.BVRRNextPage a').then(function() {
    this.waitFor(function() {
      return startPage != 1;
    }, processPage, terminate);
  });
};

casper.start(url, function() {
  this.echo(this.getTitle());
});

casper.wait(2000, function() {
  console.log('waited 2 seconds');
});

casper.then(function() {
  this.click('button[data-click-location="customerreviewstab"]');
  console.log('clicked reviews tab ');
});

casper.then(function() {
  startPage = this.evaluate(startPageFn);
});

casper.waitForSelector('.BVRRRatingContainerStar', processPage, terminate);

casper.run();