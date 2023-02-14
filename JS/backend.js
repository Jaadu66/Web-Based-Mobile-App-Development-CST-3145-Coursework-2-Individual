var express = require("express");
var path = require("path");
var fs = require("fs");
const req = require("express/lib/request");
const cors = require("cors");
const mongoClient = require("mongodb").MongoClient;
const app = express();
const ObjectId = require('mongodb').ObjectId;

app.use(express.json())

app.use(cors());

let db;
mongoClient.connect('mongodb+srv://MF928:iShahid66@cluster0.0kkyck8.mongodb.net/test', (error, client) => {
    db = client.db('Cluster1');

});

app.param('collectionName', (req, response, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

app.use(function (req, response, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});


app.get("/", function (req, response) {
    response.sendFile(path.join(__dirname, '/../index.html'));
});

// retrieves data from the api
app.get('/collection/:collectionName', (req, response, next) => {
    req.collection.find({}).toArray((error, results) => {
        if (error) return next(error)
        response.send(results)
    })
})

// sends new data to the api
app.post('/collection/:collectionName', (req, response, next) => {
    req.collection.insert(req.body, (error, results) => {
        if (error) return next(error);
        response.send(results.ops);
    });
});

//updates existing data
app.put('/collection/:collectionName/:id', (req, response, next) => {
    req.collection.update(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (error, result) => {
            if (error) return next(error);
            response.send((result.result.n === 1) ? { message: 'success' } : { message: 'error' });
        });
});

//Removes existing data
app.delete('/collection/:collectionName/:id', (req, response, next) => {
        req.collection.deleteOne(
            { _id: ObjectId(req.params.id) },
            (error, result) => {
                if (error) return next(error)
                response.send((result.result.n === 1) ? { message: 'success' } : { message: 'error' })
            })
    })

app.use(function (req, response, next) {
    var filePath = path.join(__dirname, "/..", req.url);
    console.log(filePath);
    fs.stat(filePath, function (error, fileInfo) {
        if (error) {
            response.send("This file does not exist.");
            next();
            return;
        }
        if (fileInfo.isFile()) response.sendFile(filePath);
        else next();
    });
});

app.use(function (req, response) {
    response.status(404).send("This page has not been made yet!");
});

const port = process.env.PORT || 3000;
app.listen(port);