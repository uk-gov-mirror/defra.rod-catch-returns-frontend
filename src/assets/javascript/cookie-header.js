/**
 * Function to act on the seen cookie header. Removes the message if seen once (gds_seen_cookie_message set)
 */
(function () {
  'use strict'
  var root = this
  if (typeof root.GOVUK !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      if (root.GOVUK.getCookie('gds_seen_cookie_message')) {
        var elem = document.getElementById('global-cookie-message')
        if (elem.parentNode) {
          elem.parentNode.removeChild(elem)
        }
      } else {
        root.GOVUK.cookie('gds_seen_cookie_message', 'true', { days: 90 })
      }
    })
  }
}).call(this)
