import { Page } from 'playwright'
import screenshotDesktop from 'screenshot-desktop'

import { RESERVA_NAV, PRONOTAMI_AG_URL } from '../constants/locators'
import { formatDate } from './formatDate'

import {RequestPrenotami} from '../model/requestPrenotami';

export const passportAppointmentIsAvailable = async (
  page: Page,
  screenshot: { filename?: string; manualScreenshot?: false } = {},
) => {
  const path = __dirname.split('\\')
  path.splice(path.length - 2, 2)
  let result = new RequestPrenotami();
  try {
    await page.locator(RESERVA_NAV).click()
    await page.waitForLoadState('load')
    await page.locator('#dataTableServices > tbody > tr:nth-child(3) > td:nth-child(4) > a').click()
    await page.waitForLoadState('load')
    //await page.locator(PRONOTAMI_AG_URL).click()
    //await page.waitForLoadState('load')
    const text = await page
      .locator('.jconfirm-content > div')
      .innerText()
      .catch(error => 'Não deu')

    if (
      text ===
      //"Sorry, all appointments for this service are currently booked. Please check again tomorrow for cancellations or new appointments."
      "Stante l'elevata richiesta i posti disponibili per il servizio scelto sono esauriti. E' consigliabile ricontrollare frequentemente in quanto nuovi appuntamenti prenotabili vengono aggiunti ogni settimana."
    ) {
      if (screenshot.filename && !screenshot.manualScreenshot) {
        await screenshotDesktop({
          filename: `${path.join('/')}/screenshots/${screenshot.filename}_${formatDate(
            new Date(),
            '_',
          )}.png`,
        })
      } else {
        if (screenshot.manualScreenshot) {
          await page.waitForTimeout(1000 * 12)
        }
      }

      await page.locator('.jconfirm-buttons > button').click()
    }

    result.sucess = !(
      text ===
      "Stante l'elevata richiesta i posti disponibili per il servizio scelto sono esauriti. Si invita a controllare con frequenza la disponibilità in quanto l’agenda viene aggiornata regolarmente"
    );
    result.mensagem = 'Dada a elevada procura, as vagas disponíveis para o serviço escolhido encontram-se esgotadas. Convidamos você a verificar a disponibilidade com frequência, pois a agenda é atualizada regularmente';

    return result;
  } catch (error) {
    console.error('Erro func: passportAppointmentIsAvailable')
    return result
  }
}
