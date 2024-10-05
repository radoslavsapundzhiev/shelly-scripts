const CONFIG = {
    SEND_EMAIL_VC: "button:200",
    API_URL: "https://sofiatraffic-proxy.onrender.com/virtual-board?stop_code=",
    INFO_VC: "text:202",
    STOP_CODE_VC: "text:203",
    BUS_VC: "text:204"
}

const sendEmailVc = Virtual.getHandle(CONFIG.SEND_EMAIL_VC);
const infoVc = Virtual.getHandle(CONFIG.INFO_VC);
const busVc = Virtual.getHandle(CONFIG.BUS_VC);
const stopCodeVc = Virtual.getHandle(CONFIG.STOP_CODE_VC);
const stopCode = stopCodeVc.getValue();
const URL = CONFIG.API_URL + stopCode;
const bus = Number(busVc.getValue());

function handle204Info(result, error_code, error_message) {
    if (error_code !== 0) {
        console.log(error_message);
        return;
    }
    const response = JSON.parse(result.body);
    const generated_at = response.generated_at;

    console.log(generated_at);

    for (let i = 0; i < response.routes.length; i++) {
        if (response.routes[i]["route_ref"] === bus) {
            const minutes = response.routes[i]["times"][0].t;
            console.log(minutes);
            const info = new Date((Math.ceil(new Date(generated_at).getTime() / 1000) + minutes * 60) * 1000);
            console.log(info);
            infoVc.setValue(String(info));
            break;
        }
    }
}

sendEmailVc.on("double_push", function(event) {
    Shelly.call("HTTP.GET", {"url": URL}, handle204Info);
});