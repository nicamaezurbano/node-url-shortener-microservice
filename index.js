require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// Array of URL
let url_array = [];
let id = 0;

app.post('/api/shorturl', function(req, res) {
  let url = req.body.url;

  // Regex to follow the pattern : http://www.example.com
  let urlPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;

  if(!urlPattern.test(url)) 
  {
    // Not match
    res.json({
      "error":"Invalid URL"
    });
  }
  else
  {
    try 
    {
        
      // Retrieve hostname
      let hostname = new URL(url).hostname;
      
      // Check the hostname if valid
      dns.lookup(hostname, (err, address, family) => {
        if(err)
        {
          console.log('error:' + err);
          res.json({
            "error":"Invalid Hostname"
          });
        }
        else
        {
          // Check if the url is existing on the array
          let isExists = false;
          url_array.forEach(element => {
            if(element.original_url == url)
            {
              isExists = true;
            }
          });

          if(!isExists)
          {
            id++;
            url_array.push({'original_url': url, 'id': id});
          }

          // Retrieve the short url based on its index +1
          let shorturl = id;
          console.log(url_array);

          res.json({
            'original_url': url,
            'short_url': shorturl
          })
        }
      });
    } 
    catch (e) {
      res.json({
        "error":"Invalid URL"
      });
    }
  }
});

app.get('/api/shorturl/:shorturl', function(req, res) {
  let shorturl = req.params.shorturl;
  let original_url = '';

  // Check if the url is existing on the array
  let isExists = false;
  url_array.forEach(element => {
    if(element.id == shorturl)
    {
      isExists = true;
      original_url = element.original_url;
    }
  });

  if(isExists)
  {
    // Redirect to the url
    console.log(url_array);
    res.redirect(original_url);
  }
  else
  {
    res.json({
      "error":"No short URL found for the given input"
    });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
