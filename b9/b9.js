/****************************************************************
* Log in to B9Lab
* Capture the results
*****************************************************************/

var casper = require('casper').create({
  verbose: true,
  logLevel: "info",
  pageSettings: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
  }
});

var url = 'https://academy.b9lab.com/login';

var email = '';
var auth = '';
var currentChapter = '';
var currentChapterId = 0;
var chapters = [];
var lessons = [];


function terminate() {
  this.echo('thats all folks. ').exit();
}

function getChapters() {
  var chapters = document.querySelectorAll('nav[aria-label="Course Navigation"] h3 a');
  return Array.prototype.map.call(chapters, function(e) {
    return e.innerText;
  });
};

function getLessons() {
  var lessons = document.querySelectorAll('#accordion > nav > div.chapter.is-open > ul > li');
  return Array.prototype.map.call(lessons, function(e) {
    return e.innerText;
  });
};


casper.start(url, function() {
  this.echo(this.getTitle());
  console.log('Starting location is ' + this.getCurrentUrl());
});

casper.then(function() {
  this.fillSelectors('div.group.group-form.group-form-requiredinformation', {
    'input[name="email"]': email,
    'input[name="password"]': auth
  }, true);
});

casper.then(function() {
  console.log('Authentication ok, new location is ' + this.getCurrentUrl());
  // Log Error if we hit the captcha
  if (/captcha/.test(this.getCurrentUrl())) {
    console.log('Please login and confirm your captcha.');
  }
});


casper.then(function() {
  console.log('the location is ' + this.getCurrentUrl());
  this.click('#submit');
  console.log('clicked view course ');
});

casper.wait(2000, function() {
  console.log('waited 2 seconds');
  console.log('the location is ' + this.getCurrentUrl());
});

casper.then(function() {
  console.log('the location is ' + this.getCurrentUrl());
  this.click('#my-courses > ul > li > article > section > div.wrapper-course-details > div.wrapper-course-actions > div > a');
  console.log('clicked view course ');
});

casper.wait(2000, function() {
  console.log('waited 2 seconds');
  console.log('the location is ' + this.getCurrentUrl());
});

casper.then(function() {
  console.log('the location is ' + this.getCurrentUrl());
  this.click('#content > nav > div > ol > li:nth-child(1) > a');
  console.log('clicked courseware ');
});

casper.wait(2000, function() {
  console.log('waited 2 seconds');
  console.log('the location is ' + this.getCurrentUrl());
});

casper.then(function() {
  chapters = this.evaluate(getChapters);
});

casper.then(function() {
  this.echo(chapters.length + ' chapters found: ');
  this.echo(' - ' + chapters.join('\n - '))

  // this.echo('finished').exit();
});


casper.then(function() {


  var currentChapterId = 0;
  var end = chapters.length;

  for (;currentChapterId < end;) {

    (function(cId) {
      casper.thenClick('#ui-accordion-accordion-header-'+currentChapterId+' > a', function() {
            this.echo('Clicked chapter '+cId);
            this.wait(1000, function() {
              console.log('waited 1 seconds');
            });

            var lessons = this.evaluate(getLessons)
            this.then(function() {
              this.echo(lessons.length + ' lessons found: ');
              this.echo(' - ' + lessons.join('\n - '))
            });

            this.then(function() {
              var i = 1;
              this.repeat(lessons.length, function() {
                this.click('#ui-accordion-accordion-panel-'+cId+' > li:nth-child('+i+') > a');
                this.echo('Clicked lesson '+i);
                this.wait(4000, function() {
                  console.log('waited 4 second');
                });

                this.then(function() {
                  this.echo("capturing lesson " + i);
                  this.captureSelector("img-c" + (cId+1) + "-l-" + (i-1) + ".png", '#course-content');
                });

                i++;
              });
            });

      });
    })(currentChapterId);

    currentChapterId++;

  }


});


casper.run();
