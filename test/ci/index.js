const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const child = require('child_process');

var server = child.fork(`${__dirname}/server.js`);

(async (html) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 960});
    await page.goto('http://127.0.0.1:8080/' + html, {waitUntil: 'load'});

    var results = await page.evaluate(() => {
        testCasesResult = document.querySelector('#results').outerHTML;
        return testCasesResult;
    });

    var dom = new jsdom.JSDOM(results, { contentType: 'text/html'});
    var testResults = [];
    for (let i = 0; i < dom.window.document.querySelector('tbody').rows.length; i++) {
        var testResult = {};
        testResult['caseId'] = dom.window.document.querySelector('tbody').rows[i].cells[1].textContent;
        testResult['result'] = dom.window.document.querySelector('tbody').rows[i].cells[0].textContent;
        testResult['message'] = dom.window.document.querySelector('tbody').rows[i].cells[2].textContent;

        testResult['component'] = 'roslibjs';
        testResult['purpose'] = '';
        testResult['type'] = 'auto';
        testResult['comment'] = '';
        testResult['suite'] = html;

        testResults.push(testResult);
    }

    console.log(testResults);
    browser.close();
    server.kill('SIGINT');
})(process.argv[2]);