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

const multerConfig = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, DIR);
        },
        filename: (req, file, cb) => {
            console.log(file);
            //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
            const ext = file.mimetype.split('/')[1];
            cb(null, file.fieldname + '-' + Date.now() + '.' + ext); // Testing everything up to here and its working
        }
    }), // end of diskStorage, still in multerConfig
    fileFilter: function(req, file, next) { // when I added this it stoped working
        if (!file) {
            next();
            console.log("Inside the if");
        }
        console.log("In file filter");
    }

};

//let upload = multer({ storage: storage });

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

app.post('/api/upload', multer(multerConfig).single('photo'), function(req, res) {
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