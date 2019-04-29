process.chdir('mock-cms');

var express = require('express');
var exphbs = require('express-handlebars');

var app = express();
var hbs = exphbs.create({ /* config */ });

// Register `hbs.engine` with the Express app.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.get('/', function(req, res, next) {
  res.render('home');
});

app.get('/blog', function(req, res, next) {
  res.render('blog');
});

app.listen(5000);
