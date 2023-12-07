import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import TeamChannelUsersDatastore from "../datastores/team_channel_users_datastore.ts";
import { getUserFromCache } from "../util/get-user-from-cache.ts";

const RESPONSE_ACTION_ID = "response_action";

export const GetRocketFeedbackDefinition = DefineFunction({
  callback_id: "collect_rocket_feedback",
  title: "Collect Rocket Feedback",
  description:
    "Asks emoji-reactor why the comment was interesting and posts their feedback to the team channel",
  source_file: "functions/collect_rocket_feedback.ts",
  input_parameters: {
    properties: {
      submitter_slack_username: {
        type: Schema.types.string,
        description: "The user who wrote the PR",
      },
      reviewer_slack_username: {
        type: Schema.types.string,
        description: "The user who wrote review comment",
      },
      astronaut_slack_username: {
        type: Schema.types.string,
        description: "The user who reacted to the PR comment",
      },
      comment_url: {
        type: Schema.types.string,
        description: "Contents of the review comment",
      },
      comment_body: {
        type: Schema.types.string,
        description: "URL of the review comment",
      },
    },
    required: [
      "submitter_slack_username",
      "reviewer_slack_username",
      "astronaut_slack_username",
      "comment_url",
      "comment_body",
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
    const reviewer = await getUserFromCache(
      client,
      inputs.reviewer_slack_username,
    );

    const infoText =
      `Thanks for highlighting <@${reviewer.slack_user_id}>'s <${inputs.comment_url}|review comment>!  What was so great about it?  What did you learn?`;

    const astronaut = await getUserFromCache(
      client,
      inputs.astronaut_slack_username,
    );
    const response = await client.chat.postMessage({
      channel: astronaut.slack_user_id || "",
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
).addBlockActionsHandler(
  [RESPONSE_ACTION_ID],
  async function ({ action, body, client }) {
    const inputs = body.function_data.inputs;
    const msgUpdate = await client.chat.update({
      channel: body.container.channel_id,
      ts: body.container.message_ts,
      blocks: [{
        "type": "context",
        "elements": [
          {
            "type": "plain_text",
            "text": "done!",
            "emoji": true,
          },
        ],
      }],
    });
    if (!msgUpdate.ok) {
      console.log("Error during manager chat.update!", msgUpdate.error);
    }

    const astronaut = await getUserFromCache(
      client,
      inputs.astronaut_slack_username,
    );
    const reviewer = await getUserFromCache(
      client,
      inputs.reviewer_slack_username,
    );

    const teamText =
      `<@${astronaut.slack_user_id}> highlighted <@${reviewer.slack_user_id}>'s <${inputs.comment_url}|review comment>!`;

    const channelsToPostToResult = await client.apps.datastore.query({
      datastore: TeamChannelUsersDatastore.name,
      expression: "contains (#user_term, :user)",
      expression_attributes: {
        "#user_term": "slack_user_ids",
      },
      expression_values: {
        ":user": astronaut.slack_user_id,
      },
    });

    if (!channelsToPostToResult.ok) {
      console.log(channelsToPostToResult.error);
      throw new Error(channelsToPostToResult.error);
    }

    console.log("channels to post to", channelsToPostToResult);

    for (
      const channel of channelsToPostToResult.items.map((item) =>
        item.team_slack_channel_id
      )
    ) {
      const response = await client.chat.postMessage({
        channel: channel,
        blocks: [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": ":rocket: Rocket Watch! :rocket:",
              "emoji": true,
            },
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": teamText,
            },
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `>${action.value}`,
            },
          },
        ],
      });

      if (!response.ok) {
        console.log("Error during request chat.postMessage!", response.error);
      }
    }

    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: { astronautFeedback: action.value },
    });
  },
);
