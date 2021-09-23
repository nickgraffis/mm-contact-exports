import axios from 'axios'
import { Parser } from 'json2csv'
import { writeFileSync } from 'fs'
import inquirer from 'inquirer'
import { ReqContact, ResponseReqContact } from './types';
import { getEmails } from './functions/getEmails';
import { getReqs } from './functions/getReqs';
const { get } = axios
const { ES_ENDPOINT, INQUIRE, OUTPUT_DIRECTORY, LOG } = process.env
import { snakeCase } from "snake-case";

export async function createExport(
  tenantId: string, 
  userId: string,
  lastId: string | null  = null, 
  index: number = 0
): Promise<void> {
  // Get All of the reqs for this tenant
  const { reqs, totalReqs } = await getReqs(tenantId, userId, lastId)
  let req = reqs[0].req
  let reqName = reqs[0].reqName
  let reqContacts: ReqContact[];
  let total: number = 0

  let answer = INQUIRE ? await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: `Do you want run req ${index}/${totalReqs}: ${req}?`,
      default: true
    }
  ]) : { continue: true }
  if (answer.continue === true && req) {
    LOG && console.log(`starting with req ${index}/${totalReqs}`, req)
    let id: string = req
    await get(`${ES_ENDPOINT}/req_contacts/_search`, {
      data: {
        "size": 10000,
        "query": {
          "bool": {
            "filter": [
              {
                "term": {
                  "reqId.keyword": id
                }
              }
            ]
          }
        }
      }
    }).then(res => {
      LOG && console.log('found x contacts: ', res.data.hits.total.value)
      total = total + res.data.hits.total.value
      reqContacts = res.data.hits.hits 
    })
    .catch(err => console.log(err))

    if (reqContacts.length > 0) {
      LOG && console.log('starting to build contact objects')
      const finalReqContacts: ResponseReqContact[] = []
      for (let j = 0; j < reqContacts.length; j++) {
        if (j % 10 == 0 && LOG) console.log(`working on contact ${j}/${reqContacts.length - 1}`)
        let data = reqContacts[j]._source
        let emails = await getEmails(data?.contactId)
        finalReqContacts.push({
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          reqName: data.reqName,
          emails: emails ? emails.map(email => email.address).join(', ') : null,
          phones: data.phones?.map(phone => phone.number).join(', '),
          city: data.address?.city,
          state: data.address?.state,
          zip: data.address?.zip,
          nmlsId: data.nmlsId
        })
      }
  
      LOG && console.log(total, finalReqContacts.length)
  
      const json2csvParser = new Parser();
      writeFileSync(`${OUTPUT_DIRECTORY}/export-${snakeCase(reqName)}.csv`, json2csvParser.parse(finalReqContacts), 'utf8');
    } else {
      LOG && console.log('skipped this req because it was empty')
    }
  } else {
    LOG && console.log('skipping req: ', req)
  }

  answer = INQUIRE ? await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: `Do you want to continue?`,
      default: true
    }
  ]) : { continue: true }

  if (answer.continue === true) createExport(tenantId, userId, req, index + 1)
  else return console.log('finished')
}