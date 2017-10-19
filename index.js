/**
 * See tests on how to use this function to mock e.g. redux thunk async
 *  actions
 * 
 * @param {Array} actionStack of object { response? any, error? any }
 */
const mockPromise = (actionStack = []) => {
  let stack = actionStack.slice()

  return () => {
    return {
      then: function (cb) {
        if (stack.length > 0 && stack[0].response) cb(stack.shift().response)
        return this
      },
      catch: function (cb) {
        if (stack.length > 0 && stack[0].error) cb(stack.shift().error)
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
