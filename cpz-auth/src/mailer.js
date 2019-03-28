import nodemailer from "nodemailer";
import mailgunTransport from "nodemailer-mailgun-transport";
import Log from "cpz/log";

const { MAILGUN_API, MAILGUN_DOMAIN } = process.env;

function sendCode(email, code) {
  const transporter = nodemailer.createTransport(
    mailgunTransport({
      auth: {
        api_key: MAILGUN_API,
        domain: MAILGUN_DOMAIN
      }
    })
  );

  transporter.sendMail(
    {
      from: '"Центр авторизации Cryptuoso " <iamrobot@cryptuoso.com>',
      to: email,
      subject: "Код подтверждения регистрации 👻", // Subject line
      html: `<table>
    <tr>
        <td>Код</td>
        <td>${code}</td>
    </tr>
</table>` // html body
    },
    error => {
      if (error) {
        Log.error(error);
      }
    }
  );
}

export { sendCode };
