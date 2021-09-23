import axios from 'axios'
const { get } = axios
const { ES_ENDPOINT } = process.env

export async function getEmails(contactId: string): Promise<{ type: string, address: string}[] | null> {
  return get(`${ES_ENDPOINT}/user_contacts/_search`, {
    data: {
      "query": {
        "bool": {
          "filter": [
            {
              "term": {
                "contactId.keyword": contactId
              }
            }
          ]
        }
      }
    }
  }).then(res => {
    return res.data.hits.hits[0]._source?.emails || null
  })
  .catch(err => console.log(err))
}