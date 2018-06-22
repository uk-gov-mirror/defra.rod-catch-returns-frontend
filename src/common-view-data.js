/**
 * This object is provides common data to to all views
 * @type {{assetPath: string}}
 */
module.exports = {
  context: () => {
    return {
      asset_path: '/public/',
      css: {
        compressed: false
      }
    }
  }
}
