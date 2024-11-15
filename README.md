For a more detailed README: [https://drive.google.com/file/d/1b_bivXpFJ3m1FT19_V0FQCCxqDCeCqX-/view?usp=sharing](url)
# **Campus Connect**


## **Project Description**
### Section 1: Motivation and Aims
Our application aims to address often-overlooked challenges university students encounter, such as academic, social and personal hurdles, which may come to feel overwhelming.
Our aim is to create a platform where students from different universities in Singapore can seek support and guidance through provision of their experiences, study tips and
academic advice tailored to their individual needs. This will be done by connecting students with other peers or alumni who have navigated similar challenges. Social connections
are thus fostered and students will no longer feel isolated as they know that they can seek help and support anytime through this application, promoting mental well-being and 
personal growth. Ultimately, our goal is to empower students to overcome obstacles, achieve their goals, and enjoy a fulfilling university experience within a
vibrant and inclusive community.
<br>

<br>

### Section 2: Campus Connect Features:
Our final application will consist of the following core and extension features:
1. Account Creation, Deletion and Updating (Core)
2. Option to Remain Anonymous (Core)
3. Post and Comment System (Core)
4. Direct Messaging System (Core)
5. Moderation of Users (Extension)
6. Display Configuration (Extension)
<br>

### Section 3: Tech Stack
Campus Connect will use a PERN stack as our main architecture to build a full-stack application with CRUD operations.
<br>
Frontend: **React Native** (responsible for our app's GUI)
<br>
Backend: **Express and Node.js** (building of our restful API and handling of HTTP requests and responses)
<br>
Database: **PostgreSQL** (database management system that is ACID compliant)
<br>

<br>

### Section 4: System Architecture Diagram
![System Architecture Diagram](https://github.com/haleemairfan/HardCoders/assets/156863812/1e8a68c3-85a3-4231-ae5a-749dcc90ed49)
*Figure 1: Campus Connect System Architecture Diagram*
<br>

Above details how the components of the tech stack (highlighted in Section 3) interact with each other on a system-level to deliver the client-side request
based on their interaction with the user interface of Campus Connect.
<br>

<br>

### Section 5: Entity-Relationship Diagram
![Entity-Relationship Diagram (Orbital) (1)](https://github.com/haleemairfan/HardCoders/assets/156863812/bb5ef41c-19e5-493d-afff-a75b2e075ecf)
*Figure 2: Campus Connect Database Entity-Relationship Diagram*
<br>

Above details how the different entities in the database are associated with each other by means of the Crow's feet notation. 
All tables branch out from the Users Table (as that is the first table the user information is inserted into when an account is created). 
They then respectively branch out to their individual tables like so:
- One-to-One Relationship: **Moderator Table** and **Configuration Table** (as each user can only have one moderator status and display configuration)
- One-to-Many Relationship: **Post Table**, **Comment Table**, **Reported Posts Table**, **Reported Comments Table** (as each user can have multiple posts / comments
  which may or may not be reported)

<br>

## **Installation and Running**
we used the expo app template to create the frontend of our app using react native.
you can run our app on an android emulator.
Currently the login page is not completed and has a placeholder page.
The account creation page is completed however, we were unable to figure out why the frontend is not able to connect to the backend and send the necessary data
The backend is located in the node-mySQL folder. we used mySQL as we havent fully figured out how to integrate postgreSQL with node.js. To run our backend server, use the command npm start. Our mySQL database is locally created via PHPMyAdmin.

<br>

**Orbital Team 6211: Halemma Irfan and Yeo Jaye Lin**
<br>

