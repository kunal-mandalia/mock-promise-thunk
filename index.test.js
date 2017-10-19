const { mockPromise, dispatchWrapper } = require('./index')

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
    const mockDispatch = dispatchWrapper()
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

    // define the shape of your values depending on how your async library outputs values
    //  e.g. axios wraps up output in a data object
    const comment = `You rock dude`
    const successValue = { data: comment }
    const errorValue = 400
    const mockDispatch = dispatchWrapper()
    
    beforeEach(() => {
      mockDispatch().clear()
    })

    it(`should dispatch success actions chain on success`, () => {
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
    })

    it(`should dispatch error actions chain on catch`, () => {
      // No then actions as this mock promise won't resolve
      //  but rather catch once
      const thenStack = []
      const catchStack = [createCommentError(errorValue)]
      const mp = { post: mockPromise(thenStack, catchStack, successValue, errorValue) }

      createComment(comment, mp)(mockDispatch)
      expect(mockDispatch().calls()).toHaveLength(2)
      expect(mockDispatch().calls()).toEqual([createCommentRequest(comment), createCommentError(errorValue)])
    })
  })
})
