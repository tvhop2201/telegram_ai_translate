import * as mailgun from 'mailgun-js';
const SibApiV3Sdk = require('@getbrevo/brevo');

export default class Email {
  static async sendEmail(
    to: string,
    subject: string,
    title: string,
    content: string,
    otp: string,
  ): Promise<any> {
    const template = this.template(title, content, otp);
    await Email.brevo(to, subject, template);
    return { status: true };
  }

  private static async mailGun(template, subject, to) {
    const mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    });
    mg.messages().send(
      {
        from: 'Live247 <contact@live247.ai>',
        subject: subject,
        text: subject,
        html: template,
        to: to,
      },
      function (error, body) {
        if (error) console.log('send email', error);
      },
    );
  }

  private static async brevo(to, subject, template) {
    try {
      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      let apiKey = apiInstance.authentications['apiKey'];
      apiKey.apiKey = process.env.BRAVO_API_KEY;

      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = template;
      sendSmtpEmail.sender = { email: 'contact@live247.ai', name: 'Live247' };
      sendSmtpEmail.to = [{ email: to }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      return true;
    } catch (e) {
      console.error('email:brevo : ', e || e);
    }
  }

  private static template(title: string, content: string, otp: string) {
    return `
    <!doctype html>
    <html lang="en-US">
    <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <title>${title}</title>
      <meta name="description" content="${title}">
      <style type="text/css">
        a:hover {
          text-decoration: underline !important;
        }
      </style>
    </head>
    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px;" leftmargin="0">
      <!--100% body table-->
      <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
          <td>
            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
              align="center" cellpadding="0" cellspacing="0">
              <tr>
                <td style="height:80px;">&nbsp;</td>
              </tr>
              <tr>
                <td style="text-align:center;">
                  <a href="https://rakeshmandal.com" title="logo" target="_blank">
                    <img width="140" src="https://s3-preview.gostream.co/5faad90894279678bdead436-4-2024/6614fa71dfae8392d5611b1a_merge/7a702f66dfc250a9e7c217368d76c044_jp2ijv_1712650865460.png" 
                    style="border-radius:15px" title="logo"
                      alt="logo">
                  </a>
                </td>
              </tr>
              <tr>
                <td style="height:20px;">&nbsp;</td>
              </tr>
              <tr>
                <td>
                  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                    <tr>
                      <td style="height:40px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="padding:0 35px;">
                        <h1
                          style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                          ${title}</h1>
                        <span
                          style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:200px;"></span>
                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                          ${content}
                        </p>
                        <h1 href="javascript:void(0);">${otp}</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="height:40px;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              <tr>
                <td style="height:20px;">&nbsp;</td>
              </tr>
              <tr>
                <td style="text-align:center;">
                  <p
                    style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                    &copy; Live247</strong></p>
                </td>
              </tr>
              <tr>
                <td style="height:80px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!--/100% body table-->
    </body>
    </html>
    `;
  }
}
