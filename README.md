# mock-promise-thunk

Test your redux thunk promises.

## Getting started
1. Install `yarn add mock-promise-thunk`
2. Import with ES6 modules `import { mockPromise, mockDispatchWrapper } from 'mock-promise-thunk' or `const { mockPromise, mockDispatchWrapper } = require('mock-promise-thunk')` with node modules

## Mocking

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
it(`should dispatch success actions chain on success`, () => {
  // define the shape of your values depending on how your async library outputs values
  //  e.g. axios wraps up output in a data object
  const comment = `You rock dude`
  const successValue = { data: comment }
  const errorValue = 400
  const mockDispatch = mockDispatchWrapper()

  // define the then / catch calls the promise should make
  //  since we're testing against the success case there's
  //  at least one action which'll be resolved and none rejected
  const thenStack = [createCommentSuccess(comment)]
  const catchStack = []
  // Since we're mocking a post request, wrap the promise in a post object
  const mp = { post: mockPromise(thenStack, catchStack, successValue, errorValue) }

  // call action we want to test and track calls in mockDispatch
  createComment(comment, mp)(mockDispatch)
  expect(mockDispatch().calls()).toHaveLength(2)
  expect(mockDispatch().calls()).toEqual([createCommentRequest(comment), createCommentSuccess(comment)])

  // clear all mockDispatch calls
  mockDispatch().clear()
})
```
