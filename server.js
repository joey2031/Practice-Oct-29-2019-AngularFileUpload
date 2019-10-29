// Some notes: In the tutorial the import for FileUploader is wrong, the right path is used in my code
// He decides to use nodemon. I installed it to, in the futuore we can uninstall it and just use node
// Don't worry about CORS, it just used to allow the browser to accept something comming from an  external source.
// Not sure why he imported FileSelectDirective and never used it- After some testing might take it out.
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const app = express();
const router = express.Router();

const DIR = './uploads';
const PDF = 'application/pdf';
const image = 'image/jpeg';
let fileAllowed = false;

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

let upload = multer({ storage: multerConfig }); // might not need this just say multer(multerConfig).single('photo') in app.post

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) { // this is to handel cors.
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/api', function(req, res) {
    res.end('file catcher example');
});

app.post('/api/upload', upload.single('photo'), function(req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        console.log('file received');
        return res.send({
            success: true
        })
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log('Node.js server is running on port ' + PORT);
});