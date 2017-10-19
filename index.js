/**
 * See tests on how to use this function to mock e.g. redux thunk async
 *  actions
 * 
 * @param {Array} thenStack actions called on resolve
 * @param {Array} catchStack actions called on reject
 * @param {*} successValue: resolve callback arg
 * @param {*} errorValue: reject callback arg
 */
const mockPromise = (thenStack = [], catchStack = [], successValue = 200, errorValue = 400) => {
	let thenStackCopy = thenStack.slice()
  let catchStackCopy = catchStack.slice()
  return () => {
  	return {
      then: function (cb) {
        if (thenStackCopy.length > 0) cb(successValue)
        return this
        },
      catch: function (cb) {
        if (catchStack.length > 0) cb(errorValue)
        return this
      }
    }
  }
}

/**
 * Serves as a mockFn similar to jest.fn()
 */
const mockDispatchWrapper = () => {
	let actions = []
  return function mockDispatch (action) {
  	if (action) actions.push(action)
    return {
    	calls: () => { return actions },
      clear: () => { actions = [] }
    }
  }
}

module.exports = {
  mockPromise,
  mockDispatchWrapper
}
