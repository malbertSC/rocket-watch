import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import { UpdateUsersCacheWorkflow } from "../workflows/update_users_cache.ts";

const manageTeamTrigger: Trigger<
  typeof UpdateUsersCacheWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Update Users Cache for Rocket Watch",
  description: "Updates the users cache",
  workflow: `#/workflows/${UpdateUsersCacheWorkflow.definition.callback_id}`,
  inputs: {},
};

export default manageTeamTrigger;
