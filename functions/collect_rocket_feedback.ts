import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

const RESPONSE_ACTION_ID = "response_action";

export const GetRocketFeedbackDefinition = DefineFunction({
  callback_id: "collect_rocket_feedback",
  title: "Collect Rocket Feedback",
  description:
    "Asks emoji-reactor why the comment was interesting and posts their feedback to the team channel",
  source_file: "functions/collect_rocket_feedback.ts",
  input_parameters: {
    properties: {
      commenter_slack_user_id: {
        type: Schema.types.string,
        description: "The user who wrote the PR comment",
      },
      astronaut_slack_user_id: {
        type: Schema.types.string,
        description: "The user who reacted to the PR comment",
      },
      comment_url: {
        type: Schema.types.string,
        description: "Contents of the review comment",
      },
      comment_contents: {
        type: Schema.types.string,
        description: "URL of the review comment",
      },
      team_channel_id: {
        type: Schema.types.string,
        description: "Channel for posting the review highlight",
      },
    },
    required: [
      "commenter_slack_user_id",
      "astronaut_slack_user_id",
      "comment_url",
      "comment_contents",
      "team_channel_id",
    ],
  },
  output_parameters: {
    properties: {
      astronautFeedback: {
        type: Schema.types.string,
        description: "Comments from the emoji-reactor",
      },
    },
    required: ["astronautFeedback"],
  },
});

export default SlackFunction(
  GetRocketFeedbackDefinition,
  async ({ inputs, client }) => {
    const infoText =
      `Thanks for highlighting ${inputs.astronaut_slack_user_id}'s <${inputs.comment_url}|review comment>!  What was so great about it?  What did you learn?`;

    const response = await client.chat.postMessage({
      channel: inputs.astronaut_slack_user_id || "",
      blocks: [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": ":rocket: Prepare for liftoff! :rocket:",
            "emoji": true,
          },
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": infoText,
          },
        },
        {
          "dispatch_action": true,
          "type": "input",
          "element": {
            "type": "plain_text_input",
            "action_id": RESPONSE_ACTION_ID,
            "multiline": true,
            "dispatch_action_config": {
              "trigger_actions_on": [
                "on_enter_pressed",
              ],
            },
          },
          "label": {
            "type": "plain_text",
            "text": "Your Take...",
            "emoji": true,
          },
        },
      ],
    });

    if (!response.ok) {
      console.log("Error during request chat.postMessage!", response.error);
    }
    return {
      completed: false,
    };
  },
  // ).addBlockActionsHandler(
  //   [RESPONSE_ACTION_ID],
  //   async function ({ action, body, client }) {
  //     const msgUpdate = await client.chat.update({
  //       channel: body.container.channel_id,
  //       ts: body.container.message_ts,
  //       blocks: [{
  //         "type": "context",
  //         "elements": [
  //           {
  //             "type": "plain_text",
  //             "text": "done!",
  //             "emoji": true,
  //           },
  //         ],
  //       }],
  //     });
  //     if (!msgUpdate.ok) {
  //       console.log("Error during manager chat.update!", msgUpdate.error);
  //     }

  //     const astronaut = await client.users.info({
  //       user: body.function_data.inputs.astronaut_slack_user_id,
  //     });
  //     const commenter = await client.users.info({
  //       user: body.function_data.inputs.commenter_slack_user_id,
  //     });
  //     console.log("astronaut", astronaut);

  //     const teamText =
  //       `@${astronaut.user.name} highlighted @${commenter.user.name}'s <www.google.com|review comment>!`;

  //     const response = await client.chat.postMessage({
  //       channel: body.function_data.inputs.team_channel_id || "",
  //       blocks: [
  //         {
  //           "type": "header",
  //           "text": {
  //             "type": "plain_text",
  //             "text": ":rocket: Rocket Watch! :rocket:",
  //             "emoji": true,
  //           },
  //         },
  //         {
  //           "type": "section",
  //           "text": {
  //             "type": "mrkdwn",
  //             "text": teamText,
  //           },
  //         },
  //         {
  //           "type": "section",
  //           "text": {
  //             "type": "mrkdwn",
  //             "text": `>${action.value}`,
  //           },
  //         },
  //       ],
  //     });

  //     if (!response.ok) {
  //       console.log("Error during request chat.postMessage!", response.error);
  //     }
  //     await client.functions.completeSuccess({
  //       function_execution_id: body.function_data.execution_id,
  //       outputs: { astronautFeedback: action.value },
  //     });
  //   },
);
