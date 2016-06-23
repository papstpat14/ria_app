/*
 Creator: Schalk
 */

// change url if needed
var host = 'http://localhost:63342/ria_app/index.html';

// libraries
var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var assert = require('assert');
var path = require('chromedriver').path;

// create selenium service
var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);
var browser = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

// tests
testLogin('hans', 'hans', false);
// Your credentials
testLogin('***', '***', true);

// quit the browser
browser.quit();

/**
 * tests a login with the provided credentials
 * @param username
 * @param pw
 * @param login: true if login was successful
 */
function testLogin(username, pw, login) {
    // open browser url
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