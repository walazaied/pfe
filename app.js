const express = require('express');

const app = express();

const MongoClient = require('mongodb').MongoClient;

//const url = 'mongodb+srv://wala:wala@cluster0.cjxf6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const url ='mongodb://localhost:27017';

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Content-Type', 'application/json');
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.get('/companies/secteurs', function (req, res) {
    const specialtiesName = req.query.name || '';

    MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const dbo = db.db('db');
            dbo.collection("company_profiles")
                .distinct(
                    "overview.industry",
                    {"overview.industry": {'$regex': specialtiesName, "$options": "i"}}
                )
                .then(
                    function (result) {
                        db.close();
                        res.json(result);
                    },
                    function (err) {
                        db.close();
                        throw err;
                    }
                )
        }
    );
});

app.get('/companies', function (req, res) {
    const page = Number(req.query.page) || null;
    const limit = Number(req.query.limit) || 0;
    const companyName = req.query.name || '';
    const location = req.query.localisation || '';
    const secteurs = req.query.secteur || '';
    const size = req.query.size || '';

    const query =  {
        "overview.name": {'$regex': companyName, "$options": "i"},
        "overview.location": {'$regex': location, "$options": "i"},
        "overview.company_size": {'$regex': size, "$options": "i"}
    };

    if (typeof secteurs === 'string') {
        query["overview.industry"] = {'$regex': secteurs, "$options": "i"}
    } else {
        query["overview.industry"] = {'$in': secteurs}
    }

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const dbo = db.db('db');
        const mongoRequest = dbo.collection("company_profiles").find(
           query,
            {
                fields: {_id: 1, overview: {location: 1, name: 1, image: 1, industry: 1, company_size: 1}}
            }
        );


        mongoRequest.count({$group: {$sum: 1}}, function (e, total) {
            if (e) throw e;

            mongoRequest.limit(limit)
                .skip(page * limit)
                .toArray(
                    function (err, result) {
                        db.close();
                        if (err) throw err;
                        res.json({total: total, data: result});
                    });

        });

    });
});

app.get('/companies/sizes', function (req, res) {
    MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const dbo = db.db('db');
            dbo.collection("company_profiles")
                .distinct("overview.company_size")
                .then(
                    function (result) {
                        db.close();
                        res.json(result);
                    },
                    function (err) {
                        db.close();
                        if (err) throw err;
                    }
                );
        }
    );
});

app.get('/companies/:name', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("company_profiles").findOne({
                "overview.name": {$regex: req.params.name, $options: 'i'}
            }, {fields: {_id: 0, overview: 1}},
            function (err, result) {
                if (err) throw err;
                res.json(result["overview"]);
                db.close();
            });
    });
});

app.get('/companies/:name/tech', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("scraped_companies_wttj").findOne({
                "name": {$regex: req.params.name, $options: 'i'}
            }, {fields: {_id: 0, technologies: 1}},
            function (err, result) {
                if (err) throw err;
                res.json(result["technologies"]);
                db.close();
            });
    });
});
app.get('/companies/:name/jobs', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").find({
            "name": {$regex: req.params.name, $options: 'i'}
        }, {
            fields: {
                _id: 0,
                url_post: 1,
                post: 1,
                post_class: 1,
                location: 1,
                education_level: 1,
                experience: 1,
                posting_date: 1
            }
        }).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/news', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("news").find({
            "name": {$regex: req.params.name, $options: 'i'}
        }, {fields: {_id: 0, title: 1, link: 1, published: 1}}).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/funding', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("Funding").findOne({
                "name": {$regex: req.params.name, $options: 'i'}
            }, {fields: {_id: 0, "Overview ": 1, Fundings: 1, Investors: 1}},
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });
});
app.get('/companies/:name/static/tot', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match: {
                    "name": {$regex: req.params.name, $options: 'i'}
                }
            },

            {
                $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                        month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                    count: {$sum: 1}

                }
            }, {fields: {_id: 0, year: 1, month: 1, count: {$sum: 1}}}).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/static/production', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match: {
                    "name": {$regex: req.params.name, $options: 'i'}, "post_class": "production"
                }
            },

            {
                $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                        month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                    count: {$sum: 1}

                }
            }, {fields: {_id: 0, year: 1, month: 1, count: {$sum: 1}}}).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/static/support', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match: {
                    "name": {$regex: req.params.name, $options: 'i'}, "post_class": "support"
                }
            },

            {
                $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                        month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                    count: {$sum: 1}

                }
            }, {fields: {_id: 0, year: 1, month: 1, count: {$sum: 1}}}).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/static/management', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match: {
                    "name": {$regex: req.params.name, $options: 'i'}, "post_class": "management"
                }
            },

            {
                $group: {

                    _id: {
                        year: {$year: {$dateFromString: {dateString: "$posting_date"}}},
                        month: {$month: {$dateFromString: {dateString: "$posting_date"}}}

                    },
                    count: {$sum: 1}
                }
            },

            {fields: {_id: 0, year: 1, month: 1, count: {$sum: 1}}}).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/educ', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match: {
                    "name": {$regex: req.params.name, $options: 'i'}
                }
            },

            {
                $group: {


                    _id: "$education_level"
                    ,
                    count: {$sum: 1}

                }
            }, {fields: {_id: 0, education_level: 1, count: {$sum: 1}}}).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
app.get('/companies/:name/exp', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db('db');
        dbo.collection("jobs_wttj").aggregate(
            {
                $match: {
                    "name": {$regex: req.params.name, $options: 'i'}
                }
            },

            {
                $group: {
                    _id: "$experience",
                    count: {$sum: 1}
                }
            },
            {
                fields: {
                    _id: 0
                    , experience: 1,
                    count: {$sum: 1}
                }
            }
        ).toArray(
            function (err, result) {
                if (err) throw err;
                res.json(result);
                db.close();
            });
    });

});
module.exports = app;