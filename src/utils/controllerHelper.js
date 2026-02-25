const { sendError } = require('./responseHandler')

/**
 * Retrieves a resource by ID and sends 404 error if not found
 * @param {Object} res - Express response object
 * @param {Function} getResourceFunction - Function that retrieves resource by ID
 * @param {string|number} id - Resource ID
 * @param {string} errorMessage - Error message if not found
 * @returns {Promise<Object>} Resource if exists, null if not found and error was sent
 */
const ensureResourceExists = async (res, getResourceFunction, id, errorMessage) => {
  const resource = await getResourceFunction(id)

  if (!resource) {
    sendError(res, 404, errorMessage)
    return null
  }

  return resource
}

/**
 * Merges updated fields with existing resource data
 * @param {Object} existingData - Current resource data
 * @param {Object} updateData - New data to merge
 * @returns {Object} Merged data with existing values as defaults
 */
const mergeResourceData = (existingData, updateData) => {
  const merged = { ...existingData }

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      merged[key] = updateData[key]
    }
  })

  return merged
}

module.exports = {
  ensureResourceExists,
  mergeResourceData
}
