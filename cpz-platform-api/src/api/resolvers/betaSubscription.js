import ServiceError from "cpz/error";
import Log from "cpz/log";
import Mailer from "cpz/mailer";

const emailReqex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

async function subscribeToBeta(_, { email }) {
  try {
    if (!emailReqex.test(email)) {
      return {
        success: false,
        error: {
          name: ServiceError.types.VALIDATION_ERROR,
          message: "Invalid email format"
        }
      };
    }

    let exist = false;
    try {
      await Mailer.addToList({
        subscribed: true,
        address: email
      });
    } catch (e) {
      if (e.message.includes("Address already exists")) exist = true;
      else throw e;
    }
    if (!exist) {
      await Mailer.send({
        to: email,
        subject: "🚀 Cryptuoso - Early access subscription confirmation.",
        html: `<p>Greetings!</p>
            <p>You are successfully subscribed to our <b>beta</b> early access list! 🚀🚀🚀 </p>
            <p>We will notify you about the most important updates and beta launch date.</p></br>
            <p>Please complete our <b><a href="https://forms.gle/fMThy2t9n6yZD9SZ7">survey ✅</a></b>, to help us improve our service for you.</p></br>
            <p>Follow our signals on <a href="https://t.me/cryptuoso">Telegram</a>, <a href="https://www.instagram.com/cryptuoso/">Instagram</a> or <a href="https://www.tradingview.com/u/algammon/#published-charts">Tradingview</a>.</p></br>
            <p><a href="https://cryptuoso.com">Cryptuoso</a> Team. 🤖</p>`
      });
    }
    Log.clearContext();
    return {
      success: true
    };
  } catch (e) {
    Log.clearContext();
    const error =
      e instanceof ServiceError
        ? e
        : new ServiceError(
            { name: ServiceError.types.API_ERROR, cause: e },
            "Failed to subscribe to beta."
          );
    return {
      success: false,
      error: error.json
    };
  }
}

export default subscribeToBeta;
