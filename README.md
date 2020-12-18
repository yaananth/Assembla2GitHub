# Assembla tickets to GitHub

Nothing fancy, but a quick script.

Feel free to use this as base and improve.

No concurrency/parallelism, just dumb script :)

## Set up

Create `.env` file with:

```
ASSEMBLA_API_KEY="SETSOMEVALUEHERE"
ASSEMBLA_API_SECRET="SETSOMEVALUEHERE"
GITHUB_TOKEN="SETSOMEVALUEHERE"
```

`ASSEMBLA_API_KEY` and `ASSEMBLA_API_SECRET` Get assembla key and secret for API using:  https://articles.assembla.com/en/articles/998043-getting-started-with-assembla-developer-api

`GITHUB_TOKEN`: Creates PAT token for github using: https://github.com/settings/tokens

### Run
`node app.js`

## Push .content!

Attachments are downloaded to `.content` directory.

Make sure you push them to GitHub as repositories!

May be using something like https://github.com/yaananth/Assembla2GitHub/blob/main/pushContent.bat

Issue comments just mention about these paths.
