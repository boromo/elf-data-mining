# Data mining

Using the small rest API backend server which main purpose is to serve static json files in form of normalized data, which will be consumed by the fronted application.

## Backend
Backend implementation doesn't have too many features, for now, it just normalized the output, but it can be easily expanded to serve parts of the data, as well as the specific fields, since these operations are to expensive to be performed on the fronted side.

## Frontend
Current implementation on the fronted side, uses the React as the main framework, and Redux as a state container. For data presentation, I've choosed D3, rendering inside of the canvas, since the DOM manipulation, with huge amount of data is pretty much unusable. The working example is still missing a lot of features, for ex. zoom, pan, node selecting and detail previewing.

There are a lot of known issues, for ex. the data circles overlapping, but since the lack of free time, I wasn't able to improve this any further.

## Usage
For an in depth explanation or use `npm run` to get a list of all commands available for building and running your application.

Basics are:
- `npm start`: Will start up the dev webserver and backend server as well
- `npm test`: Run unit tests (no tests implemented)
- `npm run dist`: Create the packed version
