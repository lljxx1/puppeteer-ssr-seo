
const puppeteer = require('./node_modules/puppeteer');

let browserWSEndpoint = null;
let allInstances = [];

function GraceFullytShoutDown(){
    console.log('GraceFullytShoutDown.  kill all browsers');
    allInstances.forEach((bt) => {
        try{
            bt.close();
        }catch(e){

        }
    });
    setTimeout(function () {
        console.log('Exiting after some time.');
        process.exit(0);
    }, 5000);
}

// process.on('SIGTERM', () => GraceFullytShoutDown);
async function SSR(renderUrl){
    let browser = null;
    // Launch once
    if(browserWSEndpoint){
        try{
            browser = await puppeteer.connect({browserWSEndpoint});
        }catch(e){
            // maybe connect faild
            browserWSEndpoint = null;
            browser = null;
        }
    }

    if(!browserWSEndpoint){
        browser = await puppeteer.launch({ 
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                // Required for Docker version of Puppeteer
                '--no-sandbox',
                '--disable-setuid-sandbox',
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                // '--disable-dev-shm-usage',
                // '--proxy-server=customer-radbugtech-cc-CN:cqpR35xfHP@cn-pr.oxylabs.io:30001'
            ]
        });
        browserWSEndpoint = await browser.wsEndpoint();
        allInstances.push(browser);
    }

    const page = await browser.newPage();

    // 1. Intercept network requests.
    await page.setRequestInterception(true);

    page.on('request', req => {
        // 2. Ignore requests for resources that don't produce DOM
        // (images, stylesheets, media).
        const whitelist = ['document', 'script', 'xhr', 'fetch'];
        if (!whitelist.includes(req.resourceType())) {
            return req.abort();
        }

        // 3. Pass through all other requests.
        req.continue();
    });

    await page.goto(renderUrl, {waitUntil: 'networkidle0'});

    const html = await page.content();
    let results = {
        html
    }

    await page.close();
    return results;
}


module.exports = SSR;