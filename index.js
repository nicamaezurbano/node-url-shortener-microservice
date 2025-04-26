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
console.log(url_array);

app.post('/api/shorturl', function(req, res) {
  let url = req.body.url;
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
        let isExists = url_array.includes(url);
        if(!isExists)
        {
          url_array.push(url);
        }

        // Retrieve the short url based on its index +1
        let shorturl = url_array.indexOf(url) + 1;
        console.log(url_array);

        res.json({
          'original_url': url,
          'short_url': shorturl
        })
      }
    });
  }
});

app.get('/api/shorturl/:shorturl', function(req, res) {
  let shorturl = req.params.shorturl;
  let url_index = shorturl - 1;

  if(url_array[url_index])
  {
    // Redirect to the url
    let original_url = url_array[url_index];
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
