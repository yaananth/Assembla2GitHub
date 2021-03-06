"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var axios = __importStar(require("axios"));
var process_1 = require("process");
var fs = __importStar(require("fs"));
var path_1 = require("path");
var https = __importStar(require("https"));
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
function parseAssembla() {
    return __awaiter(this, void 0, void 0, function () {
        var apiConfig, config, githubData, spacesResponse, spaces, doneSpaces, spaceIndex, space, spaceId, spaceName, ticketPageNumber, ticketsUrl, ticketsResponse, tickets, repoName, ticketsIndex, ticket, ticketNumber, ticketSummary, gitHubIssueNumber, ticketCommentsUrl, ticketCommentsResponse, ticketComments, ticketCommentIndex, ticketComment, comment, ticketAttachmentsUrl, ticketAttachmentResponse, ticketAttachments, ticketAttachmentsIndex, ticketAttachment, downloadUrl, ticketAttachmentId, fileName, contentType, path, dirPath, success, documentPageNumber, documentsUrl, documents, documentsResponse, err_1, repoName, documentsIndex, document_1, downloadUrl, fileName, dirPath, success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiConfig = getAssemblaConfig();
                    config = {
                        headers: {
                            "X-Api-key": apiConfig.apiKey,
                            "X-Api-secret": apiConfig.apiSecret
                        }
                    };
                    githubData = getGitHubData();
                    return [4 /*yield*/, Axios.get("https://api.assembla.com/v1/spaces.json", config)];
                case 1:
                    spacesResponse = _a.sent();
                    spaces = spacesResponse.data;
                    console.log("> \uD83D\uDEF8  Got " + spaces.length + " assembla spaces to parse...");
                    doneSpaces = [];
                    spaceIndex = 0;
                    _a.label = 2;
                case 2:
                    if (!(spaceIndex < spaces.length)) return [3 /*break*/, 42];
                    space = spaces[spaceIndex];
                    spaceId = space["id"];
                    spaceName = space["name"];
                    console.log(">> \u2604\uFE0F  Space " + spaceName + "...");
                    if (doneSpaces.indexOf(spaceName.toLowerCase()) >= 0) {
                        console.log(">> \u2705  Skipping space " + spaceName + "...");
                        return [3 /*break*/, 41];
                    }
                    ticketPageNumber = 1;
                    _a.label = 3;
                case 3:
                    if (!true) return [3 /*break*/, 26];
                    ticketsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/tickets.json?report=0&page=" + ticketPageNumber + "&per_page=100";
                    return [4 /*yield*/, Axios.get(ticketsUrl, config)];
                case 4:
                    ticketsResponse = _a.sent();
                    tickets = ticketsResponse.data;
                    if (!(tickets && tickets.length > 0)) return [3 /*break*/, 24];
                    console.log(">>> \uD83C\uDF9F\uFE0F  Got " + tickets.length + " tickets " + ticketsUrl);
                    ticketPageNumber++;
                    repoName = ("assembla_" + spaceName).replace(" ", "-");
                    return [4 /*yield*/, createRepoInGitHub(repoName)];
                case 5:
                    _a.sent();
                    ticketsIndex = 0;
                    _a.label = 6;
                case 6:
                    if (!(ticketsIndex < tickets.length)) return [3 /*break*/, 22];
                    ticket = tickets[ticketsIndex];
                    ticketNumber = ticket["number"];
                    ticketSummary = ticket["summary"];
                    return [4 /*yield*/, createIssueInGitHub(repoName, ticket)];
                case 7:
                    gitHubIssueNumber = _a.sent();
                    if (!gitHubIssueNumber) {
                        console.error("⛔ GitHub issue isn't created!");
                        process_1.exit(0);
                    }
                    ticketCommentsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/tickets/" + ticketNumber + "/ticket_comments.json";
                    return [4 /*yield*/, Axios.get(ticketCommentsUrl, config)];
                case 8:
                    ticketCommentsResponse = _a.sent();
                    ticketComments = ticketCommentsResponse.data;
                    if (!(ticketComments.length > 0)) return [3 /*break*/, 12];
                    console.log(">>>> \uD83D\uDCAC  Got " + ticketComments.length + " comments on ticket " + ticketNumber + " " + ticketSummary);
                    ticketCommentIndex = 0;
                    _a.label = 9;
                case 9:
                    if (!(ticketCommentIndex < ticketComments.length)) return [3 /*break*/, 12];
                    ticketComment = ticketComments[ticketCommentIndex];
                    comment = ticketComment["comment"];
                    if (!(comment && comment.trim())) return [3 /*break*/, 11];
                    return [4 /*yield*/, addCommentToIssueInGitHub(repoName, gitHubIssueNumber, comment)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    ticketCommentIndex++;
                    return [3 /*break*/, 9];
                case 12:
                    ticketAttachmentsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/tickets/" + ticketNumber + "/attachments.json";
                    return [4 /*yield*/, Axios.get(ticketAttachmentsUrl, config)];
                case 13:
                    ticketAttachmentResponse = _a.sent();
                    ticketAttachments = ticketAttachmentResponse.data;
                    if (!(ticketAttachments.length > 0)) return [3 /*break*/, 19];
                    console.log(">>>> \uD83D\uDCC1  Got " + ticketAttachments.length + " attachments on ticket " + ticketNumber + " " + ticketSummary);
                    ticketAttachmentsIndex = 0;
                    _a.label = 14;
                case 14:
                    if (!(ticketAttachmentsIndex < ticketAttachments.length)) return [3 /*break*/, 19];
                    ticketAttachment = ticketAttachments[ticketAttachmentsIndex];
                    downloadUrl = ticketAttachment["url"];
                    ticketAttachmentId = ticketAttachment["id"];
                    fileName = ticketAttachment["filename"] || "unknownfilename";
                    contentType = ticketAttachment["content-type"];
                    console.log(">>>>> \uD83D\uDCC2  Got " + fileName + " attachment: " + downloadUrl);
                    path = path_1.join(ticketNumber + "", ticketAttachmentId + "");
                    dirPath = path_1.join(".content", "" + githubData.orgName, repoName, path);
                    return [4 /*yield*/, download(dirPath, downloadUrl, fileName, config)];
                case 15:
                    success = _a.sent();
                    if (!success) return [3 /*break*/, 17];
                    console.log(">>>>> \u23EC  Downloaded, please push the downloaded folders, I will add this as a comment to issue..");
                    return [4 /*yield*/, addCommentToIssueInGitHub(repoName, gitHubIssueNumber, "AttachedPackage: \uD83D\uDCE6 " + path_1.join("https://github.com", githubData.orgName, repoName, "blob/main", ticketNumber + "", ticketAttachmentId + "", fileName) + ". Check this repo for the attachment.")];
                case 16:
                    _a.sent();
                    return [3 /*break*/, 18];
                case 17:
                    console.log(">>>>> \u26A0\uFE0F  Not downloadable..");
                    fs.appendFileSync(".not-downloadable-from-assembla", downloadUrl + " " + path_1.join(dirPath, fileName) + " Issue: " + gitHubIssueNumber);
                    _a.label = 18;
                case 18:
                    ticketAttachmentsIndex++;
                    return [3 /*break*/, 14];
                case 19:
                    console.log("\uD83E\uDD71  Waiting for a second before trying next issue...");
                    return [4 /*yield*/, timer(1000)];
                case 20:
                    _a.sent();
                    _a.label = 21;
                case 21:
                    ticketsIndex++;
                    return [3 /*break*/, 6];
                case 22:
                    console.log("\uD83E\uDD71  Waiting for a second before trying page " + ticketPageNumber + "...");
                    return [4 /*yield*/, timer(1000)];
                case 23:
                    _a.sent();
                    return [3 /*break*/, 25];
                case 24: return [3 /*break*/, 26];
                case 25: return [3 /*break*/, 3];
                case 26:
                    documentPageNumber = 1;
                    _a.label = 27;
                case 27:
                    if (!true) return [3 /*break*/, 40];
                    documentsUrl = "https://api.assembla.com/v1/spaces/" + spaceId + "/documents.json?page=" + documentPageNumber + "&per_page=100";
                    documents = [];
                    _a.label = 28;
                case 28:
                    _a.trys.push([28, 30, , 31]);
                    return [4 /*yield*/, Axios.get(documentsUrl, config)];
                case 29:
                    documentsResponse = _a.sent();
                    documents = documentsResponse.data;
                    return [3 /*break*/, 31];
                case 30:
                    err_1 = _a.sent();
                    console.log(">>> \u26A0\uFE0F  Failed to get " + documentsUrl);
                    return [3 /*break*/, 31];
                case 31:
                    if (!(documents && documents.length > 0)) return [3 /*break*/, 38];
                    console.log(">>> \uD83C\uDF9F\uFE0F  Got " + documents.length + " documents " + documentsUrl);
                    documentPageNumber++;
                    repoName = ("assembla_" + spaceName).replace(" ", "-");
                    documentsIndex = 0;
                    _a.label = 32;
                case 32:
                    if (!(documentsIndex < documents.length)) return [3 /*break*/, 36];
                    document_1 = documents[documentsIndex];
                    downloadUrl = document_1["url"];
                    fileName = document_1["name"] || "unknownfilename";
                    console.log(">>>>> \uD83D\uDCC2  Got " + fileName + " attachment: " + downloadUrl);
                    dirPath = path_1.join(".content", "" + githubData.orgName, repoName, "files");
                    return [4 /*yield*/, download(dirPath, downloadUrl, fileName, config)];
                case 33:
                    success = _a.sent();
                    if (success) {
                        console.log(">>>>> \u23EC  Downloaded, please push the downloaded folders");
                    }
                    else {
                        console.log(">>>>> \u26A0\uFE0F  Not downloadable..");
                        fs.appendFileSync(".not-downloadable-from-assembla", downloadUrl + " " + path_1.join(dirPath, fileName));
                    }
                    console.log("\uD83E\uDD71  Waiting for a second before trying next document...");
                    return [4 /*yield*/, timer(1000)];
                case 34:
                    _a.sent();
                    _a.label = 35;
                case 35:
                    documentsIndex++;
                    return [3 /*break*/, 32];
                case 36:
                    console.log("\uD83E\uDD71  Waiting for a second before trying page " + documentPageNumber + "...");
                    return [4 /*yield*/, timer(1000)];
                case 37:
                    _a.sent();
                    return [3 /*break*/, 39];
                case 38: return [3 /*break*/, 40];
                case 39: return [3 /*break*/, 27];
                case 40:
                    console.log(">> \u2705  Space " + spaceName + "...");
                    _a.label = 41;
                case 41:
                    spaceIndex++;
                    return [3 /*break*/, 2];
                case 42: return [2 /*return*/];
            }
        });
    });
}
function download(dirPath, downloadUrl, fileName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    success = true;
                    return [4 /*yield*/, new Promise(function (resolve) {
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
                                    https.get(response.headers.location, function (contentResponse) {
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
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, success];
            }
        });
    });
}
function createRepoInGitHub(repoName) {
    return __awaiter(this, void 0, void 0, function () {
        var data, config, successMessage, issuesResponse, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = getGitHubData();
                    config = {
                        headers: data.headers
                    };
                    successMessage = "\uD83D\uDE07  " + data.orgName + "/" + repoName + " exists \uD83C\uDF89";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Axios.post(encodeURI("https://api.github.com/orgs/" + data.orgName + "/repos"), JSON.stringify({
                            name: repoName,
                            private: true
                        }), config)];
                case 2:
                    issuesResponse = _a.sent();
                    if (issuesResponse.status == 201) {
                        console.log(successMessage);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    if (err_2.response && err_2.response.status == 422) {
                        console.log(successMessage);
                    }
                    else {
                        console.log("🛑 creating repo failed");
                        throw err_2;
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createIssueInGitHub(repoName, ticket) {
    return __awaiter(this, void 0, void 0, function () {
        var data, config, labels, payload, attempts, getIssueUrl, isExistingIssueResponse, existingIssue, issuesResponse, err_3, dirPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    repoName = repoName.replace(" ", "-");
                    data = getGitHubData();
                    config = {
                        headers: data.headers
                    };
                    labels = ["status:" + ticket["status"], "id:" + ticket["id"]];
                    payload = "";
                    attempts = 10;
                    _a.label = 1;
                case 1:
                    if (!(attempts > 0)) return [3 /*break*/, 10];
                    console.log("creating issue retries left: " + attempts);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    getIssueUrl = encodeURI("https://api.github.com/repos/" + data.orgName + "/" + repoName + "/issues?labels=id:" + ticket["id"]);
                    return [4 /*yield*/, Axios.get(getIssueUrl, config)];
                case 3:
                    isExistingIssueResponse = _a.sent();
                    existingIssue = isExistingIssueResponse.data;
                    if (!(existingIssue.length > 0 && existingIssue[0])) return [3 /*break*/, 4];
                    console.log("\uD83D\uDE07  Ticket " + ticket["id"] + ": https://github.com/" + data.orgName + "/" + repoName + "/issues/" + existingIssue[0]["number"] + " is already created \uD83C\uDF89");
                    return [2 /*return*/, existingIssue[0]["number"]];
                case 4:
                    payload = JSON.stringify({
                        title: JSON.stringify("Ticket Id: " + ticket["id"] + " Number: " + ticket["number"] + " " + ticket["summary"]),
                        body: JSON.stringify(ticket["description"]),
                        labels: labels
                    });
                    return [4 /*yield*/, Axios.post(encodeURI("https://api.github.com/repos/" + data.orgName + "/" + repoName + "/issues"), payload, config)];
                case 5:
                    issuesResponse = _a.sent();
                    console.log("\uD83D\uDE07   Ticket " + ticket["id"] + ": https://github.com/" + data.orgName + "/" + repoName + "/issues/" + issuesResponse.data["number"] + " is created \uD83C\uDF89");
                    return [2 /*return*/, issuesResponse.data["number"]];
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_3 = _a.sent();
                    console.log("creating issue retries left: " + attempts + " failed...");
                    if (attempts == 1) {
                        console.log("\uD83D\uDED1 creating issue for ticket:" + ticket["id"] + " failed");
                        console.log(payload);
                        dirPath = path_1.join(".failures", repoName, "create-issue");
                        fs.mkdirSync(dirPath, { recursive: true });
                        fs.writeFileSync(path_1.join(dirPath, ticket["id"] + ""), payload);
                        console.log(ticket);
                    }
                    return [3 /*break*/, 8];
                case 8: return [4 /*yield*/, timer(20000)];
                case 9:
                    _a.sent();
                    attempts--;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function addCommentToIssueInGitHub(repoName, issueNumber, comment) {
    return __awaiter(this, void 0, void 0, function () {
        var data, config, attempts, err_4, dirPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    repoName = repoName.replace(" ", "-");
                    data = getGitHubData();
                    config = {
                        headers: data.headers
                    };
                    attempts = 10;
                    _a.label = 1;
                case 1:
                    if (!(attempts > 0)) return [3 /*break*/, 7];
                    console.log("adding comment to issue retries left: " + attempts);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, Axios.post(encodeURI("https://api.github.com/repos/" + data.orgName + "/" + repoName + "/issues/" + issueNumber + "/comments"), JSON.stringify({
                            body: comment,
                        }), config)];
                case 3:
                    _a.sent();
                    console.log("\uD83D\uDE07  https://github.com/" + data.orgName + "/" + repoName + "/issues/" + issueNumber + " is updated with comment \uD83C\uDF89");
                    return [2 /*return*/, issueNumber];
                case 4:
                    err_4 = _a.sent();
                    console.log("adding comment to issue retries left: " + attempts + " failed");
                    if (attempts == 1) {
                        console.log("\uD83D\uDED1 adding comment " + comment + " to issue failed");
                        dirPath = path_1.join(".failures", repoName, "comment-to-issue");
                        fs.mkdirSync(dirPath, { recursive: true });
                        fs.writeFileSync(path_1.join(dirPath, issueNumber + ""), JSON.stringify({
                            body: comment,
                        }));
                    }
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, timer(20000)];
                case 6:
                    _a.sent();
                    attempts--;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseAssembla()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run();
