## Blueprint for exporting large amounts of contacts to a CSV file
This demo shows the following flow:
1 - Get all requisitions for a given tenant
2 - Get all the requisition contacts for each requisition
3 - For each requisition contact, get the user contact and add the emails to the requistion contact
4 - Export the requisition contacts to a CSV file
5 - Ask if you want to move on to the next requistion
6 - Repeat steps 2-5 until all requisitions have been processed

## Why ask to continue?
If we are exporting huge amounts of data, especially in the instance here where we are checking out the user contacts for each requisition contact, it is very time consuming and ES can timeout. 

Checking after each requisition contact is a good way to see if the export is still working, and means that if there is an error in the last one we haven't lost all of our data and processing.

## Logging & Setting Variables
The following variables are set in the `.env` file:
1 - `ES_ENDPOINT`: The elastic search endpoint to use.
2 - `TENANT_ID`: The tenant id to use.
3 - `USER_ID`: The user id to use.
4 - `LOG`: true or false.  If true, the script will log to the console.
5 - `INQUIRE`: true or fals. If true, the script will ask if you want to continue after each requisition.
6 - `OUTPUT_DIRECTORY`: The output directory to use. Make sure this directory exists.

We log out the requisition we are on and the number of requisitions we have left to process.
We log out every tenth contact we are on and the number of contacts we have left to process.
We log out the number of contacts Elastic Search found and the number of contacts we processed, to confirm this was done properly.

You can also set some variables in side your command:
1 - `npm run export tenantId=<TENANT_ID>`: The tenant id to use.
2 - `npm run export userId=<USER_ID>`: The user id to use.
3 - `npm run export index=<INDEX>`: The index within the reqs to start at.

## Check just the requisitions
`npm run reqs`
The `tenantId` and `userId` variables can be set in this command as well

## Bugs & Limitations
_This script is not perfect, there are bugs I'm sure._

A major limitation in general here is that we are currently going across indexes to try to add email addresses to requisition contacts, this is insanely expensive and not necessary. 

A major improvement here would be to dig deeper into ES and figure out how to do this more efficently with some kind of script query. For sure, going cross index would be impossible in that case though. 