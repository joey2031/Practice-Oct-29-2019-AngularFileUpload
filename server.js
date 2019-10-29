// src: https://medium.com/@TheJesseLewis/how-to-make-a-basic-html-form-file-upload-using-multer-in-an-express-node-js-app-16dac2476610
// mimetypes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
// RUN PACKAGES
const express = require('express'); //app router
const multer = require('multer'); // file storing middleware
const bodyParser = require('body-parser'); //cleans our req.body
var path = require("path");

const PDF = 'application/pdf';
const image = 'image/jpeg';
let fileAllowed = false;

// SETUP APP
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false })); //handle body requests
app.use(bodyParser.json());

//let's declare a public static folder, 
// this is where our client side static files/output go
app.use('/', express.static(__dirname + '/public'));


//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {

    //specify diskStorage (another option is memory)
    storage: multer.diskStorage({

        //specify destination
        destination: function(req, file, next) {
            next(null, './public'); // when I put a folder that dosent exist its suspose to make it but it crashes
        },

        //specify the filename to be unique
        filename: function(req, file, next) {
            console.log(file);
            //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
            const ext = file.mimetype.split('/')[1];
            //set the file fieldname to a unique name containing the original name, current datetime and the extension.
            next(null, file.fieldname + '-' + Date.now() + '.' + ext);
        }
    }),

    // filter out and prevent non-image files.
    fileFilter: function(req, file, next) {
        if (!file) { // if its not a file??
            next();
        }
        console.log(file.mimetype); //instead of extenssions we can just use the mimetypes 

        // only permit image mimetypes
        //  const image = file.mimetype.startsWith('image/');

        if (file.mimetype.startsWith(PDF) || file.mimetype.startsWith(image)) {
            fileAllowed = true;
        } else {
            fileAllowed = false;
        }

        if (fileAllowed) {
            console.log('photo uploaded');
            next(null, true);
        } else {
            console.log("file not supported")
                //TODO:  A better message response to user on failure.
            return next();
        }
    }
};


app.use(function(req, res, next) { // this is to handel cors.
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


//Route 1: serve up the homepage
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './index.html'));
});

//Route 2 (post): serve up the file handling solution (it really needs a better user response solution. 
//If you try uploading anything but an image it will still say 'complete' though won't actually upload it). 
app.post('/upload', multer(multerConfig).single('photo'), function(req, res) {
    res.send('Complete!');
});
// Please note the .single method calls ('photo'), and that 'photo' is the name of our file-type input field!

app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});