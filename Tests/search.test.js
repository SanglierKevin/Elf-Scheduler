/**
 * 
 * Suite de test sur le fonctionnement de la recherche d'information
 * 
 */

 require('chromedriver');

 const {Builder,By,Key,Util,  until} = require('selenium-webdriver');
 const script = require('jest');
 const { beforeAll , afterAll} = require('@jest/globals');
 const assert = require("assert")
  
 const url = "https://localhost:8080"
 const urlAppend = "https://localhost:8080/tools/append"
 const urlConnect = "https://localhost:8080/log/connexion"
 
 
 describe('Exécute les tests sur la recherche', () => {
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

   test("Vérifie que l'on trouve bien un résultat en tapant le mot exact", async () => {
     await driver.get(url)
     await driver.wait(async ()=>{
      try{
        await driver.findElement(By.id("search")).sendKeys("Lion", Key.RETURN)
        return true
      }catch{
        return false
      }
     }, 1000, "Erreur : la page n'a pas chargé à temps", 100)
     var elements = await driver.findElements(By.css(".ElementForTest"))
     var length = 0
     for (let elem of elements){
         length ++
     }
     assert(length > 0, `Au moins un résultat aurait dû être trouvé : ${length} éléments trouvés` )
   });

   test("Vérifie que l'on trouve bien un résultat en tapant un mot proche", async () => {
    await driver.get(url)
    await driver.wait(async ()=>{
      try{
        await driver.findElement(By.id("search")).sendKeys("Lian", Key.RETURN)
        return true
      }catch{
        return false
      }
     }, 1000, "Erreur : la page n'a pas chargé à temps", 100)
     var elements = await driver.findElements(By.css(".ElementForTest"))
     var length = 0
     for (let elem of elements){
         length ++
     }
     assert(length > 0, `Au moins un résultat aurait dû être trouvé : ${length} éléments trouvés` )
  });

  test("Vérifie que l'on trouve bien un résultat en tapant sans faire attention aux majuscules", async () => {
    await driver.get(url)
    await driver.wait(async ()=>{
      try{
        await driver.findElement(By.id("search")).sendKeys("lIOn", Key.RETURN)
        return true
      }catch{
        return false
      }
     }, 1000, "Erreur : la page n'a pas chargé à temps", 100)
     var elements = await driver.findElements(By.css(".ElementForTest"))
     var length = 0
     for (let elem of elements){
         length ++
     }
     assert(length > 0, `Au moins un résultat aurait dû être trouvé : ${length} éléments trouvés` )
  });

  test("Vérifie que l'on trouve bien un résultat en tapant plusieurs mots et que cela supprime la ponctuation", async () => {
    await driver.get(url)
    await driver.wait(async ()=>{
     try{
       await driver.findElement(By.id("search")).sendKeys("Lion.? Colère", Key.RETURN)
       return true
     }catch{
       return false
     }
    }, 1000, "Erreur : la page n'a pas chargé à temps", 100)
    var elements = await driver.findElements(By.css(".ElementForTest"))
    var length = 0
    for (let elem of elements){
        length ++
    }
    assert(length > 0, `Au moins un résultat aurait dû être trouvé : ${length} éléments trouvés` )
  });

  test("Vérifie que l'on a bien une alerte en ayant aucun résultat", async () => {
    await driver.get(url)
    await driver.get(url)
    await driver.wait(async ()=>{
      try{
        await driver.findElement(By.id("search")).sendKeys("ZerTH", Key.RETURN)
        return true
      }catch{
        return false
      }
    }, 10000, "Erreur : la page n'a pas chargé à temps", 100)
    await driver.wait( async ()=>{
      try{
        await driver.switchTo().alert().dismiss()   // cherche l'alerte disant qu'il n'y a pas de résultat
        return true
      }catch{
        return false
      }
    }, 1500, "Pas de message d'alerte trouvé", 150)
  });
 });
 