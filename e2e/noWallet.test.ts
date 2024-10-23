/* eslint-disable camelcase */
import { test, expect } from 'playwright/test';
import HomePage from './pages/home_page';
import TradePage from './pages/trade_page';
<<<<<<< HEAD
=======
import { timeout } from 'd3';
>>>>>>> chat-started-with-old-code-base

test('test_CS_187_Toppool', async ({ page }) => {
    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    await test_page.clickHomepageTradepair();
    await test_page.assertTradepair();
});

test('test_CS_183_Tradebutton', async ({ page }) => {
    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.assertTradepage();
});

test('test_CS_1301_AF_Stats', async ({ page }) => {
    const test_page = new HomePage(page);
    await test_page.goto();
    await test_page.home_btn();
    await test_page.assertTotalVolume();
    await test_page.assertTotalFees();
    await test_page.assertTotalValue();
});

test('test_CS_269_Denom', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_limit_btn();
    await test_page.denom();
    await test_page.assert_denom();
});

test('test_CS_1291_Toppools', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
<<<<<<< HEAD
    await test_page.click_toppools();
=======
    // open top pools
    await test_page.click_toppools();
    // select top pool
>>>>>>> chat-started-with-old-code-base
    await test_page.click_toppools_token();
    // compare if the trade paris are the same on the toppools and the trade page
    await test_page.assert_token();
});

test('test_CS_1292_Recentpools', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_recent_pools();
    await test_page.click_recentpools_token();
    // compare if the trade paris are the same on the recentpools and the trade page
    await test_page.assert_token();
});

test('test_CS_1310_Back', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // await test_page.goBack()
    // compare if the trade paris are the same on the recentpools and the trade page
    // test_page.assert_homepage()
});

// no more in scope, interface changed
/*
test('test_CS_1311_Sidebarlock', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.click_lock_sidebar();
    await test_page.assert_lock_sidebar();
});
*/

// no more in scope, interface changed
/*
test('test_CS_1312_Collapse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.click_open_all_dropdown();
    // assert if dropdowns are open
    await test_page.assert_transactions();
    await test_page.assert_limit_order();
    await test_page.assert_range_position();
    await test_page.assert_recent_pools();
    await test_page.assert_fav_pools();
    await test_page.assert_top_pools();
});
*/

test('test_CS_1303_Search', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.fill_search_sidebar('eth');
    await test_page.click_search_token();
    await test_page.assertSearchToken();
});

test('test_CS_1378_Searchneg', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    // open sidebar
    await test_page.click_toppools();
    await test_page.fill_search_sidebar('abc');
    await test_page.assert_searchneg();
});

test('test_CS_800_Trade_Reverse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_reverse();
    await test_page.assert_swap_reverse();
});

test('test_CS_801_Limit_Reverse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_limit_btn();
    await test_page.click_reverse();
    await test_page.assert_limit_reverse();
});

test('test_CS_802_Swap_Reverse', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_swap_page();
    await test_page.click_reverse();
    await test_page.assert_reverse();
});

test('test_CS_734_Denomswap', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.denom();
    await test_page.assert_denom();
});

test('test_CS_214_Favpool', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_toppools();
    await test_page.click_add_fav();
    await test_page.click_favpools();
    await test_page.assert_fav_pool_added();
});

test('test_CS_252_Balanceranges_5to10', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // 5-10
    await test_page.click_5percent();
    const value = test_page.get_min_price();
    await test_page.click_10percent();
    const value_new = test_page.get_min_price();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).toBeGreaterThan(newValue);
});

test('test_CS_252_Balanceranges_10to25', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // 10-25
    await test_page.click_10percent();
    const value = test_page.get_min_price();
    await test_page.click_25percent();
    const value_new = test_page.get_min_price();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).toBeGreaterThan(newValue);
});

test('test_CS_252_Balanceranges_25to50', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // 25-50
    await test_page.click_25percent();
    const value = test_page.get_min_price();
    await test_page.click_50percent();
    const value_new = test_page.get_min_price();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).toBeGreaterThan(newValue);
});

test('test_CS_252_Balanceranges_Ambient', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    // ambient
    await test_page.click_ambient();
    const value = test_page.get_min_price();
    // value is Promises resolving to number
    const actualValue = await value;
    await expect(actualValue).toBe(0);
});

test('test_CS_251_Plusminus_Min', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_balanced();
    // min percentage decrease test
    const value = test_page.get_min_percentage();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    await test_page.click_decrease();
    const value_new = test_page.get_min_percentage();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    await expect(newValue).toBeGreaterThan(await actualValue);
});

test('test_CS_251_Plusminus_Max', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_balanced();
    // max percentage increase test
    const value = test_page.get_max_percentage();
    for (let i = 0; i < 4; i++) {
        await test_page.click_increase();
    }
    const value_new = test_page.get_max_percentage();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    await expect(newValue).toBeGreaterThan(await actualValue);
});

test('test_CS_342_Pooldisplay', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.assert_balanced_enabled();
});
// id needed ---fail
test('test_CS_693_Leadboard', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    // click on leaderboard
    await test_page.click_leaderboard();
    const value = test_page.get_leaderboard();
    // open detail of row
    await test_page.click_leaderboard_row();
    // await test_page.assert_leaderboard();
});

test('test_CS_769_Slippage', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_swap_page();
    await test_page.click_settings_btn();
    // %0.1
    await test_page.click_01();
    const value = test_page.get_01();
    // value is Promises resolving to number
    const actualValue = await value;
    await expect(actualValue).toBe(0.1);
    // 0.3%
    await test_page.click_03();
    const value3 = test_page.get_03();
    // value3 is Promises resolving to number
    const actualValue3 = await value3;
    await expect(actualValue3).toBe(0.3);
    // 0.5%
    await test_page.click_05();
    // value5 is Promises resolving to number
    const value5 = test_page.get_05();
    const actualValue5 = await value5;
    await expect(actualValue5).toBe(0.5);
});

test('test_CS_774_Clipboard', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on swap page
    await test_page.click_trade_btn();
    await test_page.click_clipboard();
    await test_page.assert_clipboard();
});

test('test_CS_231_Full_Screen', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_Full_Screen();
    await test_page.assert_Modules_Not_Visible();
});

test('test_CS_609_Pool_Denom_5', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_5percent();
    const value = test_page.get_min_price();
    await test_page.denom();
    const value_new = test_page.get_Min_Price_Denom();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).not.toEqual(newValue);
});

test('test_CS_609_Pool_Denom_10', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_10percent();
    const value = test_page.get_min_price();
    await test_page.denom();
    const value_new = test_page.get_Min_Price_Denom();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).not.toEqual(newValue);
});

test('test_CS_609_Pool_Denom_25', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_25percent();
    const value = test_page.get_min_price();
    await test_page.denom();
    const value_new = test_page.get_Min_Price_Denom();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).not.toEqual(newValue);
});

test('test_CS_609_Pool_Denom_50', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_pool_btn();
    await test_page.click_50percent();
    const value = test_page.get_min_price();
    await test_page.denom();
    const value_new = test_page.get_Min_Price_Denom();
    // value and value_new are Promises resolving to numbers
    const actualValue = await value;
    const newValue = await value_new;
    expect(actualValue).not.toEqual(newValue);
});

test('test_CS_2089_USD_Price_Toggle', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_USD_Toggle();
    await test_page.assert_USD_Toggle();
});

test('test_CS_1305_ESC', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_Transaction_Row();
    await test_page.assert_Transaction_Popup();
    await test_page.click_ESC();
    await test_page.page.waitForTimeout(10000);
    await test_page.assert_Popup();
});
<<<<<<< HEAD

test('test_CS_353_Chat_Unlogged', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_Open_Chat();
    await test_page.assert_Chat_Unable();
});
// not clicking on chat room maybe need for id
test('test_CS_351_Message_Display', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.goto();
    await test_page.home_btn();
    // Click on trade button on homepage
    await test_page.click_trade_btn();
    await test_page.click_Open_Chat();
    await test_page.click_Chat_Room_Dropdown();
    await test_page.click_Select_Chat_Room();
    await test_page.assert_Chat_Room();
});

test('test_CS_1659_Scroll_to_Bottom', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    await test_page.click_Open_Chat();
    // Wait for the chat container to be visible
    await page.waitForSelector('#chatmessage');

    // Scroll to the top of the chat message element
    await page.evaluate(() => {
        const chatElement = document.getElementById('chatmessage'); // Ensure the correct ID is used
        if (chatElement) {
            chatElement.scrollTop = 0; // Scroll to the top
        } else {
            console.error('Chat message element not found!');
        }
    });
    // click the last button to scroll back to the bottom
    await test_page.click_Last_Button();

    // Assert that the last message is in the viewport
    const isLastMessageInView = await page.evaluate(() => {
        const lastMessage = document.getElementById('thelastmessage');
        if (!lastMessage) return false;
        const rect = lastMessage.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
                (window.innerWidth || document.documentElement.clientWidth)
        );
    });

    expect(isLastMessageInView).toBe(true);
=======
// --------------------------------------CHAT-------------------------------------------------
test('test_CS_353_Chat_Unlogged', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    await test_page.assert_Chat_Unable();
});

test('test_CS_351_Chat_Message_Display', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat panel
    await test_page.click_Open_Chat();
    await test_page.click_Open_Room_Dropdown();
    await test_page.click_Select_Pool();
    await test_page.assert_Chat_Room();
});

test('test_CS_1659_Chat_Scroll_to_Bottom', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // Scroll to the bottom of the chat panel
    await test_page.scroll_Up_Chat_Room();
    // click the last button to scroll back to the bottom
    await test_page.click_Last_Button();
    // Assert that the last message is in the viewport
    await test_page.assert_Last_Message();
});

test('test_CS_360_Chat_Pages', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    await test_page.click_Open_Chat();
    // open swap page
    await test_page.click_swap_page();
    await test_page.assert_Chat_Active();
    // open trade page
    await test_page.click_trade_page();
    await test_page.assert_Chat_Active();
    // open pool page
    await test_page.click_pool_page();
    await test_page.assert_Chat_Active();
    // open explore page
    await test_page.click_explore_page();
    await test_page.assert_Chat_Active();
});

test('test_CS_2351_Chat_Previous_Message', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // Scroll to the top of the chat panel
    await test_page.page.waitForTimeout(1000);
    await test_page.scroll_Up_Chat_Room();
    // click previous button
    await test_page.click_Previous_Button();
    // Assert
    await test_page.assert_Previous_Message();
});

test('test_CS_1740_Chat_Ctrl_M', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // Press CTRL+M
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyM');
    await page.keyboard.up('Control');
    // Assert
    await test_page.assert_Infobox();
});

test('test_CS_1737_Chat_Esc', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // Press esc
    await page.keyboard.press('Escape');
    // Assert
    await test_page.assert_Chat_Deactive();
});

test('test_CS_1736_Chat_Ctrl_Alt_C', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // Press Ctrl + Alt + C
    await page.keyboard.down('Control');
    await page.keyboard.down('Alt');
    await page.keyboard.press('KeyC');
    await page.keyboard.up('Alt');
    await page.keyboard.up('Control');
    // Assert
    await test_page.assert_Chat_Active();
});

test('test_CS_998_Chat_Change_Pool', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // open room dropdown
    await test_page.click_Open_Room_Dropdown();
    // select a pool
    await test_page.click_Select_Pool();
    // Assert
    await test_page.assert_Pool_Name();
});

test('test_CS_2010_Chat_Scroll_Position', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // Scroll to the top of the chat panel
    await test_page.page.waitForTimeout(10000);
    await test_page.scroll_Chat_Room();
    // Assert
    await test_page.assert_Previous_Message();
});

test('test_CS_354_Chat_Favorite_Pools', async ({ page }) => {
    const test_page = new TradePage(page);
    // open chat link on the trade page
    await test_page.gotoChat();
    // open dropdown
    await test_page.click_toppools();
    // add a fav pool
    await test_page.click_add_fav();
    // open chat
    await test_page.click_Open_Chat();
    // open room dropdown
    await test_page.click_Open_Room_Dropdown();
    // Assert
    await test_page.assert_Pool_Name_Favorite();
});

test('test_CS_2716_Chat_Current_Pools', async ({ page }) => {
    const test_page = new TradePage(page);
    // open chat link on the trade page
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // click on current pool
    await test_page.click_current_pools();
    // Assert
    await test_page.assert_Pool_Name_Current();
});

test('test_CS_2399_Chat_Dynamic_Room_Emoji', async ({ page }) => {
    const test_page = new TradePage(page);
    // open chat link on the trade page
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // open room dropdown
    await test_page.click_Open_Room_Dropdown();
    // Assert
    await test_page.assert_Pool_Name_Global();
    // await test_page.assert_Pool_Name_Admin();
});

test('test_CS_1651_Chat_Account_Visit', async ({ page }) => {
    const test_page = new TradePage(page);
    // open chat link on the trade page
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // click on ens name in chat
    const valueChat = test_page.get_ENS_Chat();
    // Click on ENS name in chat to visit the account
    await test_page.click_ENS_Name();
    // Assert that the ENS name in chat matches the ENS name in the account
    await test_page.assert_ENS_Name(await valueChat);
});
// new tc
test('test_CS_371_Chat_Last_Message', async ({ page }) => {
    const test_page = new TradePage(page);
    await test_page.gotoChat();
    // open chat
    await test_page.click_Open_Chat();
    // Assert that the last message is in the viewport
    await test_page.assert_Last_Message();
    // open room dropdown
    await test_page.click_Open_Room_Dropdown();
    // select a pool
    await test_page.click_Select_Pool();
    // Assert
    await test_page.assert_Pool_Name();
    // Assert that the last message is in the viewport
    await test_page.assert_Last_Message();
>>>>>>> chat-started-with-old-code-base
});
