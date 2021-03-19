# Introduction

This API was created for the purposes of the assignment [msw-keeposted](https://github.com/hkgnp/msw-keeposted). It is being deployed on [Heroku](https://www.heroku.com) and connects to both [MongoDB](https://www.mongodb.com/cloud/atlas) and [Amazon S3](https://aws.amazon.com/s3/).

Note: As this is not a secure database, please do not post any real or sensitive information to it.

## Routes

### Posts

Users can perform the below transactions for resources, including uploading an image from their device. The following flow is expected upon posting of a resource.

1. Obtained a signed URL from S3
2. A new resource is inserted into the database.
3. Retrieve the ObjectId of the new resource.
4. Use the ObjectId to post the URL of the image file to the database.

```
- GET
- POST
- PUT
- DELETE
```

### Reviews

Users can perform the below transactions for reviews of resources. `GET` will return the review, user's name and the message time.

```
- GET
- POST
```

### Users

Users can perform the below transactions for the registration and logging in of users. Upon a successful registration, user's password will be hashed before posting to the database. Upon a successful login, a JWT will be sent to the user.

```
- GET
- POST
- PUT
```
