const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017'
const dbName = 'db';

const client = new MongoClient(url,{ useUnifiedTopology: true});

app.get('/:name', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db('db');
        dbo.collection("companies").findOne({
                "overview.name": {$regex: req.params.name, $options: 'i'}
            },{fields:{ _id:0,overview:1}},
            function(err, result) {
                if (err) throw err;
                res.json(result["overview"]);
                db.close();
            });
    });
});

app.get('/:name/tech', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db('db');
        dbo.collection("scraped_companies_wttj").findOne({
                "name": {$regex: req.params.name, $options: 'i'}
            },{fields:{ _id:0,technologies:1}},
            function(err, result) {
                if (err) throw err;
                res.json(result["technologies"]);
                db.close();
            });
    });
});
app.get('/:name/jobs', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db('db');
        dbo.collection("jobs_wttj").find({
                "name": {$regex: req.params.name, $options: 'i'}
            },{fields:{ _id:0,url_post:1,post:1,post_class:1,location:1,education_level:1,experience:1}}).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
            });

});
app.get('/:name/news', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db('db');
        dbo.collection("news").find({
            "name": {$regex: req.params.name, $options: 'i'}
        },{fields:{ _id:0,title:1,link:1,published:1}}).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});

module.exports = app;