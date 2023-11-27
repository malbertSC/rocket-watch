import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import { AddTeamUserFeedbackWorkflow } from "../workflows/add_team_user.ts";

const manageTeamTrigger: Trigger<
  typeof AddTeamUserFeedbackWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Manage Users for Rocket Watch",
  description: "Manage users in your team",
  workflow: `#/workflows/${AddTeamUserFeedbackWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default manageTeamTrigger;
