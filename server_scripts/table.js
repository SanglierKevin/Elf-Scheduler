
const modifierHelp = require("./modifierMethods")

const ListTask = ["Soins", "Nourrir", "Nettoyer", "Spectacle", "Dressage"]

function generateTaskList(strActualHour, hasAlreadyTask){
    /**
     * @pre : strActualHour : l'heure sous forme de string "HH:MM"
     * @pre : hasAlreadyTask : un string représentant une des 5 tâches possibles se trouvant dans ListTask ou bien null
     * @post : retourne une sélection entre les différentes tâches possibles.
     * Si une tâche est déjà sélectionnée (hasAlreadyTask), alors celle-ci se trouvera en tête de la sélection,
     * sinon ce sera l'option vide qui sera affichée en première
     */
    var options = "";
    for (let option of ListTask){
        if (option != hasAlreadyTask){
            options += `<option value=${option}>${option}</option>`
        }
    }
    if (hasAlreadyTask === "Pas de tâche"){  // met la valeur à __null__ pour facilement l'identifier
        options = `<option value="__null__">${hasAlreadyTask}</option>` + options + `<option value=""></option>`
    }else if (hasAlreadyTask){    // met la tâche déjà choisie en première
        options = `<option value=${hasAlreadyTask}>${hasAlreadyTask}</option>` + options + `<option value=""></option>`
    }else{
        options = `<option value=""></option>` + options
    }
    
    return `<select name='taskList${strActualHour}' id='taskList${strActualHour}' style='width:150px'>
                ${options}
            </select>`
}

function returnTaskListAccordingStatus(status, strActualHour, task){
    /**
     * @pre : status : un string représentant le status de la tâche (personne déjà assignée, personne non nécessaire ou personne nécessaire)
     * @pre : task : un string représentant la tâche déjà effectuée
     * @pre : strActualHour : l'heure à laquelle la tâche doit être effectuée, il s'agit d'un string du format "HH:MM"
     * @post : retourne le string pour pouvoir sélectionner la tâche parmis la liste des tâches disponibles,
     * ou bien "-" si l'on ne peut attribuer une tâche à cette heure
     */
    switch(status){
        case "requiredField":
            return generateTaskList(strActualHour, null)  // génère la sélection de tâche 
        case "unrequiredField":
            return generateTaskList(strActualHour, "Pas de tâche")
        case "FilledField":
            return generateTaskList(strActualHour, task)
    }
}


function makeListEmployeeNotAvailable(documentTimetable, hour){
    /**
     * @pre : documentTimetable : un array contenant tous les objets de la collection timetable pour une date donnée
     * @pre : hour : une heure sous le format string 'HH:MM'
     * @post : retourne un array contenant les noms de tous les employés ayant déjà un objet dans cette collection pour cette heure,
     * et donc ayant déjà une assignation pour cette date et heure
     */
    var listEmployeeNotAvailable = []       //liste des employés déjà occupés pour cette heure
    for (let item of documentTimetable){
        if (item.time === hour){
            listEmployeeNotAvailable.push(item.staffName)
        }
    }
    return listEmployeeNotAvailable
}


function makeListAnimalNotAvailable(documentTimetable, hour){
    /**
     * @pre : documentTimetable : un array contenant tous les objets de la collection timetable pour une date donnée
     * @pre : hour : une heure sous le format string 'HH:MM'
     * @post : retourne un array contenant les noms de tous les animaux ayant déjà un objet dans cette collection pour cette heure,
     * et donc ayant déjà une assignation pour cette date et heure
     */
    var listAnimalNotAvailable = []
    for (let item of documentTimetable){
        if (item.time === hour){
            listAnimalNotAvailable.push(item.animalName)
        }
    }
    listAnimalNotAvailable.push("__originalAdmin__")
    return listAnimalNotAvailable
}


function returnNameSelectionAccordingStatus(status, isAnimal, listAnimalStaff, strActualHour, potentialName, documentTimetable){
    /**
     * @pre : status : un string représentant le status de la tâche (personne déjà assignée, personne non nécessaire ou personne nécessaire)
     * @pre : isAnimal : un booléen représentant si l'on recherche une sélection d'animaux ou d'employés
     * @pre : listAnimalStaff : la liste des employés ou des animaux (en fonction du paramètre isAnimal)
     * @pre : strActualHour : l'heure dont on souhaite avoir la sélection de noms, il s'agit d'un string ayant le format "HH:MM"
     * @pre : date : la date pour laquelle on cherche l'ensemble des noms (pour savoir si certains employés sont occupés ce jour là)
     * @pre : potentialName : le nom de l'animal ou de l'employé s'il y avait déjà un animal/employé attribué dans la sélection
     * ex : Pour employé = Luc, on a déjà attribué à 11:00 de devoir s'occuper de animal = Lion => potentialName = Lion
     * @pre : DatabaseAccess : une référence pour se connecter à la base de données
     * 
     * @post : retourne la sélection entre les différents animaux ou employés du site
     * Si la sélection est celle des employés, vérifie également que la sélection ne contient pour cette heure-là que les 
     * employés travaillant sur cette période de temps (strActualHour entre son heure de début et son heure de fin)
     */
    var name = `<select name='nameSelection${strActualHour}' id='nameSelection${strActualHour}' style='width:150px'>`   // en-tête du select
    var nameAlreadyAdded = "";
    switch(status){
        case "requiredField":
            name += `<option value=''></option>`   //option vide par défaut
            break;
        case "unrequiredField":
            name += `<option value="__null__">Pas d'employé</option>`    //option préalablement choisie dans la base de données
            nameAlreadyAdded = "Pas d'employé";
            break;
        case "FilledField":
            name += `<option value=${potentialName}>${potentialName}</option>`    //option préalablement choisie dans la base de données
            nameAlreadyAdded = potentialName;
            break;
    }
    var listAnimal = makeListAnimalNotAvailable(documentTimetable, strActualHour)
    var listEmployee = makeListEmployeeNotAvailable(documentTimetable, strActualHour)
    for (let item of listAnimalStaff){
        if (!isAnimal){  //ajoute tous les animaux à la liste d'option
            if (item.name === nameAlreadyAdded || listAnimal.includes(item.name)){  // nom déjà ajouté ou bien ayant déjà une occupation
                continue
            }
            name += `<option value=${item.name}>${item.name}</option>`

        }else{    // doit vérifier les heures de début et de fin de journée pour ajouter les employés à la liste

            if (item.name === nameAlreadyAdded || listEmployee.includes(item.name)){
                continue
            }
            if (!item.startHour){     // si un utilisateur n'a pas encore rentré son heure de début
                continue
            }
            var startHourFormated = modifierHelp.formatHour(item.startHour)   // pour avoir un array de int à partir de l'heure     ex : [17,0] ou [14,30]  => 17h00 ou 14h30
            var endHourFormated = modifierHelp.formatHour(item.endHour)
            var actualHour = modifierHelp.formatHour(strActualHour)

            if (modifierHelp.comprisedBetween(startHourFormated, endHourFormated, actualHour)){
                name += `<option value=${item.name}>${item.name}</option>`
            }
        }
    }
    if (nameAlreadyAdded!="Pas d'employé" && isAnimal){
        name += `<option value="__null__">Pas d'employé</option>`
    }
    if (nameAlreadyAdded){   // si on a le nom déjà sélectionné => oublie pas de rajouter option vide à la fin
        name += `<option value=""></option>`
    }
    name += "</select>"
    return name
}


function renderTimeTableAdmin(timeTable, listAnimalStaff, isAnimal, request, documentTimetable, Employee=null){
    /**
     * @pre : timeTable un array d'objet ayant le format suivant:
     * {status : status, time : exactHour, name : name}
     * avec status : si le champs est requis, non-requis ou déjà remplis
     *      time : heure suivant le format "HH:MM" avec HH qui est une heure appartenant à [0,23] et MM, une demi-heure appartienant à {0, 30}
     *      name : nom de l'animal/employé
     * @pre : ListAnimalStaff : un document avec tous les employés ou animaux
     * @pre : isAnimal : un booléen indiquant si l'objet représente un animal ou un employé 
     * @pre : Request : objet permettant de récupérer les information demandées (queries)
     * @pre : documentTimetable : un array contenant tous les objets de la collection timetable pour une date donnée
     * @pre : Employee : un objet JSON représentant l'employé dont on veut avoir la sélection
     * @post : retourne un string représentant la table d'affichage avec la personne en charge pour 
     * chaque tranche horaire (version admin => avec sélection d'un employé)
     */
    var renderedTimeTable = `<table>
                                <input type="hidden" id="dateModif" name="dateModif" value = '${request.query.date}/${request.query.day}'>
                                <tr>
                                    <th>Statut</th>
                                    <th>Heure</th>
                                    <th>Assignation</th>
                                    <th>Tâche</th>
                                </tr>`
    var status;
    var nameList;
    var taskList;
    for (let i = 0; i<timeTable.length; i++){
        actualHour = [ Math.floor(i/2) , (i%2)*30 ]
        if (Employee && !modifierHelp.comprisedBetween(modifierHelp.formatHour( Employee.startHour), modifierHelp.formatHour( Employee.endHour), actualHour)){
            // heure à laquelle l'employé ne travaille pas => passe cette heure
            continue
        }
        strActualHour = modifierHelp.formatHourString(actualHour)
        status = returnStatusString(timeTable[i].status)
        taskList = returnTaskListAccordingStatus(timeTable[i].status, strActualHour, timeTable[i].task)
        nameList = returnNameSelectionAccordingStatus(timeTable[i].status, isAnimal, listAnimalStaff, strActualHour, timeTable[i].name, documentTimetable)

        renderedTimeTable += `<tr>
                                <td>${status}</td>
                                <td>${timeTable[i].time}</td>
                                <td>${nameList}</td>
                                <td>${taskList}</td>
                             </tr>`
    }
    renderedTimeTable += "</table>"
    return renderedTimeTable
}


function renderTimeTableNotAdmin(timeTable){
    /**
     * @pre : TimeTable un array d'objet ayant le format suivant:
     * {status : status, time : exactHour, name : name}
     * avec status : si le champs est requis, non-requis ou déjà remplis
     *      time : heure suivant le format "HH:MM" avec HH qui est une heure appartenant à [0,23] et MM, une demi-heure appartienant à {0, 30}
     *      name : nom de l'animal/employé
     * @post : retourne un string représentant la table d'affichage avec la personne en charge pour 
     * chaque tranche horaire (version non-admin => affiche juste les noms)
     */
    var renderedTimeTable = `<table>
                                <tr>
                                    <th style="min-width: 50px;">Status</th>
                                    <th style="min-width: 100px;">Heure</th>
                                    <th style="min-width: 180px;">Assignation</th>
                                    <th style="min-width: 120px;">Tâche</th>
                                </tr>`
    var status;
    for (let i = 0; i<timeTable.length; i++){
        status = returnStatusString(timeTable[i].status)
        if (timeTable[i].status=="FilledField"){    // affiche que les éléments nécessaires
            renderedTimeTable += `<tr>
            <td style="min-width: 50px;">${status}</td>
            <td style="min-width: 100px;">${timeTable[i].time}</td>
            <td style="min-width: 180px;">${timeTable[i].name}</td>
            <td style="min-width: 120px;">${timeTable[i].task}</td>
         </tr>`
        }

    }
    renderedTimeTable += "</table>"
    return renderedTimeTable
}

function returnStatusString(status){
    /**
     * @pre : status : un string représentant l'état de la tâche à effectuer
     * @post : retourne les différentes images HTML en fonction du status de la tâche
     */
    switch(status){
        case "requiredField":
            return "<i class='bx bx-x-circle bx-tada' style='color:#fa0000' ></i>"    // rond barré rouge
        case "unrequiredField":
            return "<i class='bx bx-minus-circle' style='color:#e1ac0e'  ></i>"       // rond jaune
        case "FilledField":
            return "<i class='bx bxs-check-circle' style='color:#29f40a'  ></i>"      // rond vert avec V
    }
}


function makeRenderedTable(collectionSearch, request, isAnimal, doc, res, databaseAccess, Employee = null){
    /**
     * @pre : collectionSearch : type de recherche : sur les animaux ou sur les employés
     * @pre : Request : objet permettant de récupérer les information demandées (queries)
     * @pre : isAnimal : un booléen indiquant si l'objet représente un animal ou un employé
     * @pre : doc : un array contenant les résultats de recherche dans timetable pour une certaine date et un certain nom
     * @pre : res : objet permettant d'envoyer la réponse au client
     * @pre : un objet JSON représentant l'employé dont on veut avoir la sélection  => utilisé pour n'afficher la sélection que pour ses heures de travail
     * @post : envoie la table d'affichage avec la personne en charge pour chaque tranche horaire
     */
    if (request.session.isAdmin){
        databaseAccess.collection(collectionSearch).find({}).sort({name : 1}).toArray((err,documentEmployee)=>{
            databaseAccess.collection("timetable").find({date : request.query.date}).toArray((err,documentTimetable)=>{
                var TimeTable = modifierHelp.createListItem(isAnimal, doc)
                responseTimeTable = renderTimeTableAdmin(TimeTable, documentEmployee, isAnimal , request, documentTimetable,  Employee);         
                res.send(responseTimeTable)
            })
        })
    
    }else{
        var timeTable = modifierHelp.createListItem(isAnimal, doc)
        responseTimeTable = renderTimeTableNotAdmin(timeTable);                 
        res.send(responseTimeTable)
    }
}


module.exports = {
    "makeRenderedTable" : makeRenderedTable,
    "ListTask" : ListTask
}
