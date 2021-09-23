export type ReqContact = {
  _source: {
    contactId: string,
    firstName: string,
    lastName: string,
    company: string,
    reqName: string,
    phones: { type: string, number: string }[],
    nmlsId: string | number,
    address: {
      city: string,
      state: string,
      zip: string | number,
    },
  }
}

export type ResponseReqContact = {
  firstName: string,
  lastName: string,
  company: string,
  reqName: string,
  emails: string | null,
  phones: string,
  city: string,
  state: string,
  zip: string | number,
  nmlsId: string | number
}