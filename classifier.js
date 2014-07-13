// https://www.npmjs.org/package/classifier
var classifier = require('classifier');


var bayes = new classifier.Bayesian({
  backend: {
    type: 'Redis',
    options: {
      hostname: 'localhost', // default
      port: 6379,            // default
      name: 'emailspam'      // namespace for persisting
    }
  }
});

/*
bayes.train("cheap replica watches", 'spam');

bayes.train("I don't know if this works on windows", 'not');
bayes.train("fuck you genetally", 'fuck');

*/

bayes.classify(" don't know ", function(category) {
  console.log("classified in: " + category);
});
