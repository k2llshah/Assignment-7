var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var jsonParser = bodyParser.json({
    type: 'application/json'
});
var router = express.Router();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var url = 'mongodb://localhost:27017/assignment';

app.post('/links', function(req, res) {

    var title = req.param("title");
    var link = req.param("link");
    var clicks = 0;

    var insertDocument = function(db, callback) {

        db.collection('linktbl').insert({
            "title": title,
            "link": link,
            "clicks": clicks
        });

        var data = db.collection('linktbl').find().toArray(function(err, documents) {
            res.send(documents);
            // db.close();
        });

    };
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertDocument(db, function() {
            db.close();
        });
    });
});

app.get('/links', function(req, res) {

    var findLinks = function(db, callback) {

        var data = db.collection('linktbl').find().toArray(function(err, documents) {
            res.send(documents);
            db.close();
        });
    };
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        findLinks(db, function() {});
    });
});

app.get('/links/:title', function(req, res) {

    var title = req.param("title");
    var incrClicks = function(db, callback) {
        var data = db.collection('linktbl').find({
            "title": title
        });
        data.each(function(err, doc) {
            assert.equal(err, null);
            if (doc !== null) {
                db.collection('linktbl').updateOne({
                    "title": doc.title
                }, {
                    $set: {
                        "link": doc.link
                    },
                    $inc: {
                        "clicks": 1
                    }
                }, function(err, results) {
                    //console.log(results);
                    callback();
                });
                res.writeHead(302, {
                    'Location': doc.link
                });
                res.end();
            } else {
                callback();
            }
        });
    };
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        incrClicks(db, function() {
            db.close();
        });
    });
});

console.log("Server started on 3000");
app.listen(3000);
module.exports = router;