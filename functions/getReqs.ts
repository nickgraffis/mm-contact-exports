import axios from 'axios'
const { get } = axios
const { ES_ENDPOINT } = process.env

export async function getReqs (
  tenantId: string, 
  userId: string,
  lastId: string | null  = null,
  size: number = 1
  ): Promise<{
    reqs: { reqName: string, req: string, index: number }[],
    totalReqs: number
  }> {
  let totalReqs: number
  let reqs: { reqName: string, req: string, index: number }[] = [];
  await get(`${ES_ENDPOINT}/user_reqs/_search`, {
    data: {
      "size": size,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "tenant.keyword": tenantId
              }
            },
            {
              "match_phrase_prefix": {
                "id": userId
              }
            }
          ]
        }
      },
      "sort": [
        {
          "reqId.keyword": {
            "order": "desc"
          }
        }
      ], 
      ...(lastId) && { "search_after": [lastId]}
    }
  }).then(res => {
    totalReqs = res.data.hits.total.value
    res.data.hits.hits.forEach((hit, i) => {
      reqs.push({
      req: hit._source.reqId,
      reqName: hit._source.title,
      index: i
      })
    })
  })
  .catch(err => console.log(err))

  return {
    reqs,
    totalReqs
  }
}