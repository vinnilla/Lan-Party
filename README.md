#[LAN PARTY](http://lan-party.herokuapp.com "Lan Party")

### A real-time co-op combat based game using socket.io


##### MEAN Stack:
Mongo is used to store account information (username and password) as well as character information associated with the account.
Express and Node are used to set up the backend so that Angular can make http requests to Mongo.
Angular is used to create the main application, being a game.
Socket.io is used to create the multiplayer aspect of the game. Players can play with up to 3 other players to experience the game in a different light.

##### Approach:
Main landing page allows users to register or login to a pre-existing account.
Once registered/logged in, the users are sent to the main game screen where they are presented with the option to start the game solo, or join a room to play cooperatively.
	If co-op is selected, users can type in the name of the room to join (if no room exists, a new room is created.) Only 4 players can play together.
	The game progresses in waves until the team eventually succumbs to the neverending horde of zombies.

##### Front-End Angular Routes:
Route | Description
--- | ---
/#/welcome | landing page - option to register or login
/#/register| registration form
/#/login   | login form
/#/game    | the shell page for the game (has the option and sound buttons in a 'header')
/#/game/home    | game landing page - option to play solo or in a group
/#/game/group   | enter the name of the group to join
/#/game/start/lobby   | the team name is shown with all players who are in the team
/#/game/start/playing | the game runs and the team tries to survive the unending onslaught


##### Back-End Express Routes:
Action | Route | Description
--- | --- | ---
post | /login | local authorization for logging in
post | /register | local authorization for registering
get | /users | get all users in database
post | /users | add a new user to database
get | /user | pull user information (send to front end on login)
delete | /users | remove user from database

##### Models
User:

Key | Type | Value | Use
--- | --- | --- | ---
name | string | set on registration | authorization
password_hash | string | set on registration | authorization
socket | string | set on login | connecting to socket on backend
experience | number | default 0, updates with gameplay | track overall level of character
class | string | default null, updates when class is selected | track character class
room | string | default null, updates when room is joined | track which users are in which rooms
date | date | set on registration | track date and time account was made

##### Known Bugs:
