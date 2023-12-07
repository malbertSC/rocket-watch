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
    inputs: {
      submitter_slack_username: {
        value: "{{data.submitter_slack_username}}",
      },
      reviewer_slack_username: {
        value: "{{data.reviewer_slack_username}}",
      },
      astronaut_slack_username: {
        value: "{{data.astronaut_slack_username}}",
      },
      comment_url: {
        value: "{{data.comment_url}}",
      },
      comment_body: {
        value: "{{data.comment_body}}",
      },
    },
  };

export default sampleTrigger;
