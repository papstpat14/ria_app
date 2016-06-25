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
var options = new chrome.Options();
// deactivate chrome notifications because they are not supported in selenium
options.setUserPreferences({'profile.default_content_setting_values.notifications': 2});
var browser = new webdriver.Builder().
    withCapabilities(options.toCapabilities())
    .build();

// open browser url
browser.get(host);

// Tests
//######################################################
// test wrong user
testLogin('hans', 'hans', false);
// test the user with YOUR CREDENTIALS!!
testLogin('***', '***', true);
// test data refresh
testDataRefresh();
//######################################################

// quit the browser
browser.quit();


/**
 * tests a login with the provided credentials
 * @param username
 * @param pw
 * @param login: true if login was successful
 */
function testLogin(username, pw, login) {
    var userField = browser.findElement(webdriver.By.id('username'));
    var pwField = browser.findElement(webdriver.By.id('password'));
    userField.clear();
    pwField.clear();
    userField.sendKeys(username);
    pwField.sendKeys(pw);
    browser.findElement(webdriver.By.id('btLogin')).click().then(function() {
        browser.sleep(5000);
        browser.manage().getCookies().then(function(cookies) {
            assert(cookies.length > 0 == login);
        });
    });
}

/**
 * checks if a data refresh happens successfully
 * checks if course "Systemmanagement" is in the list
 */
function testDataRefresh() {
    browser.wait(function() {
        return browser.isElementPresent(webdriver.By.id('course1147'));
    }, 10000);
    browser.findElement(webdriver.By.id('course1147')).then(function(course) {
        assert(course != null);
        course.findElement(webdriver.By.tagName('div')).then(function(div) {
            assert(div != null);
            course.getInnerHtml().then(function(inner) {
                assert(inner != null);
                assert(inner.indexOf('Systemmanagement') != -1);
            });
        });
    });
}