'use strict';

 // The UserAgent is used to detect IE11. Only IE11 requires ES5.
(function () {
  
  function _ojIsIE11() {
    var nAgt = navigator.userAgent;
    return nAgt.indexOf('MSIE') !== -1 || !!nAgt.match(/Trident.*rv:11./);
  }
  var _ojNeedsES5 = _ojIsIE11();

  requirejs.config({
    baseUrl: 'js',

    // Path mappings for the logical module names
    paths:
    // injector:mainReleasePaths
    {
      'knockout': 'libs/knockout/knockout-3.5.0.debug',
      'jquery': 'libs/jquery/jquery-3.4.1',
      'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1',
      'hammerjs': 'libs/hammer/hammer-2.0.8',
      'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.1',
      'ojs': 'libs/oj/v8.0.0/debug' + (_ojNeedsES5 ? '_es5' : ''),
      'ojL10n': 'libs/oj/v8.0.0/ojL10n',
      'ojtranslations': 'libs/oj/v8.0.0/resources',
      'text': 'libs/require/text',
      'signals': 'libs/js-signals/signals',
      'customElements': 'libs/webcomponents/custom-elements.min',
      'proj4': 'libs/proj4js/dist/proj4-src',
      'css': 'libs/require-css/css',
      'touchr': 'libs/touchr/touchr',
      'persist': '@samplesjsloc@/persist/debug',
      'corejs' : 'libs/corejs/shim',
      'regenerator-runtime' : 'libs/regenerator-runtime/runtime'
    }
    // endinjector
  });
}());

require([
  'knockout',
  'jquery',
  'ojs/ojbootstrap',
  'ojs/ojknockout',
  'ojs/ojformlayout',
  'ojs/ojinputtext',
  'ojs/ojbutton',
],
function (ko, $, Bootstrap) {

  const ViewModel = function () {
    this.authorized = ko.observable(false);
    this.baseUrl = ko.observable('https://hostname.domain/documents');
    this.username = ko.observable();
    this.password = ko.observable();

    this.getUsersHomeContents = function () {
      this.authorized(true);
    }.bind(this);

    // eslint-disable-next-line no-unused-vars
    this.authorized.subscribe(function(newValue) {
      $('#loginPanel').toggle();
      $('#docsPanel').toggle();
    }.bind(this));
  };
  
  Bootstrap.whenDocumentReady().then(
    function () {
      const init = function () {
        ko.applyBindings(new ViewModel(), document.getElementById('pageBody'));
      };

      if (document.body.classList.contains('oj-hybrid')) {
        document.addEventListener('deviceready', init);
      }
      else {
        init();
      }
    });
});
