![bearbnb logo](https://i.imgur.com/sszpMlw.png)

# bearbnb

The backend for a bear-themed clone of AirBnB!

Originally a REST API built with Flask and MySQL, it has been migrated to use GraphQL, Prisma, and Postgres.

## Setup for Development

### Prerequisites

If you do not already have Prisma installed and running on Docker, refer to steps 1-4 on [this page](https://v1.prisma.io/docs/1.34/get-started/01-setting-up-prisma-new-database-TYPESCRIPT-t002/) of the Prisma docs for setting that up.

Be sure you have a Postgres database set up and fill in the appropriate database fields in `docker-compose.yml` with your credentials.

Install the GraphQL CLI (version 3.x or earlier) if you have not done so already.

```
npm i -g prisma graphql-cli@3.0.14
```

Now that you have those set up, you can clone the repo and install the dependencies with the following:

```
git clone https://github.com/jmtes/bearbnb-server.git
cd bearbnb-server
npm install
```

### Configuring the Environment

The scripts in `package.json` depend on env files to configure variables used by the app.

In the root of the directory, create an `env` folder. Inside this folder, create two files, `dev.env` and `test.env`.

In each file, define the following variables (note that the last part of `PRISMA_ENDPOINT` should be either "dev" or "test" depending on the file):

```
PRISMA_ENDPOINT=http://localhost:4466/bearbnb/(dev|test)
PRISMA_SECRET=yourprismasecret
JWT_SECRET=yourjwtsecret
PORT=4000
```

`PRISMA_SECRET` and `JWT_SECRET` can be whatever you want. You're free to use a different value for `PORT` as well, this is just a guideline!

Next up, the app makes use of the LocationIQ API to validate addresses. It requires an API token to use, so to generate one head over to [LocationIQ](https://locationiq.com/) and create an account.

Once you've made your account, go to the dashboard and select "Account details" from the sidebar. Copy your API token and set it to the `BEARBNB_LOCATIONIQ_API_KEY` variable in both files.

```
LOCATIONIQ_API_KEY=yourapikey
```

Lastly, the app uses the Unsplash API to grab photos for cities, which requires an access key and secret to use.

Register an account with Unsplash and then head to the [developer page](https://unsplash.com/developers). Select "Your apps" from the top menu and register a new application. Copy the access key and secret key and set them to the following in both files.

```
UNSPLASH_ACCESS_KEY=youraccesskey
UNSPLASH_SECRET=yoursecret
```

### Deploying the Prisma Schema

Now that the environment is all set up, we can properly deploy the Bearbnb schema to Prisma.

Within the `prisma` directory, run the following:

```
prisma deploy -e ../env/dev.env
prisma deploy -e ../env/test.env
```

These commands may take a few minutes to complete. Once they are though, run `npm run get-schema` to generate a schema for the Node server to use.

### Running the Dev Server

Simply run `npm run dev-server`.

Now you can access a GraphQL Playground instance for your Bearbnb server from your browser on `localhost:4000` (or whichever `PORT` you specified, for that matter)!

### Running Tests

```
npm run test
```

## Contributing and Future Developments

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Authors

- Juno Tesoro is a developer and bear enthusiast who is very partial to panda bears and polar bears. You can find them on [Github](https://github.com/jmtes), [Linkedin](https://linkedin.com/in/jutesoro), and [Twitter](https://twitter.com/jumicates).
