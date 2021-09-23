require('dotenv').config();
import axios from 'axios'
import { createExport } from './createExport';
import { getReqs } from './functions/getReqs';
const { TENANT_ID, USER_ID } = process.env;
const { get } = axios
const args = process.argv.slice(2)

async function init() {
  let index: string | string[] = args.filter(arg => arg.includes('index='))
  index.length ? index = index[0].split('=')[1] : index = null

  let tenantId: string | string[] = args.filter(arg => arg.includes('tenantId='))
  tenantId.length ? tenantId = tenantId[0].split('=')[1] : tenantId = null

  let userId: string | string[] = args.filter(arg => arg.includes('userId='))
  userId.length ? userId = userId[0].split('=')[1] : userId = null


  switch (args[0]) {
    case 'export':
      if (tenantId && userId) {
        if (index) {
          const { reqs, totalReqs } = await getReqs(args[1], args[2], null, 10000)
          const lastId = reqs[index as string].req
          return createExport(tenantId as string, userId as string, lastId, parseInt(index as string) as number)
        } else {
          return createExport(tenantId as string, userId as string)
        }
      } else if (TENANT_ID && USER_ID) {
        if (index) {
          const { reqs, totalReqs } = await getReqs(TENANT_ID, USER_ID, null, 10000)
          const lastId = reqs[index as string].req
          return createExport(TENANT_ID, USER_ID, lastId, parseInt(index as string) as number)
        } else {
        return createExport(TENANT_ID, USER_ID)
        }
      } else {
        console.log('please provide a tenant and user id')
      }
    case 'reqs':
      if (args[1] && args[2]) {
        const { reqs, totalReqs } = await getReqs(args[1], args[2], null, 10000)
        console.log('found x reqs: ', totalReqs)
        return console.log(reqs)
      } else if (TENANT_ID && USER_ID) {
        const { reqs, totalReqs } = await getReqs(TENANT_ID, USER_ID, null, 10000)
        console.log('found x reqs: ', totalReqs)
        return console.log(reqs)
      } else {
        return console.log('please provide a tenant and user id')
      }
    default:
      return console.log('specifiy a script to run.')
  }
}

init()