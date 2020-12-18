require('dotenv').config();
var axios = require("axios");
var process_1 = require("process");
var fs = require("fs");
var path_1 = require("path");
var https = require("https");
var url_1 = require("url");
var Axios = axios.default;
var timer = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
function getAssemblaConfig() {
    var apiKey = process.env.ASSEMBLA_API_KEY;
    var apiSecret = process.env.ASSEMBLA_API_SECRET;
    if (!(apiKey || apiSecret)) {
        console.error("Need ASSEMBLA_API_KEY, ASSEMBLA_API_SECRET environment variable set. See https://articles.assembla.com/en/articles/998043-getting-started-with-assembla-developer-api");
    }
    return {
        apiKey: apiKey,
        apiSecret: apiSecret
    };
}
function getGitHubData() {
    var token = process.env.GITHUB_TOKEN;
    var orgName = process.env.GITHUB_ORG_NAME;
    if (!(token || orgName)) {
        console.error("Need GITHUB_TOKEN, GITHUB_ORG_NAME environment variable set. See https://github.com/settings/tokens");
    }
    return {
        token: token,
        orgName: orgName,
        headers: {
            //https://docs.github.com/en/free-pro-team@latest/rest/overview/resources-in-the-rest-api#authentication
            Authorization: "Bearer " + token
        }
    };
}
async;
function parseAssembla() {
    //https://articles.assembla.com/en/articles/998043-getting-started-with-assembla-developer-api
    var apiConfig = getAssemblaConfig();
    var config = {
        headers: {
            "X-Api-key": apiConfig.apiKey,
            "X-Api-secret": apiConfig.apiSecret
        }
    }, as = axios.AxiosRequestConfig;
    var githubData = getGitHubData();
    var spacesResponse = await, Axios, get = ("https://api.assembla.com/v1/spaces.json", config);
    var spaces = spacesResponse.data, as = [];
    console.log("> \uD83D\uDEF8  Got " + spaces.length + " assembla spaces to parse...");
    var doneSpaces = [];
    for (var spaceIndex = 0; spaceIndex < spaces.length; spaceIndex++) {
        var space = spaces[spaceIndex];
        var spaceId = space["id"];
        var spaceName = space["name"];
        console.log(">> \u2604\uFE0F  Space " + spaceName + "...");
        if (doneSpaces.indexOf((spaceName), as, string).toLowerCase())
             >= 0;
        {
            console.log(">> \u2705  Skipping space " + spaceName + "...");
            continue;
        }
        var ticketPageNumber = 1;
        while (true) {
            //https://api-docs.assembla.cc/content/ref/tickets_index.html
            var ticketsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/tickets.json?report=0&page=" + ticketPageNumber + "&per_page=100";
            var ticketsResponse = await, Axios_1, get_1 = (ticketsUrl, config);
            var tickets = ticketsResponse.data, as_1 = [];
            if (tickets && tickets.length > 0) {
                console.log(">>> \uD83C\uDF9F\uFE0F  Got " + tickets.length + " tickets " + ticketsUrl);
                ticketPageNumber++;
                var repoName = ("assembla_" + spaceName).replace(" ", "-");
                await;
                createRepoInGitHub(repoName);
                for (var ticketsIndex = 0; ticketsIndex < tickets.length; ticketsIndex++) {
                    var ticket = tickets[ticketsIndex];
                    var ticketNumber = ticket["number"];
                    var ticketSummary = ticket["summary"];
                    var gitHubIssueNumber = await, createIssueInGitHub_1 = (repoName, ticket);
                    if (!gitHubIssueNumber) {
                        console.error("⛔ GitHub issue isn't created!");
                        process_1.exit(0);
                    }
                    // https://api-docs.assembla.cc/content/ref/ticket_comments_index.html
                    var ticketCommentsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/tickets/" + ticketNumber + "/ticket_comments.json";
                    var ticketCommentsResponse = await, Axios_2, get_2 = (ticketCommentsUrl, config);
                    var ticketComments = ticketCommentsResponse.data, as_2 = [];
                    if (ticketComments.length > 0) {
                        console.log(">>>> \uD83D\uDCAC  Got " + ticketComments.length + " comments on ticket " + ticketNumber + " " + ticketSummary);
                        for (var ticketCommentIndex = 0; ticketCommentIndex < ticketComments.length; ticketCommentIndex++) {
                            var ticketComment = ticketComments[ticketCommentIndex];
                            var comment = ticketComment["comment"], as_3 = string;
                            if (comment && comment.trim()) {
                                await;
                                addCommentToIssueInGitHub(repoName, gitHubIssueNumber, comment);
                            }
                        }
                    }
                    // https://api-docs.assembla.cc/content/ref/tickets_attachments.html
                    var ticketAttachmentsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/tickets/" + ticketNumber + "/attachments.json";
                    var ticketAttachmentResponse = await, Axios_3, get_3 = (ticketAttachmentsUrl, config);
                    var ticketAttachments = ticketAttachmentResponse.data, as_4 = [];
                    if (ticketAttachments.length > 0) {
                        console.log(">>>> \uD83D\uDCC1  Got " + ticketAttachments.length + " attachments on ticket " + ticketNumber + " " + ticketSummary);
                        for (var ticketAttachmentsIndex = 0; ticketAttachmentsIndex < ticketAttachments.length; ticketAttachmentsIndex++) {
                            var ticketAttachment = ticketAttachments[ticketAttachmentsIndex];
                            var downloadUrl = ticketAttachment["url"];
                            var ticketAttachmentId = ticketAttachment["id"];
                            var fileName = ticketAttachment["filename"] || "unknownfilename";
                            var contentType = ticketAttachment["content-type"], as_5 = string;
                            console.log(">>>>> \uD83D\uDCC2  Got " + fileName + " attachment: " + downloadUrl);
                            var path = path_1.join(ticketNumber + "", ticketAttachmentId + "");
                            var dirPath = path_1.join(".content", "" + githubData.orgName, repoName, path);
                            var success = await, download_1 = (dirPath, downloadUrl, fileName, config);
                            if (success) {
                                console.log(">>>>> \u23EC  Downloaded, please push the downloaded folders, I will add this as a comment to issue..");
                                await;
                                addCommentToIssueInGitHub(repoName, gitHubIssueNumber, "AttachedPackage: \uD83D\uDCE6 " + path_1.join("https://github.com", githubData.orgName, as_5, string, repoName, "blob/main", ticketNumber + "", ticketAttachmentId + "", fileName) + ". Check this repo for the attachment.");
                            }
                            else {
                                console.log(">>>>> \u26A0\uFE0F  Not downloadable..");
                                fs.appendFileSync(".not-downloadable-from-assembla", downloadUrl + " " + path_1.join(dirPath, fileName) + " Issue: " + gitHubIssueNumber);
                            }
                        }
                    }
                    console.log("\uD83E\uDD71  Waiting for a second before trying next issue...");
                    await;
                    timer(1000);
                }
                console.log("\uD83E\uDD71  Waiting for a second before trying page " + ticketPageNumber + "...");
                await;
                timer(1000);
            }
            else {
                break;
            }
        }
        var documentPageNumber = 1;
        while (true) {
            //https://api-docs.assembla.cc/content/ref/documents_index.html
            var documentsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/documents.json?page=" + documentPageNumber + "&per_page=100";
            var documents = [];
            try {
                var documentsResponse = await, Axios_4, get_4 = (documentsUrl, config);
                documents = documentsResponse.data;
                as[];
            }
            catch (err) {
                console.log(">>> \u26A0\uFE0F  Failed to get " + documentsUrl);
            }
            if (documents && documents.length > 0) {
                console.log(">>> \uD83C\uDF9F\uFE0F  Got " + documents.length + " documents " + documentsUrl);
                documentPageNumber++;
                var repoName = ("assembla_" + spaceName).replace(" ", "-");
                for (var documentsIndex = 0; documentsIndex < documents.length; documentsIndex++) {
                    var document_1 = documents[documentsIndex];
                    var downloadUrl = document_1["url"];
                    var fileName = document_1["name"] || "unknownfilename";
                    console.log(">>>>> \uD83D\uDCC2  Got " + fileName + " attachment: " + downloadUrl);
                    var dirPath = path_1.join(".content", "" + githubData.orgName, repoName, "files");
                    var success = await, download_2 = (dirPath, downloadUrl, fileName, config);
                    if (success) {
                        console.log(">>>>> \u23EC  Downloaded, please push the downloaded folders");
                    }
                    else {
                        console.log(">>>>> \u26A0\uFE0F  Not downloadable..");
                        fs.appendFileSync(".not-downloadable-from-assembla", downloadUrl + " " + path_1.join(dirPath, fileName));
                    }
                    console.log("\uD83E\uDD71  Waiting for a second before trying next document...");
                    await;
                    timer(1000);
                }
                console.log("\uD83E\uDD71  Waiting for a second before trying page " + documentPageNumber + "...");
                await;
                timer(1000);
            }
            else {
                break;
            }
        }
        console.log(">> \u2705  Space " + spaceName + "...");
    }
}
async;
function download(dirPath, downloadUrl, fileName, config) {
    var success = true;
    await;
    new Promise(function (resolve) {
        fs.mkdirSync(dirPath, { recursive: true });
        var writeStream = fs.createWriteStream(path_1.join(dirPath, fileName));
        var urlType = new url_1.URL(downloadUrl);
        https.get({
            headers: config.headers,
            hostname: urlType.host,
            protocol: urlType.protocol,
            href: urlType.href,
            path: urlType.pathname
        }, function (response) {
            if (response.statusCode == 302) {
                console.log("Fetching from " + response.headers.location + "...");
                https.get(response.headers.location, as, string, function (contentResponse) {
                    contentResponse.pipe(writeStream);
                    writeStream.on('finish', resolve);
                });
            }
            else {
                console.error("Failed with response " + response.statusCode + " " + response.statusMessage);
                success = false;
                resolve(null);
            }
        });
    });
    return success;
}
async;
function createRepoInGitHub(repoName) {
    var data = getGitHubData();
    //https://docs.github.com/en/free-pro-team@latest/rest/reference/repos
    var config = {
        headers: data.headers
    }, as = axios.AxiosRequestConfig;
    var successMessage = "\uD83D\uDE07  " + data.orgName + "/" + repoName + " exists \uD83C\uDF89";
    try {
        var issuesResponse = await, Axios_5, post = (encodeURI("https://api.github.com/orgs/" + data.orgName + "/repos"), JSON.stringify({
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
            console.log("🛑 creating repo failed");
            throw err;
        }
    }
}
async;
function createIssueInGitHub(repoName, ticket) {
    repoName = repoName.replace(" ", "-");
    var data = getGitHubData();
    //https://docs.github.com/en/free-pro-team@latest/rest/reference/issues
    var config = {
        headers: data.headers
    }, as = axios.AxiosRequestConfig;
    var labels = [("status:" + ticket["status"]), ("id:" + ticket["id"])];
    var payload = "";
    var attempts = 10;
    while (attempts > 0) {
        console.log("creating issue retries left: " + attempts);
        try {
            var getIssueUrl = encodeURI("https://api.github.com/repos/" + data.orgName + "/" + repoName + "/issues?labels=id:" + ticket["id"]);
            var isExistingIssueResponse = await, Axios_6, get = (getIssueUrl, config);
            var existingIssue = isExistingIssueResponse.data, as_6 = any;
            if (existingIssue.length > 0 && existingIssue[0]) {
                console.log("\uD83D\uDE07  Ticket " + ticket["id"] + ": https://github.com/" + data.orgName + "/" + repoName + "/issues/" + existingIssue[0]["number"] + " is already created \uD83C\uDF89");
                return existingIssue[0]["number"];
            }
            else {
                payload = JSON.stringify({
                    title: JSON.stringify("Ticket Id: " + ticket["id"] + " Number: " + ticket["number"] + " " + ticket["summary"]),
                    body: JSON.stringify(ticket["description"]),
                    labels: labels
                });
                var issuesResponse = await, Axios_7, post = (encodeURI("https://api.github.com/repos/" + data.orgName + "/" + repoName + "/issues"), payload, config);
                console.log("\uD83D\uDE07   Ticket " + ticket["id"] + ": https://github.com/" + data.orgName + "/" + repoName + "/issues/" + issuesResponse.data["number"] + " is created \uD83C\uDF89");
                return issuesResponse.data["number"];
            }
        }
        catch (err) {
            console.log("creating issue retries left: " + attempts + " failed...");
            if (attempts == 1) {
                console.log("\uD83D\uDED1 creating issue for ticket:" + ticket["id"] + " failed");
                console.log(payload);
                var dirPath = path_1.join(".failures", repoName, "create-issue");
                fs.mkdirSync(dirPath, { recursive: true });
                fs.writeFileSync(path_1.join(dirPath, ticket["id"] + ""), payload);
                console.log(ticket);
            }
        }
        await;
        timer(20000);
        attempts--;
    }
}
async;
function addCommentToIssueInGitHub(repoName, issueNumber, comment) {
    repoName = repoName.replace(" ", "-");
    var data = getGitHubData();
    //https://docs.github.com/en/free-pro-team@latest/rest/reference/issues
    var config = {
        headers: data.headers
    }, as = axios.AxiosRequestConfig;
    var attempts = 10;
    while (attempts > 0) {
        console.log("adding comment to issue retries left: " + attempts);
        try {
            await;
            Axios.post(encodeURI("https://api.github.com/repos/" + data.orgName + "/" + repoName + "/issues/" + issueNumber + "/comments"), JSON.stringify({
                body: comment
            }), config);
            console.log("\uD83D\uDE07  https://github.com/" + data.orgName + "/" + repoName + "/issues/" + issueNumber + " is updated with comment \uD83C\uDF89");
            return issueNumber;
        }
        catch (err) {
            console.log("adding comment to issue retries left: " + attempts + " failed");
            if (attempts == 1) {
                console.log("\uD83D\uDED1 adding comment " + comment + " to issue failed");
                var dirPath = path_1.join(".failures", repoName, "comment-to-issue");
                fs.mkdirSync(dirPath, { recursive: true });
                fs.writeFileSync(path_1.join(dirPath, issueNumber + ""), JSON.stringify({
                    body: comment
                }));
            }
        }
        await;
        timer(20000);
        attempts--;
    }
}
async;
function run() {
    await;
    parseAssembla();
}
run();
