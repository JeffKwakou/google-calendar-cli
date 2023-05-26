const {google} = require('googleapis');
const chalk = require('chalk');
const chalkTable = require('chalk-table');
const boxen = require('boxen');

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
    backgroundColor: "#555555"
};

module.exports.getEvent = async (auth, eventId) => {
    const calendar = google.calendar({version: 'v3', auth});

    const res = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
    });

    return res.data;
}

module.exports.listEvents = async (auth) => {
    const calendar = google.calendar({version: 'v3', auth});
  
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      console.log(chalk.bgRed.white('No upcoming events found.'));
      return;
    }
  
    console.log(chalk.underline('Upcoming 10 events:'));
  
    const options = {
      leftPad: 2,
      columns: [
        { field: "id",     name: chalk.cyan("ID") },
        { field: "summary", name: chalk.green("Title") },
        { field: "start",  name: chalk.magenta("Start date") },
        { field: "end",  name: chalk.yellow("End date") }
      ]
    };
  
    const eventsFormatted = events.map((event) => {
      return {
        id: event.id,
        start: new Date(event.start.dateTime).toLocaleString('fr-FR', { timeZone: 'UTC' }),
        end: new Date(event.end.dateTime).toLocaleString('fr-FR', { timeZone: 'UTC' }),
        summary: event.summary,
        description: event.description
      }
    });
     
    const table = chalkTable(options, eventsFormatted);
    
    console.log(table);
}
  

module.exports.createEvent = async (auth, eventToCreate) => {
    const calendar = google.calendar({version: 'v3', auth});

    const event = {
        summary: eventToCreate.title,
        description: eventToCreate.description,
        start: {
        dateTime: eventToCreate.start_date.toISOString(),
        timeZone: 'Europe/Paris',
        },
        end: {
        dateTime: eventToCreate.end_date.toISOString(),
        timeZone: 'Europe/Paris',
        },
    };

    try {
        const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        });

        const msgBox = boxen(chalk.green('Event created:', response.data.id), boxenOptions);
        console.log(msgBox);
    } catch (error) {
        console.log(chalk.bgRed.white('Error creating event:', error));
    }
}

module.exports.deleteEvent = async (auth, eventId) => {
  const calendar = google.calendar({version: 'v3', auth});

  try {
      await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      });

      const msgBox = boxen(chalk.green('Event deleted:', eventId), boxenOptions);
      console.log(msgBox);
  } catch (error) {
      console.log(chalk.bgRed.white('Error deleting event:', error));
  }
}

module.exports.updateEvent = async (auth, eventId, event) => {
  const calendar = google.calendar({version: 'v3', auth});

  try {
      await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event
      });

      const msgBox = boxen(chalk.green('Event updated:', eventId), boxenOptions);
      console.log(msgBox);
  } catch (error) {
      console.log(chalk.bgRed.white('Error updating event:', error));
  }
}