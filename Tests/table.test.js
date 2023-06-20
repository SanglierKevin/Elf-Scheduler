/**
 * 
 * Suite de test sur la modifications des horaires dans la table et des attributions de tâches à des employés/animaux
 * 
 */

require('chromedriver');

const {Builder,By,Key,Util,  until} = require('selenium-webdriver');
const script = require('jest');
const { beforeAll , afterAll} = require('@jest/globals');
const assert = require("assert")
var MongoClient = require('mongodb').MongoClient;
 
var url = "https://localhost:8080/modif"
var urlClear = "https://localhost:8080/tools/clear"
var urlConnect = "https://localhost:8080/log/connexion"
var listHour = ["00:00", "08:00", "16:00"]


describe('Tests de la modifications des horaires des employés/animaux', () => {
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
  }, 15000);

  jest.setTimeout(3600000)  // laisse 10 minutes max pour tous les tests
  

  test("Vérifie que l'on ne peut soumettre sans avoir rempli le nom (employé)", async () => {
    await driver.get( url + "/staffmodif?name=Georges_Tel");
    var Hourindex = 0
    await driver.wait( async ()=>{
      try{
        let selection = driver.findElement(By.id("nameSelection" + listHour[Hourindex]));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)
        return true
      }
      catch (e){
        if (e.name == "NoSuchElementError"){    // l'employé ne travaille pas à cette heure
          Hourindex++;
          Hourindex = Hourindex%3
        }
        return false
      }
    }, 4000, 'La requête n\'a pas abouti', 500)
    await driver.wait( async () =>{
      try{
        var submit = await driver.findElement(By.css(".submitButton"))
        await submit.click()
        await driver.switchTo().alert().dismiss()
        return true
      }catch{
        return false
      }

    }, 4000, 'La requête n\'a pas abouti', 5000)
    urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Georges_Tel")
  });


  test("Vérifie que l'on ne peut soumettre sans avoir rempli la tâche (employé)", async () => {
    await driver.get( url + "/staffmodif?name=Georges_Tel");
    var Hourindex = 0
    await driver.wait( async ()=>{
      try{
        let selection = driver.findElement(By.id("taskList" +  listHour[Hourindex]));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)
        return true
      }
      catch (e){
        if (e.name == "NoSuchElementError"){   // l'employé ne travaille pas à cette heure
          Hourindex++;
          Hourindex = Hourindex%3
        }
        return false
      }
    }, 4000, 'La requête n\'a pas abouti', 500)
    await driver.wait( async () =>{
      try{
        var submit = await driver.findElement(By.css(".submitButton"))
        await submit.click()
        await driver.switchTo().alert().dismiss()
        return true
      }catch{
        return false
      }

    }, 4000, 'La requête n\'a pas abouti', 500)
    urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Georges_Tel")
  });

  test("Vérifie que l'on peut soumettre et que la tâche est ajoutée à Timetable (employé)", async () => {
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
    }, 4000, 'La requête n\'a pas abouti', 500)
    //envoie la requête
    await driver.wait( async () =>{
      try{
        var submit = await driver.findElement(By.css(".submitButton"))
        await submit.click()
        return true
      }catch{
        return false
      }

    }, 4000, 'La requête n\'a pas abouti', 500)
    urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/staffmodif?name=Georges_Tel")
    var hasItem = false
    await driver.wait( async ()=>{
      MongoClient.connect("mongodb://localhost:27017",(err,db)=>{
          db.db('site').collection("timetable").find({time : listHour[Hourindex]}).toArray((err,doc)=>{
            //vérifie que ajouté à la DB
            if (doc.length>0){
              hasItem = true
            }
          })
      })
      return hasItem
    }, 4000, "Requête non aboutie : l'objet n'a pas été ajouté", 500)
  });


  test("Vérifie que l'on ne peut soumettre sans avoir rempli le nom (animal)", async () => {
    await driver.get( url + "/animalmodif?name=Lion");
    await driver.wait( async ()=>{
      try{
        let selection = driver.findElement(By.id("nameSelection04:30"));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)
        return true
      }
      catch{
        return false
      }
    }, 2000, 'La requête n\'a pas abouti', 500)
    await driver.wait( async () =>{
      try{
        var submit = await driver.findElement(By.css(".submitButton"))
        await submit.click()
        await driver.switchTo().alert().dismiss()
        return true
      }catch{
        return false
      }

    }, 2000, 'La requête n\'a pas abouti', 500)
    urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/animalmodif?name=Lion")
  });

  test("Vérifie que l'on ne peut soumettre sans avoir rempli la tâche (animal)", async () => {
    await driver.get( url + "/animalmodif?name=Lion");
    await driver.wait( async ()=>{
      try{
        let selection = driver.findElement(By.id("taskList05:30"));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)
        return true
      }
      catch{
        return false
      }
    }, 2000, 'La requête n\'a pas abouti', 500)
    await driver.wait( async () =>{
      try{
        var submit = await driver.findElement(By.css(".submitButton"))
        await submit.click()
        await driver.switchTo().alert().dismiss()
        return true
      }catch{
        return false
      }

    }, 2000, 'La requête n\'a pas abouti', 500)
    urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/animalmodif?name=Lion")
  });


  test("Vérifie que l'on peut soumettre et que la tâche est ajoutée à Timetable (animal)", async () => {
    await driver.get( url + "/animalmodif?name=Lion");

    //choisi une tâche
    await driver.wait( async ()=>{
      try{
        let selection = driver.findElement(By.id("taskList07:30"));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)  
        return true
      }
      catch{
        return false
      }
    }, 5000, 'La requête n\'a pas abouti', 500)

    //choisi un employé
    await driver.wait( async ()=>{
      try{
        let selection = driver.findElement(By.id("nameSelection07:30"));
        await selection.click()
        selection.sendKeys(Key.ARROW_DOWN)
        return true
      }
      catch{
        return false
      }
    }, 5000, 'La requête n\'a pas abouti', 500)

    //envoie la requête
    await driver.wait( async () =>{
      try{
        var submit = await driver.findElement(By.css(".submitButton"))
        await submit.click()
        return true
      }catch{
        return false
      }

    }, 2000, 'La requête n\'a pas abouti', 500)
    urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(url + "/animalmodif?name=Lion")
    var hasItem = false
    await driver.wait( async ()=>{
      MongoClient.connect("mongodb://localhost:27017",(err,db)=>{
          db.db('site').collection("timetable").find({time : "07:30"}).toArray((err,doc)=>{
            if (doc.length>0){
              hasItem = true
            }
          })
      })
      return hasItem
    }, 5000, "Requête non aboutie : l'objet n'a pas été ajouté", 500)
  });
});
