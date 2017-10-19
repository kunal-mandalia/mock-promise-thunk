# mock-promise-thunk [![CircleCI](https://circleci.com/gh/kunal-mandalia/mock-promise-thunk.svg?style=svg)](https://circleci.com/gh/kunal-mandalia/mock-promise-thunk)

Test your redux thunk promises.

## Getting started
1. Install `yarn add mock-promise-thunk`
2. Import with ES6 modules `import { mockPromise, mockDispatchWrapper } from 'mock-promise-thunk' or `const { mockPromise, mockDispatchWrapper } = require('mock-promise-thunk')` with node modules

## Example

Suppose we have the async thunk action `createComment` which fires a request action immediately followed by either a success or error action depending on whether the async call resolved or was rejected:

```
const createCommentRequest = comment => ({ type: 'CREATE_COMMENT_REQUEST', comment })
const createCommentError = error => ({ type: 'CREATE_COMMENT_ERROR', error })
const createCommentSuccess = comment => ({ type: 'CREATE_COMMENT_SUCCESS', comment })
const createComment = (comment, axios) => {
  return (dispatch) => {
    dispatch(createCommentRequest(comment))
    axios.post(`/comments/`, comment)
    .then((response) => { dispatch(createCommentSuccess(response.data)) })
    .catch((error) => { dispatch(createCommentError(error)) })
  }
}
```

In our test:
```
const { mockPromise, mockDispatch } = require('mock-promise-thunk')

it(`should dispatch success actions chain on success`, () => {
  // define the action stack resulting from the calls of the .then
  //  or .catch calls of the promise
  //  { response: any } will invoke .then, error will invoke .catch
  //  when the promise is resolved (instantly)
  //  
  const comment = `You rock dude`
  const actionStack = [ { response: { data: comment } }]

  // Since we're mocking a post request, wrap the promise in a post object
  const mockXHRLib = { post: mockPromise(actionStack) }

  // track dispatch calls using mockDispatch
  //  alternatively use jest.fn()
  const mockDispatch = mockDispatchWrapper()

  // call the action we want to test and track calls in mockDispatch
  createComment(comment, mockXHRLib)(mockDispatch)
  expect(mockDispatch().calls()).toHaveLength(2)
  expect(mockDispatch().calls()).toEqual([createCommentRequest(comment), createCommentSuccess(comment)])
})
```
