/**
 * 
 * Suite de test sur le fonctionnement du pop-up permettant de modifier la description des employés et animaux,
 * l'heure de fin et de début d'horaire des employés et si les employés sont admins ou non
 * 
 */


require('chromedriver');

const {Builder,By,Key,Util,  until} = require('selenium-webdriver');
const script = require('jest');
const { beforeAll , afterAll} = require('@jest/globals');
const assert = require("assert")
const MongoClient = require('mongodb').MongoClient
const modifHelp = require("./../server_scripts/modifierMethods")
 
const url = "https://localhost:8080/modif"
const urlConnect = "https://localhost:8080/log/connexion"
const listHour = ["07:00", "12:00", "17:00"]


describe('Tests de la modifications des caractéristiques des employés/animaux', () => {
  let driver;

  beforeAll(async () => {    
    driver = new Builder().forBrowser("chrome").build();   // connecter en admin
    await driver.get('https://localhost:8080/tools/importEmployee')
    await driver.findElement(By.id("details-button")).click()   //accepte les danger HTTPS
    await driver.findElement(By.id("proceed-link")).click()
    await driver.get('https://localhost:8080/tools/importAnimal')
    await driver.get(urlConnect)
    await driver.findElement(By.id("nameEmployee")).sendKeys("Georges_Tel")
    await driver.findElement(By.id("connmdp")).sendKeys("test")
    await driver.findElement(By.className("buttonModif")).click()   // se connecte en admin
    return true
  }, 10000);
 
  afterAll(async () => {
    await driver.quit();
    return true
  }, 4000);

  jest.setTimeout(3600000)  // laisse 10 minutes max pour tous les tests
  
  /**
   * 
   * Tests sur les employés
   * 
   */
  test("Vérifie que la description est modifiée (employé)", async () => {
    await driver.get( url + "/staffmodif?name=Georges_Tel");
    await driver.findElement(By.id("descModifier")).click()
    var defaultdesc = await driver.findElement(By.id("desc")).getAttribute("value")
    var append = "rajoutons du texte"
    await driver.findElement(By.id("desc")).sendKeys(append)
    await driver.findElement(By.id("submitButton")).click()
    var urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Georges_Tel")
    MongoClient.connect("mongodb://localhost:27017", (err,db)=>{
        dbo = db.db("site")
        dbo.collection("employee").find({name : "Georges_Tel"}).toArray((err,doc)=>{
            assert(doc[0].description === defaultdesc+append, `La description n'a pas bien été modifiée : attendu : ${defaultdesc+append}, reçu ${doc[0].description}`)
        })
    })
  });


  test("Vérifie que l'heure de début est modifiée", async () => {
    await driver.get( url + "/staffmodif?name=Georges_Tel");
    await driver.findElement(By.id("descModifier")).click()
    await driver.executeScript("document.getElementById('rangeStart').value = '10.5'")  // met l'heure à 10:30
    await driver.findElement(By.id("submitButton")).click()
    var urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Georges_Tel")
    MongoClient.connect("mongodb://localhost:27017", (err,db)=>{
        dbo = db.db("site")
        dbo.collection("employee").find({name : "Georges_Tel"}).toArray((err,doc)=>{
            assert(doc[0].startHour === modifHelp.formatHourString([10,30]), `L'heure de début n'a pas été correctement modifiée : ${modifHelp.formatHourString([10,30])} attendu et l'heure est ${doc[0].endHour}`)
        })
    })
  });


  test("Vérifie que l'heure de fin est modifiée", async () => {
    await driver.get( url + "/staffmodif?name=Georges_Tel");
    await driver.findElement(By.id("descModifier")).click()
    await driver.executeScript("document.getElementById('rangeEnd').value =  '4.0'")  // met l'heure à 04:00
    await driver.findElement(By.id("submitButton")).click()
    MongoClient.connect("mongodb://localhost:27017", (err,db)=>{
        dbo = db.db("site")
        dbo.collection("employee").find({name : "Georges_Tel"}).toArray((err,doc)=>{
            assert(doc[0].endHour === modifHelp.formatHourString([4,0]), `L'heure de fin n'a pas été correctement modifiée : ${modifHelp.formatHourString([4,0])} attendu et l'heure est ${doc[0].endHour}`)
        })
    })
    var urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Georges_Tel")
  });



  test("Vérifie que la base de données est mise à jour quand on modifie les horaires", async () => {
    await driver.get( url + "/staffmodif?name=Georges_Tel");

    //choisi un animal
    var Hourindex = 0
    await driver.wait( async ()=>{
        try{
        let selection = driver.findElement(By.id("nameSelection" + listHour[Hourindex]));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)  
        return true
        }
        catch (e){
            if (e.name == "NoSuchElementError"){  // l'employé ne travaille pas à cette heure
                Hourindex++;
                Hourindex = Hourindex%3
              }
            return false
        }
    }, 4000, 'La requête n\'a pas abouti', 500)

    //choisi une tâche
    await driver.wait( async ()=>{
        try{
        let selection = driver.findElement(By.id("taskList" + listHour[Hourindex]));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)
        return true
        }
        catch{
        return false
        }
    }, 10000, 'La requête n\'a pas abouti', 2000)
    //envoie la requête
    await driver.wait( async () =>{
        try{
        var submit = await driver.findElement(By.css(".submitButton"))
        await submit.click()
        return true
        }catch{
        return false
        }

    }, 10000, 'La requête n\'a pas abouti', 1000)
    // on s'assure qu'il y ait au moins une tranche horaire à supprimer en ajoutant cet animal et tâche
    await driver.findElement(By.id("descModifier")).click()
    await driver.executeScript("document.getElementById('rangeEnd').value =  '4.0'")  // met l'heure de fin à 04:00
    await driver.executeScript("document.getElementById('rangeStart').value =  '20.5'")  // met l'heure de début à 20:30
    await driver.findElement(By.id("submitButton")).click()
    var startHourArray = [20,30]
    var endHourArray = [4,0]
    var finished = false
    MongoClient.connect("mongodb://localhost:27017", (err,db)=>{
        dbo = db.db("site")
        dbo.collection("timetable").find({name : "Georges_Tel"}).toArray((err,doc)=>{
            for (let item of doc){
                var actualHour = modifHelp.formatHour(item.time)
                assert(modifHelp.comprisedBetween(startHourArray, endHourArray, actualHour), 
                `Une heure n'est pas comprise entre la nouvelle heure de début et de fin : ${actualHour} n'est pas entre ${modifHelp.formatHourString(startHourArray)} et ${modifHelp.formatHourString(endHourArray)}`)
            }
            finished = true
        })
    })
    await driver.wait(()=>{
        return finished
    }, 10000, 'La  requête n\'a pas abouti', 1000)
    var urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Georges_Tel")
  });

  
  test("Vérifie que l'on peut changer si admin ou non", async () => {
    var isAdmin;
    await driver.get( url + "/staffmodif?name=Jean");
    MongoClient.connect("mongodb://localhost:27017", (err,db)=>{
        dbo = db.db("site")
        dbo.collection("employee").find({name : "Jean"}).toArray((err,doc)=>{
            isAdmin = doc[0].admin
        })
    })
    await driver.findElement(By.id("descModifier")).click()
    await driver.wait(()=>{
        return isAdmin !== undefined
    }, 5000, 'La requête n\'a pas abouti',1000)
    await driver.findElement(By.id("adminCheck")).click()
    await driver.findElement(By.id("submitButton")).click()
    MongoClient.connect("mongodb://localhost:27017", (err,db)=>{
        dbo = db.db("site")
        dbo.collection("employee").find({name : "Jean"}).toArray((err,doc)=>{
            assert(doc[0].admin !== isAdmin, `La valeur de admin n'as pas été modifiée : attendu ${!isAdmin} , reçu ${doc[0].admin}`)
        })
    })
    var urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Jean")
  });

  /**
   * 
   * Tests sur les animaux
   * 
   */
  test("Vérifie que la description est modifiée (animal)", async () => {
    await driver.get( url + "/animalmodif?name=Lion");
    await driver.findElement(By.id("descModifier")).click()
    var defaultdesc = await driver.findElement(By.id("desc")).getAttribute("value")
    var append = "rajoutons du texte"
    await driver.findElement(By.id("desc")).sendKeys(append)
    await driver.findElement(By.id("submitButton")).click()
    var urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/animalmodif?name=Lion")
    MongoClient.connect("mongodb://localhost:27017", (err,db)=>{
        dbo = db.db("site")
        dbo.collection("animal").find({name : "Lion"}).toArray((err,doc)=>{
            assert(doc[0].description === defaultdesc+append, `La description n'a pas bien été modifiée : attendu : ${defaultdesc+append}, reçu ${doc[0].description}`)
        })
    })
  });
});
