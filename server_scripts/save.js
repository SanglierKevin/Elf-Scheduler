var fs = require('fs');

function saveDB(auto=false){
    var extension = auto? "Auto" : ""
    dbo.collection("timetable").find({}).toArray((err,doc)=>{
        if (err) console.log(err)
        var str = []
        for (let i of doc){
            str.push(JSON.stringify(i))
        }
        fs.writeFile(`database_save/timetableSave${extension}.json`,JSON.stringify({list : str}),(err)=>{
            console.log("Done appending")
        })
    })

    dbo.collection("animal").find({}).toArray((err,doc)=>{
        if (err) console.log(err)
        var str = []
        for (let i of doc){
            str.push(JSON.stringify(i))
        }
        fs.writeFile(`database_save/animalSave${extension}.json`,JSON.stringify({list : str}),(err)=>{
            console.log("Done appending animal")
        })

    })
    
    dbo.collection("employee").find({}).toArray((err,doc)=>{
        if (err) console.log(err)
        var str = []
        for (let i of doc){
            str.push(JSON.stringify(i))
        }
        fs.writeFile(`database_save/employeeSave${extension}.json`,JSON.stringify({list : str}),(err)=>{
            console.log("Done appending employee")
        })
    })
}

module.exports = {
    saveDB : saveDB
}