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
      commenter_slack_user_id: {
        value: "{{data.commenter_slack_user_id}}",
      },
      astronaut_slack_user_id: {
        value: "{{data.astronaut_slack_user_id}}",
      },
      comment_url: {
        value: "{{data.comment_url}}",
      },
      comment_contents: {
        value: "{{data.comment_contents}}",
      },
      team_channel_id: {
        value: "{{data.team_channel_id}}",
      },
    },
  };

export default sampleTrigger;
