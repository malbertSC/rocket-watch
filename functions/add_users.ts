import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { UsersDatastore } from "../datastores/users_datastore.ts";

export const AddUsersFunctionDefinition = DefineFunction({
  callback_id: "add_users",
  title: "Add users",
  description: "Add users",
  source_file: "functions/add_users.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity", "channel"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  AddUsersFunctionDefinition,
  async ({ inputs, client }) => {
    console.log("inputs", inputs);
    // Get the draft
    const existingUsersResults = await client.apps.datastore.get<
      typeof UsersDatastore.definition
    >(
      {
        datastore: UsersDatastore.name,
        id: inputs.channel,
      },
    );
    const existingUsers = existingUsersResults.ok
      ? existingUsersResults.item.slack_user_ids
      : [];
    console.log("existingUsers", existingUsers, existingUsersResults);
    const result = await client.views.open({
      interactivity_pointer: inputs.interactivity.interactivity_pointer,
      view: {
        type: "modal",
        callback_id: "manage_users",
        title: {
          type: "plain_text",
          text: "title",
        },
        blocks: [
          // elements: [
          //   {
          //   "type": "section",
          //   "text": {
          //     "type": "mrkdwn",
          //     "text":
          //       "What team members should we look for in #methods-regional-chat?",
          //   },
          // },
          {
            "block_id": "multi_users_select",
            "type": "input",
            "element": {
              "type": "multi_users_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select users",
                "emoji": true,
              },
              "action_id": "multi_users_select_action",
              "initial_users": existingUsers,
            },
            "label": {
              "type": "plain_text",
              "text": "Your Team",
              "emoji": true,
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });

    console.log(result);
    // for (const user of inputs.users) {
    //   const putResp = await client.apps.datastore.put<
    //     typeof UsersDatastore.definition
    //   >({
    //     datastore: UsersDatastore.name,
    //     item: user,
    //   });
    //   if (!putResp.ok) {
    //     console.log(putResp.error);
    //   }
    // }
    return {
      completed: false,
    };
  },
).addViewSubmissionHandler(
  ["manage_users"],
  async function ({ view, body, client, inputs }) {
    const updatedUsers =
      view.state.values.multi_users_select.multi_users_select_action
        .selected_users;
    console.log("channel", inputs.channel);
    console.log("updatedUsers", updatedUsers);
    const putResp = await client.apps.datastore.put<
      typeof UsersDatastore.definition
    >({
      datastore: UsersDatastore.name,
      item: {
        team_slack_channel_id: inputs.channel,
        slack_user_ids: updatedUsers,
      },
    });

    console.log("putResp", putResp);
    if (!putResp.ok) {
      const saveErrorMsg =
        `Error saving team users. (Error detail: ${putResp.error})`;
      console.log(saveErrorMsg);

      return { error: saveErrorMsg };
    }
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: {},
    });
  },
);
