/** routeur pour les outils de gestion de la base de données */

const express = require('express');
var MongoClient = require('mongodb').MongoClient
var fs = require('fs');
var generate = require("../server_scripts/randomGeneration")
const save = require("./../server_scripts/save")

const router = express.Router();

const prefix = "/tools"


MongoClient.connect('mongodb://localhost:27017', (err,db)=>{

    dbo = db.db('site')
    // ajouter des événements facilement ->> à retirer
    router.get("/append", (req,res)=>{
        generate.randomCollections(dbo)
        res.redirect("/")
    })

    // reset la base de donnée ->> à retirer
    router.get("/clear", (req,res)=>{
        dbo.collection("timetable").deleteMany({});
        dbo.collection("employee").deleteMany({});
        dbo.collection("animal").deleteMany({});
        res.redirect("/log/deconnexion")
    })

    router.get("/deleteOne", (req,res)=>{
        dbo.collection(req.query.coll).deleteOne({name : req.query.name})
        return res.redirect("/")
    })

    router.get("/deleteOriginal", (req,res)=>{
        dbo.collection("employee").deleteOne({ name : "__originalAdmin__"});
        if (req.session.name === "__originalAdmin__"){
            return res.redirect("/log/deconnection.html")
        }
        return res.redirect("/")
    })

    router.get('/importEmployee', (req,res)=>{
        var lstEmployee = [{
            "name" : "Georges_Tel",
            "password" : "$2a$08$R27f0iKs4H2ziBqPC9BMD.vKZq5sTinaG/OMm56zWN/3tgjJXqZ9e", 
            "description" : "En vacances",
            "admin" : true,
            "startHour" : "00:00",
            "endHour" : "12:00",
            "picture" : ""
        },
        {
            "name" : "Julien",
            "password" : "test2",
            "description" : "En vacances 2",
            "admin" : false,
            "startHour" : "12:00",
            "endHour" : "20:00",
            "picture" : ""
        },
        {
            "name" : "Jean",
            "password" : "test",
            "description" : "En vacances",
            "admin" : true,
            "startHour" : "21:00",
            "endHour" : "05:00",
            "picture" : ""
        }]
        for (let employee of lstEmployee){
            dbo.collection("employee").insertOne(employee)
        }
        res.redirect("/")
    })

    router.get('/importAnimal', (req,res)=>{
        var lstAnimal = [{
            "name" : "test",
            "description" : "Paresse",
            "picture" : "/uploads/jungle.jpg"
        },
        {
            "name" : "Lion",
            "description" : "Colère",
            "picture" : ""
        },
        {
            "name" : "Tortue",
            "description" : "Envie",
            "picture" : ""
        },
        {
            "name" : "Lapin",
            "description" : "Luxure",
            "picture" : ""
        }]
        for (let animal of lstAnimal){
            dbo.collection("animal").insertOne(animal)
        }
        res.redirect("/")
    })

    // permet de créer un fichier JSON contenant tous les incidents de la base de donnée
    router.get("/serialize", (req,res) =>{
        save.saveDB()
        setTimeout(()=>{       // Permet aux autres fonction de finir leur travail avant de redirect
            res.redirect("/")
        },400)
    })

    // permet de recréer la base de donnée à partir du fichier JSON sérialisé
    router.get("/deserialize", (req,res)=>{
        var extension = req.query.auto ? "Auto" : ""
        fs.readFile(`database_save/animalSave${extension}.json`, (err,data)=>{
            data = JSON.parse(data)
            for (let item of data.list){
                item = JSON.parse(item)
                dbo.collection("animal").insertOne(item)
            }
        })

        fs.readFile(`database_save/employeeSave${extension}.json`, (err,data)=>{
            data = JSON.parse(data)
            for (let item of data.list){
                item = JSON.parse(item)
                dbo.collection("employee").insertOne(item)
            }
        })

        fs.readFile(`database_save/timetableSave${extension}.json`, (err,data)=>{
            data = JSON.parse(data)
            for (let item of data.list){
                item = JSON.parse(item)
                dbo.collection("timetable").insertOne(item)
            }
        })

        setTimeout(()=>{       // Permet aux autres fonction de finir leur travail avant de redirect
            res.redirect("/")
        },400)
    })
})

router.use(express.static('static'));

module.exports = {
    "DBTools" : router
}