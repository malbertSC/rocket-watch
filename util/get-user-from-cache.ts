import { SlackAPIClient } from "deno-slack-sdk/deps.ts";
import UsersCacheDatastore from "../datastores/users_cache_datastore.ts";


export async function getUserFromCache(client: SlackAPIClient, slackUsername: string) {
  const reviewerResult = await client.apps.datastore.get<
      typeof UsersCacheDatastore.definition
    >({
      datastore: UsersCacheDatastore.name,
      id: slackUsername,
    });

    if (!reviewerResult.ok) {
      console.log(reviewerResult.error);
      throw new Error(reviewerResult.error);
    }
    return reviewerResult.item;
}