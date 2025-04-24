const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const csvSources = [
    {
        graph: 'Goalie_Active_Playoff',
        url: 'https://www.naturalstattrick.com/playerteams.php?fromseason=20222023&thruseason=20242025&stype=3&sit=all&score=all&stdoi=g&rate=n&team=ALL&pos=S&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines=single&draftteam=ALL'
    },
    {
        graph: 'Goalie_Active_Playoff_Tied',
        url: 'https://www.naturalstattrick.com/playerteams.php?fromseason=20222023&thruseason=20242025&stype=3&sit=all&score=tied&stdoi=g&rate=n&team=ALL&pos=S&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines=single&draftteam=ALL'
    },
    {
        graph: 'Goalie_Active_Playoff_Up1',
        url: 'https://www.naturalstattrick.com/playerteams.php?fromseason=20222023&thruseason=20242025&stype=3&sit=all&score=u1&stdoi=g&rate=n&team=ALL&pos=S&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines=single&draftteam=ALL'
    },
    {
        graph: 'Goalie_Active_Reg',
        url: 'https://www.naturalstattrick.com/playerteams.php?fromseason=20222023&thruseason=20242025&stype=2&sit=all&score=all&stdoi=g&rate=n&team=ALL&pos=S&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines=single&draftteam=ALL'
    },
    {
        graph: 'Goalie_Active_Reg_Tied',
        url: 'https://www.naturalstattrick.com/playerteams.php?fromseason=20222023&thruseason=20242025&stype=2&sit=all&score=tied&stdoi=g&rate=n&team=ALL&pos=S&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines=single&draftteam=ALL'
    },
    {
        graph: 'Goalie_Active_Reg_Up1',
        url: 'https://www.naturalstattrick.com/playerteams.php?fromseason=20222023&thruseason=20242025&stype=2&sit=all&score=u1&stdoi=g&rate=n&team=ALL&pos=S&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines=single&draftteam=ALL'
    }
];

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const downloadPath = path.resolve(__dirname, 'downloads');

    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }

    for (let { graph, url } of csvSources) {
        const page = await browser.newPage();
        console.log(`Navigating to: ${url}`);

        await page.goto(url, { waitUntil: 'networkidle2' });
        
        await page.waitForSelector('.dt-button.buttons-csv.buttons-html5 span');
        console.log(`Found CSV in ${graph}`);

        const csvButton = await page.$('.dt-button.buttons-csv.buttons-html5');
        if (csvButton) {
            await Promise.all([
                page._client().send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: downloadPath
                }),
                csvButton.click()
            ]);
            console.log(`Downloading ${graph}...`);
            await page.waitForSelector('.dt-button.buttons-csv.buttons-html5', { visible: true });
        }
        await page.close();
    }

    await browser.close();
    console.log('All downloads complete');
})();
