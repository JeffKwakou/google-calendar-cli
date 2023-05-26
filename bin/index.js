#! /usr/bin/env node
const yargs = require('yargs');
const {authorize, credentialsFileExist, setApiCredentials} = require('../modules/auth.js');
const inquirer = require('inquirer');
const DatePrompt = require('inquirer-date-prompt');
const {listEvents, createEvent, updateEvent, deleteEvent, getEvent} = require('../modules/calendar.js');

inquirer.registerPrompt("date", DatePrompt);

// Commands documentation, acces with --help
const usage = "\n Usage: Manage your Google Calendar with this CLI tool\n";
yargs.usage(usage)
.option ("h", {alias:"help", describe: "Show help", type: "void", demandOption: false })
.option("c", {alias:"config", describe: "Config google credentials", type: "void", demandOption: false })
.option("i", {alias:"client_id", describe: "Set the client id key of Google Calendar API", type: "string", demandOption: false }) 
.option("s", {alias:"client_secret", describe: "Set the client secret key of Google Calendar API", type: "string", demandOption: false })  
.option("p", {alias:"project_id", describe: "Set the project id of Google Calendar API", type: "string", demandOption: false })
.option("l", {alias:"events", describe: "List all events in Google Calendar", type: "void", demandOption: false })
.option("n", {alias:"new_event", describe: "Create a new event in Google Calendar", type: "void", demandOption: false })
.option("u", {alias:"update_event", describe: "Update an event in Google Calendar", type: "string", demandOption: false })
.option("d", {alias:"delete_event", describe: "Delete an event in Google Calendar", type: "string", demandOption: false })
.help(true) 
.argv; 

const arguments = yargs.argv;

// Verify if credentials file exist and create it if not
credentialsFileExist();

// Handle commands
if (arguments.client_id) {
  setApiCredentials({client_id: arguments.client_id});
}
if (arguments.client_secret) {
  setApiCredentials({client_secret: arguments.client_secret});
}
if (arguments.project_id) {
  setApiCredentials({project_id: arguments.project_id});
}
if (arguments.hasOwnProperty("config")) { 
    inquirer.prompt([
      {
          name: 'client_id',
          type: 'input',
          message: 'Enter your google client id:',
          validate: function( value ) {
            if (value.length) {
              return true;
            } else {
              return ;
            }
          }
      },
      {
        name: 'client_secret',
        type: 'input',
        message: 'Enter your google client secret:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your google client secret.';
          }
        }
    },
    {
      name: 'project_id',
      type: 'input',
      message: 'Enter your google project id:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your google project id.';
        }
      }
  },
  ]).then(answers => {
      setApiCredentials(answers);
  });
}
if (arguments.hasOwnProperty("new_event")) {
    inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: 'Enter the event title:',
            validate: function( value ) {
              if (value.length) {
                return true;
              } else {
                return 'Please enter the event title.';
              }
            }
        },
        {
          name: 'description',
          type: 'input',
          message: 'Enter the event description:'
      },
        {
            name: 'start_date',
            type: 'date',
            message: 'Choose a start date of the event:'
        },
        {
          name: 'end_date',
          type: 'date',
          message: 'Choose a end date of the event:'
      },
    ]).then(answers => {
        authorize().then((auth) => {
          createEvent(auth, answers);
        }).catch(console.error);
    });
}
if (arguments.hasOwnProperty("update_event") && arguments.update_event) {
  authorize().then((auth) => {
    getEvent(auth, arguments.update_event).then((event) => {
      inquirer.prompt([
          {
              name: 'title',
              default: event.summary,
              type: 'input',
              message: 'Enter the event title:',
              validate: function( value ) {
                if (value.length) {
                  return true;
                } else {
                  return 'Please enter the event title.';
                }
              }
          },
          {
            name: 'description',
            default: event.description,
            type: 'input',
            message: 'Enter the event description:'
        },
        {
            name: 'start_date',
            type: 'date',
            message: 'Choose a start date of the event:',
            default: new Date(event.start.dateTime)
        },
        {
          name: 'end_date',
          type: 'date',
          message: 'Choose a end date of the event:',
          default: new Date(event.end.dateTime)
        },
      ]).then(answers => {
        event.summary = answers.title;
        event.description = answers.description;
        event.start.dateTime = answers.start_date;
        event.end.dateTime = answers.end_date;

        updateEvent(auth, arguments.update_event, event);
      });
      
    }).catch(console.error);
  }).catch(console.error);
}
if (arguments.hasOwnProperty("events")) {
  authorize().then((auth) => {
    listEvents(auth);
  }).catch(console.error)
} 
if (arguments.delete_event) {
  authorize().then((auth) => {
    deleteEvent(auth, arguments.delete_event);
  }).catch(console.error)
}


