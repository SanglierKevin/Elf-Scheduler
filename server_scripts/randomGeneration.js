var help = require('./modifierMethods')
var table = require("./table")

function generateNumber(min,max){
    /**
     * @pre : min : un entier
     * @pre : max : un entier tel que max>min
     * @post : retourne un entier aléatoire compris dans l'interval [min,max[
     */
    if (min>max){
        throw new Exception()
    }
    return Math.floor(Math.random()*(max-min)+min)
}

function randomCollections(DatabaseAccess){
    /**
     * @pre : DatabaseAccess : un accès pour se connecter à la base de donnée "site"
     * @post : génère les collections animal, employee et timetable de manière aléatoire
     */
    var number = 50   // nombre d'éléments
    randomAnimalCollection(DatabaseAccess,number/2)
    randomEmployeeCollection(DatabaseAccess,number/2)
    randomTimeTableCollection(DatabaseAccess,number)
}

function randomEmployeeCollection(DatabaseAccess,number){
    /**
     * @pre : DatabaseAccess : un accès pour se connecter à la base de donnée "site"
     * @pre : number : le nombre d'employés à générer
     * @post : génère la collection employee avec des Employés aléatoire
     */
    for (var count = 0; count<number; count++){
        var employee = randomEmployee(count)
        if (employee){
            DatabaseAccess.collection("employee").insertOne(employee)
        }
    }
}

function randomAnimalCollection(DatabaseAccess,number){
    /**
     * @pre : DatabaseAccess : un accès pour se connecter à la base de donnée "site"
     * @pre : number : le nombre d'employés à générer
     * @post : génère la collection animal avec des Animaux aléatoire
     */
    for (var count = 0; count<number; count++){
        var animal = randomAnimal(count);
        if (animal){
            DatabaseAccess.collection("animal").insertOne(animal)
        }
    }
}

function randomTimeTableCollection(DatabaseAccess,number){
    /**
     * @pre : DatabaseAccess : un accès pour se connecter à la base de donnée "site"
     * @pre : number : le nombre d'employés à générer
     * @post : génère la collection timetable avec des Temps aléatoire
     */
    for (var count = 0; count<number; count++){
        DatabaseAccess.collection("timetable").insertOne(randomTime())
    }
}

function randomAnimal(count){
    /**
     * @pre : count : l'id de l'animal
     * @post : génère un animal aléatoire
     */
    var name = generateAnimalName(count)
    if (!name){
        return
    }
    var description = generateDescription()
    return {name : name, description :  description, picture : ""}
}

function randomEmployee(count){
    /**
     * @pre : count : l'id de l'meployé
     * @post : génère un employé aléatoire
     */
    var name = generateEmployeeName(count)
    if (name === null){    // plus de nom à attribuer
        return;
    }
    var description = generateDescription()

    var hour = generateNumber(0,24)
    var halfhour = generateNumber(0,2)
    var time = help.formatHourString([hour,halfhour*30])

    var endHour = (hour+8) %24
    var endTime = help.formatHourString([endHour,halfhour*30])

    var isAdmin = generateNumber(0,10) >= 9 ? true : false
    return {name : name, description : description, password : "test", admin : isAdmin, startHour : time, endHour: endTime, picture : ""}
}

function randomTime(){
    /**
     * @pre : -
     * @post : génère un objet Temps aléatoire
     */
    const DayList = ["Dimanche","Lundi" , "Mardi" , "Mercredi" , "Jeudi", "Vendredi" , "Samedi" ]
    var date = new Date(generateNumber(1950,2021), generateNumber(0,11), generateNumber(1,31))
    dateString = help.formatDateFromObject(date)
    var time = generateTime()
    var choiceCase = generateNumber(0,5)
    var name;
    if (choiceCase==0){
        name = null
    }else{
        name = generateEmployeeName()
    }
    var animalName = generateAnimalName()
    var task = generateTask()
    return {day : DayList[date.getDay()] , date : dateString, time : time, staffName : name, animalName : animalName, task : task}
}


function generateEmployeeName(idx = null){
    /**
     * @pre : idx : un int
     * @post : génère un nom d'employé selon l'index idx, si celui-ci n'est pas spécifié, retourne un nom aléatoire
     */
    const listName = ["Jean", "Michel", "Luc", "Exedius", "Rick", "Elvis", "Astley", "Xander", "Takumi", "Simon", "Charles", "Olivier", "Pierre", "Julie", "Sandra",
    "Marie", "Roxanne", "Illia", "Lucie", "Camille", "Lize", "Samuel", "Stéphanie", "Lucas", "Franck"]
    if (idx == null){
        return listName[generateNumber(0,listName.length)]
    }
    if (idx<listName.length){
        return listName[idx]
    }
    return null
}

function generateAnimalName(idx = null){
    /**
     * @pre : idx : un int
     * @post : génère un nom d'animal selon l'index idx, si celui-ci n'est pas spécifié, retourne un nom aléatoire
     */
    const listAnimal = ["Lion", "Tortue", "Hirondelle", "Chenilles", "Papillons", "Chauve-souris", "Crocodile", "Serpent", "Hyene", "Dauphin",
    "Girafe", "Singe", "Gorille", "Baleine", "Requin", "Panda", "Loups", "Elephant", "Poissons", "Wapiti", "Loutre"]
    if (idx == null){
        return listAnimal[generateNumber(0,listAnimal.length)]
    }
    if (idx<listAnimal.length){
        return listAnimal[idx]
    }
    return null
}

function generateDescription(){
    /**
     * @pre : -
     * @post : génère une description aléatoire
     */
    const listdescription = ["Lazy", "Angry", "Luxury", "Envy", "Glutony", "Pride", "Greed"]
    return listdescription[generateNumber(0,listdescription.length)]
}

function generateTask(){
    /**
     * @pre : -
     * @post : génère une tâche aléatoire
     */
    const listTask = table.ListTask
    return listTask[generateNumber(0, listTask.length)]
}


function generateTime(){
    /**
     * @pre : -
     * @post : génère une heure aléatoire HH:MM avec  0 < HH <24 et MM appartient à {0,30}
     */
    var hour = generateNumber(0,24)
    var halfhour = generateNumber(0,2)
    var time = help.formatHourString([hour,halfhour*30])
    return time
}


module.exports = {
    "randomCollections" : randomCollections
}