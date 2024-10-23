import { chromium, Page, BrowserContext, Browser } from 'playwright';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

import { downloadMMask } from './mmask-fetch';

export async function click(selector: string, page: Page) {
    await page.waitForSelector(selector);
    await page.click(selector);

    return page;
}

export async function checkAndClick(selector: string, page: Page) {
    const el = await page.$(selector);

    if (el) {
        await el.click();
    }
}

export async function fill(selector: string, page: Page, value: string) {
    const el = await page.waitForSelector(selector);
    if (el) {
        await el.fill(value);
    }
}

export async function clickmmask(selector: string, page: Page) {
    return click('[data-testid="' + selector + '"]', page);
}

export async function checkAndClickMMask(selector: string, page: Page) {
    return checkAndClick('[data-testid="' + selector + '"]', page);
}

export async function fillmmask(selector: string, page: Page, value: string) {
    return fill('[data-testid="' + selector + '"]', page, value);
}

export async function waiter(delay: number) {
    return new Promise((resolve, reject) => {
        setTimeout(
            async () => {
                resolve(3);
            },
            delay ? delay * 1000 : 5000,
        );
    });
}
// for 2 context used
// export async function prepareBrowser(userDataDirSuffix: string) {
// const userDataDir = path.join(__dirname, `UserData_${userDataDirSuffix}`);
export async function prepareBrowser() {
    const userDataDir = path.join(__dirname, 'UserData');
    const pathToExtension = path.join(__dirname, 'metamask');

    if (!fs.existsSync(pathToExtension)) {
        await downloadMMask();
    }

    const browser = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
        ],
    });

    return browser;
}

export async function initWallet(context: BrowserContext) {
<<<<<<< HEAD
    await waiter(2);

    console.log('.............................');
    console.log('Environment variables loaded');
    console.log('.............................');
=======
    await waiter(5);
>>>>>>> chat-started-with-old-code-base

    const seedEnv = process.env.TEST_METAMASK_SEED
        ? process.env.TEST_METAMASK_SEED
        : '';
    const seed = seedEnv.split(',');

<<<<<<< HEAD
    console.log('Seed phrase loaded');
    console.log(seedEnv);
    console.log('...............................................');

=======
>>>>>>> chat-started-with-old-code-base
    async function processWallet(page) {
        const elementHandle = await page.$('#onboarding__terms-checkbox');
        if (elementHandle) {
            await click('#onboarding__terms-checkbox', page);

            await clickmmask('onboarding-import-wallet', page);

            await checkAndClickMMask('metametrics-no-thanks', page);

            for (let i = 0; i < 12; i++) {
                await fill('#import-srp__srp-word-' + i, page, seed[i]);
            }

            await clickmmask('import-srp-confirm', page);

            await clickmmask('create-password-terms', page);

            await fillmmask('create-password-new', page, '11111111');
            await fillmmask('create-password-confirm', page, '11111111');

            await clickmmask('create-password-import', page);

            await clickmmask('onboarding-complete-done', page);

            await clickmmask('pin-extension-next', page);

            await clickmmask('pin-extension-done', page);
            
            await checkAndClickMMask('popover-close', page);

            await clickmmask('network-display', page);
            await checkAndClick(
                '.multichain-network-list-menu-content-wrapper .toggle-button.toggle-button--off',
                page,
            );
        } else {
            console.log('wallet already created');

            await fill('#password', page, '11111111');
            await clickmmask('unlock-submit', page);

            await checkAndClickMMask('popover-close', page);
            await checkAndClickMMask('onboarding-complete-done', page);
            await checkAndClickMMask('pin-extension-next', page);
            await checkAndClickMMask('pin-extension-done', page);

            // first time popup clicks will be added

            // await clickmmask('account-options-menu-button', page);
            // await clickmmask('global-menu-settings', page);
            // await click('.box.tab-bar__tab.pointer:nth-child(2)', page);
            // await click('[data-testid]="advanced-setting-show-testnet-conversion" ', page);

            await clickmmask('network-display', page);
            await checkAndClick(
                '.multichain-network-list-menu-content-wrapper .toggle-button.toggle-button--off',
                page,
            );
        }

        // select sepolia network
        setTimeout(async () => {
<<<<<<< HEAD
            // const spanElement = await page
            //     .locator(
            //         '.multichain-network-list-menu-content-wrapper span:text("Goerli")',
            //     )
            //     .first();
            // if (spanElement) {
            //     spanElement.click();
            // }

            await clickmmask('Sepolia', page);
=======
            const spanElement = await page
                .locator(
                    '.multichain-network-list-menu-content-wrapper span:text("Sepolia")',
                )
                .first();
            if (spanElement) {
                spanElement.click();
            }
>>>>>>> chat-started-with-old-code-base
            setTimeout(async () => {
                // page.close();
            }, 300);
        }, 1000);
    }

    const pages = context.pages();
    let extensionPage;
    pages.map((page) => {
        if (
            page.url().includes('chrome-extension') &&
            page.url().includes('home.html')
        ) {
            extensionPage = page;
        }
    });

    if(!extensionPage){
        console.log('extension page not found, redirecting...')
        const page = await context.newPage();
        await page.goto('chrome-extension://flndlnecmoofflbammaghnboonfhgaaf/home.html#');
        extensionPage = page;
    }
    await waiter(2);

    if(extensionPage){
        processWallet(extensionPage);
    }
}

export async function setNetwork(
    page: Page,
) {
    await click('#network-select-dropdown', page);
    await waiter(1)
    await click('#sepolia_network_selector', page);
}


export async function checkForWalletConnection(
    page: Page,
    browser: BrowserContext,
) {
    // const el = await page.locator('button[role="button"]').nth(1);
    // const button = await page.waitForSelector(`//button[contains(text(), 'Connect Wallet')]`, {timeout: 100});
    // const button = await page.locator(`button:text("Connect Wallet")`).first();
    // Connect wallet button
    const button = await page.$('#connect_wallet_button_page_header');
    if (button) {
        button.click();
        await waiter(2);
        // Aggree button
        // await checkAndClick('#agree_button_ToS', page);
        await clickmmask('wallet-selector-eip6963', page);

        // // Metamask button
        // await page
        //     .locator(
        //         '#Modal_Global [class^="WalletButton_container"]:nth-child(1)',
        //     )
        //     .click();

        try {
            // browser.on('page', async (ppp) => {
            //     await clickmmask('page-container-footer-next', ppp);
            //     await clickmmask('page-container-footer-next', ppp);
            // })
            const ppp = await browser.waitForEvent('page');
            await clickmmask('page-container-footer-next', ppp);
            await clickmmask('page-container-footer-next', ppp);
        } catch (err) {
            console.log('error', err);
        }
        console.log('wallet connected to ambient');
    } else {
        console.log('already connected');
    }
}
