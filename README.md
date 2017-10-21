# mock-promise-thunk [![CircleCI](https://circleci.com/gh/kunal-mandalia/mock-promise-thunk.svg?style=svg)](https://circleci.com/gh/kunal-mandalia/mock-promise-thunk)

Test your redux thunk promises.

## Getting started
1. Install `yarn add mock-promise-thunk`
2. Import with ES6 modules `import { mockPromise, mockDispatchWrapper } from 'mock-promise-thunk' or `const { mockPromise, mockDispatchWrapper } = require('mock-promise-thunk')` with node modules

## Example: axios post

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
## Example: AsyncStorage (React-Native) getItem and jest.fn()

Suppose we have a getDecks thunk in `actions.js`

```
import * as c from './constants'
import { AsyncStorage } from 'react-native'

/**
 * storage variable is used as dependency
 *  injection so it can be mocked for testing
 */
export const getDecksRequest = () => ({ type: c.GET_DECKS_REQUEST })
export const getDecksSuccess = (decks) => ({ type: c.GET_DECKS_SUCCESS, value: decks })
export const getDecksError = (error) => ({ type: c.GET_DECKS_ERROR, error })
export const getDecks = (storage = AsyncStorage) => {
  return (dispatch) => {
    dispatch(getDecksRequest())
    storage.getItem(c.ASYNC_STORAGE_DECKS_KEY)
    .then((response) => {
      dispatch(getDecksSuccess(response))
    })
    .catch((error) => {
      dispatch(getDecksError(error))
    })
  }
}
```

Here's how we can mock and test the call to AsyncStorage in `actions.test.js`:

```
import * as actions from './actions'
import { mockPromise } from 'mock-promise-thunk'

describe(`actions`, () => {
  describe(`getDecks`, () => {
    it(`should dispatch request and success actions on resolve`, () => {
      const mockDispatch = jest.fn()      
      const decks = { 'History': { title: 'History' }}
      const actionStack = [{ response: decks }]
      const mockPromiseLib = { getItem: mockPromise(actionStack) }
      actions.getDecks(mockPromiseLib)(mockDispatch)

      expect(mockDispatch.mock.calls[0][0]).toEqual(actions.getDecksRequest())
      expect(mockDispatch.mock.calls[1][0]).toEqual(actions.getDecksSuccess(decks))
      expect(mockDispatch.mock.calls.length).toEqual(2)
    }) 
  })
```