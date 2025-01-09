/* eslint-disable quotes */
/* eslint-disable camelcase */
import { chromium, Page, BrowserContext, Browser } from 'playwright';
import * as path from 'path';
import { click, clickmmask, waiter } from '../helpers/utils';
import { locators } from './meta_page_locators';
import { expect } from 'playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

// go to trade page
export async function goto(page: Page) {
    await page.goto(locators.gotoTradePage);
    return page;
}

// go to swap page
export async function gotoSwap(page: Page) {
    await page.goto(locators.gotoSwap);
    return page;
}

// go to Chat link
export async function gotoChat(page: Page) {
    await page.goto(locators.gotoChat);
    return page;
}

// go to home page
export async function gotoHomepage(page: Page) {
    await page.goto(locators.gotoHomepage);
    return page;
}
// ---------------------------------------click-----------------------------------
// sidebar liquidity postion
export async function clickLiqPosition(page: Page) {
    await page.locator(locators.clickLiqPosition).click();
    return page;
}

// sidebar limit orders
export async function clickLimitOrder(page: Page) {
    await page.locator(locators.clickLimitOrder).click();
    return page;
}

// sidebar transactions
export async function clickTransactions(page: Page) {
    await page.locator(locators.clickTransactions).click();
    return page;
}

// id needed
// go to account page
export async function clickAccountPage(page: Page) {
    await page
        .getByTestId('page-header')
        .getByRole('link', { name: 'Account' })
        .click();
    return page;
}

// click on wallet Balances tab
export async function clickWalletBalances(page: Page) {
    await page.locator(locators.clickWalletBalances).click();
    return page;
}

// click on exchange Balances tab
export async function clickExchangeBalances(page: Page) {
    await page.locator(locators.clickExchangeBalances).click();
    return page;
}

// click on exchange Balances tab
export async function clickLiquidityTab(page: Page) {
    await page.locator(locators.clickLiquidityTab).click();
    return page;
}

// click on limits tab
export async function clickLimitTab(page: Page) {
    await page.locator(locators.clickLimitTab).click();
    return page;
}

// click on limits tab
export async function clickLimit(page: Page) {
    await page.locator(locators.clickLimit).click();
    return page;
}

// click on Pool tab
export async function clickPoolTab(page: Page) {
    await page.locator(locators.clickPoolTab).click();
    return page;
}

// click on transactions tab
export async function clickTransactionsTab(page: Page) {
    await page.locator(locators.clickTransactionsTab).click();
    return page;
}

// click on transfer tab
export async function clickTransferTab(page: Page) {
    await page.locator(locators.clickTransferTab).click();
    return page;
}

// click on change token button on account page
export async function clickChangeTokenAccount(page: Page) {
    await page.locator(locators.clickChangeTokenAccount).click();
    await page.locator(locators.clickSelectChangeToken).fill('USDC');
    await page.locator('button').filter({ hasText: 'USDC' }).click();
    return page;
}

// id needed
// click on transfer button
export async function clickTransfer(page: Page) {
    await page.locator(locators.clickTransfer).click();
    return page;
}

// click on withdraw tab
export async function clickWithdrawTab(page: Page) {
    await page.locator(locators.clickWithdrawTab).click();
    return page;
}

// click on "send to a different address" toggle
export async function clickDifferentAddress(page: Page) {
    await page.locator(locators.clickDifferentAddress).click();
    return page;
}

// click on withdarw button
export async function clickWithdraw(page: Page) {
    await page.locator(locators.clickWithdraw).click();
    return page;
}

// click on deposit
export async function clickDeposit(page: Page) {
    await page.locator(locators.clickDeposit).click();
    return page;
}

// click on Transactions tab under chart
// ID missing
export async function clickLiquidityTransactionTable(page: Page) {
    await page.getByRole('tab', { name: 'Liquidity' }).click();
    return page;
}

// click on Limits tab under chart
// ID missing
export async function clickLimitsTransactionTable(page: Page) {
    await page.getByRole('tab', { name: 'Limits' }).click();
    return page;
}

// click on Transactions tab under chart
// ID missing
export async function clickTransactionsTransactionTable(page: Page) {
    await page.getByRole('tab', { name: 'Transactions' }).click();
    return page;
}

// click add liq on transaction table
export async function clickAddLiquidity(page: Page) {
    // Wait for rows to load
    await page.waitForSelector('[data-type="infinite-scroll-row"]', { timeout: 10000 });

    // Locate all rows with the data-type "infinite-scroll-row"
    const rows = page.locator('[data-type="infinite-scroll-row"]');
    const rowCount = await rows.count();

    console.log('Total rows found:', rowCount);
    console.log(await page.content()); // Log the full HTML content for debugging

    if (rowCount === 0) {
        console.warn('No rows with data-type "infinite-scroll-row" found.');
        throw new Error('Test failed: No rows found with the specified selector');
    }

    for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);

        // Locate "Add" button within the row based on the id pattern
        const addButton = row.locator('button[id^="add_liquidity_position_"]');
        const buttonCount = await addButton.count();
        
        // Log for debugging
        console.log(`Row ${i + 1}: Found ${buttonCount} 'Add' button(s) with ID starting with "add_liquidity_position_"`);

        // Check if the "Add" button exists in this row
        if (buttonCount > 0) {
            const text = await addButton.innerText();

            // Check if the button's text is "Add"
            if (text === 'Add') {
                await addButton.click();
                console.log('Add button found and clicked in row:', i + 1);

                // Enter amount in USDC
                await page.locator(locators.enterAmountLiquidity).fill('50');
                // Click on confirm
                await page.locator(locators.clickSubmit).click();
                await page.locator(locators.clickConfirm).click();
                return page; // Exit after clicking the first "Add" button
            }
        }
    }

    // If no "Add" button with text "Add" was found, fail the test
    console.warn('No "Add" button with text "Add" found in any row.');
    throw new Error('Test failed: No matching "Add" button found in any row');

   
   /* const locator = await page.getByText(locators.clickAddLiquidity).nth(1);
    const text = await locator.innerText();
    if (text == 'Add') {
        await locator.click();
        // enter amount usdc
        await page.locator(locators.enterAmountLiquidity).fill('50');
        // click on confirm
        await page.locator(locators.clickSubmit).click();
        await page.locator(locators.clickConfirm).click();
    } else {
        // fail test add does not exist
        expect(text).toContain('Add');
    }
    return page;*/
}

// id needed
// click remove limits on transaction table
export async function clickRemoveLimits(page: Page) {
    // Wait for rows to load
    await page.waitForSelector('[data-type="infinite-scroll-row"]', { timeout: 10000 });

    // Locate all rows with the data-type "infinite-scroll-row"
    const rows = page.locator('[data-type="infinite-scroll-row"]');
    const rowCount = await rows.count();

    if (rowCount === 0) {
        console.warn('No rows with data-type "infinite-scroll-row" found.');
        throw new Error('Test failed: No rows found with the specified selector');
    }

    for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);

        // Locate "Remove" button within the row based on the id pattern
        const removeButton = row.locator('button[id^="remove_position_"]');
        const buttonCount = await removeButton.count();

        // Check if the "Remove" button exists in this row
        if (buttonCount > 0) {
            const text = await removeButton.innerText();

            // Check if the button's text is "Remove"
            if (text === 'Remove') {
                await removeButton.click();
                console.log('Remove button found and clicked in row:', i + 1);

                // Enter any additional steps after clicking "Remove"
                // Click on additional confirmation buttons if required
                await page.locator(locators.clickRemoveLiq).click(); // Confirm removing the limit order
                await page.locator(locators.clickSubmit).click(); // Click submit if necessary
                await page.locator(locators.clickConfirm).click(); // Final confirmation click
                return page; // Exit after clicking the first "Remove" button
            }
        }
    }

    // If no "Remove" button with text "Remove" was found, fail the test
    console.warn('No "Remove" button with text "Remove" found in any row.');
    throw new Error('Test failed: No matching "Remove" button found in any row');
}


// click remove liq on transaction table
export async function clickRemoveLiquidity(page: Page) {
    const locator = await page.getByText(locators.clickRemoveLimits).nth(1);
    const text = await locator.innerText();
    if (text == 'Remove') {
        await locator.click();
        // enter amount usdc
        await page.locator(locators.enterAmountRemove).click();
        // click on confirm
        await page.locator(locators.clickRemoveLiq).click();
        await page.locator(locators.clickConfirm).click();
    } else {
        // fail test remove does not exist
        expect(text).toContain('Remove');
    }
    return page;
}

// id needed
// click reverse button swap page
export async function clickReverseTokenSwap(page: Page) {
    await page.getByLabel(locators.clickReverseTokenSwap).click();
    return page;
}

// click on deposit
export async function clickSettingsSwap(page: Page) {
    await page.locator(locators.clickSettingsSwap).click();
    return page;
}

// click on submit swap settings
export async function clickSubmitSlippage(page: Page) {
    await page.locator(locators.clickSubmitSlippage).click();
    return page;
}

// click on Confirm swap
export async function clickConfirmSwap(page: Page) {
    await page.locator(locators.clickConfirmTrade).click();
    return page;
}

// click on Confirm swap
export async function clickConfirmSwapTrade(page: Page) {
    await page.locator(locators.clickConfirmTrade).click();
    return page;
}

// click on submit swap / pool
export async function clickSubmitSwap(page: Page) {
    await page.locator(locators.clickConfirm).click();
    return page;
}

// click on confirm limit
export async function clickConfirmLimit(page: Page) {
    await page.locator(locators.clickConfirmLimit).click();
    return page;
}

// click on transactions row to open shareable chart button
export async function clickTransactionsRow(page: Page) {
    const locator = page.locator(locators.clickTransactionsRow).first().click();
    return page;
}

// click on detail on shareable chart
// ID missing
export async function clickDetailsShareableChart(page: Page) {
    await page
        .getByLabel('modal', { exact: true })
        .getByRole('button', { name: 'Details' })
        .click();
    return page;
}

// click remove liq on transaction table
export async function clickClaimLimit(page: Page) {
     // Locate all rows with classes starting with "TransactionTable__Row"
    const rows = page.locator('[class^="TransactionTable__Row"]');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const text = await row.innerText();

        // Check if this row contains "Claim"
        if (text.includes('Claim')) {
            await row.locator(locators.clickClaimLimit).click(); // Click the claim button within the row
            // Click to remove limit order after claiming
            await page.locator(locators.clickRemoveLimitOrder).click();
            console.log('Claim button found and clicked.');
            return page;
        }
    }
 
     // If no "Claim" button was found, fail the test
     //console.warn('No "Claim" button found in any row.');
    // expect(false).toBe(true); // Force test failure
}

// click on submit swap
export async function clickMyTransactions(page: Page) {
    await page.locator(locators.clickMyTransactions).click();
    return page;
}

// click on balanced Toggle
export async function clickBalancedToggle(page: Page) {
    await page.locator(locators.clickBalancedToggle).click();
    return page;
}

// click on decrease min price
export async function clickDecreaseMinPrice(page: Page) {
    await page.locator(locators.clickDecreaseMinPrice).click();
    await page.locator(locators.clickDecreaseMinPrice).click();
    return page;
}

// click on confirm pool transaction
export async function clickConfirmPool(page: Page) {
    await page.locator(locators.clickSubmit).click();
    return page;
}

// increase limit by one click
export async function clickLimitRate(page: Page) {
    await page.locator(locators.clickLimitRate).click();
    return page;
}

// click change network
export async function clickChangeNetwork(page: Page) {
    await page.getByText('Sepolia').click();
    await page.waitForTimeout(1000);
    await page.getByText('Scroll').click();
    return page;
}

// click change network ---MMask Page
export async function clickChangeWallet(page: Page) {
    await click(locators.clickChangeWallet, page);
    await page.locator(locators.clickChangeWalletSelecet).click();
    return page;
}

// open chat panel
export async function click_Open_Chat(page: Page) {
    await page.locator(locators.chatOpenTrollbox).click();
    return page;
}

// open chat pool drowdown
export async function click_Chat_Room_Dropdown(page: Page) {
    await page.locator(locators.chatOpenRoomDropdown).click();
    return page;
}

// click chat sent message button
export async function click_Chat_Sent_Message(page: Page) {
    await page.locator(locators.chatSentMessage).click();
    return page;
}

// click chat emoji panel open
export async function click_Chat_Emoji_Panel(page: Page) {
    await page.locator(locators.chatEmojipanel).click();
    return page;
}

// click chat emoji
export async function click_Chat_Emoj(page: Page) {
    await page.click(
        'button[aria-label="smiling face with heart-shaped eyes"]',
    );
    return page;
}

// click chat emoji panel close
export async function click_Chat_Emoji_Panel_Close(page: Page) {
    await page.locator(locators.chatEmojiPanelClose).click();
    return page;
}

// id needed
export async function click_Select_Chat_Room(page: Page) {
    await this.page.waitForSelector(
        'div._dropdown_item_1p5ax_277[data-value="ETH / USDC"]',
        { timeout: 60000 },
    );
    const elementHandle = await this.page.$(
        'div._dropdown_item_1p5ax_277[data-value="ETH / USDC"]',
    );

    if (!elementHandle) {
        throw new Error('Element not found.');
    }

    await elementHandle.click();
    // await this.page.getByText('ETH / WBTC').click();
    return page;
}

// asser sent message is visisble in chat
export async function click_Chat_Emoji_Reaction(page: Page) {
    // Execute script to scroll to the top of the chat container
    await this.page.evaluate((xpath) => {
        const chatContainer = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        ).singleNodeValue as HTMLElement;
        if (chatContainer) {
            chatContainer.scrollTop == 100;
        } else {
            console.log('Chat container not found');
        }
    }, locators.chatRoomScrollUpXpath);

    const chatRoomScrollUp = this.page.locator(locators.chatRoomScrollUp);
    // select a reaction for the message
    await expect(chatRoomScrollUp);
}

// ---------------------------------------assert-----------------------------------

// id needed
// assert account page
export async function assertAccountPage(page: Page) {
    const locator = await page.getByRole('link', { name: 'Account' });
    await expect(locator).toBeEnabled();
    return page;
}

// assert wallet balances
export async function assertWalletBalances(page: Page) {
    const locator = await page.locator(locators.clickWalletBalances);
    await expect(locator).toBeEnabled();
    return page;
}

// assert exchange balances
export async function assertExchangeBalances(page: Page) {
    const locator = await page.locator(locators.clickExchangeBalances);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Liq tab
export async function assertLiquidityTab(page: Page) {
    const locator = await page.locator(locators.clickLiquidityTab);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Limit tab
export async function assertLimitTab(page: Page) {
    const locator = await page.locator(locators.clickLimitTab);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Transactions tab
export async function assertTransactionsTab(page: Page) {
    const locator = await page.locator(locators.clickTransactionsTab);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Transaction complete ----ERRRORRR
export async function assertTransaction(page: Page) {
    const locator = await page.locator(
        'div > div > div > div.MuiAlert-message.css-1xsto0d',
    );
    const text = await locator.innerText();
    expect(text).toContain('successfully');
    return page;
}

// assert Transaction complete Swap page
export async function assertTransactionSwap(page: Page) {
    // Locate the element using a partial CSS selector
    const locator = page.locator(locators.assertTransactionSwap);
    
    // Wait until the text contains "successfully completed"
    await page.waitForSelector('text=successfully completed');

    // Get the updated text
    const text = await locator.innerText();

    // Check if the updated text contains "successfully completed"
    expect(text).toContain('successfully completed');
    return page;
}

// id missing
// assert wallet id shareable chart
export async function assertIdShareableChart(page: Page, text: string) {
     // Wait for the element with class starting with "_info_button_"
    await page.waitForSelector('[class^="_info_button_"]', { timeout: 10000 });

    // Locate the element with class starting with "_value_content_"
    const locator = page.locator('[class^="_value_content_"] p').first();
    
    // Get the text of the element
    const fullText = await locator.innerText();
    console.log('Full Text Found:', fullText);  // Log the full text to verify

    // Extract the part that starts with "$"
    const match = fullText.match(/\$\d{1,3}(,\d{3})*(\.\d{2})?/);
    const textnew = match ? match[0] : undefined;

    if (textnew) {
        // Check if the extracted text (textnew) contains the expected text parameter
        expect(textnew).toBe(text);
        console.log(`Assertion passed: ${textnew} is equal to ${text}`);
    } else {
        throw new Error('No dollar value found in the specified element.');
    }
    
    return page;
}

// id missing
// assert wallet id shareable chart
export async function assertValLimitPriceShareableChart(
    page: Page,
    text: string,
) {
    const locator = await page.locator(
        locators.assertValLimitPriceShareableChart,
    );
    // Get val
    const val = await locator.innerText();
    // Check if the updated text contains "Transaction Confirmed"
    expect(val).toContain(text);
    return page;
}

// id missing
// assert Transaction complete Swap page
export async function assertTransactionsTransactionTab(page: Page) {
    // Locate the element by id
    const locator = page.locator(locators.clickMyTransactions);

    // Get the value of the "data-ison" attribute
    const isOn = await locator.getAttribute(locators.checkMyTransactions);

    // Check if the "data-ison" attribute is set to "true"
    expect(isOn).toBe('true');
    return page;
}

// id missing
// assert change of network
export async function assertChangeNetwork(page: Page) {
   // await page.waitForSelector('#hero > div > div > img');
    const locator = await page.locator(locators.assertChangeNetwork);
    // Get the text
    const text = await locator.innerText();
    // Check if the updated text contains "Scroll"
    expect(text).toContain('Scroll');
    return page;
}

// assert Balanced Toggel active
export async function assertBalancedToggle(page: Page) {
    const locator = await page.locator(locators.clickBalancedToggle);
    await expect(locator).toBeEnabled();
    return page;
}

// assert Wallet conectivity SawpPage
export async function assertWalletonnectivity(page: Page) {
    const locator = await page.locator(locators.getWalletConnectivity);
    await expect(locator).toBeEnabled();
    return page;
}

// asser sent message is visisble in chat
export async function assert_Sent_Message(page: Page, str: string) {
   const lastMessageLocator = page.locator(`text=${str}`).last(); // Use the text dynamically
   await lastMessageLocator.waitFor({ state: 'visible', timeout: 10000 });

   // Assert that the sent message is visible in the chat
   await expect(lastMessageLocator).toBeVisible({ timeout: 10000 });
}

// asser sent message is not visible visisble in chat
export async function assert_Delete_Message(page: Page, str: string) {
    await page.waitForTimeout(1000);
    // Execute script to scroll to the top of the chat container
    await this.page.evaluate((xpath) => {
        const chatContainer = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        ).singleNodeValue as HTMLElement;
        if (chatContainer) {
            chatContainer.scrollTop == 100;
        } else {
            console.log('Chat container not found');
        }
    }, locators.chatRoomScrollUpXpath);

    const chatRoomScrollUp = this.page.locator(locators.chatRoomScrollUp);

    // Wait for the locator to not be visible
    await expect(chatRoomScrollUp).not.toContain(str);
}

// asser sent message is visisble in chat
export async function assert_ENS_Name(page: Page, str: string ) {
    // Regex to match the ENS format (e.g., "0x849C...0B16")
    const ensRegex = /0x[0-9a-fA-F]{4}\.\.\.[0-9a-fA-F]{4}/;

    const lastMessageLocator = page.locator(`text=${str}`).last(); // Use the text dynamically
    await lastMessageLocator.waitFor({ state: 'visible', timeout: 10000 });
    // Assert that the sent message is visible in the chat
    await expect(lastMessageLocator).toBeVisible({ timeout: 10000 });

    // Find the value of the attribute that starts with `_name_default_label`
   const attributeValue = await lastMessageLocator.getAttribute('_name_default_label');
   
   if (attributeValue) {
       // Check if the attribute value matches the ENS pattern
       if (ensRegex.test(attributeValue)) {
           console.log('ENS name found in attribute and matches the pattern.');
       } else {
           console.warn('The attribute value does not match the ENS pattern.');
       }
   } else {
       console.warn('The attribute _name_default_label was not found.');
   }
}

// asser sent message is visisble in chat
export async function assert_Sent_Hyperlink(page: Page, str: string) {
    // First, wait for the message containing the string to appear
    const messageLocator = page.locator(`text=${str}`).last();
    await messageLocator.waitFor({ state: 'visible', timeout: 10000 });

    // Dynamically select the span that contains the link using a partial match on the class name
    const hyperlinkLocator = page.locator(`span[class*="_link_token_"]:has-text("${str}")`).last();
    const isHyperlinkVisible = await hyperlinkLocator.isVisible();

    // Assert that the dynamically selected "link" element is visible
    expect(isHyperlinkVisible).toBe(true);
}

// Assert that the last sent message has a reaction with the expected emoji
export async function assert_Last_Message_Emoji_Reaction(page: Page) {
    await page.waitForTimeout(1000);

    // Get the last message block
    const lastMessageBlock = await page
        .locator('div._message_block_wrapper')
        .last();

    // Scroll into view if necessary
    await lastMessageBlock.scrollIntoViewIfNeeded();

    // Wait for the message block to be visible
    await expect(lastMessageBlock).toBeVisible();

    // Locate the reaction section within the last message block
    const emojiReaction = await lastMessageBlock
        .locator('div._reactions_wrapper')
        .last();

    // Wait for the reaction to appear
    await expect(emojiReaction).toBeVisible();

    // Assert that the reaction contains the expected emoji
    await expect(emojiReaction).toContainText('😀');
}

// Assert that the last sent message has a reaction with the expected emoji
export async function assert_Last_Message_Unselect_Reaction(page: Page) {
    await page.waitForTimeout(1000);

    // Get the last message block
    const lastMessageBlock = await page
        .locator('div._message_block_wrapper')
        .last();

    // Scroll into view if necessary
    await lastMessageBlock.scrollIntoViewIfNeeded();

    // Wait for the message block to be visible
    await expect(lastMessageBlock).toBeVisible();

    // Locate the reaction section within the last message block
    const emojiReaction = await lastMessageBlock
        .locator('div._reactions_wrapper')
        .last();

    // Wait for the reaction to appear
    await expect(emojiReaction).toBeVisible();

    // Assert that the reaction contains the expected emoji
    await expect(emojiReaction).toContainText('');
}

// assert emoji panel is visible
export async function assert_Emoji_Panel(page: Page) {
    const element = await page.locator(locators.chatEmojiPanelClose);
    await expect(element).toBeVisible();
}

// assert emoji panel is not visible
export async function assert_Emoji_Panel_Closed(page: Page) {
    const element = await page.locator(locators.chatEmojiPanelClose);
    await expect(element).not.toBeVisible();
}

// assert progressbar 100
export async function assert_Progressbar_100_Character(page: Page) {
    const element = await page.locator(locators.chatProgressBar);
    await expect(element).toHaveText('40');
}

// assert progressbar 140
export async function assert_Progressbar_140_Character(page: Page) {
    const element = await page.locator(locators.chatProgressBar);
    await expect(element).toHaveText('0');
}

// assert progressbar 140+
export async function assert_Progressbar_141_Character(page: Page) {
    const element = await page.locator(locators.chatProgressBar);
    await expect(element).toHaveText('-1');
}

// assert progressbar Popup for exceeding lenghth
export async function assert_Popup_Exceeding_Lenght(page: Page) {
    const element = await page.locator(locators.chatPopupLenght);
    await expect(element).toHaveText(
        'Maximum length exceeded (140 characters limit).',
    );
}

// assert non whitelisted link warning message
export async function assert_Non_Whitelisted_Link(page: Page) {
    const element = await page.locator(locators.chatNonWhitelistedLink);
    await expect(element).toHaveText('You cannot send this link.');
}

// ---------------------------------------fill-----------------------------------

// fill in address on transfer tab
export async function fillTransferTab(page: Page) {
    await page
        .locator(locators.fillTransferTab)
        .fill('0x849C8e8Ee487424475D9e8f44244275599790B16');
    return page;
}

// fill in address on withdraw tab
export async function fillWithdrawTab(page: Page) {
    await page
        .locator(locators.fillWithdrawTab)
        .fill('0x849C8e8Ee487424475D9e8f44244275599790B16');
    return page;
}

// fill 5 usdc account transfer/withdraw
export async function fillTransferUSDC(page: Page) {
    await page.locator(locators.fillTransferUSDC).fill('5');
    return page;
}

// fill slippage tolerance swap settings
export async function fillSwapPageSlippage(page: Page) {
    await page.locator(locators.fillSlippage).fill('0.2');
    return page;
}

// fill Pool value
export async function fillPool(page: Page, num: number) {
    await page.locator(locators.fillPool).fill(num.toString());
    return page;
}

// fill Limit value
export async function fillLimit(page: Page, num: number) {
    await page.locator(locators.fillLimit).fill(num.toString());
    return page;
}

// fill Swap value
export async function fillSwap(page: Page, num: number) {
    await page.locator(locators.fillSwap).fill(num.toString());
    return page;
}

// fill set pool balance percentage
export async function fillPoolBar(page: Page, num: number) {
    await page.locator(locators.fillPoolBar).fill(num.toString());
    return page;
}

// fill chat input box
export async function fill_Input_Box(page: Page, str: string) {
    await page.locator(locators.chatBox).fill(str);
    return page;
}

// ---------------------------------------confirm-----------------------------------

// confirm transaction on metamask
export async function confirmMeta(page: Page) {
    await clickmmask(locators.confirmMeta, page);
    return page;
}

// confirm transaction on metamask
export async function confirmNetworkChange(page: Page) {
    await page.getByText(locators.confirmNetworkChange).click();
    return page;
}

// ---------------------------------------get-----------------------------------

// id needed
// get id on liquidity tab transactions
export async function getIdLiquidity(page: Page) {
     // Locate the first element with data-label="value"
     const locator = page.locator(locators.clickTransactionsRow).first();
    
     // Get the text of the first element
     const fullText = await locator.innerText();
 
     if (fullText) {
         // Match the dollar value using regex
         const match = fullText.match(/\$\d{1,3}(,\d{3})*(\.\d{2})?/);
         
         if (match) {
             const text = match[0];
             console.log('Total Value:', text);
             return text;
         } else {
             throw new Error('No dollar value found in the text.');
         }
     } else {
         throw new Error('Could not find value in the specified element.');
     }
}

// get the value of the limit price
export async function getValLimitPrice(page: Page) {
    const locator = await page.locator(locators.getValLimitPrice);
    // Get text of limit value
    const text = await locator.innerText();
    return text;
}

export async function scroll_Up_Chat_Room(page: Page) {
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });   
}

// fill chat input box
export async function generateRandomString(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 10; 

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}
