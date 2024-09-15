const CONFIG = {
    MESSAGE_VC: "text:200",
    MESSAGE_CONFIG_VC: "text:201",
    SEND_EMAIL_VC: "button:200"
  }
  
  let messageVc = Virtual.getHandle(CONFIG.MESSAGE_VC);
  let messageConfigVc = Virtual.getHandle(CONFIG.MESSAGE_CONFIG_VC);
  let sendEmailVc = Virtual.getHandle(CONFIG.SEND_EMAIL_VC);
  
  let apiKey = "";
  
  Shelly.call("KVS.GET", {key: "brevo-api-key"}, function(result) {
    apiKey = result.value;
  });
  
  function sendEmailNotification(from, to, subject, message) {
      let apiUrl = "https://api.brevo.com/v3/smtp/email";
      let headers = {
          "api-key": apiKey,
      };
  
      let body = {
          sender: {
              name: from, // Name of the sender
              email: from, // Email of the sender
          },
          // email can be sent to multiple emails
          to: [
              {
                  name: to, // Name of second receiver
                  email: to, // Email of second receiver
              },
          ],
          subject: subject,
          htmlContent: message
      };
  
      Shelly.call(
          "HTTP.Request",
          {
              method: "POST",
              url: apiUrl,
              headers: headers,
              body: body,
          },
          function (result, errorCode, errorMessage) {
              if (errorCode === 0) {
                  console.log("Successfully sent email. Result is:", result.body);
              } else {
                  console.log("There was an error sending the email:", errorMessage);
              }
          }
      );
  };
  
  sendEmailVc.on("single_push", function(event) {
    let message = messageVc.getValue();
    let messageConfig = JSON.parse(messageConfigVc.getValue());
    sendEmailNotification(messageConfig.from, messageConfig.to, messageConfig.subject, message);
  });