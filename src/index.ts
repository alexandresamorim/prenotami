import { webkit, Page } from 'playwright'
import fs from 'fs/promises'

import { passportAppointmentIsAvailable } from './functions/passport'
import { auth, logout } from './functions/auth'

import { bot } from './services/telegram'
import { telegramUsers } from './services/telegramUsers'

import users from './constants/fakeUser'
import {RequestPrenotami} from './model/requestPrenotami';
import { PRONOTAMI_AG_URL } from './constants/locators'




const main = async () => {
  const browser = await webkit.launch({ headless: true /* open browser */ })
  let resultPrenotami = new RequestPrenotami();
  let timeInterval = setInterval(async () => {
    for (const userId of telegramUsers) {
      await bot.telegram.sendMessage(userId, 'Monitoramento iniciado.').catch()
    }
  }, 2000 * 60 * 60)

  try {
    const page = await browser.newPage()
    
    await auth(page, users[0].email, users[0].password)

    let loop = true
    let countError = 0
    do {
      try {

        resultPrenotami = await passportAppointmentIsAvailable(page)

        if (resultPrenotami.sucess) {
          for (const userId of telegramUsers) {
            await bot.telegram.sendMessage(userId, 'Agendamento disponivel, acesse o link.\n '+ PRONOTAMI_AG_URL).catch()
            console.log('Agendamento iniciado')
            const pageContent = await page.content()
            await fs.writeFile('passportPage.html', pageContent)
          } 
        }
        else if (resultPrenotami.mensagem != '') {
          for (const userId of telegramUsers) {
            await bot.telegram.sendMessage(userId, resultPrenotami.mensagem)
          }
        }
        else {countError++}

        if (countError >= 2) {
          throw new Error('Reinicia aplicação.')
        }
      } catch (error) {
        throw new Error((error as Error).message)
      }
    } while (loop)
  } catch (error) {
    console.error('Erro: ' + (error as Error).message)
   
    //Reinicia a aplicação.
    await browser.close().catch()
    clearInterval(timeInterval)
    main()
  }
}

main()
