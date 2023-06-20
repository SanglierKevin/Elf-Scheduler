function formatDateFromObject(dateObject){
    /**
     * @pre : dateObject : un objet Date de javascript
     * @post : retourne un string ayant le format "DD/MM/YYYY"
     */
    appendDay =dateObject.getDate() <10 ? "0" : ""
    appendMonth = dateObject.getMonth()+1 <10 ? "0" : ""
    return `${appendDay}${dateObject.getDate()}/${appendMonth}${dateObject.getMonth()+1}/${dateObject.getFullYear()}`
}

function formatDate(dateString){
    /**
     * @pre : dateString : une date sous forme de String : DD/MM/YYYY
     * @post : retourne un array de int représentant cette date  (!)(Les mois vont de 0 à 11)
     * exemple: "12/10/2021"  =>   [12, 9, 2021]
     */
    dateString = dateString.split("/")
    if (dateString[0][0] === "0"){
        dateString[0][0] = dateString[0][1]
    }
    if (dateString[1][0] === "0"){
        dateString[1][0] = dateString[1][1]
    }
    for (var i = 0; i<3; i++){
        dateString[i] = parseInt(dateString[i])
    }
    dateString[1] = dateString[1] - 1  // Date du mois commence à 0
        return dateString
}

function formatHour(hour){
    /**
     * @pre : Hour : un string suivant le format HH:MM avec HH qui est une heure appartenant à [0,23] et MM, 
     * une demi-heure appartienant à {0, 30}
     * @post : retourne un tableau d'int représentant cette heure
     * exemple : Hour = "18:30"  => [18 , 30]
     */
    hour = hour.split(":")
    hour[0] = hour[0][0] == "0" ? hour[0].slice(1,hour.length) : hour[0]
    hour[1] = hour[1][0] == "0" ? hour[1].slice(1,hour.length) : hour[1]
    hour[0] = parseInt(hour[0])
    hour[1] = parseInt(hour[1])
    return hour
}

function formatHourString(hourArray){
    /**
     * @pre : HourArray : un array représentant des heures suivant le format [heure, demi-heure] avec heure appartient à [0,23] 
     * et demi-heure appartient à {0, 30}
     * @post : retourne une heure sous le format de string "HH:MM" HH qui est une heure appartenant à [0,23] et MM, 
     * une demi-heure appartienant à {0, 30}
     * exemple : HourArray = [9 , 0]  => "09:00"
     */
    hour = hourArray[0]
    halfhour = hourArray[1]
    strHour = hour.toString()
    if (strHour.length===1){
        strHour = '0' + strHour
    }
    strhalfhour = halfhour.toString()
    if (strhalfhour.length===1){
        strhalfhour = '0' + strhalfhour
    }
    return `${strHour}:${strhalfhour}`
}


function comprisedBetween(startHourFormated, endHourFormated, actualHour){
    /**
     * @pre : startHourFormated, endHourFormated, actualHour : des arrays de ints représentant des heures
     * Concrètement, ces trois variable ont le format [heure, demi-heure] avec heure appartient à [0,23] 
     * et demi-heure appartient à {0, 30}
     * @pre : startHourFormated : heure de début de l'intervalle, sous le format montré ci-dessus
     * @pre : endHourFormated : heure de fin de l'intervalle, sous le format montré ci-dessus
     * @pre : actualHour : heure dont on veut savoir si elle fait partie de l'intervalle, sous le format montré ci-dessus
     * @post : retourne true si actualHour est une heure comprise entre startHourFormated et endHourFormated, 
     * false sinon (en sachant que les heures sont cycliques : actual = 03:00 = [3,0] est compris 
     * entre start = 23:00 = [23,0] et end = 07:00 = [7,0])
     */
    var hoursOfWork = endHourFormated[0] - startHourFormated[0]
    if (hoursOfWork<0){
        // quand startHour est avant endHour : exemple on commence à 23:00 et fini à 07:00
        hoursOfWork += 24
    }
    for (let hour = startHourFormated[0]; hour <= startHourFormated[0]+hoursOfWork; hour++) {
        for (let halfHour = 0; halfHour < 60; halfHour+=30) {
            if (hour%24 === startHourFormated[0] && halfHour === 0 && startHourFormated[1] === 30){
                // doit sauter la première demi-heure car l'intervalle commence à [startHourFormated[0], 30]
                continue
            }
            if (hour%24  === (startHourFormated[0]+hoursOfWork)%24 && halfHour === 30 && endHourFormated[1] === 0){
                // doit sauter la dernière demi-heure car l'intervalle finit à [endHour[0], 0]
                continue
            }
            if (hour%24  === actualHour[0] && halfHour === actualHour[1]){
                return true
            }
        }
    }
    return false
}



function findDay(daySearch){
    /**
     * @pre : daySearch : un String représentant un jour de la semaine  (Majuscule commençant le nom)
     * @post : retourne l'index de ce jour dans la semaine (en considérant dimanche comme étant le premier jour)
     * @post : retourne -1 si le string ne représente aucun jour de la semaine
     */
    const DayList = ["Dimanche","Lundi" , "Mardi" , "Mercredi" , "Jeudi", "Vendredi" , "Samedi" ]
    for (var day = 0; day<7; day++){
        if (DayList[day]===daySearch){
            return day
        }
    }  
    return -1
}

function makeRenderObject(isAnimal, name, request){
    /**
     * @pre : isAnimal : un booléen indiquant si l'objet représente un animal ou un employé
     * @pre : Name : le nom de l'animal/employé
     * @pre : Request : l'objet permettant de récupérer les requêtes
     * @post : retourne l'objet pour remplir la template animalStaffModification.html
     */
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var ListNextWeek = calculateListNextWeek(date);
    var renderName = isAnimal ? "Nom de l'animal : " +  name : "Nom_Prénom de l'employé : " + name
    var error = request.session.error || ""
    if (error){
        request.session.error = ""
    }
    return {
        "Mode" : request.session.theme || "light",
        "title" : isAnimal ? "animaux" : "employés",
        "Name" : name,
        "isAnimal" : isAnimal,
        "StaffAnimalName" : renderName,
        "ActualDate" : `${day}/${month+1}/${year}`,
        "dateSelection" : ListNextWeek,
        "isAdmin" : request.session.isAdmin,
        "imageMode" : request.session.theme + ".jpg",
        "error" : error,
    }
}


function calculateListNextWeek(date){
    /**
     * @pre : date : un objet de type Date
     * @post : retourne un array contenant les 7 prochains jours ainsi que leur date
     * exemple : ["Lundi 15/11/2021", "Mardi 16/11/2021", ... , "Dimanche 21/11/2021"]
     */
    const DayList = ["Dimanche","Lundi" , "Mardi" , "Mercredi" , "Jeudi", "Vendredi" , "Samedi" ]  
    var dateHelp = date;
    var ListNextWeek = []
    for (var numberDay = 0; numberDay<7 ; numberDay++){
        ListNextWeek.push( {
            exactDate : `${dateHelp.getFullYear()}/${dateHelp.getMonth()+1}/${dateHelp.getDate()}`+"/"+`${DayList[dateHelp.getDay()]}`  ,
            dateText: DayList[dateHelp.getDay()] + " " +dateHelp.getDate()
        })
        dateHelp = new Date(dateHelp.getFullYear(), dateHelp.getMonth(), dateHelp.getDate()+1)
    }
    return ListNextWeek
}


function createListItem(isAnimal, databaseDocument){
    /**
     * @pre : isAnimal : un booléen indiquant si l'objet représente un animal ou un employé
     * @pre : DatabaseDocument : un array d'objets JSON de la forme {
     *                                                                 "animalName" : "test",
     *                                                                 "staffName" : "Georges",
     *                                                                 "time" : "00:30",
     *                                                                 "day" : "Mardi",
     *                                                                 "date" : "16/11/2021",
     *                                                                 "task" : "tache"
     *                                                              }  
     * (Il s'agit du format de la collection timetable)
     * 
     * @post : retourne un array d'objet ayant le format suivant:
     * {status : status, time : exactHour, name : name, task : task}
     * avec status : si le champs est requis, non-requis ou déjà remplis
     *      time : heure suivant le format "HH:MM" avec HH qui est une heure appartenant à [0,23] et MM, une demi-heure appartienant à {0, 30}
     *      name : nom de l'animal/employé
     *      task : la tâche à effectuer
     *      
     */
    var TimeTable = []
    for (var hour = 0; hour<24; hour++){    
        for (var halfhour = 0; halfhour <2 ; halfhour++){
            var exactHour =  formatHourString([hour,halfhour*30])
            var item = getIfTimesExists(databaseDocument,exactHour)
            var status = defineState(item,isAnimal)
            var name = getName(item,isAnimal)
            TimeTable.push({status : status, time : exactHour, name : name, task : item.task})
        }
    }
    return TimeTable
}


function getIfTimesExists(databaseDocument,exactHour){
    /**
     * @pre : DatabaseDocument : un array d'objet JSON du type {
     *                                                           "animalName" : "test",
     *                                                           "staffName" : "Georges",
     *                                                           "time" : "00:30",
     *                                                           "day" : "Mardi",
     *                                                           "date" : "16/11/2021",
     *                                                           "task" : "Spectacle"
     *                                                          }
     * @pre : exactHour : un string représentant une heure sous le format "HH:MM" avec 
     * HH qui est une heure appartenant à [0,23] et MM, une demi-heure appartienant à {0, 30}
     * @post : retourne l'objet dont le champ "time" est égal à exactHour, 
     * s'il n'y en a pas, retourne null
     */
    for(let item of databaseDocument){
        if (item.time === exactHour){
            return item
        }
    }
    return {}
}

function defineState(item, isAnimal){
    /**
     * @pre : isAnimal : un booléen indiquant si l'objet représente un animal ou un employé
     * @pre : item : un objet JSON
     * @post : retourne : - "requiredField" si l'objet est une objet vide       => champ nécessaire de compléter
     *                    - "unrequiredField" si l'objet possède le nom "null"  => champ non nécessaire
     *                    - "FilledField" si l'objet possède déjà un nom        => champ déjà complété
     */
    if (Object.keys(item).length === 0){ // objet vide
        return 'requiredField'
    }
    if (isAnimal){
        if (item.staffName === "null" || item.staffName === null){
            return "unrequiredField"
        }
        return "FilledField"
    }else{
        if (item.animalName === "null" || item.animalName === null){
            return "unrequiredField"
        }
        return "FilledField"
    }
}

function getName(item, isAnimal){
    /**
     * @pre : isAnimal : un booléen indiquant si l'objet représente un animal ou un employé
     * @pre : item : un objet JSON
     * @post : retourne : - "Pas d'employé" si l'objet est une objet vide
     *                    - "-" si l'objet possède le nom "null"
     *                    - le nom de l'animal/employé autrement
     */
    if (Object.keys(item).length === 0){    // objet vide
        if (isAnimal){
            return "Pas d'employé"
        }
        return "Pas d'animal"
    }
    if (isAnimal){
        return item.staffName === "null" ? "-" : item.staffName
    }else{
        return item.animalName === "null" ? "-" : item.animalName
    }
}

function updateDB(databaseAccess){
    /**
     * @pre : DatabaseAccess : la variable permettant de se connecter à la base de donnée
     * @post : met à jour toutes les dates de la collection "timetable" pour les faire coïncider avec la semaine d'après
     * Par exemple , si nous sommes le Dimanche 15/11/2021, va mettre à jour toutes les dates antérieures dans le semaine qui suit :
     * Lundi 10/1/2012 deviendra le Lundi 16/11/2021
     */
    var today = new Date()
    databaseAccess.collection("timetable").find({}).toArray((err,doc)=>{
        if (err) {console.log(err)}
        for (let item of doc){
            var formatdate = formatDate(item.date)
            var dateItem = new Date(formatdate[2], formatdate[1], formatdate[0], 23, 59, 59)
            nextDayString = `${dateItem.getDate()}/${dateItem.getMonth()+1}/${dateItem.getFullYear()}`
            if (dateItem.getTime() < today.getTime()){
                day = findDay(item.day) 
                for (var weekday = 0; weekday<7 ; weekday++){
                    nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + weekday)   //cherche la prochaine date pour ce jour
                    if (nextDay.getDay() === day){
                        break
                    }
                }
                nextDayString = formatDateFromObject(nextDay)
            }
            databaseAccess.collection("timetable").updateOne(item, { $set: {date : nextDayString} })
        }
    })
}


function updateTimetableAfterModif(employeeName, newStartHour, newEndHour, databaseAccess){
    /**
     * @pre : employeeName : le nom d'un employé de la base de donnée (string)
     * @pre : newStartHour : l'heure à laquelle l'employé commence à travailler 
     * @pre : newEndHour : l'heure à laquelle l'employé finit de travailler
     * Ces deux heures sont des arrays [H, M] avec H appartenant à [0,23] et M appartenant à {0, 30})
     * @pre : databaseAccess : un accès à la base de données
     * @post : supprime toutes les entrées de la collection timetable pour l'employé tel que l'heure à laquelle
     * la tâche devait être réalisée ne se trouve plus dans son nouvel intervalle de travail
     * Exemple : ne peut plus réaliser une tâche à 20:00 si il commence maintenant à 08:00 (newStartHour = [8,0]) et 
     * finit à 16:30 (newEndHour = [16, 30])
     */
    databaseAccess.collection("timetable").find({staffName : employeeName}).toArray((err,doc)=>{
        if (err) console.log(err)

        for (let item of doc){
            var taskHour = formatHour(item.time)
            if (!comprisedBetween(newStartHour,newEndHour,taskHour)){
                databaseAccess.collection("timetable").deleteOne({staffName : employeeName, time:item.time}, ()=>{
                })
            }
        }
    })
}





module.exports = {
    "makeRenderObject" : makeRenderObject,
    "createListItem" : createListItem,
    "formatHourString" : formatHourString,
    "formatHour" : formatHour,
    "comprisedBetween" : comprisedBetween,
    "updateDB" : updateDB,
    "updateTimetableAfterModif" : updateTimetableAfterModif,
    "formatDateFromObject" : formatDateFromObject
}