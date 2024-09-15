const CONFIG = {
    MESSAGE_VC: "text:200",
    MESSAGE_CONFIG_VC: "text:201",
    PUSH_NOTIFICATION_VC: "button:201"
  }
  
  let messageVc = Virtual.getHandle(CONFIG.MESSAGE_VC);
  let messageConfigVc = Virtual.getHandle(CONFIG.MESSAGE_CONFIG_VC);
  let pushNotificationVc = Virtual.getHandle(CONFIG.PUSH_NOTIFICATION_VC);
  
  let accountKey = "";
  const alertzyUrl = "https://alertzy.app/send";
  
  Shelly.call("KVS.GET", {key: "accountKey"}, function(result){
    accountKey = result.value;
  });
  
  function prepareMessage(message) {
    if (message) {
      return message.split(" ").join("%20");
    }
    return message;
  }
  
  function sendPushNotification(attrs) {
    let request = {
      url: alertzyUrl,
      content_type: "application/x-www-form-urlencoded",
      body:
        "accountKey=" +
        attrs.accountKey +
        "&title=" +
        attrs.title +
        "&message=" +
        attrs.message
      }
  
      Shelly.call("HTTP.POST", request, function (result) {
        console.log(JSON.parse(result.body));
      });
  }
  
  pushNotificationVc.on("single_push", function(event) {
    let message = messageVc.getValue();
    let messageConfig = JSON.parse(messageConfigVc.getValue());
    let attrs = {};
    attrs["accountKey"] = accountKey;
    attrs["title"] = messageConfig.subject;
    attrs["message"] = prepareMessage(message);
    sendPushNotification(attrs);
  });