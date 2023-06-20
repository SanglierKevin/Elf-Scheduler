/** Fichier contenant le code côté client de la page 404.html */

function loadPage(){
    /**
     * @pre : -
     * @post : charge le bouton de suppression de la barre de recherche et les 3 points qui avance toutes les secondes
     */

    var point1 = document.querySelector("#point1")
    var point2 = document.querySelector("#point2")
    var point3 = document.querySelector("#point3")
    var count = 0

    setInterval(()=>{
        if (count%3 === 0){
            point1.style.visibility = "visible"
            point2.style.visibility = "hidden"
            point3.style.visibility = "hidden"
        }else if (count%3 === 1){
            point2.style.visibility = "visible"
        }else{
            point3.style.visibility = "visible"
        }
        count++
    },1000)

    // pour que la page remplisse toute la fenêtre
    setInterval(()=>{
        var height = window.innerHeight
        $(".Maincontent").css("min-height", height - 57 + "px")
    })
}

