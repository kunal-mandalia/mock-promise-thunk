const { mockPromise, mockDispatchWrapper } = require('./index')

describe(`mock-promise-thunk`, () => {
  describe(`mockPromise()`, () => {
    it(`should be promise like`, () => {
      const mp = mockPromise()()
      expect(typeof mp.then).toEqual('function')
      expect(typeof mp.catch).toEqual('function')

      // chainable
      expect(typeof mp.then().then).toEqual('function')
      expect(typeof mp.then().catch).toEqual('function')
    })
  })

  describe(`dispatchWrapper()`, () => {
    const mockDispatch = mockDispatchWrapper()
    it(`should track calls`, () => {
      mockDispatch('a')
      expect(mockDispatch().calls()).toEqual(['a'])
      expect(mockDispatch().calls()).toHaveLength(1)

      mockDispatch('b')
      expect(mockDispatch().calls()).toEqual(['a', 'b'])
      expect(mockDispatch().calls()).toHaveLength(2)
    })

    it(`should reset calls on clear`, () => {
      // from prior test
      expect(mockDispatch().calls()).toEqual(['a', 'b'])
      mockDispatch().clear()
      expect(mockDispatch().calls()).toHaveLength(0)
    })
  })

  describe(`example async redux thunk action`, () => {
    // demo async axios call with all dependencies injectable
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

    // track dispatch calls using mockDispatch
    //  alternatively use jest.fn()
    const mockDispatch = mockDispatchWrapper()
    
    beforeEach(() => {
      mockDispatch().clear()
    })

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

      // call the action we want to test and track calls in mockDispatch
      createComment(comment, mockXHRLib)(mockDispatch)
      expect(mockDispatch().calls()).toHaveLength(2)
      expect(mockDispatch().calls()).toEqual([createCommentRequest(comment), createCommentSuccess(comment)])
    })

    it(`should dispatch error actions chain on catch`, () => {
      const comment = `You rock dude`
      const errorValue = 'bad request'
      const actionStack = [{ error: errorValue}]
      const mockXHRLib = { post: mockPromise(actionStack) }

      createComment(comment, mockXHRLib)(mockDispatch)
      expect(mockDispatch().calls()).toHaveLength(2)
      expect(mockDispatch().calls()).toEqual([createCommentRequest(comment), createCommentError(errorValue)])
    })
  })
})
