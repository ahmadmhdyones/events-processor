# events-processor

## Task

### The Problem

- We have a frontend mobile app for fitness training, sth like Nike Training App. We have a corresponding backend that manages users, training programs, user progress, etc.

- What we care about here is a micro-service that manages and process events the app pushes to our backend. This micro-service gets called via a POST operation on one of its endpoints `/v1/event`. The mobile app will call this api endpoint. This endpoint accepts an event object and process it.

### Example

- Our system will receive a continuous series of events like the following snapshot: Two users opening the app, playing and 1 cancelling a training program.

```json
{
 "user_id": "foo2",
 "device_id": "bar2",
 "type": "app_launch",
 "time_stamp": "2021-02-28 16:22:52",
},
{
 "user_id": "foo1",
 "device_id": "bar1",
 "type": "training_program_started",
 "training_program_id": "2352",
 "training_program_title": "7 Minutes of HIIT Training",
 "time_stamp": "2021-02-28 16:23:25",
},
{
 "user_id": "foo2",
 "device_id": "bar2",
 "type": "training_program_started",
 "training_program_id": "2352",
 "time_stamp": "2021-02-28 16:52:00",
},
{
 "user_id": "foo2",
 "device_id": "bar2",
 "type": "training_program_cancelled",
 "training_program_id": "2352",
 "time_stamp": "2021-02-28 16:54:21",
},
{
 "user_id": "foo1",
 "device_id": "bar1",
 "type": "training_program_finished",
 "training_program_id": "2352",
 "time_stamp": "2021-02-28 16:59:43",
},
//etc
```

### Technical Spec

- We want to improve the events object structure, naming convention, style, if any. Feel free to propose changes to the event object structure as you see fit and embed them into your solution design.

- Do setup the domain logic, resources and data model that are needed for this problem.

- We consider the events are chronologically ordered, meaning, the events come in order of their time_stamp.

- If a user finishes a training program that is more than 30 minutes long we want to call an api endpoint `/v1/notify` with a proper message to congratulate the user on doing his daily training dose mentioning the exact minutes he trained. Notifications are handled in another micro-service that we don’t care about in this test. We only have to call `/v1/notify`

- If a user opens the app and don’t start any training program within 10 minutes, we want to push a notification to `/v1/notify` encouraging him to start training now.

- This system should have the ability to handle unknown (unsupported) events gracefully. It should also handle new events in the future with minimum code changes. So, the design of this system, should keep this in mind.

### Requirements and Assessment Scale

- Handling of notifications at `/notify` is not part of this test. You only have to call an endpoint.
- Setup a local server that can handle the RESTful API.
- There’s no need to setup DB tables or use of DB tables at all. Use any temp data structure you like. Or mock a DB if you want.
- Use of TDD is extremely encouraged.
- This is a cmd/console application. No UI is needed.

## Design Solution

### Event Object's Improvement

1. **Removed `userId` Key:** Assuming a reliable link between `userId` and `deviceId`.

2. **Retained `deviceId` Key:** Kept the `deviceId` as the primary identifier for associating events with users.

3. **Event Type as ENUM:** The `type` field now uses an ENUM for event type identification.

4. **Standardized Timestamp:** The `timestamp` field uses the ISO 8601 format.

5. **Encapsulated Event-Specific Data:** Introduced a `details` object for event-specific data like `programId` and `programTitle`.

#### Final Structure

```json
{
  "deviceId": "bar1",
  "type": "EVENT_TYPE_ENUM",
  "timestamp": "2021-02-28T16:23:25Z",
  "details": {
    "programId": "2352",
    "programTitle": "7 Minutes of HIIT Training"
  }
}
```

### Handle Future Updates

#### Handling Unsupported Events Gracefully

1. The ability to use a `switch` statement in the event processing service to handle different event types, or just by using emitters/listeners approach.
2. Emit an event `unsupported-event` for handling unsupported event types.
3. Create an event listener method, like `handleUnsupportedEvent`, to log and respond to unsupported events.

#### Adding New Events with Minimal Code Changes

1. Design the event processing logic in a modular way with separate handler methods for each event type.
2. Define event types using an ENUM. Add new event types by extending this ENUM.
3. Design flexible data structure considering that event data can vary. This might involve using optional field `details`.

### Architecture

1. **Event-Driven Approach Using Nest.js:** Utilizes Nest.js's built-in event emitter for handling and emitting events within the application.

2. **Modular Event Listeners:** Implements event listeners, possibly within a dedicated class or as separate entities, to handle specific types of events.

3. **No External Message Broker:** The architecture operates without external message brokers like RabbitMQ, Kafka, or Redis, keeping the setup simple and contained within the Nest.js environment.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stay in touch

- Author - [Ahmad Yones](mailto:ahmadmhdyones@gmail.com)
- Website - [LinkedIn](https://www.linkedin.com/in/ahmadmhdyones/)
