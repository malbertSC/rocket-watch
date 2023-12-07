import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { UpdateUsersCacheFunctionDefinition } from "../functions/update_user_cache.ts";

export const UpdateUsersCacheWorkflow = DefineWorkflow({
  callback_id: "update_users_cache_workflow",
  title: "Update Users Cache",
  description: "Update cache of users",
  input_parameters: {
    properties: {},
    required: [],
  },
});

UpdateUsersCacheWorkflow.addStep(
  UpdateUsersCacheFunctionDefinition,
  {},
);

export default UpdateUsersCacheWorkflow;
