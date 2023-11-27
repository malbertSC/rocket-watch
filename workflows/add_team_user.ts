import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { AddUsersFunctionDefinition } from "../functions/add_users.ts";

export const AddTeamUserFeedbackWorkflow = DefineWorkflow({
  callback_id: "add_team_user",
  title: "Add User",
  description: "Adds users to your team",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user", "interactivity"],
  },
});

AddTeamUserFeedbackWorkflow.addStep(
  AddUsersFunctionDefinition,
  {
    interactivity: AddTeamUserFeedbackWorkflow.inputs.interactivity,
    channel: AddTeamUserFeedbackWorkflow.inputs.channel,
  },
);

// const inputForm = AddTeamUserFeedbackWorkflow.addStep(
//   Schema.slack.functions.OpenForm,
//   {
//     title: "title",
//     interactivity: AddTeamUserFeedbackWorkflow.inputs.interactivity,
//     submit_label: "label",
//     fields: {
//       elements: [
//         //   {
//         //   "type": "section",
//         //   "text": {
//         //     "type": "mrkdwn",
//         //     "text":
//         //       "What team members should we look for in #team-channel?",
//         //   },
//         // }, {
//         //   "type": "input",
//         //   "element": {
//         //     "type": "multi_users_select",
//         //     "placeholder": {
//         //       "type": "plain_text",
//         //       "text": "Select users",
//         //       "emoji": true,
//         //     },
//         //     "action_id": "multi_users_select-action",
//         //     "initial_users": [],
//         //   },
//         //   "label": {
//         //     "type": "plain_text",
//         //     "text": "Your Team",
//         //     "emoji": true,
//         //   },
//         // }
//       ],
//       required: [],
//     },
//   },
// );
