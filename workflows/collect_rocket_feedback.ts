import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetRocketFeedbackDefinition } from "../functions/collect_rocket_feedback.ts";

const CollectRocketFeedbackWorkflow = DefineWorkflow({
  callback_id: "rocket_feedback",
  title: "Rocket Feedback",
  description: "Collects feedback for rocket review reactions",
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
});

CollectRocketFeedbackWorkflow.addStep(
  GetRocketFeedbackDefinition,
  CollectRocketFeedbackWorkflow.inputs,
);

// CollectRocketFeedbackWorkflow.addStep(Schema.slack.functions.SendMessage, {
//   channel_id: CollectRocketFeedbackWorkflow.inputs.team_channel_id,
//   message: rocketFeedback.outputs.astronautFeedback,
// });

// const addFeedbackButton = CollectRocketFeedbackWorkflow.addStep(
//   Schema.slack.functions.SendDm,
//   {
//     user_id: CollectRocketFeedbackWorkflow.inputs.astronaut,
//     message:
//       "Thanks for .... <fill in details about the comment> ... click to add feedback.",
//     interactive_blocks: [
//       {
//         type: "actions",
//         block_id: "astronaut-input",
//         elements: [{
//           action_id: "myactionid",
//           type: "button",
//           text: { type: "plain_text", text: "Add Feedback" },
//         }],
//       },
//     ],
//   },
// );

// const inputForm = CollectRocketFeedbackWorkflow.addStep(
//   Schema.slack.functions.OpenForm,
//   {
//     title: "Collect Feedback",
//     interactivity: addFeedbackButton.outputs.interactivity,
//     submit_label: "Launch!",
//     description: "What was cool about this review?  What did you learn?",

//     fields: {
//       elements: [{
//         name: "message",
//         title: "Message",
//         type: Schema.types.string,
//         long: true,
//       }],
//       required: ["message"],
//     },
//   },
// );

// CollectRocketFeedbackWorkflow.addStep(Schema.slack.functions.SendMessage, {
//   channel_id: CollectRocketFeedbackWorkflow.inputs.channel,
//   message: inputForm.outputs.fields.message,
// });

export default CollectRocketFeedbackWorkflow;
