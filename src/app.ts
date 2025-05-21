import Fastify from "fastify";
const axios = require("axios");

const server = Fastify();

server.get("/ping", async (request, reply) => {
    return { message: "Server is alive!" };
});

server.post("/submit", async (request, reply) => {
    console.log("🚀 ~ server.post ~ request:", request);
    const data: any = request.body;
    sendDataToSlack(data);
    return {
        message: "Data received",
        received: data,
        challenge: data.challenge,
    };
});

function sendDataToSlack(data: Object) {
    axios
        .post(
            "https://hooks.slack.com/services/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",
            {
                text: JSON.stringify(data),
            }
        )
        .then((response: any) => {
            console.log("Response:", response.data);
        })
        .catch((error: any) => {
            console.error("Error:", error.response?.data || error.message);
        });
}

const port = Number(process.env.PORT || 3000);

server.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
