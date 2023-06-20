/** Routeur pour la page principale du site (animalSchedule.html) montrant tous les animaux */

const express = require('express');
const router = express.Router();
var MongoClient = require('mongodb').MongoClient
const createTable = require("./../server_scripts/displayTable")
const displayHelp = require("./../server_scripts/displayTable")

const prefix = "/schedule"
const length = 20

MongoClient.connect('mongodb://localhost:27017', (err,db)=>{
    dbo = db.db("site")

    router.get("/animalSchedule",(req,res)=>{
        if (req.session.name){
        req.session.theme = req.session.theme || "light"
        req.session.lastpage = prefix + "/animalSchedule"
        req.session.num = parseInt(req.query.num) || req.session.num || 1       // si pas de numéro de page défini, charge la première page
        if (req.query.modifIsAnimal){
            req.session.isAnimal =  req.query.isAnimal === "true"
        }
        var sortOrder = parseInt(req.session.sort) || 0  //pas de tri par défaut
        var search = req.session.search
        var collection = req.session.isAnimal ? "animal" : "employee"
        dbo.collection("timetable").find({}).toArray((err, docTimetable)=>{
            if (req.session.searched && !req.session.error){
                return res.render("animalSchedule.html",createTable.returnPages(req.session.searchResult,req, docTimetable, sortOrder))
            }
            if (sortOrder){
                var item = {}
                 if(req.session.cat === "name"){
                     item = {"name" : req.session.sort}
                 } 
                 dbo.collection(collection).find(search).sort(item).collation({ locale: "en", caseLevel: true }).toArray((err,doc) =>{
                     req.session.numberPages = displayHelp.calc_pagenum(doc,length)
                     if (err) {console.log(err)}
                     if (req.session.cat=="isAvailable"){
                        return res.render("animalSchedule.html",createTable.returnPages(doc,req, docTimetable, sortOrder))
                     }else{
                        return res.render("animalSchedule.html",createTable.returnPages(doc,req, docTimetable))
                     }
                })
             }
             else{
                dbo.collection(collection).find({}).toArray((err,doc)=>{
                    if (err) {console.log(err)}
                    req.session.numberPages = displayHelp.calc_pagenum(doc,length)
                    return res.render("animalSchedule.html",createTable.returnPages(doc,req, docTimetable))
                })
             }
        })}
        else{
            res.redirect("/log/connexion")
        }
    })

    router.get("/display", (req,res)=>{
        req.session.num = req.query.num
        return res.redirect("/")
    })

    router.get("/increaseNum", (req,res)=>{
        req.session.num = parseInt(req.session.num) + 1 > req.session.numberPages ? req.session.num : parseInt(req.session.num) + 1   // dépasse pas la valeur max du nombre de page
        return res.redirect('/')
    })

    router.get("/decreaseNum", (req,res)=>{
        req.session.num = parseInt(req.session.num) - 1 > 0 ? parseInt(req.session.num) - 1 : req.session.num   // dépasse pas la valeur minimale du nombre de page
        return res.redirect('/')
    })

    router.get("/changesort", (req,res)=>{
        req.session.cat = req.query.cat
        req.session.sort = parseInt(req.query.sort)
        return res.redirect("/")
    })


    router.use(express.static('static'));
})

module.exports = {
    "AniSchRouter" : router
}