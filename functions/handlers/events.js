const { request, response } = require("express");
const { db } = require("../util/admin");
const {
  isEmpty,
  isZipcode,
  eventDescriptionLimit,
  serviceRequestLimit,
  eventTitleLimit,
} = require("../util/validators");
const config = require('../util/config');
const e = require("express");

exports.getAllEvents = (request, response) => {
  db.collection("events")
  .get()
  .then((data) => {
    let events = [];
    data.forEach((doc) => {
      let thisDocumentData = doc.data();
      events.push(thisDocumentData);
    });

    events.sort(
      (
        x,
        y //Sort the events by created date from newest to oldest
      ) => {
        if (x.createdAt < y.createdAt) return 1;
        if (x.createdAt > y.createdAt) return -1;
        return 0;
      }
    );
    return response.json(events);
  })
  .catch((err) => {
    console.error(err.code);
    return response.status(500).json({
      error: `Could not retrieve events ${err}`,
    });
  });
}

exports.getEventsByUser = (request, response) => {
  const userHandle = request.params.userHandle;

  db.collection("events")
    .where("userHandle", "==", userHandle)
    .get()
    .then((data) => {
      let events = [];
      data.forEach((doc) => {
        let thisDocumentData = doc.data();
        events.push(thisDocumentData);
      });

      events.sort(
        (
          x,
          y //Sort the events by created date from newest to oldest
        ) => {
          if (x.createdAt < y.createdAt) return 1;
          if (x.createdAt > y.createdAt) return -1;
          return 0;
        }
      );
      return response.json(events);
    })
    .catch((err) => {
      console.error(err.code);
      return response.status(500).json({
        error: `Could not retrieve events ${err}`,
      });
    });
};

exports.getEventByID = (request, response) => {
  const eventID = request.params.eventID;

  db.doc(`/events/${eventID}`)
  .get()
  .then((doc) => {
    if (!doc.exists)
      return response
        .status(500)
        .json({ error: `Event ${eventID} does not exist` });
    return response.status(201).json(doc.data());
  })
  .catch((err) => {
    return response.status(500).json({ err });
  });
};

exports.createEvent = (request, response) => {
  
  const newEvent = {
    title: request.body.title,
    userHandle: request.user.userHandle,
    fullName: request.user.fullName, 
    description: request.body.description,
    createdAt: new Date().toISOString(),
    eventDate: request.body.eventDate,
    zipcode: request.body.zipcode,
    services: request.body.services,
  };

  let errors = {};
  if (!isZipcode(newEvent.zipcode)) errors.zipcode = "Invalid zipcode format";
  if (new Date().toISOString() > newEvent.eventDate)
    errors.eventDate = "Event date must be some time in the future";
  if (isEmpty(newEvent.title)) errors.title = "Event name cannot be empty";
  if (eventTitleLimit(newEvent.title))
    errors.title = "Event title cannot exceed 60 characters";
  if (eventDescriptionLimit(newEvent.description))
    errors.description = "Event description cannot exceed 500 characters";
  if (newEvent.services.length === 0)
    errors.serviceType = "Must submit one or more services";

  let serviceTypes = [];
  newEvent.services.forEach((service) => {
    if (serviceTypes.includes(service.serviceType))
      errors.serviceType = "Cannot have duplicate services";
    if (
      !service.serviceType ||
      service.serviceType === null ||
      isEmpty(service.serviceType)
    ) {
      errors.serviceType = "Cannot leave service empty";
    }
    serviceTypes.push(service.serviceType);
  });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json(errors);
  }

  let eventID;
  db.collection("events")
    .add(newEvent)
    .then((doc) => {
      eventID = doc.id;
      console.log(eventID);
      return db.doc(`/events/${eventID}`).update({ eventID }); //Insert Event ID
    })
    .then(() => {
      const userDBPath = `/users/${newEvent.userHandle}`;
      db.doc(userDBPath)
        .get() //Retrieve current user's events
        .then((data) => {
          let currentData = data.data();
          currentData.events.push(eventID); //Add new event
          return db.doc(userDBPath).update({ events: currentData.events }); //Set the current data
        })
        .then(() => {
          response
            .status(201)
            .json({ message: `New event ${eventID} successfully created` });
        })
        .catch((err) => {
          console.error("Could not retrieve data from /users database");
          response.status(500).json({
            error: `Failed to retrieve data from /users database ${err}`,
          });
        });
    })
    .catch((err) => {
      console.error("error");
      return response
        .status(500)
        .json({ error: `Failed to add new event to /events database ${err}` });
    });
};

exports.toggleServiceStatus = (request, response) => {
  const noImg = "no_img.jpg";
  let userHandle = request.user.userHandle; 
  let vendorFullName = request.body.vendorFullName; 
  let serviceType = request.body.serviceType; 
  let eventID = request.body.eventID; 

  db.doc(`/events/${eventID}`).get()
  .then(doc =>
  { 
      if(!doc.exists)
      {
        return response.status(500).json({error: `Event ${eventID} does not exist`});
      }

      let data = doc.data(); 
      if(data.userHandle != userHandle)
      {
        return response.status(500).json({error: `User ${userHandle} does not have permission to modify event ${eventID}`});
      }

      let services = data.services; 
      let found = false; 
      services.forEach(service =>
      {
        if(service.serviceType == serviceType)
        {
          found = true; 
          if(service.service != null)
          {
            service.service = null; 
          }else
          {
            service.service = {
              'fullName': vendorFullName,
              'imageUrl': `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
              'userHandle': null
            }
          }
        }
      });
      
      if(!found)
      {
        return response.status(500).json({err: `Service ${serviceType} not found for event ${eventID}`});
      }

      return db.collection("events").doc(eventID).update({services})
  })      
  .then(() =>
  {
      return response.status(201).json({message: `${serviceType} service for event ${eventID} toggled successfully.`}); 
  })
  .catch(err =>
  {
      return response.status(500).json({err}); 
  })
}



exports.deleteEvent = (request, response) => {
  if (request.user.type !== "client") {
    return response
      .status(500)
      .json({ error: "Account type must be client to create an event." });
  }

  const eventID = request.body.eventID;
  db.doc(`/events/${eventID}`)
    .get()
    .then((event) => {
      if (!event.exists)
        return response
          .status(500)
          .json({ error: `Event ${eventID} does not exist` });
      return response.status(201).json(event.data());
    });

  const userHandle = request.user.userHandle;
  db.doc(`/users/${userHandle}`)
    .get()
    .then((doc) => {
      let userEvents = doc.data().events;
      if (!userEvents.includes(eventID))
        return response
          .status(500)
          .json({ event: `User ${userHandle} cannot access event ${eventID}` });

      db.collection("contracts")
        .where("clientHandle", "==", userHandle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            let contract = doc.data();
            if (contract.eventID === eventID) {
              return response.status(500).json({
                event: `Contract ${contract.contractID} is tied to ${eventID}`,
              });
            }
          });

          db.collection("events")
            .doc(eventID)
            .delete()
            .then((res) => {
              response
                .status(201)
                .json({ message: "Event deleted succesfully" });
            })
            .catch((err) => {
              return response.status(500).json({ error: err, message: "Event not deleted" });
            });
        })
        .catch((err) => {
          return response.status(500).json({ error: err });
        });
    })
    .catch((err) => {
      return response.status(500).json({ error: err });
    });
};
