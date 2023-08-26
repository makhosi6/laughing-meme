const { uname, $pw, URL } = require("./config");
const puppeteer = require("puppeteer-core"),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    exPath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    user_dir = `./users/profile_661`;



async function writeSales(postMessage) {
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer 34f873721804d57a5faf3ea8809b8ef50340c69ed180");

        let raw = JSON.stringify(postMessage);

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        let response = await fetch("http://localhost:9094/sales/records", requestOptions)
        let status = response.status
        console.log({
            API_STATUS: status
        })

    } catch (err) {
        console.log('error', err)
    }
}



(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: user_dir,
        executablePath: exPath,
        args: [
            "--window-size=1920,938",
            "--flag-switches-begin",
            "--flag-switches-end",
            "--origin-trial-disabled-features=WebGPU",
        ],
    });
    const page = await browser.newPage();
    page.setViewport({
        width: 1920,
        height: 938,
    });
    await page.goto(URL, {
        waitUntil: "networkidle2",
    });

    await page.waitForTimeout(4000);

    let username = await page.$("input[name='email']");
    /// IF this login
    if (username) {
        await page.type("input[name='email']", uname);
        await page.type("input[name='password']", $pw);
        await page.click("button.blue");
    }

    //wait for navigation
    await page.waitForTimeout(5000);

    if (!(await page.$(".view-sales-table"))) {
        await page.screenshot({
            path: `./snaps/no-sales-page-${Math.floor(Math.random() * 1222)}.png`,
            fullPage: true,
        });
        throw Error("Error/Not at the sales page.");
    }

    //wait for the user to select the right page
    await page.waitForTimeout(25000);


    let salesRows = await page.$$('tbody.view-sales-table-body tr')

    console.log({
        NUMBER_OF_SALES: salesRows.length
    });
    for (let i = 0; i < salesRows.length; i++) {
        let id = "";
        const sale = salesRows[i];
        let dataItems = (await sale.$$('td'));
        let saleData = {}

        for (let idx = 0; idx < dataItems.length; idx++) {

            const el = dataItems[idx];
            let str = await page.evaluate((td) => td.innerText, el)
            let iDs = [0, 2, 3, 4, 5]
            if (iDs.includes(idx)) {
                let prefix = (id === "") ? "" : "_";
                id += prefix + str
            }
            if (str !== "-") {
                let isFee = str.includes('- R ')
                let isProfit = dataItems.length - 1 == idx || idx === "10" || idx === 10
                let isPrice = (isFee === false && isProfit === false) && str.includes("R ")
                saleData = {
                    ...saleData,
                    [isPrice ? "price" : isProfit ? "profit" : isFee ? "fee" : idx]: str.replace('- R ', "R ")
                }
            }
        }

        // let ID = await page.evaluate((str) => str.replaceAll(" ", "_").replaceAll("-", "_"), id)
        await writeSales({
            ...saleData,
            id: id.split(" ").join("_").toLowerCase()
        })
    }

    await page.waitForTimeout(2000)


    ///else process data
    await browser.close();
})();