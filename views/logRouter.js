/** Routeur pour les pages de gestion et créations de profils (profil, inscription et connexion.html) */

const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
var fs = require('fs');
const path = require("path");
var MongoClient = require('mongodb').MongoClient

const prefix = "/log"

const upload = multer({
    dest: "dbimages"
});

MongoClient.connect('mongodb://localhost:27017', (err,db)=>{
    dbo = db.db("site")

    router.get("/inscription",(req,res)=>{
        req.session.theme = req.session.theme || "light"
        req.session.lastpage = prefix + "/inscription"
        var x = req.session.error;
        req.session.error = null;
        if (req.session.isAdmin){
            res.render('inscription.html', {error : x, Mode : req.session.theme, imageMode : req.session.theme + ".jpg"})
        }
        else{
            res.redirect("/log/connexion")
        }
    })

    router.get("/profil",(req,res)=>{
        if (req.session.name){
            req.session.theme = req.session.theme || "light"
            req.session.lastpage = prefix + "/profil"
            var x = req.session.error;
            req.session.error = null;
            dbo.collection("employee").find({name : req.session.name}).toArray((err,doc)=>{
                var aName = doc[0].name;
                var aDescription = doc[0].description;
                var aAdmin = doc[0].admin;
                var aStartHour = doc[0].startHour;
                var aEndHour = doc[0].endHour;
                var aPicture = doc[0].picture;
                res.render('profil.html', {error : x, name : aName, description : aDescription, admin : aAdmin, startHour : aStartHour, endHour : aEndHour, picture : aPicture, Mode : req.session.theme, imageMode : req.session.theme + ".jpg"})
            });
        }
        else{
            res.redirect("/log/connexion")
        }
    })

    router.get("/connexion",(req,res)=>{
        if (req.session.name){
            res.redirect("/log/profil")
        }
        else{
            req.session.theme = req.session.theme || "light"
            req.session.lastpage = prefix + "/connexion"
            var x = req.session.error;
            req.session.error = null;
            res.render('connexion.html', {error : x, Mode : req.session.theme, imageMode : req.session.theme + ".jpg"})
        }
    })

    router.post('/createAnimal.html', function(req,res,next){
        if (req.body.nameAnimal != null && req.body.descriptionAnimal != null){
            dbo.collection("animal").find({name : req.body.nameAnimal}).toArray((err,doc)=>{
                if (doc.length!=0){
                    req.session.error = "Animal déjà existant.";
                    res.redirect("/log/inscription")
                }
                else{
                    dbo.collection("animal").insertOne({name : req.body.nameAnimal, description : req.body.descriptionAnimal})
                    res.redirect(req.session.lastpage)
                }
            });
        }
        else{
            res.redirect(req.session.lastpage)
        }
    })

    router.post('/createEmployee.html', function(req,res,next){
        if (req.body.nameEmployee != null && req.body.descriptionEmployee != null && req.body.connmdp != null && req.body.confmdp != null && req.body.startHour != null && req.body.endHour != null){
            dbo.collection("employee").find({name : req.body.nameEmployee}).toArray((err,doc)=>{
                if (doc.length!=0){
                    req.session.error = "Employé déjà existant.";
                    res.redirect(req.session.lastpage)
                }
                else{
                    var hashedPassword = bcrypt.hashSync(req.body.connmdp, 8);
                    if (req.body.admin == "true"){ 
                        req.body.admin = true
                    }
                    else{
                        req.body.admin = false
                    }
                    var startHour = req.body.startHour;
                    var endHour = req.body.endHour;
                    var heureDebut = startHour%1*60;
                    startHour-=startHour%1;
                    if (startHour < 10){
                        startHour = "0" + startHour.toString();
                    }
                    if (heureDebut == 0){
                        heureDebut = heureDebut.toString() + "0";
                    }
                    var heureFin = endHour%1*60
                    endHour-=endHour%1;
                    if (endHour < 10){
                        endHour = "0" + endHour.toString();
                    }
                    if (heureFin == 0){
                        heureFin = heureFin.toString() + "0";
                    }
                    var defStartHour = startHour + ":" + heureDebut
                    var defEndHour = endHour + ":" + heureFin
                    dbo.collection("employee").insertOne({name : req.body.nameEmployee, 
                        password : hashedPassword, 
                        description : req.body.descriptionEmployee, 
                        admin : req.body.admin, 
                        startHour : defStartHour, 
                        endHour : defEndHour
                    })
                    res.redirect(req.session.lastpage)
                }
            });
        }
        else{
            res.redirect(req.session.lastpage)
        }
    })

    // fonction du formulaire de connexion
    router.post('/connexion.html', function(req,res,next){
        if (req.body.nameEmployee != null && req.body.connmdp != null){
            dbo.collection("employee").find({name : req.body.nameEmployee}).toArray((err,doc)=>{
                if (doc.length===0){
                  req.session.error = "Utilisateur inexistant.";
                  res.redirect(req.session.lastpage)
                }
                else{
                    pwd = doc[0].password;
                    const verifPassword =  bcrypt.compareSync(req.body.connmdp, pwd);
                    if (verifPassword){
                        req.session.connected = true;
                        req.session.name = req.body.nameEmployee;
                        req.session.isAdmin = doc[0].admin;
                        req.session.picture = doc[0].picture;
                        res.redirect('/');
                    }
                    else{
                      req.session.error = "Mot de passe incorrect.";
                      res.redirect(req.session.lastpage)
                    }
                }
            })
        }
        else{
            res.redirect('/log/connexion');
        }
    })


    router.post('/modifDescription.html', function(req,res,next){
        dbo.collection("employee").updateOne({name : req.session.name},{$set: {description : req.body.descriptionEmployee}});
        res.redirect(req.session.lastpage)
    })

    router.post('/modifPassword.html', function(req,res,next){
        var hashedPassword = bcrypt.hashSync(req.body.connmdp, 8);
        dbo.collection("employee").updateOne({name : req.session.name},{$set: {password : hashedPassword}});
        res.redirect(req.session.lastpage)
    })

    router.post('/modifPicture.html', upload.single('picture'), function(req,res,next){
        dbo.collection("employee").find({name : req.session.name}).toArray((err,doc)=>{
            if (req.file){
                var countElement;
                fs.readdir("./static/uploads", (err, files) => {
                    countElement = files.length;   // regarde le nombre d'images dans le dossier

                    var tempPath = req.file.path;
                    if (doc[0].picture ){
                        var targetPath = path.join(__dirname, `.././static/` + doc[0].picture);  // doit changer encore le nom pour qu'il soit unique
                    }else{
                        var targetPath = path.join(__dirname, `.././static/uploads/${countElement+1}image.png`);  // doit changer encore le nom pour qu'il soit unique
                    }

                    var urlDestination = doc[0].picture || `./uploads/${countElement+1}image.png`
                    req.session.picture = urlDestination

                    fs.rename(tempPath, targetPath, err =>{   //ajoute l'image au dossier upload se trouvant dans static
                        if (err) return err
                            fs.readdir("./dbimages", (err, files) => {
                                for (const file of files){
                                    try{
                                        fs.unlinkSync( path.join(__dirname, "../dbimages/" + file))
                                    }
                                    catch{
                                        console.log("No file to suppress")
                                    }
                                }
                            })
                        console.log("uploaded")
                    });
                    dbo.collection('employee').updateOne({name : req.session.name},{$set: {picture : urlDestination}})
                })
            }
            setTimeout(()=>res.redirect(req.session.lastpage), 100)  // laisse le temps de charger l'image dans la upnav
            
        });
    })

    router.get(['/deconnection.html', "/deconnexion"], function(req,res,next){
        req.session.isAdmin = false;
        req.session.connected = false;
        req.session.name = null;
        res.redirect(req.session.lastpage)
    })

    router.use(express.static('static'));
})
module.exports = {
    "logRouter" : router
}
