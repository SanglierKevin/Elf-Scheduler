/**
 * 
 * Suite de test sur le fonctionnement des pages de connexion, inscription, profil
 * 
 */

 require('chromedriver');

const {Builder,By,Key,Util,  until} = require('selenium-webdriver');
const script = require('jest');
const { beforeAll , afterAll, beforeEach, afterEach} = require('@jest/globals');
const assert = require("assert")
const MongoClient = require('mongodb').MongoClient
const { DBTools } = require('../views/databaseTools');
const bcrypt = require("bcryptjs");
  
 const url = "https://localhost:8080"
 const urlConnect = "https://localhost:8080/log/connexion"
 const urlDisconnect = "https://localhost:8080/log/deconnection.html"
 const urlInscription = "https://localhost:8080/log/inscription"
 const urlDeleteOne = "https://localhost:8080/tools/deleteOne"
 const urlProfil = "https://localhost:8080/log/profil"




describe('Tests des pages de connexion, inscription, profil', () => {
  let driver;

  beforeAll(async () => {    
    driver = new Builder().forBrowser("chrome").build();   
    await driver.get(url + '/tools/importEmployee')
    await driver.findElement(By.id("details-button")).click()   //accepte les danger HTTPS
    await driver.findElement(By.id("proceed-link")).click()
    await driver.get(url + '/tools/importAnimal')
    await driver.get(urlConnect)
    return true
  }, 10000);

  afterEach(async()=>{
    await driver.get(urlDisconnect)
    return true
  })
  
  afterAll(async () => {
    await driver.quit();
    return true
  }, 4000);

  jest.setTimeout(3600000)  // laisse 10 minutes max pour tous les tests

      
      test("Vérifie la fonctionnalité d'inscription employé", async () => {

            await driver.get(urlDeleteOne + '?coll=employee&name=test_')
            await driver.get(urlConnect)
            await driver.findElement(By.id("nameEmployee")).sendKeys("Georges_Tel")
            await driver.findElement(By.id("connmdp")).sendKeys("test")
            await driver.findElement(By.className("buttonModif")).click()   // se connecte en admin
            await driver.get(urlInscription)
            await driver.findElement(By.id("nameEmployee")).sendKeys("test_")
            await driver.findElement(By.id("descriptionEmployee")).sendKeys("description test")
            await driver.executeScript("document.getElementById('startHour').value = '10.5'")  // met l'heure à 10:30
            await driver.executeScript("document.getElementById('endHour').value = '18.0'")  // met l'heure à 18:00
            await driver.findElement(By.id("connmdp")).sendKeys("password")
            await driver.findElement(By.id("confmdp")).sendKeys("passwor")
            urlDestination = await driver.getCurrentUrl()
            assert(urlDestination === urlInscription, "Les mots de passe sont différents")
            await driver.findElement(By.id("confmdp")).sendKeys("d")
            await driver.findElement(By.id("employeeSubTest")).click()
            urlDestination = await driver.getCurrentUrl()
            expect(urlDestination).toContain(urlInscription)
            var hasElement = false
            await driver.wait(()=>{
              MongoClient.connect('mongodb://localhost:27017', (err,db)=>{
                  dbo = db.db("site")
                  dbo.collection('employee').find({name : "test_"}).toArray((err,doc)=>{
                      assert(doc.length>0, "L'élément n'a pas été rajouté")
                      assert(doc[0].description == "description test", "Description inexacte")
                      assert(doc[0].startHour == "10:30", "Heure début inexacte")
                      assert(doc[0].endHour == "18:00", "Heure fin inexacte")
                      assert(bcrypt.compareSync("password", doc[0].password), "Mot de passe inexact")
                      hasElement = true
                  })
              })
              if (hasElement){
                return true
              }
            }, 4000, "La requête n'a pas abouti", 500)

      });

      test("Vérifie la fonctionnalité d'inscription animal", async () => {

        await driver.get(urlDeleteOne + '?coll=animal&name=Pingouin')
        await driver.get(urlConnect)
        await driver.findElement(By.id("nameEmployee")).sendKeys("Georges_Tel")
        await driver.findElement(By.id("connmdp")).sendKeys("test")
        await driver.findElement(By.className("buttonModif")).click()   // se connecte en admin
        await driver.get(urlInscription)
        await driver.findElement(By.id("nameAnimal")).sendKeys("Pingouin")
        await driver.findElement(By.id("descriptionAnimal")).sendKeys("Gros pingouin")
        await driver.findElement(By.id("animalSubTest")).click()
        urlDestination = await driver.getCurrentUrl()
        assert(urlDestination === urlInscription, "Problème")
        var hasElement = false
        await driver.wait(()=>{
            MongoClient.connect('mongodb://localhost:27017', (err,db)=>{
              dbo = db.db("site")
              dbo.collection('animal').find({name : "Pingouin"}).toArray((err,doc)=>{
                  assert(doc.length>0, "L'élément n'a pas été rajouté")
                  hasElement = true
              })
            })
            if (hasElement){
              return true
            }

        }, 4000, "La requête n'a pas abouti", 500)

      });

      test("Vérifie la fonctionnalité du profil des employés (modification de la description)", async () => {

        await driver.get(urlConnect)
        await driver.findElement(By.id("nameEmployee")).sendKeys("Georges_Tel")
        await driver.findElement(By.id("connmdp")).sendKeys("test")
        await driver.findElement(By.className("buttonModif")).click()   // se connecte en admin
        await driver.get(urlProfil)
        var desc = await driver.findElement(By.id("descriptionEmployee")).getAttribute("value")
        await driver.findElement(By.id("descriptionEmployee")).sendKeys(" pendant une semaine")
        await driver.findElement(By.id("descModifTest")).click()
        MongoClient.connect('mongodb://localhost:27017', (err,db)=>{
            dbo = db.db("site")
            dbo.collection("employee").find({name : "Georges_Tel"}).toArray((err,doc)=>{
              assert(doc[0].description === desc + " pendant une semaine", `La description n'a pas été modifiée : obtenu ${doc[0].description} , attendu ${desc + " pendant une semaine"}`)
            })
        })
      });

      test("Vérifie la fonctionnalité du profil des employés (modification du mot de passe)", async () => {

        await driver.get(urlConnect)
        await driver.findElement(By.id("nameEmployee")).sendKeys("Georges_Tel")
        await driver.findElement(By.id("connmdp")).sendKeys("test")
        await driver.findElement(By.className("buttonModif")).click()   // se connecte en admin
        await driver.get(urlProfil)
        await driver.findElement(By.id("connmdp")).sendKeys("test2")
        await driver.findElement(By.id("mdpModifTest")).click()
        var hasResult = false
        MongoClient.connect('mongodb://localhost:27017', (err,db)=>{
            dbo = db.db("site")
            dbo.collection("employee").find({name : "Georges_Tel"}).toArray((err,doc)=>{
              assert(bcrypt.compareSync("test2", doc[0].password), `Le mot de passe n'a pas été modifiée`)
              hasResult = true
            })
        })
        await driver.wait(async ()=>{
          if (hasResult){
            await driver.findElement(By.id("connmdp")).sendKeys("test")
            await driver.findElement(By.id("mdpModifTest")).click()
            return true
          }
          return false
        }, 5000, "La requête n'a pas abouti", 1500)
      });
});


 