

import axios from "axios";
import { credentials } from "./credentials.ts";

const pullRequestDataCache: any = {};

function getCacheKey(repository: string, prNumber: string) {
    return `${repository}|${prNumber}`;
} 

export async function getPullRequestData(repository: string, prNumber: string): Promise<Array<any>> {
    const cacheKey = getCacheKey(repository, prNumber);
    if(pullRequestDataCache[cacheKey]) return pullRequestDataCache[cacheKey];
    const graphqlQuery = `
    query {
        repository(name: "${repository}" owner: "squareup") {
          pullRequest(number: ${prNumber}) {
            reviews(first: 10) {
              edges {
                node {
                  id
                  body
                  url
                  author {
                    login
                  }
                  publishedAt
                  reactions(first:5) {
                    edges {
                      node {
                        id
                        content
                      }
                    }
                  }
                  comments(first:20) {
                    edges {
                      node {
                        id
                        body
                        author {
                          login
                        }
                        reactions(first:5) {
                          edges {
                            node {
                              id
                              content
                            }
                          }
                        }
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
        rateLimit {
          cost
        }
      }
    `
    const response = await axios.default.post(
        `https://api.github.com/graphql`, {
            query: graphqlQuery
        }, credentials
    );
    const reviewData = response.data.data.repository.pullRequest.reviews.edges;
    pullRequestDataCache[cacheKey] = reviewData;
    return reviewData;
}

