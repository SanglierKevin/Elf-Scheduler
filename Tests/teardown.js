/**
 *  Fichier pour supprimer les modifications apportées par les tests
 */
const MongoClient = require('mongodb').MongoClient

module.exports = async () => {
    MongoClient.connect('mongodb://localhost:27017', (err,db)=>{

        dbo = db.db('site')

        // reset la base de donnée
        dbo.collection("timetable").deleteMany({});
        dbo.collection("employee").deleteMany({});
        dbo.collection("animal").deleteMany({});
        return
    })
};




 