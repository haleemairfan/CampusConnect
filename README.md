<<<<<<< HEAD
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
Our project is still in progress, as such a completed system is not fully available to run. <br>
However, we currently have both the application code (React Native) and database code (PostgreSQL) up on our Github. 
Please download the files and take a look.


<br>

**Orbital Team 6211: Halemma Irfan and Yeo Jaye Lin**
<br>
Last Updated: 03/06/2024
=======
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
>>>>>>> 57542cd (Initial commit)
