/* eslint-disable no-undef */
(function () {
  // inter-exclusion check box behaviour
  'use strict'
  document.addEventListener('DOMContentLoaded', function () {
    let client = new XMLHttpRequest()
    client.open('POST', '/log')
    client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')

    let exclude = document.getElementById('exclude-1')
    let catchExcludes = document.getElementsByName('exclude-catch')
    let smallCatchExcludes = document.getElementsByName('exclude-small-catch')
    let hid = document.getElementsByName('rcr2018')
    let csrf = hid[0].value

    let serverUpdateExclusion = function (message) {
      let client = new XMLHttpRequest()
      client.open('POST', '/exclusions')
      client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      client.setRequestHeader('X-CSRF-Token', csrf)
      client.send(JSON.stringify(message))
    }

    let every = function (e) {
      for (let i = 0; i < e.length; i++) {
        if (!e[i].checked) {
          return false
        }
      }
      return true
    }

    let setLineExcludes = function (chk) {
      for (let i = 0; i < catchExcludes.length; i++) {
        catchExcludes[i].checked = chk
      }
      for (let i = 0; i < smallCatchExcludes.length; i++) {
        smallCatchExcludes[i].checked = chk
      }
    }

    let lineListener = function () {
      exclude.checked = !!(this.checked && every(catchExcludes) && every(smallCatchExcludes))
      let payload = {}
      payload[this.id] = this.checked
      serverUpdateExclusion(payload)
    }

    // Add listener for all return exclude checkbox
    exclude.addEventListener('change', function () {
      let payload = {}
      payload[this.id] = this.checked
      serverUpdateExclusion(payload)
      setLineExcludes(this.checked)
    })

    // Add listeners for large catch excludes
    for (let i = 0; i < catchExcludes.length; i++) {
      catchExcludes[i].addEventListener('change', lineListener)
    }

    // Add listeners for small catch excludes
    for (let i = 0; i < smallCatchExcludes.length; i++) {
      smallCatchExcludes[i].addEventListener('change', lineListener)
    }
  })
}).call(this)
