'use strict'

/**
 * Validate the conflict page input
 */
module.exports = async request => request.payload['overwrite'] ? null : [{ override: 'NO_OVERRIDE_SELECTED' }]
