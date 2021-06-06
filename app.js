const express = require('express');

const app = express();

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017'


app.get('/secteur', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("company_profiles").distinct("overview.specialties",
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });
});

app.get('/companies', (req, res) => {
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("company_profiles").find({}
        ,{fields:{ _id:1 ,overview:1}}).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });
});

app.get('/companies/:name', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("company_profiles").findOne({
                "overview.name": {$regex: req.params.name, $options: 'i'}
            },{fields:{ _id:0,overview:1}},
            function(err, result) {
                if (err) throw err;
                res.json(result["overview"]);
                db.close();
            });
    });
});

app.get('/companies/:name/tech', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
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
app.get('/companies/:name/jobs', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").find({
                "name": {$regex: req.params.name, $options: 'i'}
            },{fields:{ _id:0,url_post:1,post:1,post_class:1,location:1,education_level:1,experience:1,posting_date:1}}).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
            });

});
app.get('/companies/:name/news', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
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
app.get('/companies/:name/funding', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
       let dbo = db.db('db');
        dbo.collection("Funding").findOne({
                "name": {$regex: req.params.name, $options: 'i'}
            },{fields:{ _id:0,"Overview ":1, Fundings:1, Investors:1}},
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });
});
app.get('/companies/:name/static/tot', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match :{
                    "name": {$regex: req.params.name, $options: 'i'} }},

            {
                $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                        month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                    count: {$sum: 1}

                }},{fields:{ _id:0, year :1,month:1, count : { $sum : 1 }} }).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/static/production', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match :{
                    "name": {$regex: req.params.name, $options: 'i'} , "post_class":"production"}},

            {
                $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                        month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                    count: {$sum: 1}

                }},{fields:{ _id:0, year :1,month:1, count : { $sum : 1 }} }).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/static/support', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
            $match :{
                          "name": {$regex: req.params.name, $options: 'i'} , "post_class":"support"}},

                {
                 $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                         month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                     count: {$sum: 1}

        }},{fields:{ _id:0, year :1,month:1, count : { $sum : 1 }} }).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/static/management', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match :{
                    "name": {$regex: req.params.name, $options: 'i'} , "post_class":"management"}},

            {
                $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                        month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                    count: {$sum: 1}}},

        {fields:{ _id:0, year :1,month:1, count : { $sum : 1 }} }).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/educ', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match :{
                    "name": {$regex: req.params.name, $options: 'i'} }},

            {
                $group: {


            _id: "$education_level"
                ,
                count : { $sum : 1 }

                }
            },{fields:{ _id:0, education_level :1, count : { $sum : 1 }}}).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/exp', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match :{
                    "name": {$regex: req.params.name, $options: 'i'} }},

             {
                $group:  {_id:"$experience",
                count : { $sum : 1 }}
    },
            {
                fields:{
                    _id:0
                    , experience :1,
                    count : { $sum : 1 }}}
        ).toArray(
            function(err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
module.exports = app;