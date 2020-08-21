const fs = require("fs");
const path = require("path");
const utils = require("util");
const puppeteer = require("puppeteer");
const hb = require("handlebars");
const readFile = utils.promisify(fs.readFile);

async function getTemplateHtml() {
  console.log("Loading template file in memory");
  try {
    const invoicePath = path.resolve("./invoice.html");
    return await readFile(invoicePath, "utf8");
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
}

async function generatePdf() {
  let data = {};
  getTemplateHtml()
    .then(async (res) => {
      // Now we have the html code of our template in res object
      // you can check by logging it on console
      // console.log(res)
      console.log("Compiing the template with handlebars");
      const template = hb.compile(res, { strict: true });
      // we have compile our code with handlebars
      const result = template(data);
      // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
      const html = result;
      // we are using headless mode
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      // We set the page content as the generated html by handlebars
      await page.setContent(html);
      // We use pdf function to generate the pdf in the same folder as this file.
      let path = getDirPath();
      await page.pdf({ path: path, format: "A4" });
      await browser.close();
      console.log("PDF Generated");
    })
    .catch((err) => {
      console.error(err);
    });
}

function getDirPath() {
  let dir = "public/uploads/pdf/shop_1/2020/08/21/";
  //   const fileName = "/bao_gia_20_08_21.pdf";
  const uuid = require("uuid");
  const fileName = uuid.v4() + ".pdf";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }

  return dir + fileName;
}
generatePdf();
