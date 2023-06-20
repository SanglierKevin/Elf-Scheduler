/** Fichier contenant le code côté client de la page animalStaffModification.html */

function loadUpnav(){
  /**
   * @pre : -
   * @post : charge la barre de navigation supérieure dans l'élément ayant l'id "upnav"
   */
   $("#upnav").load("/upnavSite")
}

function displayTable() {  
    /**
   * @pre : -
   * @post : charge le tableau dans l'élément ayant l'id "table" en faisant une requête AJAX.
   * Cette requête varie en fonction de : - si l'utilisateur est un administrateur ou non     => isAdmin
   *                                      - de l'animal ou employé sélectionné                => name
   *                                      - de la date sélectionnée et du jour                => date + day
   *                                      - de si l'individu est un animal ou un employé      => animal
   */
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
     if (this.readyState == 4 && this.status == 200) {
       if (!this.responseText){
          window.location = "https://localhost:8080";   //renvoie à la page principale si on ne trouve pas d'animal/employee
       }
       document.getElementById("table").innerHTML = this.responseText + document.getElementById("table").innerHTML;
     }
   };
   var name =  document.getElementById("name").value
   var isAnimal = document.getElementById("isAnimal").value
   var isAdmin = document.getElementById("isAdmin").value === "true" ? "<input type='submit' class='submitButton'></input>" : ""
   document.getElementById("table").innerHTML = `<input type="hidden" id = "nameModif" name = "nameModif" value= ${name}>
                                                 <input type="hidden" id = "isAnimalModif" name = "isAnimalModif" value= ${isAnimal}>
                                                  ${isAdmin}`
   var day = document.getElementById("dateSelection").value.split("/")[3]
   var date = document.getElementById("dateSelection").value.split("/").slice(0,3).reverse().join("/")   // continuer
   xhttp.open("GET", `/modif/loadTimeTable?animal=${isAnimal}&name=${name}&date=${date}&day=${day}`, true);
   xhttp.send();
}

function hideIfNotAdmin(){
  var isAdmin = document.getElementById("isAdmin").value === "true"
  if (!isAdmin){
    document.getElementById("descModifier").style.visibility = "hidden"
  }
}

function loadImage(){
  /**
   * @pre : -
   * @post : charge l'image de profil de l'animal ou l'employé en faisant une requête AJAX au serveur
   */
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      document.getElementById("picture").setAttribute("src", this.responseText || "")
      if (!this.responseText){
        document.getElementById("picture").style.margin = "0px"
        $("#picture").hide()
      }
  }
  };
  var name =  document.getElementById("name").value
  var isAnimal = document.getElementById("isAnimal").value
  var tableName = isAnimal === "true" ? "animal" : "employee"
  xhttp.open("GET", `/modif/loadImage?tableName=${tableName}&name=${name}`, true);
  xhttp.send();
}


function loadDescription(){
   /**
   * @pre : -
   * @post : charge la description de l'animal ou l'employé en faisant une requête AJAX au serveur
   */
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      document.getElementById("description").innerHTML = this.responseText || ""
      document.getElementById("desc").value = this.responseText || ""
      if (!this.responseText){
        $("#description").hide()
      }
  }
  };
  var name =  document.getElementById("name").value
  var isAnimal = document.getElementById("isAnimal").value
  var tableName = isAnimal === "true" ? "animal" : "employee"
  xhttp.open("GET", `/modif/loadDescription?tableName=${tableName}&name=${name}`, true);
  xhttp.send();
}

function loadPopup(){
  /**
   * @pre : -
   * @post : charge les informations nécessaires au pop-up, notamment la description, 
   * l'heure de début et de fin ainsi que si l'utilisateur est un admin ou non
   */
  var isAnimal = document.getElementById("isAnimal").value === "true"
  var name =  document.getElementById("name").value
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var Hour = this.responseText.split("#")
      document.getElementById("Start").innerHTML = Hour[0]
      document.getElementById("End").innerHTML = Hour[1]
      var startHour = formatHour(Hour[0])
      var endHour = formatHour(Hour[1])
      document.getElementById("rangeStart").value = startHour[0] + startHour[1]/60
      document.getElementById("rangeEnd").value = endHour[0] + endHour[1]/60
      document.getElementById("adminCheck").checked = Hour[2] === "true"
    }
  }

  if (!isAnimal){
    xhttp.open("GET", `/modif/loadHour?name=${name}`, true);
    xhttp.send();
  }
}

function formatHourString(HourArray){
  /**
   * @pre : HourArray : un array représentant des heures suivant le format [heure, demi-heure] avec heure appartient à [0,23] 
   * et demi-heure appartient à {0, 30}
   * @post : retourne une heure sous le format de string "HH:MM" HH qui est une heure appartenant à [0,23] et MM, 
   * une demi-heure appartienant à {0, 30}
   * exemple : HourArray = [9 , 0]  => "09:00"
   */
  hour = HourArray[0]
  halfhour = HourArray[1]
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

function checkValidInput(){
  /**
   * @pre : -
   * @post : vérifie que le form voulant être soumis contient toutes les infos nécessaires : 
   *  - avoir un animal ou une personne sélectionnée pour la modification
   *  - si une heure a été remplie, il faut qu'à la fois la tâche et la personne en charge (ou l'animal dont il faut s'occuper)
   *    soit sélectionné
   * Retourne faux si ces deux conditions ne sont pas remplies, vrai sinon
   */
  for (let hour = 0 ; hour<24; hour++){
    for (let halfhour=0; halfhour<2; halfhour++){
      try{
        hourStr = formatHourString([hour,halfhour*30])
        var employeeAnimalSelection = document.getElementById("nameSelection"+hourStr)
        var employeeOption = employeeAnimalSelection.options[employeeAnimalSelection.selectedIndex].value
        var taskSelection = document.getElementById("taskList"+hourStr);
        var taskOption = taskSelection.options[taskSelection.selectedIndex].text;   // prend l'élément sélectionné grâce à son index
        if (employeeOption ==="__null__"){  // pas besoin de tâche car c'est une heure sans employé nécessaire
          continue
        }
        if((employeeOption && ((!taskOption) || taskOption === "Pas de tâche")) || (!employeeOption && taskOption)){    //un seul champ parmis les deux
          alert("Veuillez renseigner les deux champs pour l'heure suivant : "+hourStr)
          return false
        }
      }
      catch{   // quand l'heure n'existe pas pour un employé à cette heure
        continue
      }
    }
  }
  return true
}

function changeAnimalStaff(){
  /**
   * @pre : - 
   * @post : affiche le cadre pop-up contenant la modification des caractéristiques de l'employé/animal (description, image, ...)
   */
  document.getElementById("popup").style.display = "flex";
  var isAnimal = document.getElementById("isAnimal").value
  if (isAnimal === "false"){
    var ids = ["rangeStart", "rangeEnd", "rangeResult", "checkLabel", "hideLabel"]
    for (let id of ids){
      document.getElementById(id).style.display = "inline";
    }
  }

  document.getElementById("Maincontent").style.filter = 'brightness(50%)'

  var expanded = false;
  $("#desc").click(()=>{
    if (!expanded){
      $("#desc").animate({height : '+=150px'})
      expanded = true
    }
  })

  $("#desc").mouseleave(()=>{
    if (expanded){
      $("#desc").animate({height : '-=150px'})
      expanded = false
    }
  })
}

function closePopup(){
  /**
   * @pre : -
   * @post : ferme le pop-up avec les modifications des caractéristiques de l'animal/employé
   */
  document.getElementById("popup").style.display = "none";
  document.getElementById("Maincontent").style.filter = 'brightness(100%)'
}

function modifiyHour(str){
  /**
   * @pre : str : un string pouvant représentant le nom de la range et du span pour afficher l'heure (en pratique : "Start" ou "End")
   * @post : affiche dans l'élement ayant l'id "str" la valeur de l'input range ayant l'id "rangestr"
   * 
   */
  var startHour = parseFloat(document.getElementById("range" + str).value)
  document.getElementById(str).innerHTML = formatHourString([startHour - startHour%1, (startHour%1)*60])
}
