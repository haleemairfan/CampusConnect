-- DATABASE CREATION
CREATE DATABASE campusconnect;
\c campusconnect;


-- SECTION 1: TABLES AND TEST CASES --
-- USERS TABLE
CREATE TABLE users (
    user_uuid UUID NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE NOT NULL ,
    password_hash VARCHAR(255) NOT NULL,
    date_created DATE NOT NULL,
    UNIQUE (username),
    UNIQUE (email)
);

---- USERS Test Case:
BEGIN;
INSERT INTO users (user_uuid, username, email, date_of_birth, password_hash, date_created) 
VALUES (uuid_generate_v4(), 'usersite', 'jaye@gmail.com', '2002-05-30', 'password', NOW());
SELECT * FROM users;
ROLLBACK;


-- POST TABLE
CREATE TABLE posts (
    post_uuid UUID NOT NULL PRIMARY KEY,
    post_title TEXT NOT NULL, 
    post_body TEXT NOT NULL,
    post_date DATE NOT NULL,  
    post_time TIME NOT NULL,
    user_uuid UUID REFERENCES users(user_uuid)
);

---- POST Test Case:
BEGIN;
INSERT INTO posts (post_uuid, post_title, post_body, post_date, post_time)
VALUES (uuid_generate_v4(), 'Hello World!', 'A simple test.', NOW(), NOW());
UPDATE posts SET user_uuid = '5df00137-b2f0-4d8f-b973-ec9c1a176916' WHERE post_uuid = 'e515f417-0560-48cb-b966-2d419f03a0b3';
SELECT * FROM posts;
ROLLBACK;


-- COMMENT TABLE 
CREATE TABLE comments ( 
    comment_uuid UUID NOT NULL PRIMARY KEY,
    comment_body TEXT NOT NULL,
    comment_date DATE NOT NULL,
    comment_time TIME NOT NULL,
    user_uuid UUID REFERENCES users(user_uuid),
    post_uuid UUID REFERENCES posts(post_uuid)
);

-- COMMENT Test Case:
BEGIN;
INSERT INTO comments (comment_uuid, comment_body, comment_date, comment_time)
VALUES (uuid_generate_v4(), 'This is a comment.', NOW(), NOW());
UPDATE comments SET user_uuid = '5df00137-b2f0-4d8f-b973-ec9c1a176916' WHERE comment_uuid = '74d1dd7c-5ae6-4298-bfd1-ad207f62e159';
UPDATE comments SET post_uuid = 'e515f417-0560-48cb-b966-2d419f03a0b3' WHERE comment_uuid = '74d1dd7c-5ae6-4298-bfd1-ad207f62e159';
SELECT * FROM comments;
ROLLBACK;


-- MODERATOR TABLE (Lists all the moderators with moderator privileges)
CREATE TABLE moderators (
    moderator_id BIGSERIAL NOT NULL PRIMARY KEY,
    user_uuid UUID REFERENCES users(user_uuid),
    moderator_type VARCHAR(255) NOT NULL
);

---- MODERATOR Test Case:
BEGIN;
INSERT INTO moderators (moderator_type) VALUES ('Senior Moderator');
UPDATE moderators SET user_uuid = '5df00137-b2f0-4d8f-b973-ec9c1a176916' WHERE moderator_id = 1;
SELECT * FROM moderators;
ROLLBACK;


-- REPORTED POSTS TABLE
CREATE TABLE reported_posts (
    rep_post_id BIGSERIAL NOT NULL PRIMARY KEY,
    date_reported DATE NOT NULL,
    time_reported TIME NOT NULL,
    reported_by_uuid UUID REFERENCES users(user_uuid),
    reported_against_uuid UUID REFERENCES users(user_uuid),
    post_reported_uuid UUID REFERENCES posts(post_uuid)
);

---- REPORTED POSTS Test Case:
BEGIN;
INSERT INTO reported_posts (date_reported, time_reported)
VALUES (NOW(), NOW());
UPDATE reported_posts SET user_uuid = '5df00137-b2f0-4d8f-b973-ec9c1a176916' WHERE rep_post_id = 1;
UPDATE reported_posts SET post_uuid = 'e515f417-0560-48cb-b966-2d419f03a0b3' WHERE rep_post_id = 1;
SELECT * FROM reported_posts;
ROLLBACK;


-- REPORTED COMMENTS TABLE
CREATE TABLE reported_comments (
    rep_comment_id BIGSERIAL NOT NULL PRIMARY KEY,
    date_reported DATE NOT NULL,
    time_reported TIME NOT NULL,
    reported_by_uuid UUID REFERENCES users(user_uuid),
    reported_against_uuid UUID REFERENCES users(user_uuid),
    reported_comment_uuid UUID REFERENCES comments(comment_uuid)
);

---- REPORTED COMMENTS Test Case:
BEGIN;
INSERT INTO reported_comments (date_reported, time_reported)
VALUES (NOW(), NOW());
UPDATE reported_comments SET user_uuid = '5df00137-b2f0-4d8f-b973-ec9c1a176916' WHERE rep_comment_id = 1;
UPDATE reported_comments SET comment_uuid = '74d1dd7c-5ae6-4298-bfd1-ad207f62e159' WHERE rep_comment_id = 1;
SELECT * FROM reported_comments;
ROLLBACK;


-- CONFIRGURATION TABLE (Customisation Options)
CREATE TABLE config (
    config_id BIGSERIAL NOT NULL PRIMARY KEY,
    style VARCHAR(255) NOT NULL,
    colour VARCHAR(255) NOT NULL,
    char_size INT NOT NULL,
    user_uuid UUID REFERENCES users(user_uuid)
);

-- CONFIGURATION Test Case:
BEGIN;
INSERT INTO config (style, colour, char_size) 
VALUES ('Mocha', 'Red', 50);
UPDATE config SET user_uuid = '5df00137-b2f0-4d8f-b973-ec9c1a176916' WHERE config_id = 1;
SELECT * FROM config;
ROLLBACK;



-- SECTION 2: TRIGGERS AND TRIGGER FUNCTIONS --
-- 1. New User Triggers Default Configuration
-- i. Trigger Function
CREATE FUNCTION add_default_user_config()
RETURNS TRIGGER AS
$$
BEGIN
INSERT INTO config (style, colour, char_size, user_uuid)
VALUES ('Default', 'Default', 20, NEW.user_uuid);

RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- ii. Trigger
CREATE TRIGGER default_config
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION add_default_user_config();

--- iii. Test Case
BEGIN;
INSERT INTO users (user_uuid, username, email, date_of_birth, password_hash, date_created) 
VALUES (uuid_generate_v4(), 'kellyfjh', 'kelly@gmail.com', '1967-03-26', 'password', NOW());
SELECT * FROM users;
ROLLBACK;



-- SECTION 3: FUNCTIONS --
-- 1. New Post by User
CREATE FUNCTION make_new_post (user_name VARCHAR(255), title TEXT, body TEXT)
RETURNS TEXT AS
$$
DECLARE user_exists BOOLEAN;
DECLARE user_uid UUID;
DECLARE post_uid UUID;
BEGIN

SELECT EXISTS (
    SELECT username FROM users
    GROUP BY username
    HAVING COUNT(*) >= 1
) INTO user_exists;

IF user_exists THEN
    INSERT INTO posts (post_uuid, post_title, post_body, post_date, post_time)
    VALUES (uuid_generate_v4(), title, body, NOW(), NOW());
    SELECT user_uuid INTO user_uid FROM users u WHERE u.username = user_name;
    SELECT post_uuid INTO post_uid FROM posts p WHERE p.post_title = title AND p.post_body = body;
    UPDATE posts SET user_uuid = user_uid WHERE post_uuid = post_uid;

    RAISE NOTICE 'Post created!';
ELSE
    RAISE NOTICE 'User does not exist!';
END IF;

RETURN 'Function run success!';

END;
$$
LANGUAGE plpgsql;

---- Test Case:
SELECT make_new_post('usersite', 'Post 2', 'This is a new post!');

-- 2. Remove Post by User
CREATE FUNCTION remove_post (user_name VARCHAR(255), post_uid UUID)
RETURNS TEXT AS
$$
DECLARE user_uid UUID;
DECLARE post_username VARCHAR(255);
DECLARE title TEXT;
DECLARE body TEXT;
BEGIN

SELECT user_uuid INTO user_uid FROM posts p WHERE p.post_uuid = post_uid;
SELECT post_title, post_body INTO title, body FROM posts p WHERE p.post_uuid = post_uid;
SELECT username INTO post_username FROM users u WHERE u.user_uuid = user_uid;
IF user_name = post_username THEN
DELETE FROM posts WHERE post_title = title AND post_body = body AND post_uuid = post_uid;
RAISE NOTICE 'Post deleted!';
ELSE
RAISE NOTICE 'User mismatch, post not deleted!';
END IF;

RETURN 'Function run success!';
END;
$$
LANGUAGE plpgsql;

-- Test Case:
SELECT remove_post('kellyfjh', 'a3589095-9271-45e8-b9c5-025dc39cfe7e');  -- User Mismatch
SELECT remove_post('usersite', 'a3589095-9271-45e8-b9c5-025dc39cfe7e');  -- Correct Deletion


-- 3. New Comment by User
CREATE FUNCTION make_new_comment (user_name VARCHAR(255), post_uid UUID, body TEXT)
RETURNS TEXT AS
$$
DECLARE user_exists BOOLEAN;
DECLARE post_exists BOOLEAN;
DECLARE user_uid UUID;
DECLARE comment_uid UUID;
BEGIN

SELECT EXISTS (
    SELECT username FROM users
    GROUP BY username
    HAVING COUNT(*) >= 1
) INTO user_exists;

SELECT EXISTS (
    SELECT post_uuid FROM posts
    GROUP BY post_uuid
    HAVING COUNT(*)  >= 1
) INTO post_exists;

IF user_exists AND post_exists THEN
    INSERT INTO comment (comment_uuid, comment_body, comment_date, comment_time)
    VALUES (uuid_generate_v4(), body, NOW(), NOW());
    SELECT user_uuid INTO user_uid FROM users u WHERE u.username = user_name;
    SELECT comment_uuid INTO comment_uid FROM comments c WHERE c.body = body;    -- did not account for duplicate comments
    UPDATE comments SET user_uuid = user_uid AND post_uuid = post_uid WHERE comment_uuid = comment_uid;

    RAISE NOTICE 'Comment created!';
ELSE IF post_exists THEN
    RAISE NOTICE 'User does not exist!';
ELSE
    RAISE NOTICE 'Post does not exist!';
    END IF;
END IF;

RETURN 'Function run success!';
END;
$$
LANGUAGE plpgsql;


-- 3. See All Posts By User

-- 4. See All Comments By User

-- 5. See All Comments Under Post

-- 6. Change Configuration Settings

-- 7. Report Post

-- 8. Report Comment

-- 9. Add a Moderator
CREATE FUNCTION add_mod (user_name VARCHAR(255), mod_status TEXT)
RETURNS TEXT AS
$$
DECLARE user_exists BOOLEAN;
DECLARE mod_exists BOOLEAN;
DECLARE user_uid UUID;
BEGIN

SELECT EXISTS (
    SELECT username FROM users
    WHERE username = user_name
    GROUP BY username
    HAVING COUNT(*) >= 1
) INTO user_exists;

SELECT user_uuid INTO user_uid FROM users u WHERE u.username = user_name;

SELECT EXISTS (  --- Abstract if possible
    SELECT user_uuid FROM moderators
    WHERE user_uuid = user_uid
    GROUP BY user_uuid
    HAVING COUNT(*) >= 1
) INTO mod_exists;

IF mod_exists THEN
    RAISE NOTICE 'User is already a moderator!';
ELSE IF user_exists THEN
    INSERT INTO moderators (moderator_type, user_uuid)
    VALUES (mod_status, user_uid);
    RAISE NOTICE 'Moderator status updated!';
ELSE
    RAISE NOTICE 'User does not exist!';
    END IF;
END IF;

RETURN 'Function run success!';
END;
$$
LANGUAGE plpgsql;

-- 13. Update Moderator Status
CREATE FUNCTION change_mod_status (user_name VARCHAR(255), mod_status TEXT)
RETURNS TEXT AS
$$
DECLARE user_exists BOOLEAN;
DECLARE mod_exists BOOLEAN;
DECLARE user_uid UUID;
BEGIN

SELECT EXISTS (
    SELECT username FROM users
    WHERE username = user_name
    GROUP BY username
    HAVING COUNT(*) >= 1
) INTO user_exists;

SELECT user_uuid INTO user_uid FROM users u WHERE u.username = user_name;

SELECT EXISTS (  -- Abstract if possible
    SELECT user_uuid FROM moderators
    WHERE user_uuid = user_uid
    GROUP BY user_uuid
    HAVING COUNT(*) >= 1
) INTO mod_exists;

IF user_exists AND mod_exists THEN
   UPDATE moderators SET moderator_type = mod_status WHERE user_uuid = user_uid;
ELSE IF user_exists THEN
    RAISE NOTICE 'User is not a moderator!';
ELSE
    RAISE NOTICE 'User does not exist!';
    END IF;
END IF;

RETURN 'Function run success!';
END;
$$
LANGUAGE plpgsql;

-- 13. Remove Moderator Status
CREATE FUNCTION remove_mod (user_name VARCHAR(255))
RETURNS TEXT AS
$$
DECLARE user_uid UUID;
DECLARE user_exists BOOLEAN;
DECLARE mod_exists BOOLEAN;
BEGIN

SELECT EXISTS (
    SELECT username FROM users
    WHERE username = user_name
    GROUP BY username
    HAVING COUNT(*) >= 1
) INTO user_exists;

SELECT user_uuid INTO user_uid FROM users u WHERE u.username = user_name;

SELECT EXISTS (  -- Abstract if possible
    SELECT user_uuid FROM moderators
    WHERE user_uuid = user_uid
    GROUP BY user_uuid
    HAVING COUNT(*) >= 1
) INTO mod_exists;

IF user_exists AND mod_exists THEN
    DELETE FROM moderators m WHERE m.user_uuid = user_uid;
ELSE IF user_exists THEN
    RAISE NOTICE 'This user is not a moderator!';
ELSE
    RAISE NOTICE 'User does not exist!';
    END IF;
END IF;

RETURN 'Function run success!';
END;
$$
LANGUAGE plpgsql;

-- 11. Remove Comment

-- 12. Remove User
CREATE FUNCTION remove_user (user_name VARCHAR(255))
RETURNS TEXT AS 
$$ 
DECLARE user_exists BOOLEAN;
DECLARE user_uid UUID;
BEGIN

SELECT EXISTS (
    SELECT username FROM users
    WHERE username = user_name
    GROUP BY username
    HAVING COUNT(*) >= 1
) INTO user_exists;

IF user_exists THEN
SELECT user_uuid INTO user_uid FROM users u WHERE u.username = user_name;
DELETE FROM reported_comments rc WHERE rc.user_uuid = user_uid;
DELETE FROM reported_posts rp WHERE rp.user_uuid = user_uid;
DELETE FROM comments WHERE comments.user_uuid = user_uid;
DELETE FROM posts WHERE posts.user_uuid = user_uid;
DELETE FROM moderators WHERE moderators.user_uuid = user_uid;
DELETE FROM config WHERE config.user_uuid = user_uid;
DELETE FROM users WHERE users.user_uuid = user_uid;

RAISE NOTICE 'User deleted!';
ELSE
RAISE NOTICE 'User does not exist!';
END IF;

RETURN 'Function run success!';
END;
$$
LANGUAGE plpgsql;

-- Test Case:
SELECT remove_user('usersite');

-- 14. Remove Report Post

-- 15. Remove Report Comment


-- SECTION 4: VIEWS
-- 1. View All Posts
CREATE VIEW all_posts AS
SELECT username, post_title, post_body, post_date, post_time FROM 
users JOIN posts ON posts.user_uuid = users.user_uuid;

SELECT * FROM all_posts;

-- 2. View All Comments
CREATE VIEW all_comments AS 
SELECT username, post_title, post_body, comment_body, comment_date, comment_time FROM
users JOIN posts ON posts.user_uuid = users.user_uuid
JOIN comments ON comments.post_uuid = posts.post_uuid;

SELECT * FROM all_comments;

-- 3. View All Moderators
CREATE VIEW all_moderators AS 
SELECT username, moderator_type FROM 
users JOIN moderators ON users.user_uuid = moderators.user_uuid;

SELECT * FROM all_moderators;

-- 4. View All Users
CREATE VIEW all_users AS
SELECT username, date_created FROM users;

SELECT * FROM all_users;

-- 5. View All Reported Posts
CREATE VIEW all_reported_posts AS
SELECT username, post_title, post_body, date_reported, time_reported
FROM users JOIN posts ON posts.user_uuid = users.user_uuid
JOIN reported_posts rp ON rp.post_uuid = posts.post_uuid;

SELECT * FROM all_reported_posts;

-- 6. View All Reported Comments
CREATE VIEW all_reported_comments AS 
SELECT username, comment_body, date_reported, time_reported
FROM users JOIN comments ON comments.user_uuid = users.user_uuid
JOIN posts ON comments.post_uuid = posts.post_uuid
JOIN reported_comments rc ON rc.comment_uuid = comments.comment_uuid;

SELECT * FROM all_reported_comments;

