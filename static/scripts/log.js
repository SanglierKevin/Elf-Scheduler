/** Fichier contenant le code côté client des pages connexion, inscription et profil */

function loadError(){
    /**
     * @pre : #error : le message d'erreur envoyé par serveur.js
     * @post : envoie le message d'erreur
     */
    var erreur = $('#error').val()
    if (erreur){
        setTimeout(()=>{alert(erreur)},200)
    }
}

function loadUpnav(){
   /**
    * @pre : -
    * @post : charge la barre de navigation supérieure dans l'élément ayant l'id "upnav"
    */
   $("#upnav").load("/upnavSite")
}

function loadHour(){
    /**
     * @pre : -
     * @post : charge l'heure sous le format "hh:mm  hh:mm"
     */
    var startHour = document.getElementById("startHour").value;
    var endHour = document.getElementById("endHour").value;
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
    document.getElementById("startText").innerHTML = startHour + ":" + heureDebut 
    document.getElementById("endText").innerHTML = endHour + ":" + heureFin;
}

function checkmdp(){
    /**
     * @pre : connmdp et confmdp : les deux mots de passe entrés par l'utilisateur
     * @post : vérifie que les deux mots de passe sont identiques
     */
    const connmdp = document.querySelector('input[name=connmdp]');
    const confmdp = document.querySelector('input[name=confmdp]');
    if (connmdp.value === confmdp.value){
        confmdp.setCustomValidity('');
    } 
    else{
        confmdp.setCustomValidity('Mots de passe incorrects');
    }
}

function AfficherMDP(){
    /**
     * @pre : -
     * @post : affiche les deux mots de passe quand on clique sur le bouton
     */
    var me = document.getElementById("connmdp");
    var mf = document.getElementById("confmdp");
    if (me.type === "text"){
        me.type = "password";
        mf.type = "password";
    }
    else{
        me.type = "text";
        mf.type = "text";
    }
}
