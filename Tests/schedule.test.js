/**
 * 
 * Suite de test sur le fonctionnement de la page principale
 * 
 */

 require('chromedriver');

 const {Builder,By,Key,Util,  until} = require('selenium-webdriver');
 const script = require('jest');
 const { beforeAll , afterAll} = require('@jest/globals');
 const assert = require("assert")
  
 const url = "https://localhost:8080"
 const urlConnect = "https://localhost:8080/log/connexion"
 const urlAnimal = "https://localhost:8080/modif/animalmodif"
 const urlEmployee = "https://localhost:8080/modif/staffmodif"
 
 
 describe('Tests de la page principale', () => {
   let driver;
 
   beforeAll(async () => {    
     driver = new Builder().forBrowser("chrome").build();   // connecter en admin
     await driver.get(url + '/tools/importEmployee')
     await driver.findElement(By.id("details-button")).click()   //accepte les danger HTTPS
     await driver.findElement(By.id("proceed-link")).click()
     await driver.get(url + '/tools/importAnimal')
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
   
   test("Vérifie que l'on arrive bien sur la page de l'employé en cliquant sur son lien", async () => {
     await driver.get(url)
     await driver.wait(async ()=>{
      try{
        await driver.findElement(By.id("LinkForTest")).click()
        return true
      }catch{
        return false
      }
     }, 1000, "Erreur : la page n'a pas chargé à temps", 100)
     urlDestination = await driver.getCurrentUrl()
     expect(urlDestination).toContain(urlEmployee)
   });

   test("Vérifie que l'on arrive bien sur la page de l'animal en cliquant sur son lien", async () => {
    await driver.get(url)
    await driver.wait(async ()=>{
      try{
        var select = await driver.findElement(By.id("tableSelection"))
        select.click()
        select.sendKeys(Key.ARROW_DOWN)
        select.sendKeys(Key.ENTER)
        return true
      }catch{
        return false
      }
     }, 4000, "Erreur : la page n'a pas chargé à temps", 400)
    await driver.wait(async ()=>{
     try{
       await driver.findElement(By.id("LinkForTest")).click()
       return true
     }catch{
       return false
     }
    }, 4000, "Erreur : la page n'a pas chargé à temps", 400)
    urlDestination = await driver.getCurrentUrl()
    expect(urlDestination).toContain(urlAnimal)
  });

  test("Vérifie que l'on peut passer du mode sombre au mode clair", async () => {
    await driver.get(url)
    var mode = await driver.findElement(By.id("modeCssTest")).getAttribute("href")
    assert(mode === url + "/schedule/" + "style/lightVersion.css", `Le site ne charge pas le bon mode au lancement : la css est ${mode} alors qu'elle aurait du être ${url + "/schedule/" + "style/lightVersion.css"}`)
    await driver.findElement(By.id("changeModeTest")).click()
    var mode = await driver.findElement(By.id("modeCssTest")).getAttribute("href")
    assert(mode === url + "/schedule/" + "style/darkVersion.css", `Le site ne change pas de mode en cliquant sur le bouton : la css est ${mode} alors qu'elle aurait du être ${url + "/schedule/" + "style/darkVersion.css"}`)
    expect(urlDestination).toContain(url)
  });

  test("Vérifie que la page est bien triée par nom en appuyant sur le bouton ", async () => {
    await driver.get(url)
    await driver.wait(async ()=>{
     try{
       await driver.findElement(By.id("sortNameTest")).click()
       return true
     }catch{
       return false
     }
    }, 1500, "Erreur : la page n'a pas chargé à temps", 100)
    var listName;
    await driver.wait(async ()=>{
      try{
        listName = []
        var iterator = await driver.findElements(By.id("LinkForTest"))
        for (let elem of iterator){
          await elem.getText().then((val)=>{    // getText retourne une Promise
            listName.push(val.toLowerCase())
          })
        }
        return true
      }catch{
        return false
      }
     }, 2000, "Erreur : la page n'a pas chargé à temps", 100)
     for (let index = 0; index < listName.length-1; index++) {
       assert(listName[index]<=listName[index+1], `L'affichage ne trie pas les noms : ${listName[index]} n'est pas inférieur à ${listName[index+1]}`)
     }
  });

 });
 