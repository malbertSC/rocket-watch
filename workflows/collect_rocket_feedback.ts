import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 *
 * This workflow uses interactivity. Learn more at:
 * https://api.slack.com/automation/forms#add-interactivity
 */
const CollectRocketFeedbackWorkflow = DefineWorkflow({
  callback_id: "rocket_feedback",
  title: "Rocket Feedback",
  description: "Collects feedback for rocket review reactions",
  input_parameters: {
    properties: {
      // reviewer: {
      //   type: Schema.slack.types.user_id,
      // },
      astronaut: {
        type: Schema.slack.types.user_id,
      },
      // em: {
      //   type: Schema.slack.types.user_id,
      // },
      // commentUrl: {
      //   type: Schema.types.string,
      // },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["astronaut", "channel"],
    // required: ["reviewer", "astronaut", "em", "commentUrl", "teamChannel"],
  },
});

const addFeedbackButton = CollectRocketFeedbackWorkflow.addStep(
  Schema.slack.functions.SendDm,
  {
    user_id: CollectRocketFeedbackWorkflow.inputs.astronaut,
    message:
      "Thanks for .... <fill in details about the comment> ... click to add feedback.",
    interactive_blocks: [
      {
        type: "actions",
        block_id: "astronaut-input",
        elements: [{
          action_id: "myactionid",
          type: "button",
          text: { type: "plain_text", text: "Add Feedback" },
        }],
      },
    ],
  },
);

const inputForm = CollectRocketFeedbackWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Collect Feedback",
    interactivity: addFeedbackButton.outputs.interactivity,
    submit_label: "Launch!",
    description: "What was cool about this review?  What did you learn?",

    fields: {
      elements: [{
        name: "message",
        title: "Message",
        type: Schema.types.string,
        long: true,
      }],
      required: ["message"],
    },
  },
);

CollectRocketFeedbackWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: CollectRocketFeedbackWorkflow.inputs.channel,
  message: inputForm.outputs.fields.message,
});

export default CollectRocketFeedbackWorkflow;
