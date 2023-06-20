/** Fichier concernant le code côté client de la page animalScheduler.html */

function renderTime(){
    /**
     * @pre : -
     * @post : affiche la date sur la page animalSchedule.html
     */
    // Date
  
    var date = new Date()
    var year = date.getFullYear();
      if (year < 1000){
         year += 1900
      }
    var day = date.getDay();
    var month = date.getMonth();
    var daym = date.getDate();
    var dayarray = new Array("Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi");
    var montharray = new Array("Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Décembre")
  
    // Time
  
    var currentTime = new Date();
    var h = currentTime.getHours();
    var m = currentTime.getMinutes();
    var s = currentTime.getSeconds();
      if(h == 24){ 
        h = 0;
      } else if(h > 12){
        h = h - 0;
      }
  
      if (h < 10){
        h = "0" + h
      }
  
      if (m < 10){
        m = "0" + m
      }
  
      if (s < 10){
        s = "0" + s
      }
  
      var myClock = document.getElementById("clockDisplay")
      myClock.textContent = "" + dayarray[day] + " " + daym + " " + montharray[month] + " " + year + " | " + h + ":" + m + ":" + s;
      myClock.innerText = "" + dayarray[day] + " " + daym + " " + montharray[month] + " " + year + " | " + h + ":" + m + ":" + s;

    }

function loadTime(){
  /**
   * @pre : -
   * @post : charge la date sur la page animalSchedule.html et la met à jour chaque seconde
   */
  renderTime()
  setInterval(()=>renderTime(), 1000)

  $("body").keydown(function (e){ 
    switch (e.which){
        case 37: // flèche de gauche du clavier <--
            window.location = "/schedule/decreaseNum";
            break;
        case 39: // flèche de droite du clavier -->
            window.location = "/schedule/increaseNum";
            break;
    }
});
}

function loadTableAnimalEmployee(){
  /**
   * @pre : -
   * @post : permet d'échanger entre la table d'affichage des animaux et des employés
   */
  var select = document.getElementById("tableSelection")
  var option = select.options[select.selectedIndex].value
  window.location = `/schedule/animalSchedule?isAnimal=${option}&modifIsAnimal=true`
}

function rotate(){
  /**
   * @pre : -
   * @post : effectue une rotation des flèches se trouvant au dessus du tableau en fonction de
   * la catégorie (cat) de tri et de l'ordre (sort) de tri
   */
  var cat = document.getElementById("cat").value
  var sort = document.getElementById("sort").value
  $("#"+cat).css('-webkit-transform',`rotate(${90*sort}deg)`); 
  $("#"+cat).css('-moz-transform',`rotate(${90*sort}deg)`);
  $("#"+cat).css('transform',`rotate(${90*sort}deg)`);
}

function changeSort(sort){
  /**
   * @pre : -
   * @post : change la catégorie de tri si l'on veut trier selon une autre catégorie,
   * sinon, si l'on veut trier selon la même catégorie, inverse l'ordre de tri (échange entre
   * croissant et décroissant)
   */
  if (document.getElementById("cat").value === sort){
    var sortOrder = parseInt(document.getElementById("sort").value)
    return window.location = "/schedule/changesort?cat=" + sort + `&sort=${(-sortOrder || 1)}`
  }
  window.location = "/schedule/changesort?cat=" + sort + "&sort=1" 
}
