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

| Method | Endpoint         | Access Control | Description                                 |
| ------ | ---------------- | -------------- | ------------------------------------------- |
| GET    | `/email/`        | all users      | todo. |

#### Story Routes

| Method | Endpoint          | Access Control | Description                       |
| ------ | ----------------- | -------------- | --------------------------------- |
| GET    | `/upload/`        | all users    | todo. |

#### Admin Routes

| Method | Endpoint                         | Access Control | Description               |
| ------ | -------------------------------- | -------------- | ------------------------- |
| GET    | `/admin/`                        | admin users    | Returns all unflagged user submissions. |
| GET    | `/admin/users`                   | admin users    | Returns all usernames. |
| POST   | `/admin/video`                   | admin users    | Set YouTube video stream url. |
| GET    | `/admin/flag/:id`                | admin users    | Returns a specific flagged submission. |
| POST   | `/admin/flag/:id`                | admin users    | Toggles flagged status on a submission. |
| GET    | `/admin/winners`                 | admin users    | Returns top 10 submissions for today's prompt. |
| POST   | `/admin/remove_user_data/:email` | admin users    | Delete all submissions from a user. |
| POST   | `/admin/login`                   | admin users    | Verify admin user login. |
| POST   | `/admin/setwinners/:prompt_id`   | admin users    | Set winners for today's prompt. |

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