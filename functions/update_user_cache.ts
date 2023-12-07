import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import UsersCacheDatastore from "../datastores/users_cache_datastore.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";

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
      console.log("error getting teams", teamsResult.error);
      return {
        error: teamsResult.error,
        outputs: {},
      };
    }
    const allUsers = [];
    for (const team of teamsResult.teams) {
      let done = false;
      let cursor = "";
      while (!done) {
        const result = await client.users.list({
          limit: 1000,
          team_id: team.id,
          cursor,
        });
        if (!result.ok) {
          console.log("error getting users", result.error);
          return {
            error: result.error,
            outputs: {},
          };
        }
        allUsers.push(...result.members);
        if (result.response_metadata?.next_cursor) {
          cursor = result.response_metadata.next_cursor;
        } else {
          done = true;
        }
      }
      const allCachedUsers: Array<
        DatastoreItem<typeof UsersCacheDatastore.definition>
      > = [];
      let cacheUserQueryDone = false;
      let cacheUserCursor = "";
      while (!cacheUserQueryDone) {
        const result = await client.apps.datastore.query<
          typeof UsersCacheDatastore.definition
        >({
          datastore: UsersCacheDatastore.name,
          limit: 1000,
          cursor: cacheUserCursor,
        });
        if (!result.ok) {
          console.log("error getting users", result.error);
          return {
            error: result.error,
            outputs: {},
          };
        }
        allCachedUsers.push(...result.items);
        if (result.response_metadata?.next_cursor) {
          cacheUserCursor = result.response_metadata.next_cursor;
        } else {
          cacheUserQueryDone = true;
        }
      }

      const newUsers = allUsers.filter((user) =>
        allCachedUsers.find((cachedUser) =>
          cachedUser.slack_user_id === user.id
        ) === undefined
      );

      console.log("new users length", newUsers.length);

      for (const user of newUsers) {
        // skip users that are random numbers, not sure why they exist
        const isInteger = (username: string) =>
          /^-?[0-9]+$/.test(username + "");
        if (isInteger(user.name)) continue;
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
          console.log("ERROR in put", putResp.error);
        }
        // throttle request to avoid rate limiting
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    return {
      outputs: {},
    };
  },
);
