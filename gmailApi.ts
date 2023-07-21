import axios from "axios";
import {
  API_URL,
  API_URL_OAUTH2,
  REFRESH_TOKEN,
  classKeyIdentify,
  keyIdentify,
  listArrIndexNeed,
  pathCsv,
  sender,
} from "./constants";

var fs = require("fs"),
  fileStream;

// read file html and query data by class gmail_quote
var cheerio = require("cheerio");

// to get refresh token, follow this link: https://developers.google.com/oauthplayground/
// const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// Function to authenticate and get the access token
async function getAccessToken(): Promise<string> {
  const URL_REFRESH =
    "https://developers.google.com/oauthplayground/refreshAccessToken";
  // Your client ID, client secret, and refresh token
  const response = await axios.post(`${URL_REFRESH}`, {
    refresh_token: REFRESH_TOKEN,
    token_uri: "https://oauth2.googleapis.com/token",
  });
  return response.data.access_token;
}

// Function to get a list of emails
export async function getEmails(): Promise<any> {
  const accessToken = await getAccessToken();
  const query = `from:${sender}`;
  const responseList = await axios.get(
    `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      query
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (responseList.data.messages.length > 0) {
    responseList.data.messages.forEach(
      async (email: { id: string; threadId: string }, index: number) => {
        const response = await axios.get(
          `${API_URL}/gmail/v1/users/me/messages/${email.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // print into file
        if (response.data) {
          getEmailBody(email.id, response.data.payload);
        }
        if (index === responseList.data.messages.length - 1) {
          parseFile();
        }
      }
    );
  }

  return responseList.data.messages;
}

// Helper function to get email body from the payload
function getEmailBody(id: string, payload: any): void {
  console.log("Start writing to file" + id);
  const bodyData = payload.body.data || "";
  const parts = payload.parts || [];
  const bodyParts = parts.filter((part: any) => part.mimeType === "text/html");
  const part = bodyParts.length > 0 ? bodyParts[0] : null;

  if (!fs.existsSync("./results")) {
    fs.mkdirSync("./results");
  }
  // stream.pipe(fs.createWriteStream("msg-" + seqno + "-body.html"));
  // Create a write dataRes to save the decoded body

  let dataRes = "";
  if (part && part.body && part.body.data) {
    dataRes = Buffer.from(part.body.data, "base64").toString();
  } else {
    dataRes = Buffer.from(bodyData, "base64").toString();
  }

  // write data to file
  console.log("Start writing to file" + dataRes);
  fs.writeFileSync("./results/" + id + "-body.html", dataRes);

  console.log("Done writing to file" + id);
}

export const parseFile = async () => {
  await fs.readdir("./results", function (err: any, files: any) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    files.forEach(function (file: any) {
      const $ = cheerio.load(fs.readFileSync("./results/" + file));
      // console.log($(".gmail_quote").text());
      // find to table element and get list tr
      const listTr = $(classKeyIdentify).find("table").find("tr");

      // get data from tr[1]
      const tr1 = listTr[1];
      const td1 = $(tr1).find("td");
      const td1Text = $(td1).text();
      if (
        keyIdentify.filter((item: any) => td1Text.includes(item)).length > 0
      ) {
        console.log("td1Text", td1Text);
        // find and get data contain <b> if before is "ACB trân trọng thông báo tài khoản" or "Ghi nợ" or "Nội dung giao dịch:"
        const td1TextContainB = $(td1).find("b");
        console.log("data result", $(td1TextContainB).text());

        const td1TextContainBText = $(td1TextContainB).text();
        const listDataResult = listArrIndexNeed.map((item: any) => {
          return $(td1TextContainB[item]).text();
        });
        console.log("listDataResult", listDataResult);

        // create csv with header: account, debit and message
        const createCsvWriter = require("csv-writer").createObjectCsvWriter;
        const csvWriter = createCsvWriter({
          path: pathCsv,
          header: [
            { id: "account", title: "Số tài khoản" },
            { id: "debit", title: "Ghi nợ" },
            { id: "currency", title: "Đơn vị tiền tệ" },
            { id: "message", title: "Nội dung chuyển khoản" },
          ],
        });

        // input listDataResult into out.csv
        const data = [
          {
            account: listDataResult[0],
            debit: parseInt(listDataResult[1].split(" ")[0].replace(",", "")),
            currency: listDataResult[1].split(" ")[1],
            message: listDataResult[2],
          },
        ];
        csvWriter
          .writeRecords(data) // returns a promise
          .then(() => {
            console.log("...Done");
          });
      }
    });
  });
};
