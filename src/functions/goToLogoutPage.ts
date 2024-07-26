import { Page } from 'playwright'

import { PRONOTAMI_URL } from '../constants/locators'


export const goToLogoutPage = async (page: Page) => {
    await page.goto(PRONOTAMI_URL + 'UserArea')
    await page.waitForLoadState('load')
  }