import { getEmails, parseFile } from "./gmailApi";

async function main() {
  try {
    const emails = await getEmails();
    console.log(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
}

main();
