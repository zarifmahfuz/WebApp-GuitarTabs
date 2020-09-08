# WebApp-GuitarTabs
A web application to post, edit, comment and review guitar tabs!

Data Models:
1) User
2) Tab
3) Comment
4) Review

Comments and reviews are associated with a particular guitar tab/post on the website.

Some Important Website Features:
1) The application connects to a MongoDB database to support the whole website. 
2) User authentication: Users can sign up and returning users can login to their previously created profile and proceed to an active session on the website. 
3) User authorization: An user is only allowed to do certain things on the website. 
                  - To post a guitar tab, an user must be signed in
                  - To edit/delete a guitar tab, the user must own the post
                  - To comment/review a post, an user must be signed in
                  - To edit/delete a comment/review, an user must own the comment/review
                  - An user is only allowed to make one review on a post, but can make multiple comments
4) Reviews: Users can rate a guitar tab from 1 to 5 stars and the average review rating as well as reviews and ratings by other users can be seen on the website
5) Comments: Users can add comments to a post
