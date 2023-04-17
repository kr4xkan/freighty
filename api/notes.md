# Where to get DATA O.o

## Rayze.it
Endpoint that returns the full list of donations that can be converted back to a list and check for changes

Url: https://www.rayze.it/dnt_donors.php?account=**\[ACCOUNT\]**

## TheChesedFund
They have an edge function running that gives live donations in JSON.

Url: https://us-central1-tcf-backend-prod.cloudfunctions.net/donations_live/list/**\[ACCOUNT\]**/**\[TOKEN\]**
Sample url: https://us-central1-tcf-backend-prod.cloudfunctions.net/perks/pidyonshvuyimkimchadipischa/9bwgs77q92eEgPRmG2X9

Where **\[ACCOUNT\]** is the name of the campaign.
Problem: the last part of the URL seems to be a token. Maybe we can ask them to have a permanent token like /_ or something like this.
This token is not in cookies/local storage

## DryveUP
There is also a url that returns some form of JSON. But it works with EventStream

Url: https://www.dryveup.com/partials/serve.php?dryve=**\[ID\]**
Sample Url: https://www.dryveup.com/partials/serve.php?dryve=431

But the urls above only give recent donations, to get all of them:
Url: https://www.dryveup.com/api/transactions.php?dryve=**\[ID\]**&limit=0&s=&order=timestamp_desc
Sample Url: https://www.dryveup.com/api/transactions.php?dryve=431&limit=0&s=&order=timestamp_desc

CAUTION: The call needs to have this header `x-requested-with: XMLHttpRequest`, else it won't give any data

## Charidy
Awesome way to get all teams with this,

Url: https://api.charidy.com/api/v1/campaign/**\[CAMPAIGN_ID\]**/teams

And all the donations can retrieved in order using,

Url: https://api.charidy.com/api/v1/campaign/**\[CAMPAIGN_ID\]**/donations?searchQ&limit=100&sortBy=-time&extend=team&extend=campaign

Problem: We cannot bypass the limit=100, so maybe webhooks here is better, but here team_id_list seems to always be correctly referenced.