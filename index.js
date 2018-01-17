const puppeteer = require('puppeteer');
const file = require('fs');
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36';
const options = {args:['--headless', '--allow-external-pages', '--enable-file-cookies', '--allow-running-insecure-content', '--hide-scrollbars', '--remote-debugging-port=9222', '--no-sandbox', '--disable-gpu']};
(async function() {
    var config = {
        url:            'https://www.github.com',
        image_path:     './image.jpeg',
        pdf_path:       './file_pdf.pdf',
        viewportWidth:  1920,
        viewportHeight: 1080,
        mobile:         false,
        userAgent:      false,
        pdf:            false,
        mediaTypePrint: true
    };

    var result = {
        status: 'OK'
    };

    function log(status, message, terminate)
    {
        result.status = status;

        if (message)
        {
            result.message = message;
        }

        console.log(result);

        if (terminate)
        {
            process.exit(terminate);
        }
    }

    const browser = await puppeteer.launch({ headless: false }); // use const options to allow options
    const page = await browser.newPage();
    page.setJavaScriptEnabled(true);

    // set the media type
    if (config.mediaTypePrint)
    {
        await page.emulateMedia('print');
    }
    else
    {
        await page.emulateMedia('screen');
    }

    if (config.userAgent)
    {
        // console.log(config.userAgent);
        await page.setUserAgent(config.userAgent);
    }

    if (config.mobile)
    {

        await page.setUserAgent('Mozilla/5.0 (Linux; Android 5.1; XT1039 Build/LPBS23.13-17.6-1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Mobile Safari/537.36');
        await page.setViewport({width: 320, height: 480});
    }
    else
    {
        await page.setViewport({width: parseInt(config.viewportWidth), height: parseInt(config.viewportHeight)}); // set default view port size
    }

    await page.tracing.start({path: './trace.json', screenshots: true}).catch(function () {
        log('BAD', 'Tracing error', 1);
    });
    await page.goto(config.url, {"waitUntil" :['load','domcontentloaded','networkidle0','networkidle2']}).catch(function() {
        log('BAD', 'Error while loading up the url.', 1);
    });
    await page.tracing.stop();


    if (config.pdf)
    {
        await page.pdf({path: config.pdf_path, format: 'A4',fullPage: true, printBackground: true}).catch(function () {
            result.status = 'BAD';
            result.message = 'Promise rejected while creating PDF';
            result.terminate = 1;
        });
    }
    else
    {
        await page.screenshot({path: config.image_path,type: "jpeg", fullPage: true}).catch(function () {
            result.status = 'BAD';
            result.message = 'Promise rejected while creating Screenshot';
            result.terminate = 1;
        });
    }

    browser.close();
    console.log(result);
})();
