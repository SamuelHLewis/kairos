# Kairos
A lightweight, terminal-based task management app.

## Introduction
Kairos is a task management app that allows a user to:
* view their tasks in an Eisenhower prioritisation matrix
* add new tasks
* delete existing tasks

It runs entirely locally, writing task details to the user's computer.

## Prerequisites
This app runs through Node.js. If you don't have this installed already, you can install it on MacOS with:
```
brew install node
```
Or on linux with:
```
sudo apt-get install -y nodejs
```

## Installation
1. Check that Node.js is installed on your computer:
```
node --version
```
2. Clone this repo:
```
git clone https://github.com/SamuelHLewis/kairos
```
3. Install kairos:
```
npm install
```

## How to Run
Kairos is written in TypeScript, which needs to be compiled to JavaScript before it runs. To do this, open a terminal and run:
```
npx tsc
```
Then you can launch the app with:
```
node app.js
```
### Changing the Urgency Threshold
By default, tasks due in fewer than 3 days are treated as urgent, and all others are non-urgent. To change this, adjust the `urgentThreshold` value in `app.ts`.