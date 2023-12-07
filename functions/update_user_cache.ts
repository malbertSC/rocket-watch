import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import UsersCacheDatastore from "../datastores/users_cache_datastore.ts";

export const UpdateUsersCacheFunctionDefinition = DefineFunction({
  callback_id: "update_users_cache",
  title: "Update user cache",
  description: "Update user cache",
  source_file: "functions/update_user_cache.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  UpdateUsersCacheFunctionDefinition,
  async ({ inputs, client }) => {
    console.log("starting update_users_cache function");

    console.log("getting users");
    const teamsResult = await client.auth.teams.list();
    if (!teamsResult.ok) {
      console.log(teamsResult.error);
      return {
        error: teamsResult.error,
        outputs: {},
      };
    }
    for (const team of teamsResult.teams) {
      let done = false;
      let cursor = "";
      while (!done) {
        const result = await client.users.list({
          limit: 500,
          team_id: team.id,
          cursor,
        });
        if (!result.ok) {
          console.log(result.error);
          return {
            error: result.error,
            outputs: {},
          };
        }
        const users = result.members;
        for (const user of users) {
          const putResp = await client.apps.datastore.put<
            typeof UsersCacheDatastore.definition
          >({
            datastore: UsersCacheDatastore.name,
            item: {
              username: user.name,
              slack_user_id: user.id,
            },
          });
          if (!putResp.ok) {
            console.log(putResp.error);
          }
        }
        if (result.response_metadata?.next_cursor) {
          cursor = result.response_metadata.next_cursor;
        } else {
          done = true;
        }
      }
    }

    return {
      outputs: {},
    };
  },
);
