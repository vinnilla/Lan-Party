#LAN PARTY

### A real-time coop combat based game using socket.io

##### MEAN Stack:
Mongo is used to store account information (username and password) as well as character information associated with the account.
Express and Node are used to set up the backend so that Angular can make http requests to Mongo.
Angular is used to create the main application, being a game.
Socket.io is used to create the multiplayer aspect of the game. Players can play with up to 3 other players to experience the game in a different light.

##### Approach:
Main landing page allows users to register or login to a pre-existing account.
Once registered/logged in, the users are sent to the main game screen where they are presented with the option to start the game solo, or join a room to play cooperatively.
	If co-op is selected, users can type in the name of the room to join (if no room exists, a new room is created.) Only 4 players can play together.

##### Routes: 
Front-End Angular Routes:
| Route     | Description  |
|:---------:|:------------:|
|/#/welcome | landing page - option to register or login |
|/#/register| registration form |
|/#/login   | login form |
|/#/game    | the shell page for the game (has the option and sound buttons in a 'header') |
|/#/home    | game landing page - option to play solo or in a group |
|/#/group   | enter the name of the group to join |
|/#/start   | the team name is shown with all players who are in the team |