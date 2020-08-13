![bearbnb logo](https://i.imgur.com/VBNaSJr.png)

# bearbnb

A bear-themed clone of AirBnB!

Originally seahorse-themed and built with Python, Flask, MySQL, and vanilla JS, it is currently being migrated to the MERN stack.

## Setup for Development

Clone the repo and `cd` into it.

```
git clone https://github.com/jmtes/bearbnb.git
cd bearbnb
```

Install the dependencies.

```
npm install
```

Make sure you have a MongoDB Atlas cluster to connect the app to. If you don't already, [this page](https://docs.atlas.mongodb.com/getting-started/) outlines how to set one up.\

Once your cluster's been created, visit the "Clusters" panel on the MongoDB Atlas homepage and click the "Connect" button on the cluster's listing.\

From there, click "Connect Your Application" and set the driver to Node.js with version 3.0 or later. Copy the connection string and set the `BEARBNB_DB_URI` variable to it. Be sure to put quotation marks around it!

```
export BEARBNB_DB_URI="yourDBURI"
```

Now, because this app was made by a frontend developer who couldn't quite wrap their head around GridFS and wanted to do as little backend work as possible to make it work, it posts user-uploaded photos to Imgur via the Imgur API. As such, it requires an Imgur API client ID to work.\

To get a client ID for the Imgur API, make an Imgur account and go to [this page](https://api.imgur.com/oauth2/addclient) to register an application. For the authorization type, be sure to specify "Anonymous usage without user authorization".\

Once you've filled out all the fields, click Submit, copy the client ID, and set it to the `BEARBNB_IMGUR_ID` variable.

```
export BEARBNB_IMGUR_ID=yourClientID
```

Next up, the app makes use of the LocationIQ API to validate addresses on the backend and render maps on the frontend. It requires an API token to use, so to generate one head over to [LocationIQ](https://locationiq.com/) and create an account.\

Once you've made your account, go to the dashboard and select "Account details" from the sidebar. Copy your API token and set it to the `BEARBNB_LOCATIONIQ_API_KEY` variable.

```
export BEARBNB_LOCATIONIQ_API_KEY=yourAPIKey
```

Lastly, the app uses the Unsplash API to grab photos for city cards on the frontend, which requires an access key and secret to use.\

Register an account with Unsplash and then head to the [developer page](https://unsplash.com/developers). Select "Your apps" from the top menu and register a new application. Copy the access key and secret key and set them to the following.

```
export BEARBNB_UNSPLASH_ACCESS_KEY=yourAccessKey
export BEARBNB_UNSPLASH_SECRET=yourSecret
```

That's all for the APIs!\

Lastly, set a secret to use for the JSON web tokens. This can be any string you want, but I'd recommend [generating a random one](https://www.random.org/strings/).

```
export BEARBNB_JWT_SECRET=yourSecret
```

You've now configured all the necessary environment variables and can run the app!

```
npm run dev
```

At the time of writing, the app is still just an Express server, but that will change very soon!

## Testing the API with Postman

Bearbnb has a Postman collection! Simply open up Postman and import `BearBnB.postman_collection.json`, located at the root of the repository.\

Each request is rife with usage and response examples. They are updated as endpoint handlers are implemented.\

As of now, the review routes are still in development. As such, it is of note that the review requests are by no means complete.

## Contributing and Future Developments

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Development progress is being tracked here on Trello! Any issues opened will be added to the board.

## Authors

- Juno Tesoro is a frontend developer and bear enthusiast who is very partial to panda bears and polar bears.
