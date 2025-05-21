import Fastify from "fastify";
const { App, say } = require("@slack/bolt");
import { searchXmlItems } from "./source";

// Initializes your app with your bot token and signing secret
const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
    // Start your app
    await slackApp.start(4000);
    slackApp.logger.info("⚡️ Bolt app is running!");
})();

const server = Fastify();
const YOUR_CHANNEL_ID = "C08SYMKDQT1";
server.get("/ping", async (request, reply) => {
    return { message: "Server is alive!" };
});

server.post("/submit", async (request: any, reply) => {
    console.log("🚀 ~ server.post ~ request:", request);
    const event = request.body.event;
    const userId: string = event.user;
    const rawText: string = event.text;
    const cleanText = rawText.replace("<@U08TFACE9TN>", "");
    try {
        const results = await searchXmlItems(
            "src/SearchRequest.xml",
            cleanText
        );
        sendMessage(YOUR_CHANNEL_ID, { userId, results });
    } catch (error) {
        console.error("Search error:", error);
    }
});

async function sendMessage(channelId: string, data: any) {
    try {
        const userId = data?.userId;
        const results = data?.results;

        // Format message as text block
        const formattedTickets = results
            .map((ticket: any, index: number) => {
                const assignee = ticket.assignee?.[""] || "Unassigned";
                return (
                    `*${index + 1}. <${ticket.link}|${
                        ticket.originalTitle
                    }>*\n` +
                    `   • *Match Score:* ${ticket.matchScore}\n` +
                    `   • *Summary:* ${ticket.summary}\n` +
                    `   • *Assignee:* ${assignee}\n`
                );
            })
            .join("\n");

        const message = `<@${userId}> Here are the top matched Jira tickets:\n\n${formattedTickets}`;

        await slackApp.client.chat.postMessage({
            channel: channelId,
            text: message,
            mrkdwn: true, // enable markdown formatting
        });

        console.log(`Message sent to channel ${channelId}`);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

const port = Number(process.env.PORT || 3000);

server.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
