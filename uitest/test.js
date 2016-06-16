/*
 Creator: Schalk
 */

var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var assert = require('assert');
var path = require('chromedriver').path;

// change localhost if needed
var host = 'http://localhost:63342/ria_app/index.html';

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);
var browser = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

testLogin('hans', 'hans', false);
// Your credentials
testLogin('***', '***', true);

browser.quit();

/**
 * 
 * @param username
 * @param pw
 * @param login: true if login was successful
 */
function testLogin(username, pw, login) {
    browser.get(host);
    browser.findElement(webdriver.By.id('username')).sendKeys(username);
    browser.findElement(webdriver.By.id('password')).sendKeys(pw);
    browser.findElement(webdriver.By.id('btLogin')).click().then(function() {
        browser.sleep(2500);
        browser.manage().getCookies().then(function(cookies) {
            assert(cookies.length > 0 == login);
        });
    });
}