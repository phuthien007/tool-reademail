// contain key to identify email
const keyIdentify = [
  "ACB trân trọng thông báo tài khoản",
  "Ghi nợ",
  "Nội dung giao dịch:",
];
// contain index of data need to get
const listArrIndexNeed = [0, 3, 4];
// path to save csv file
const pathCsv = "./out.csv";
// class key to identify email need near to table element
const classKeyIdentify = ".gmail_quote";
// email to get data
const targetEmail = "@gmail.com";

var fs = require("fs"),
  fileStream;
const quotedPrintable = require("quoted-printable");
const iconv = require("iconv-lite");
var Imap = require("node-imap"),
  inspect = require("util").inspect;

// get list mail and save it to html file
var imap = new Imap({
  user: "@gmail.com",
  password: "",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
});

function openInbox(cb: any) {
  imap.openBox("INBOX", true, cb);
}

imap.once("ready", function () {
  openInbox(function (err: any, box: any) {
    if (err) throw err;
    imap.search(
      ["ALL", ["FROM", targetEmail]],
      function (err: any, results: any) {
        if (err) throw err;
        console.log("results", results);
        var f = imap.fetch(results, {
          bodies: ["HEADER.FIELDS (FROM)", "TEXT"],
        });
        f.on("message", function (msg: any, seqno: any) {
          console.log("Message #%d", seqno);
          var prefix = "(#" + seqno + ") ";
          msg.on("body", function (stream: any, info: any) {
            console.log(prefix + "Body");
            // check results folder is exist
            if (!fs.existsSync("./results")) {
              fs.mkdirSync("./results");
            }
            // stream.pipe(fs.createWriteStream("msg-" + seqno + "-body.html"));
            // Create a write stream to save the decoded body
            const writeStream = fs.createWriteStream(
              "./results/" + "msg-" + seqno + "-body.html"
            );

            // Handle encoding if necessary
            if (info.which === "TEXT") {
              const chunks = [] as any[];
              // split the stream into chunks and decode each chunk if necessary
              stream.on("data", function (chunk: any) {
                chunks.push(chunk);
              });

              stream.on("end", function () {
                const body = Buffer.concat(chunks).toString();
                let decodedBody = body;
                // If the encoding is quoted-printable, we need to decode it
                const decodedBuffer = Buffer.from(
                  quotedPrintable.decode(body.toString()),
                  "binary"
                );
                decodedBody = iconv.decode(decodedBuffer, "utf-8");
                // write data to file
                writeStream.write(decodedBody);
                writeStream.end();
              });
            } else {
              // If no encoding specified, simply pipe the stream to the write stream
              stream.pipe(writeStream);
            }
          });
          msg.once("attributes", function (attrs: any) {
            console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
          });
          msg.once("end", function () {
            console.log(prefix + "Finished");
          });
        });
        f.once("error", function (err: any) {
          console.log("Fetch error: " + err);
        });
        f.once("end", function () {
          console.log("Done fetching all messages!");
          imap.end();
        });
      }
    );
    // var f = imap.seq.fetch(box.messages.total + ":1", {
    //   bodies: ["HEADER.FIELDS (FROM)", "TEXT"],
    // });
    // f.on("message", function (msg: any, seqno: any) {
    //   console.log("Message #%d", seqno);
    //   var prefix = "(#" + seqno + ") ";
    //   msg.on("body", function (stream: any, info: any) {
    //     console.log("info.which", info);
    //     if (info.which === "TEXT")
    //       console.log(
    //         prefix + "Body [%s] found, %d total bytes",
    //         inspect(info.which),
    //         info.size
    //       );
    //     var buffer = "",
    //       count = 0;
    //     stream.on("data", function (chunk: any) {
    //       count += chunk.length;
    //       buffer += chunk.toString("utf8");
    //       if (info.which === "TEXT")
    //         console.log(
    //           prefix + "Body [%s] (%d/%d)",
    //           inspect(info.which),
    //           count,
    //           info.size
    //         );
    //     });
    //     stream.once("end", function () {
    //       if (info.which !== "TEXT")
    //         console.log(
    //           prefix + "Parsed header: %s",
    //           inspect(Imap.parseHeader(buffer))
    //         );
    //       else console.log(prefix + "Body [%s] Finished", inspect(info.which));
    //     });
    //   });
    //   msg.once("attributes", function (attrs: any) {
    //     console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
    //   });
    //   msg.once("end", function () {
    //     console.log(prefix + "Finished");
    //   });
    // });
    // f.once("error", function (err: any) {
    //   console.log("Fetch error: " + err);
    // });
    // f.once("end", function () {
    //   console.log("Done fetching all messages!");
    //   imap.end();
    // });
  });
});

imap.once("error", function (err: any) {
  console.log(err);
});

imap.once("end", function () {
  console.log("Connection ended");
  parseFile();
});
// start connect and get email, save to file
// imap.connect();

// read file html and query data by class gmail_quote
var cheerio = require("cheerio");

imap.connect();

const parseFile = async () => {
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
        const listDataResult = listArrIndexNeed.map((item) => {
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
