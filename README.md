# Symbl Personal Assistant Meeting App

This is a sample app that lets you invite Symbl to your zoom meeting by just pasting in the meeting invite


### sample web app (local version)
```javascript
git clone https://github.com/symblai/symbl-for-zoom.git --branch master --depth 1
cd symbl-for-zoom
npm install
npm run start
```

open browser http://localhost:5000

## Update .env

First update the .env file with the following:
1. Your App Id that you can get from [Platform](https://platform.symbl.ai)
2. Your App Secret that you can get from [Platform](https://platform.symbl.ai)

## Run

1. First, run `npm install` to download all the node modules
2. Second, run `node app.js` to start the node server
3. Navigate to localhost:5000 to view the app

## Note

This is a sample application and should not be directly used in a production environment. Use this as a sample to build upon with proper production guidelines in mind.

### Dependencies

```package.json
"dependencies": {
	"react": "16.8.6",
	"react-dom": "16.8.6",
	"redux": "3.7.2",
	"react-redux": "7.1.0",
	"jquery": "^3.4.1",
	"lodash": "^4.17.14",
	"redux-thunk": "2.2.0"
}
```

## References

Feel free to fork any of the projects here to use on your own and if you have any code improvements, make a pull request and the request will be reviewed by one of our admins.

For a sample reference implentation using Symbl, take a look at our [Platform](https://platform.symbl.ai).

If you have questions, bugs to report or feature suggestions, join our [Dev Community](https://community.symbl.ai/).
