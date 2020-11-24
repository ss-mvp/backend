`https://server.storysquad.app` - AWS Deployment

# API Documentation

## Getting started

Check the wiki for a [setup guide](https://github.com/ss-mvp/backend/wiki/Setup-Guide)

### Backend framework

#### Express

-   Useful libraries such as helmet and CORS.
-   Well documented.

#### Knex

-   Simplifies database creation, connections, queries, etc.
-   Highly cross-compatible with different databases.

## Endpoints

#### Email Routes

| Method | Endpoint                   | Access Control | Description                                 |
| ------ | -------------------------- | -------------- | ------------------------------------------- |
| POST   | `/email/register`           | anyone         | Creates new user and sends validation email |
| POST   | `/email/login`              | anyone         | Returns authorization if user exists and email validated |
| POST   | `/email/activate`           | anyone         | Validates email for a new user if given a valid query string |
| POST   | `/email/activatedLogin`     | anyone         | Returns aothorization if user email validated |
| GET    | `/email/video`              | anyone         | Returns link for winners announcement YouTube video stream |

#### Story Routes

| Method | Endpoint             | Access Control | Description                       |
| ------ | -------------------- | -------------- | --------------------------------- |
| POST   | `/upload/`           | user           | Save new submission |
| GET    | `/upload/image/:id` | user | Request an image |
| GET    | `/upload/mytopstories` | user | Get the current users top 5 stories |
| GET    | `/upload/video`      | user           | Returns link for winners announcement YouTube video stream |
| GET    | `/upload/prompt`     | user           | Get current prompt and user-relative state |
| PUT    | `/upload/edit/:id`   | admin           | Edit a prompt |
| GET    | `/upload/all_prompts` | admin          | Get all previous prompt data |
| POST   | `/upload/add`        | admin          | Add a new prompt |

#### Admin Routes

| Method | Endpoint                         | Access Control | Description               |
| ------ | -------------------------------- | -------------- | ------------------------- |
| GET    | `/admin/`                        | admin          | Returns all active user submissions |
| GET    | `/admin/users`                   | admin          | Returns all usernames |
| POST   | `/admin/video`                   | admin          | Set YouTube video stream url |
| GET    | `/admin/flag/:id`                | admin          | Returns a specific flagged submission |
| POST   | `/admin/flag/:id`                | admin          | Toggles flagged status on a submission |
| GET    | `/admin/winners`                 | admin          | Returns top 10 submissions for today's prompt |
| GET    | `/admin/image/:id`               | admin          | Request an image (no checks under /admin)
| POST   | `/admin/remove_user_data/:email` | admin          | Delete all submissions from a user |
| POST   | `/admin/login`                   | admin          | Verify admin user login |
| POST   | `/admin/setwinners/:prompt_id`   | admin          | Set winners for today's prompt |

#### Ranking Routes

| Method | Endpoint          | Access Control | Description                       |
| ------ | ----------------- | -------------- | --------------------------------- |
| GET    | `/ranking/`       | anyone         | Get the 3 winner submissions |
| POST   | `/ranking/`       | anyone         | Submit ranking of the 3 submissions |
| GET    | `/ranking/votes`  | anyone         | Get current vote counts |
| GET    | `/ranking/winner` | anyone         | Get the 3 winner submissions final ranking |
| GET    | `/ranking/histogram` | user      | Get histogram data from previous day |

## Documentation

For information on database entities and environment variables, see the [backend wiki](https://github.com/ss-mvp/backend/wiki).

See [Frontend Documentation](https://github.com/ss-mvp/story-master-fe/blob/master/README.md) for details on the frontend of our project.


## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
Please note we have a [code of conduct](./code_of_conduct.md). Please follow it in all your interactions with the project.

### Attribution

These contribution guidelines have been adapted from [this good-Contributing.md-template](https://gist.github.com/PurpleBooth/b24679402957c63ec426).
