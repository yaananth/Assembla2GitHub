require('dotenv').config()
import * as axios from "axios";
import { exit } from "process";
import * as fs from "fs";
import { join } from "path";
import * as https from "https";
import { URL } from "url";

const Axios = axios.default;
const timer = (ms: number) => new Promise(res => setTimeout(res, ms));

function getAssemblaConfig() {
  const apiKey = process.env.ASSEMBLA_API_KEY;
  const apiSecret = process.env.ASSEMBLA_API_SECRET;

  if (!(apiKey || apiSecret)) {
    console.error("Need ASSEMBLA_API_KEY, ASSEMBLA_API_SECRET environment variable set. See https://articles.assembla.com/en/articles/998043-getting-started-with-assembla-developer-api")
  }
  return {
    apiKey: apiKey,
    apiSecret: apiSecret
  }
}

function getGitHubData() {
  const token = process.env.GITHUB_TOKEN;
  const orgName = process.env.GITHUB_ORG_NAME;
  if (!(token || orgName)) {
    console.error("Need GITHUB_TOKEN, GITHUB_ORG_NAME environment variable set. See https://github.com/settings/tokens")
  }

  return {
    token: token,
    orgName: orgName,
    headers: {
      //https://docs.github.com/en/free-pro-team@latest/rest/overview/resources-in-the-rest-api#authentication
      Authorization: `Bearer ${token}`
    }
  };
}

async function parseAssembla() {
  //https://articles.assembla.com/en/articles/998043-getting-started-with-assembla-developer-api
  const apiConfig = getAssemblaConfig();
  const config = {
    headers: {
      "X-Api-key": apiConfig.apiKey,
      "X-Api-secret": apiConfig.apiSecret
    }
  } as axios.AxiosRequestConfig;


  const githubData = getGitHubData();
  const spacesResponse = await Axios.get("https://api.assembla.com/v1/spaces.json", config);
  const spaces = spacesResponse.data as [];
  console.log(`> 🛸  Got ${spaces.length} assembla spaces to parse...`)
  const doneSpaces: string[] = [

  ];
  for (let spaceIndex = 0; spaceIndex < spaces.length; spaceIndex++) {
    const space = spaces[spaceIndex];
    const spaceId = space["id"];
    const spaceName = space["name"];
    console.log(`>> ☄️  Space ${spaceName}...`)
    if (doneSpaces.indexOf((spaceName as string).toLowerCase()) >= 0) {
      console.log(`>> ✅  Skipping space ${spaceName}...`)
      continue;
    }

    let pageNumber = 1;
    while (true) {
      //https://api-docs.assembla.cc/content/ref/tickets_index.html

      const ticketsUrl = `https://api.assembla.com/v1/spaces/${spaceId}/tickets.json?report=0&page=${pageNumber}&per_page=100`;
      const ticketsResponse = await Axios.get(ticketsUrl, config);
      const tickets = ticketsResponse.data as [];
      if (tickets && tickets.length > 0) {
        console.log(`>>> 🎟️  Got ${tickets.length} tickets ${ticketsUrl}`)
        pageNumber++;

        const repoName = `assembla_${spaceName}`.replace(" ", "-");
        await createRepoInGitHub(repoName);

        for (let ticketsIndex = 0; ticketsIndex < tickets.length; ticketsIndex++) {
          const ticket = tickets[ticketsIndex];
          const ticketNumber = ticket["number"];
          const ticketSummary = ticket["summary"];

          const gitHubIssueNumber = await createIssueInGitHub(repoName, ticket);
          if (!gitHubIssueNumber) {
            console.error("⛔ GitHub issue isn't created!")
            exit(0);
          }

          // https://api-docs.assembla.cc/content/ref/ticket_comments_index.html
          const ticketCommentsUrl = `https://api.assembla.com/v1/spaces/${spaceId}/tickets/${ticketNumber}/ticket_comments.json`;
          const ticketCommentsResponse = await Axios.get(ticketCommentsUrl, config);
          const ticketComments = ticketCommentsResponse.data as [];
          if (ticketComments.length > 0) {
            console.log(`>>>> 💬  Got ${ticketComments.length} comments on ticket ${ticketNumber} ${ticketSummary}`);
            for (let ticketCommentIndex = 0; ticketCommentIndex < ticketComments.length; ticketCommentIndex++) {
              const ticketComment = ticketComments[ticketCommentIndex];
              const comment = ticketComment["comment"] as string;
              if (comment && comment.trim()) {
                await addCommentToIssueInGitHub(repoName, gitHubIssueNumber, comment)
              }
            }
          }

          // https://api-docs.assembla.cc/content/ref/tickets_attachments.html
          const ticketAttachmentsUrl = `https://api.assembla.com/v1/spaces/${spaceId}/tickets/${ticketNumber}/attachments.json`;
          const ticketAttachmentResponse = await Axios.get(ticketAttachmentsUrl, config);
          const ticketAttachments = ticketAttachmentResponse.data as [];
          if (ticketAttachments.length > 0) {
            console.log(`>>>> 📁  Got ${ticketAttachments.length} attachments on ticket ${ticketNumber} ${ticketSummary}`);
            for (let ticketAttachmentsIndex = 0; ticketAttachmentsIndex < ticketAttachments.length; ticketAttachmentsIndex++) {
              const ticketAttachment = ticketAttachments[ticketAttachmentsIndex];
              const downloadUrl = ticketAttachment["url"];
              const ticketAttachmentId = ticketAttachment["id"];
              const fileName = ticketAttachment["filename"] || "unknownfilename";
              const contentType = ticketAttachment["content-type"] as string;
              console.log(`>>>>> 📂  Got ${fileName} attachment: ${downloadUrl}`)
              const path = join(ticketNumber + "", ticketAttachmentId + "");
              const dirPath = join(".content", `${githubData.orgName}`, repoName, path);
              try {
                await new Promise(resolve => {
                  fs.mkdirSync(dirPath, { recursive: true });
                  const writeStream = fs.createWriteStream(join(dirPath, fileName));
                  const urlType = new URL(downloadUrl);
                  https.get({
                    headers: config.headers,
                    hostname: urlType.host,
                    protocol: urlType.protocol,
                    href: urlType.href,
                    path: urlType.pathname
                  }, (response) => {
                    if (response.statusCode == 302) {
                      console.log(`Fetching from ${response.headers.location}...`)
                      https.get(response.headers.location as string, (contentResponse) => {
                        contentResponse.pipe(writeStream);
                        writeStream.on('finish', resolve);
                      })
                    }
                  })
                });
                console.log(`>>>>> ⏬  Downloaded, please push the downloaded folders, I will add this as a comment to issue..`)
                await addCommentToIssueInGitHub(repoName, gitHubIssueNumber, `AttachedPackage: 📦 ${join("https://github.com", githubData.orgName as string, repoName, "blob/main", ticketNumber + "", ticketAttachmentId + "", fileName)}. Check this repo for the attachment.`)
              }
              catch (err) {
                console.log(`>>>>> ⚠️  Not downloadable..`)
                fs.appendFileSync(".not-downloadable-from-assembla", `${downloadUrl} ${join(dirPath, fileName)} Issue: ${gitHubIssueNumber}`);
              }
            }
          }

          console.log(`🥱  Waiting for a second before trying next issue...`)
          await timer(1000);
        }

        console.log(`🥱  Waiting for a second before trying page ${pageNumber}...`)
        await timer(1000);
      }
      else {
        break;
      }
    }

    console.log(`>> ✅  Space ${spaceName}...`)
  }
}

async function createRepoInGitHub(repoName: string) {
  const data = getGitHubData();
  //https://docs.github.com/en/free-pro-team@latest/rest/reference/repos
  const config = {
    headers: data.headers
  } as axios.AxiosRequestConfig;
  const successMessage = `😇  ${data.orgName}/${repoName} exists 🎉`;
  try {
    const issuesResponse = await Axios.post(encodeURI(`https://api.github.com/orgs/${data.orgName}/repos`), JSON.stringify({
      name: repoName,
      private: true
    }), config);
    if (issuesResponse.status == 201) {
      console.log(successMessage);
    }
  }
  catch (err) {
    if (err.response && err.response.status == 422) {
      console.log(successMessage);
    }
    else {
      console.log("🛑 creating repo failed")
      throw err
    }
  }
}

async function createIssueInGitHub(repoName: string, ticket: any) {
  repoName = repoName.replace(" ", "-");
  const data = getGitHubData();
  //https://docs.github.com/en/free-pro-team@latest/rest/reference/issues
  const config = {
    headers: data.headers
  } as axios.AxiosRequestConfig;
  const labels = [`status:${ticket["status"]}`, `id:${ticket["id"]}`];
  let payload = "";
  let attempts = 10;
  while (attempts > 0) {
    console.log(`creating issue retries left: ${attempts}`)
    try {
      const getIssueUrl = encodeURI(`https://api.github.com/repos/${data.orgName}/${repoName}/issues?labels=id:${ticket["id"]}`);
      const isExistingIssueResponse = await Axios.get(getIssueUrl, config);
      const existingIssue = isExistingIssueResponse.data as any;
      if (existingIssue.length > 0 && existingIssue[0]) {
        console.log(`😇  Ticket ${ticket["id"]}: https://github.com/${data.orgName}/${repoName}/issues/${existingIssue[0]["number"]} is already created 🎉`);
        return existingIssue[0]["number"];
      }
      else {
        payload = JSON.stringify({
          title: JSON.stringify("Ticket Id: " + ticket["id"] + " Number: " + ticket["number"] + " " + ticket["summary"]),
          body: JSON.stringify(ticket["description"]),
          labels: labels
        });
        const issuesResponse = await Axios.post(encodeURI(`https://api.github.com/repos/${data.orgName}/${repoName}/issues`), payload, config);
        console.log(`😇   Ticket ${ticket["id"]}: https://github.com/${data.orgName}/${repoName}/issues/${issuesResponse.data["number"]} is created 🎉`);
        return issuesResponse.data["number"];
      }
    }
    catch (err) {
      console.log(`creating issue retries left: ${attempts} failed...`)
      if (attempts == 1) {
        console.log(`🛑 creating issue for ticket:${ticket["id"]} failed`)
        console.log(payload)
        const dirPath = join(".failures", repoName, "create-issue");
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(join(dirPath, ticket["id"] + ""), payload)
        console.log(ticket)
      }
    }

    await timer(20000);
    attempts--;
  }
}

async function addCommentToIssueInGitHub(repoName: string, issueNumber: number, comment: string) {
  repoName = repoName.replace(" ", "-");
  const data = getGitHubData();
  //https://docs.github.com/en/free-pro-team@latest/rest/reference/issues
  const config = {
    headers: data.headers
  } as axios.AxiosRequestConfig;
  let attempts = 10;
  while (attempts > 0) {
    console.log(`adding comment to issue retries left: ${attempts}`)
    try {
      await Axios.post(encodeURI(`https://api.github.com/repos/${data.orgName}/${repoName}/issues/${issueNumber}/comments`), JSON.stringify({
        body: comment,
      }), config);
      console.log(`😇  https://github.com/${data.orgName}/${repoName}/issues/${issueNumber} is updated with comment 🎉`);
      return issueNumber;
    }
    catch (err) {
      console.log(`adding comment to issue retries left: ${attempts} failed`)
      if (attempts == 1) {
        console.log(`🛑 adding comment ${comment} to issue failed`)
        const dirPath = join(".failures", repoName, "comment-to-issue");
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(join(dirPath, issueNumber + ""), JSON.stringify({
          body: comment,
        }))
      }
    }

    await timer(20000);
    attempts--;
  }

}

async function run() {
  await parseAssembla();
}

run();
