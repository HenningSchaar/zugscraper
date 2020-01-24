const puppeteer = require('puppeteer');
const OSC = require('osc-js')
const fs = require('fs');

const results = [];

urls = [
    "https://www.zugfinder.de/kbs.php?kbs=650",
    "https://www.zugfinder.de/kbs.php?kbs=651",
    "https://www.zugfinder.de/kbs.php?kbs=655",
    "https://www.zugfinder.de/kbs.php?kbs=471",
    "https://www.zugfinder.de/kbs.php?kbs=466",
    "https://www.zugfinder.de/kbs.php?kbs=646",
    "https://www.zugfinder.de/kbs.php?kbs=640",
    "https://www.zugfinder.de/kbs.php?kbs=643",
    "https://www.zugfinder.de/kbs.php?kbs=637",
    "https://www.zugfinder.de/kbs.php?kbs=472",
    "https://www.zugfinder.de/kbs.php?kbs=466",
    "https://www.zugfinder.de/kbs.php?kbs=615",
    "https://www.zugfinder.de/kbs.php?kbs=627",
    "https://www.zugfinder.de/kbs.php?kbs=630",
    "https://www.zugfinder.de/kbs.php?kbs=445",
    "https://www.zugfinder.de/kbs.php?kbs=620",
    "https://www.zugfinder.de/kbs.php?kbs=465",
    "https://www.zugfinder.de/kbs.php?kbs=610",
    "https://www.zugfinder.de/kbs.php?kbs=611",
    "https://www.zugfinder.de/kbs.php?kbs=621",
    "https://www.zugfinder.de/kbs.php?kbs=613",
    "https://www.zugfinder.de/kbs.php?kbs=615",
    "https://www.zugfinder.de/kbs.php?kbs=625",
    "https://www.zugfinder.de/kbs.php?kbs=636",
    "https://www.zugfinder.de/kbs.php?kbs=633",
    "https://www.zugfinder.de/kbs.php?kbs=461",
    "https://www.zugfinder.de/kbs.php?kbs=629"
];

const osc = new OSC({
    plugin: new OSC.DatagramPlugin({
        type: 'udp4', // @param {string} 'udp4' or 'udp6'
        open: {
            host: 'localhost', // @param {string} Hostname of udp server to bind to
            port: 41234, // @param {number} Port of udp server to bind to
            exclusive: false // @param {boolean} Exclusive flag
        },
        send: {
            host: 'localhost', // @param {string} Hostname of udp client for messaging
            port: 8000 // @param {number} Port of udp client for messaging
        }
    })
})
osc.open();


(async() => {

    const browser = await puppeteer.launch({
        headless: true
    })

    while (true) {

        console.log("...start...");

        for (let i = 0; i < urls.length; i++) {

            let url = urls[i];

            const page = await browser.newPage()

            await page.goto(url, {
                waitUntil: 'networkidle2'
            })

            await new Promise((resolve, reject) => {

                let tmt = setTimeout(() => {
                    resolve();
                }, 60000);

                page.on('response', async(res) => {

                    if (res.url() == jsonUrl(url)) {

                        console.log('XHR response received');

                        data = await res.text();

                        filename = __dirname + '/record/' + url[url.length - 3] + Date.now()

                        fs.writeFileSync(filename, data);

                        data = url + '\null' + data;

                        osc.send(new OSC.Message('/streckenData', data));

                        clearTimeout(tmt);

                        page.close();

                        resolve();
                    }

                });
            });

        }

    }

})()


function jsonUrl(url) {
    url = url.slice(0, 25) + 'js/json_' + url.slice(25)
    return url;
}