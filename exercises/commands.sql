postgres=# insert into blogs (author, url, title, likes) values ('Chuck Palahniuk', 'www.fight.com', 'Fight Club', 10);

postgres=# insert into blogs (author, url, title, likes) values ('JK Rowling', 'www.harrypots.com', 'Harry Potter and the Sorcerer''
s Stone', 5);

postgres=# CREATE TABLE blogs (
postgres(# id SERIAL PRIMARY KEY,
postgres(# author text,
postgres(# url text NOT NULL,
postgres(# title text NOT NULL,
postgres(# likes integer DEFAULT 0
postgres(# );