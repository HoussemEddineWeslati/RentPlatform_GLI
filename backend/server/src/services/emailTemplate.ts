// src/services/emailTemplate.ts
/**
 * Generates the HTML content for the OTP verification email using your template.
 * @param {object} details - The details for the email.
 * @param {string} details.otp - The One-Time Password.
 * @param {string} details.email - The recipient's email address.
 * @param {string} details.appName - The name of your application.
 * @returns {string} The full HTML string for the email.
 */
export const getOtpVerificationHtml = ({ otp, email, appName }: { otp: string; email: string; appName: string }): string => {
  // CORRECTED: Use the GitHub RAW content URL for the image to display correctly in email clients.
  const mainImageUrl = "https://raw.githubusercontent.com/whoussem-e/my-app-assets/main/image-1.png";

  return `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Email Verification</title>
      <style type="text/css">
        @media only screen and (min-width: 620px) { .u-row { width: 600px !important; } .u-row .u-col { vertical-align: top; } .u-row .u-col-100 { width: 600px !important; } }
        @media (max-width: 620px) { .u-row-container { max-width: 100% !important; padding-left: 0px !important; padding-right: 0px !important; } .u-row .u-col { min-width: 320px !important; max-width: 100% !important; display: block !important; } .u-row { width: 100% !important; } .u-col > div { margin: 0 auto; } }
        body { margin: 0; padding: 0; }
        table, tr, td { vertical-align: top; border-collapse: collapse; }
        .ie-container table, .mso-container table { table-layout: fixed; }
        * { line-height: inherit; }
        a[x-apple-data-detectors='true'] { color: inherit !important; text-decoration: none !important; }
        table, td { color: #000000; } #u_body a { color: #0000ee; text-decoration: underline; }
      </style>
    <link href="https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap" rel="stylesheet" type="text/css">
  </head>
  <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ecf0f1;color: #000000">
    <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ecf0f1;width:100%" cellpadding="0" cellspacing="0">
    <tbody>
    <tr style="vertical-align: top">
      <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="background-color: #ffffff;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 15px solid #8d95ff;border-left: 15px solid #8d95ff;border-right: 15px solid #8d95ff;border-bottom: 15px solid #8d95ff;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="overflow-wrap:break-word;word-break:break-word;padding:25px 0px 10px;font-family:'Raleway',sans-serif;" align="center">
                           <h1 style="margin: 0px; color: #000000; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 26px; font-weight: 700;">
                            Email Verification
                           </h1>
                       </td>
                    </tr>
                  </tbody>
                </table>
                <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr><td style="overflow-wrap:break-word;word-break:break-word;padding:10px 0px;font-family:'Raleway',sans-serif;" align="left">
                      <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;">
                        <tbody><tr style="vertical-align: top"><td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;"><span>&#160;</span></td></tr></tbody>
                      </table>
                    </td></tr>
                  </tbody>
                </table>
                <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="overflow-wrap:break-word;word-break:break-word;padding:20px 40px 10px;font-family:'Raleway',sans-serif;" align="left">
                        <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                             <p style="line-height: 140%; margin: 0px;">Dear ${email},</p>
                             <br />
                             <p style="line-height: 140%; margin: 0px;">Welcome to ${appName}! Please use the following One-Time Password (OTP) to verify your account:</p>
                         </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                   <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                   <tbody>
                    <tr>
                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;" align="center">
                           <div style="font-size: 28px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 15px 25px; border-radius: 5px; display: inline-block;">
                            ${otp}
                           </div>
                       </td>
                    </tr>
                   </tbody>
                   </table>
                <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="overflow-wrap:break-word;word-break:break-word;padding:20px 40px 30px;font-family:'Raleway',sans-serif;" align="left">
                        <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                          <p style="line-height: 140%; margin: 0px;">For your security, this code will expire in 10 minutes.</p>
                            <br />
                          <p style="line-height: 140%; margin: 0px;"><em>If you didn't request this, you can safely ignore this email.</em></p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr><td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Raleway',sans-serif;" align="left">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px;padding-left: 0px;" align="center">
                        <img align="center" border="0" src="${mainImageUrl}" alt="Image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 90%;max-width: 540px;" width="540"/>
                      </td></tr></table>
                    </td></tr>
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="background-color: #8d95ff;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr><td style="overflow-wrap:break-word;word-break:break-word;padding:10px 100px 30px;font-family:'Raleway',sans-serif;" align="left">
                      <div style="font-size: 14px; color: #ffffff; line-height: 170%; text-align: center; word-wrap: break-word;">
                        <p style="font-size: 14px; line-height: 170%; margin: 0px;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                      </div>
                    </td></tr>
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </td>
    </tr>
    </tbody>
    </table>
  </body>
  </html>
  `;
};
