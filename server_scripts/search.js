var table = require("./table")

const ListTask = table.ListTask
const acceptableCompatibility = 0.7
const thresholdDisplay = 0.1
const emptyWords = ["le", "la", "un", "une", "des", "les", "de", "l"]

function removePunctuation(str){
    /**
     * @pre : str : un String
     * @post : retourne un string sans les éléments de ponctuation
     */
    const punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    var strArray = str.split("")
    strArray = strArray.filter((character)=>{
        return !punctuation.includes(character)
    })
    str = strArray.join("")
    return str
}

function strCompare(str1, str2){
    /**
     * @pre : str1 : un string
     * @pre : str2 : un string
     * @post : retourne un taux de correspondance entre les deux strings correspondant au nombre de lettres en commun et au même endroit
     * Par exemple : - retourne 1 pour "test" et "test" car ce sont les même mots
     *               - retourne 0 pour "test" et "rate" car ils n'ont aucune lettre au même endroit
     *               - retourne 0.75 pour "test" et "rest" car une seule lettre diffère
     *               - retourne 1 pour "test" et "retester" car un string est compris dans l'autre
     */
    str1 = str1.toLowerCase()
    str2 = str2.toLowerCase()
    var compatibilty = 0    
    var length = Math.min(str1.length, str2.length)
    var longest =  Math.max(str1.length, str2.length)
    for (let index = 0; index< longest - length + 1; index++){
        var actualCompatibility = 0     // nombre de caractères en commun et à la même position à chaque boucle
        for (let character = 0; character < length; character++) {
            if (str1.length > str2.length){         // str1 que l'on doit parcourir avec le pattern
                if (str1[character + index] === str2[character]){
                    actualCompatibility ++
                }
            }
            else{                       // str2 que l'on doit parcourir avec le pattern
                if (str1[character] === str2[character + index]){
                    actualCompatibility ++
                }
            }
        }
        compatibilty = Math.max(actualCompatibility, compatibilty)
        if (compatibilty===length){   // compatibilité maximale  => on peut arrêter de suite
            return 1
        }
    }
    var lengthFract = (str1.length)/(str2.length) >= 1 ? 1 : (str1.length)/(str2.length)  // quand le pattern est plus long que mot => veut que ce soit moins pertinent
    return compatibilty/length * lengthFract
}

function sort(dictionnary){
    /**
     * @pre : dictionnary : un dictionnaire ayant des paires <Objet, float>
     * @post : retourne une liste des paires triées selon ces floats, de manière décroissante
     */
    var lst = []
    dictionnary.forEach((value,key)=>{
        lst.push([key,value])
    })
    var comparator = (o1, o2) => {
        return o2[1] - o1[1]
    }
    lst.sort((comparator))
    return lst
}


function makeWordMatrix(databaseDocumentLiving, databaseDocumentTime=null){
    /**
     * @pre : databaseDocumentLiving : un array reprenant des objets JSON du même format que ceux de la collection animal ou employee
     * @pre : databaseDocumentTime : un array reprenant des objets JSON du même format que ceux de la collection timetable
     * @post : retourne un array contenant des Maps<String, int>. Concrètement, chaque Maps représente un document avec le compte de chaque mot
     * se trouvant dans les objets JSON de l'animal ou de l'employé (+ ses tâches qui sont ajoutées grâce à databaseDocumentTime s'il est passé
     * en paramètre)
     */
    var wordMatrix = []
    for(let item of databaseDocumentLiving){
        var description = removePunctuation(item.description).trim().split(" ")
        description.push(removePunctuation(item.name))
        var tasklst = []
        var listWord = new Map()
        listWord.set("_originalDocument", item)
        for (let word of description){
            if (emptyWords.includes(word)){
                continue
            }
            if (listWord.has(word)){
                listWord.set(word, listWord.get(word) + 1)
            }else{
                listWord.set(word,1)
            }
        }
        if (databaseDocumentTime){
            for (let time of databaseDocumentTime){    // ajoute les tâches réalisées par cet employé ou pour cet animal
                if((time.staffName === item.name || time.animalName === item.name) && ! tasklst.includes(time.task)){
                    listWord.set(time.task,1)
                }
            }
        }
        wordMatrix.push(listWord)
    }
    return wordMatrix
}

function TF(document, searchQuery){
    /**
     * @pre : document : un Map (dictionnaire) contenant des paires <String, int> représentant des mots et leur occurence dans un vecteur de mots
     * @pre : searchQuery : un String représentant un mot que l'on recherche
     * @post : retourne le coefficient TF de ce vecteur de mot/document
     */
    var countWordApparition = 0
    var countTotalWord = 0
    document.forEach((value, key)=>{
        var compatibility = strCompare(key, searchQuery)
        if (compatibility>acceptableCompatibility){
            countWordApparition += value*compatibility   // multiplie par indice de correspondance pour que les éléments les plus ressemblant viennent en premier
        }
        if (key!=="_originalDocument"){
            countTotalWord += value
        }
    })
    return Math.log(1 + (countWordApparition/countTotalWord))
}

function IDF(wordMatrix, searchQuery){
    /**
     * @pre : wordMatrix : un array de Map (dictionnaire) contenant des paires <String, int> représentant des mots et leur occurence dans un vecteur de mots
     * Chaque élément de cet array représente un document à part entière
     * @pre : searchQuery : un String représentant un mot que l'on recherche
     * @post : retourne le coefficient IDF de cette matrice de mots
     */
    var countDocWithWord = 0
    for (let document of wordMatrix){
        if (document.get(searchQuery)>= 1){
            countDocWithWord += 1
        }else{   // vérifie qu'on ait une compatibilité suffisant 
            var hasWord = false
            for (let [key, value] of document.entries()) {
                if (strCompare(key, searchQuery)>acceptableCompatibility){
                    hasWord = true
                }
            }
            if (hasWord){
                countDocWithWord += 1
            }
        }
    }
    if (countDocWithWord ===0){
        return 0;
    }
    return Math.log(wordMatrix.length/countDocWithWord)
}

function search(databaseDocumentLiving, searchQuery, databaseDocumentTime=null){
    /**
     * @pre : databaseDocumentLiving : un array contenant tous les animaux et employés de la base de données
     * @pre : databaseDocumentTime : un array contenant tous les objets de la collection timetable
     * @pre : searchQuery : un String représentant la recherche que l'on souhaite réaliser
     * @post : retourne un array contenant des objets animal ou employee qui satisfont la recherche fournie par searchQuery
     * sur base de la méthode TF-IDF sur les noms, descriptions et tâches des animaux/employés
     */
    searchQuery = removePunctuation(searchQuery)
    searchQuery = searchQuery.trim().split(" ")
    var TF_IDF_score = new Map()
    wordMatrix = makeWordMatrix(databaseDocumentLiving, databaseDocumentTime)
    for (let word of searchQuery){
        if (emptyWords.includes(word)){  // ignore les mots vides
            continue
        }else{
            var IDFResult = IDF(wordMatrix, word)
            for (let item of wordMatrix){
                var TFResult = TF(item,word)
                var previousScore = TF_IDF_score.get(item.get("_originalDocument")) || 0
                TF_IDF_score.set(item.get("_originalDocument"), previousScore + TFResult*IDFResult)
            } 
        }
    }
    var sorted = sort(TF_IDF_score)   // trie selon les scores TF_IDF
    var ret = []
    for (let index = 0; index < sorted.length; index++) {
        if (sorted[index][1]>=(thresholdDisplay*searchQuery.length)){
            ret.push(sorted[index][0])   // récupère juste la référence vers l'objet JSON
        }
    }
    if (ret.length===0){
        return databaseDocumentLiving
    }
    return ret
}


function mergeResult(...listsResult){
    /**
     * @pre : listsResult : un array à 2 dimensions contenant des résultats de recherche (objets JSON)
     * @post : fusionne les array afin de n'en avoir plus qu'un à une dimension contenant tous les 
     * éléments uniques de l'array de départ 
     */
    var merged = []
    for (let list of listsResult){
        if (!list){
            continue;
        }
        for (let result of list){
            var alreadyPushed = false;
            for (let i = 0; i<merged.length; i++){
                if (merged[i]._id.toString() == result._id.toString()){
                    alreadyPushed = true;
                    break
                }
            }
            if (!alreadyPushed){
                merged.push(result)
            }
        }
    }
    return merged
}

module.exports = {
    "search" : search,
    "merge" : mergeResult
}
