import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import CollectRocketFeedbackWorkflow from "../workflows/collect_rocket_feedback.ts";
/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const sampleTrigger: Trigger<typeof CollectRocketFeedbackWorkflow.definition> =
  {
    type: TriggerTypes.Webhook,
    name: "Rocket Feedback",
    description: "Collect feedback for a rocket review",
    workflow:
      `#/workflows/${CollectRocketFeedbackWorkflow.definition.callback_id}`,
    // inputs: {
    //   interactivity: {
    //     value: TriggerContextData.Shortcut.interactivity,
    //   },
    //   // channel: {
    //   //   value: TriggerContextData.Shortcut.channel_id,
    //   // },
    //   user: {
    //     value: TriggerContextData.Shortcut.user_id,
    //   },
    // },
    inputs: {
      channel: {
        value: "{{data.channel_id}}",
      },
      // reviewer: {
      //   value: "{{data.reviewer_slack_id}}",
      // },
      astronaut: {
        value: "{{data.astronaut_slack_id}}",
      },
      // em: {
      //   value: "{{data.em_slack_id}}",
      // },
      // commentUrl: {
      //   value: "{{data.pr_comment_url}}",
      // },
      // teamChannel: {
      //   value: "{{data.slack_team_channel}}",
      // },
    },
  };

export default sampleTrigger;
