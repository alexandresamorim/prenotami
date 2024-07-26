import { webkit, Page } from 'playwright'

import { goToLoginPage } from '../functions/goToLoginPage'
import { userLogin } from '../functions/userLogin'
import { goToLogoutPage } from './goToLogoutPage'
import { userLogout } from './userLogout'

export const auth = async (page: Page, email: string, password: string) => {
  await goToLoginPage(page)
  await userLogin(page, email, password)
  console.log('auth')
}
export const  logout = async (page: Page) => {
  await goToLogoutPage(page);
  await userLogout(page);
}
