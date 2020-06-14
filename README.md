<h1 align="center">
  <img src="https://res.cloudinary.com/eykhagen/image/upload/v1536487016/logo.png" height="300" width="300"/>
  <p align="center" style="font-size: 0.5em">:rocket: Flexible REST Tests</p>
</h1>

![](https://img.shields.io/github/license/eykrehbein/strest.svg)
![](https://img.shields.io/github/package-json/v/eykrehbein/strest.svg)
![](https://img.shields.io/npm/v/@strest/cli.svg)

**:link: Connect multiple requests**: _Example_ Embed an authorization token you got as a response from a login request in your following requests automatically

**:memo: YAML Syntax**: Write all of your tests in YAML files

**:tada: Easy to understand**: You'll understand the concept in seconds and be able to start instantly (seriously!)

## Try it with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io#https://github.com/eykrehbein/strest)

Run some Tests

```bash
npm i -g @strest/cli
strest tests/success/postman.strest.yml
```

## Getting Started in your own environment

```bash
# Via Yarn
yarn global add @strest/cli
```

```bash
# Via npm
npm i -g @strest/cli
```

```bash
# Via Docker
# The image contains everything in the tests directory
docker run -it eykrehbein/strest:latest strest tests/success/chaining/

# Bring your own test and environment
docker run -it --env STREST_URL=https://jsonplaceholder.typicode.com -v ${PWD}:/app/data eykrehbein/strest:latest strest /data/tests/success/Env/
```

We'll be using the [postman-echo](https://docs.postman-echo.com) test API in this tutorial.

To get started, we're using [this file](tests/success/postman.strest.yml) _(The extension needs to be `.strest.yml` or `.strest.yaml`)_

```yaml
version: 2                            # only version at the moment

requests:                             # all test requests will be listed here
  testRequest:                        # name the request however you want
    request:
      url: https://postman-echo.com/get  # required
      method: GET                       # required
      queryString:
      - name: foo1
        value: bar1
      - name: foo2
        value: bar2
    # log: true # uncomment this to log the response
```

To run the test, open your terminal and type

```bash
strest tests/success/postman.strest.yml
```

You may also run multiple test files at the same time by pointing to the directory, where the files are stored

```bash
strest tests/success/chaining
# or
strest # this will recursively search for all .strest.yml files in the cwd and it's subdirectories
```

Success! If you've done everything correctly, you'll get a response like this

```shell
[ Strest ] Found 4 test file(s)
[ Strest ] Schema validation: 4 of 4 file(s) passed

Executing tests in ./
✔ Testing login succeeded (0.463s)
✔ Testing verify_login succeeded (0.32s)
✔ Testing verify_login_chained succeeded (0.233s)
Executing tests in: ./var/
✔ Testing chaining_var1 succeeded (0.128s)
✔ Testing chaining_var2 succeeded (0.131s)

[ Strest ] ✨  Done in 1.337s
```

## Writing .strest.yml test files

The examples in [tests/success](tests/success/) are used for testing this library. Read through the examples to see what is possible.

## VS Code extension

Send requests directly from the yml file.

[source](https://github.com/jgroom33/vscode-strest-client)

[extension](https://marketplace.visualstudio.com/items?itemName=jgroom.strest)

![alt text](https://raw.githubusercontent.com/jgroom33/vscode-strest-client/master/images/strest_preview.gif "extension demo")

## Documentation

- [How to write Tests](SCHEMA.md)
- [Validation Types](VALIDATION.md)
- [Examples](tests/success/)

## Using & Connecting multiple requests

With traditional tools like [Postman](https://www.getpostman.com/) or [Insomnia](https://insomnia.rest/) it's common to perform only a single request at a time. Moreover, you have to trigger each request on your own with a click on a button.

With __Strest__ you're able to predefine a very well structured test file once, and every time you make any changes to your API you can test it with just one command in your terminal. Additionally, you can add hundreds or thousands of requests and endpoints which will run synchronously one after the other.

To create multiple requests, simply add multiple entries into the `requests` yaml object.

```yaml
version: 2

requests:
  requestOne:
    ...
  requestTwo:
    ...
  requestThree:
    ...
```

Running this will result in something like

```shell
[ Strest ] Found 1 test file(s)
[ Strest ] Schema validation: 1 of 1 file(s) passed

✔ Testing requestOne succeeded (0.1s)
✔ Testing requestTwo succeeded (0.32s)
✔ Testing requestThree succeeded (0.11s)

[ Strest ] ✨  Done in 0.62s
```

### Chaining multiple requests

**What is meant by _chaining multiple requests_?**

Chaining multiple requests means that you write a request and in each of the following requests you are able to use and insert any of the data that was responded by this request.

Each reponse is stored as a dictionary for future requests to use.  The format is [HAR](http://www.softwareishard.com/blog/har-12-spec/#response).  This format is used by browsers to store request and response history.

```json
{
  "login": {
    "status": 200,
    "statusText": "OK",
    "headers": {
      "content-type": "application/json; charset=utf-8",
      "date": "Mon, 12 Nov 2018 19:04:52 GMT",
      "vary": "Accept-Encoding",
      "content-length": "22",
      "connection": "Close"
    },
    "content": {
      "authenticated": true
    }
  }
}
```

#### Chaining Example

```yaml
requests:
  login: # will return { authenticated: true }
    ...
  authNeeded:
    request:
    ...
      headers:
      - name: Authorization
        value: Bearer <$ login.content.authenticated $>  # It's possible to use the status code, headers, and status text from previous calls.
```

As you could see, the usage is very simple. Just use `<$ requestName.content.jsonKey $>` to use any of the JSON data that was retrieved from a previous request. If you want to use raw data, just use `<$ requestName.content $>` without any keys.

You can use this syntax __*anywhere*__ regardless of whether it is inside of some string like `https://localhost/posts/<$ postKey.content.key $>/...` or as a standalone term like `Authorization: <$ login.content.token $>`

This can also be used across files as demonstrated [here](tests/success/chaining)

### JsonPath

Use JsonPath to extract specific data from previous.  [This](https://github.com/dchester/jsonpath) library is used.

```yaml
version: 2
requests:
  set_JsonPath:
    request:
      url: https://jsonplaceholder.typicode.com/posts
      method: POST
      postData:
        mimeType: application/json
        text:
          firstName: John
          lastName: doe
          age: 26
          address:
              streetAddress: 'naist street'
              city: Nara
              postalCode: 630-0192
          phoneNumbers:
              - {type: iPhone, number: 0123-4567-8888}
              - {type: home, number: 0123-4567-8910}
  JsonPath:
    request:
      url: https://postman-echo.com/get
      method: GET
      queryString:
      - name: foo
        value: <$ JsonPath("set_JsonPath.content.phoneNumbers[?(@.type == \"home\")].number") $>
    validate:
    - jsonpath: content.args.foo
      expect: 0123-4567-8910

```

Practice [here](http://jsonpath.com/)

## Using random values with Faker

If you need to generate some random values, you are able to do so by using [Faker API](http://marak.github.io/faker.js/) templates.

### Example - Faker

```yaml
version: 2

requests:
  fake:
    request:
      url: https://postman-echo.com/get
      method: GET
      queryString:
        - name: first
          value: <$ Faker("name.firstName") $>
        - name: first_last
          value: <$ Faker("name.firstName") $> <$ Faker("name.lastName") $>
    log: true
```

Visit [Faker.js Documentation](http://marak.github.io/faker.js/) for more methods

## Replacing values with predefined environment variables

### Example - Environment Variables

```bash
export STREST_URL=https://jsonplaceholder.typicode.com
strest tests/success/Env/environ.strest.yml
```

```yaml
version: 2
# ensure the ENV var is set: `export STREST_URL=https://jsonplaceholder.typicode.com`
requests:
  environment:
    request:
      url: <$ Env("STREST_URL") $>/todos/1
      method: GET
```

## Replacing values with predefined custom variables

### Example - User Defined Variables

```yml
version: 2

variables:  # Define variables here
  testUrl: https://jsonplaceholder.typicode.com/todos/1
  to_log: true

requests:
  my_variable_request:
    request:
      url: <$ testUrl $>
      method: GET
    log: <$ to_log $>

```

## Only Execute If

With **Strest** you can skip a response by setting a match criteria

```yaml
version: 2

requests:
  if_Set:
    request:
      url: https://jsonplaceholder.typicode.com/posts
      method: POST
      postData:
        mimeType: application/json
        text:
          foo: 1
  skipped:
    if:
      operand: <$ if_Set.content.foo $>
      equals: 2
    request:
      url: https://jsonplaceholder.typicode.com/todos/2
      method: GET
  executed:
    if:
      operand: <$ if_Set.content.foo $>
      equals: 1
    request:
      url: https://jsonplaceholder.typicode.com/todos/2
      method: GET
```

## Use strest file name as parameter in the tests
You can use the strest file name as a parameter in the tests .

*note* that the strest suffix is removed 

**Usage**
The file name for this example is postman-echo.strest.yml

```yml
version: 2                            
requests:                             
  test-file-name:                       
    request:
      url: https://<$ Filename() $>.com/get  
      method: GET                       
    validate:
    - jsonpath: status
      expect: 200
```

## Using dates and dates format 
You can insert dates times plus format them using the custom [nunjucks date filter](https://www.npmjs.com/package/nunjucks-date)
under the hood its a wrapper for [momentjs](https://momentjs.com/) so all its [formatting](https://momentjs.com/docs/#/displaying/) is supported  

**Usage**
You can use the date filter inside a nunjuck brackets in the request and inside the validate parts.

```yml
requests:
    moment-in-request:
      request:
        url: https://postman-echo.com/get
        method: GET
        queryString:
        - name: foo
          value: <$ now | date('YYYY') $>
      validate:
      - jsonpath: content.args.foo
        expect: "<$ '2019-10-10' | date('YYYY') $>"
    moment-in-validate:
      request:
        url: https://postman-echo.com/time/format?timestamp=2019-10-10&format=YYYY
        method: GET
      validate:
      - jsonpath: content.format
        expect: "<$ '2019-10-10' | date('YYYY') $>"
```

## Sending JSON requests from external files

If you have a JSON file that represents the body of your request, you can use the `json` option.

Strest will read the JSON file you have specified and add it to the body of the request, you won't even need to worry about the Content-Type header, Strest will take care of that for you.

```yaml
version: 2

requests:
  jsonfile:
    request:
      url: https://postman-echo.com/post
      method: POST
      json: tests/success/jsonfile/data.json  # You have to put the whole path relative to the current directory that you run strest
    log: true
```

## Sending files and form data
Sending files and form data is easy, use params type in the postData prop.
```yaml
version: 2
requests:
  postwithfile:
    request:
      url: https://postman-echo.com/post
      method: POST
      postData:
        mimeType: multipart/form-data
        params:
          - name: userId
            value: "1"
          - name: avatar
            value: <$ file("tests/strest.png") $>

```
## Response Validation

The immediate response is stored in [HAR Format](http://www.softwareishard.com/blog/har-12-spec/#response)

With **Strest** you can validate responses with:

- exact match (expect)
- regex
- type _[List of all valid Types](VALIDATION.md)_
- jsonschema

Read [jsonpath](https://github.com/dchester/jsonpath#jpvalueobj-pathexpression-newvalue) for more info and see [this file](tests/success/validate/jsonpath.strest.yml) for more complex example

### Expect

```yaml
requests:
  example:
    ...
    validate:
    - jsonpath: content
      expect: "the response has to match this string exactly"
```

### Type

```yaml
version: 2

requests:
  typeValidate:
    request:
      url: https://jsonplaceholder.typicode.com/todos
      method: GET
    validate:
    - jsonpath: headers["content-type"]
      type: [ string ]
    - jsonpath: status
      type: [ boolean, string, number ]
    - jsonpath: content.0.userId
      type: [ number ]
```

### Regex

Regex can be used to validate status code or any other returned param

```yml
version: 2

requests:
  codeValidate:
    request:
      url: https://jsonplaceholder.typicode.com/todos
      method: GET
    validate: # Multiple ways to use regex to validate status code
    - jsonpath: status
      regex: 2\d+
    - jsonpath: status
      regex: 2[0-9]{2}
    - jsonpath: status
      regex: 2..
    - jsonpath: status
      regex: 2.*
```

### jsonschema

Validate the response using a specified json(yaml) schema.  The schema can be defined in the variables portion or within the request.

```yaml
version: 2
variables:
  schemaValidate:
    properties:
      fruits:
        type: array
        items:
          type: string
      vegetables:
        type: array
        items:
          "$ref": "#/definitions/veggie"
    definitions:
      veggie:
        type: object
        required:
        - veggieName
        - veggieLike
        properties:
          veggieName:
            type: string
          veggieLike:
            type: boolean

requests:
  jsonschema1:
    request:
      url: https://postman-echo.com/post
      method: POST
      postData:
        mimeType: application/json
        text:
          fruits:
            - apple
            - orange
            - pear
          vegetables:
          - veggieName: potato
            veggieLike: true
          - veggieName: broccoli
            veggieLike: false
    validate:
    - jsonpath: content.data
      jsonschema: <$ schemaValidate | dump | safe $>
  jsonschema2:
    request:
      url: https://postman-echo.com/post
      method: POST
      postData:
        mimeType: application/json
        text:
          fruits:
            - apple
            - orange
            - pear
          vegetables:
          - veggieName: potato
            veggieLike: true
          - veggieName: broccoli
            veggieLike: false
    validate:
    - jsonpath: content.data
      jsonschema:
        properties:
          fruits:
            type: array
            items:
              type: string
          vegetables:
            type: array
            items:
              "$ref": "#/definitions/veggie"
        definitions:
          veggie:
            type: object
            required:
            - veggieName
            - veggieLike
            properties:
              veggieName:
                type: string
              veggieLike:
                type: boolean
```

### Retry until validation succeeds

```yaml
requests:
  waiter:
    request:
      url: https://postman-echo.com/time/now
      method: GET
    delay: 900
    maxRetries: 30
    validate:
    - jsonpath: status
      expect: 200
    - jsonpath: content
      expect: "Tue, 09 Oct 2018 03:07:20 GMT"
```

```bash
export STREST_GMT_DATE=$(TZ=GMT-0 date --date='15 seconds' --rfc-2822 | sed "s/+0000/GMT/g")
strest tests/success/validate/maxRetries.strest.yml
```

## Reusing Objects

stREST uses [nunjucks](https://mozilla.github.io/nunjucks/templating.html) to parse everything inside <$ $>

This allows passing complex objects between requests using the [`dump` filter](https://mozilla.github.io/nunjucks/templating.html#dump)

```yaml
version: 2
requests:
  objectSet:
    request:
      url: https://postman-echo.com/post
      method: POST
      postData:
        mimeType: application/json
        text:
          foo: bar
          baz: 1
    log: true
  objectReset:
    request:
      url: https://postman-echo.com/post
      method: POST
      postData:
        mimeType: application/json
        text:
          new: <$ objectSet.content.data | dump | safe $>
    validate:
      - jsonpath: content.data
        expect: {"new":{"foo":"bar","baz":1}}
    log: true
```

## Errors

**Strest** is a testing library so of course, you'll run into a few errors when testing an endpoint. Error handling is made very simple so can instantly see what caused an error and fix it.
If a request fails, the process will be exited with _exit code 1_ and no other requests will be executed afterwards.

### Example

```shell
[ Strest ] Found 1 test file(s)
[ Strest ] Schema validation: 1 of 1 file(s) passed

✖ Testing test failed (0.2s)

[ Validation ] The required item test wasn't found in the response data

[ Strest ] ✨  Done in 0.245s
```

## Allow Insecure certs

Boolean to allow:

- insecure certificates
- self-signed certificates
- expired certificates

### Example - Allow Insecure certs

```yaml
allowInsecure: true
requests:
  someRequest:
    ...
```

## Print out the equivalent curl commands

To print out the equivalent curl commands for each request, add the following flag to the command

```bash
strest ... --output curl
```

## Exiting on a failed request

By default, **Strest** will exit the process with an exit code 1 if any request failed.
But you can also manipulate this by adding the `-n` or `--no-exit` flag into the command. This will instruct the program to go on
with the following request if the request failed.

## Bulk tests

Specify a list of tests or directories to execute.

`strest tests/success/bulk.yml -b`

Contents of bulk.yml:

```yaml
---
- tests/success/postman.strest.yml
- tests/success/two.strest.yml
- tests/success/chaining/
```

## Configuration

You can create a file in your Computer's home directory called `.strestConfig.yml` which will be the custom config for **Strest**.

```yaml
config:
  primaryColor: "#2ed573" # Hexadecimal Color Code (don't forget the quotation marks)
  secondaryColor: "#ff4757" # Hexadecimal Color Code
  errorColor: "#576574" # Hexadecimal Color Code
```
## Extract key and cert from p12
```shell script
openssl pkcs12 -in my.p12 -out file.key.pem -nocerts -nodes
openssl pkcs12 -in my.p12 -out file.crt.pem -clcerts -nokeys
```


## License

Strest is [MIT Licensed](LICENSE)


