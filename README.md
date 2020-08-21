`https://ss-mvp-be.herokuapp.com/` - Heroku deploy

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
| GET    | `/email/activation/:email` | anyone         | Returns user if email was validated. |
| POST   | `email/register`           | anyone         | Creates new user and sends validation email. |
| POST   | `email/login`              | anyone         | Returns authorization if user exists and email validated. |
| POST   | `email/activate`           | anyone         | Validates email for a new user if given a valid query string. |
| POST   | `email/activatedLogin`     | anyone         | Returns aothorization if user email validated. |
| DELETE | `email/:email`             | anyone         | Delete user account. |
| GET    | `email/video`              | anyone         | Returns link for winners announcement YouTube video stream. |

#### Story Routes

| Method | Endpoint             | Access Control | Description                       |
| ------ | -------------------- | -------------- | --------------------------------- |
| GET    | `/upload/`           | user           | Get all prevuous prompt data. |
| POST   | `/upload/`           | user           | Save new submission. |
| GET    | `/upload/video`      | user           | Returns link for winners announcement YouTube video stream. |
| GET    | `/upload/time`       | user           | Get prompt start, end, and next game times. |
| GET    | `/upload/prompt`     | user           | Get prompt data. |
| GET    | `/upload/story`      | user           | Get all past submissions and all user data :triangular_flag_on_post:. |
| PUT    | `/upload/edit/:id`   | user           | Edit the daily prompt. |
| GET    | `/upload/all_prompt` | admin          | Get all previous prompt data. |
| DELETE | `/upload/prompt/:id` | admin          | Delete a previous prompt. |
| POST   | `/upload/add`        | admin          | Add a new daily prompt. |

#### Admin Routes

| Method | Endpoint                         | Access Control | Description               |
| ------ | -------------------------------- | -------------- | ------------------------- |
| GET    | `/admin/`                        | admin          | Returns all unflagged user submissions. |
| GET    | `/admin/users`                   | admin          | Returns all usernames. |
| POST   | `/admin/video`                   | admin          | Set YouTube video stream url. |
| GET    | `/admin/flag/:id`                | admin          | Returns a specific flagged submission. |
| POST   | `/admin/flag/:id`                | admin          | Toggles flagged status on a submission. |
| GET    | `/admin/winners`                 | admin          | Returns top 10 submissions for today's prompt. |
| POST   | `/admin/remove_user_data/:email` | admin          | Delete all submissions from a user. |
| POST   | `/admin/login`                   | admin          | Verify admin user login. |
| POST   | `/admin/setwinners/:prompt_id`   | admin          | Set winners for today's prompt. |

#### Ranking Routes

| Method | Endpoint          | Access Control | Description                       |
| ------ | ----------------- | -------------- | --------------------------------- |
| GET    | `/ranking/`       | all users      | todo. |

## Known issues at the end of Labs24 6/24/20

## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
Please note we have a [code of conduct](./code_of_conduct.md). Please follow it in all your interactions with the project.

### Attribution

These contribution guidelines have been adapted from [this good-Contributing.md-template](https://gist.github.com/PurpleBooth/b24679402957c63ec426).

## Documentation

See [Frontend Documentation](https://github.com/ss-mvp/story-master-fe/blob/master/README.md) for details on the frontend of our project.

For information on database entities and environment variables, see the [backend documentation](https://github.com/ss-mvp/backend/wiki).