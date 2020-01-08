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
  'ojs/ojarraydataprovider',
  'ojs/ojLogger',
  'ojs/ojknockout',
  'ojs/ojmessages',
  'ojs/ojformlayout',
  'ojs/ojinputtext',
  'ojs/ojbutton',
  'ojs/ojselectsingle',
  'ojs/ojfilepicker',
],
function (ko, $, Bootstrap, ArrayDataProvider, Logger) {

  const ViewModel = function () {
    this.authorized = ko.observable(false);
    this.baseUrl = ko.observable('https://hostname.domain/documents');
    this.username = ko.observable();
    this.password = ko.observable();
    this.loginMsgs = ko.observableArray();
    this.loginMsgsProvider = new ArrayDataProvider(this.loginMsgs);

    this.folders = ko.observableArray();
    this.folderId = ko.observable();
    this.uploadFile = ko.observable();
    this.uploadFileName = ko.pureComputed(function () {
      if (this.uploadFile()) {
        return this.uploadFile().name;
      }
      else {
        return '未指定';
      }
    }.bind(this));
    this.foldersProvider = new ArrayDataProvider(this.folders, { keyAttributes: 'value'});
    this.uploadMsgs = ko.observableArray();
    this.uploadMsgsProvider = new ArrayDataProvider(this.uploadMsgs);

    this.getUsersHomeContents = function () {
      this.loginMsgs.removeAll();
      $.ajax({
        url: this.baseUrl() + '/api/1.2/folders/items',
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(this.username() + ':' + this.password())
        }
      }).then(
        function (data) {
          this.folders.removeAll();
          for (let i = 0; i < data.items.length; i++) {
            if (data.items[i].type !== 'folder') {
              continue;
            }
            this.folders.push({
              value: data.items[i].id,
              label: data.items[i].name
            });
          }
          this.authorized(true);
        }.bind(this),
        function (jqXHR) {
          Logger.error(jqXHR.status, jqXHR.statusText);
          let summary;
          switch (jqXHR.status) {
            case 401:
              summary = 'ユーザー名またはパスワードが無効です';
              break;
            case 404:
              summary = 'OCE の URL が無効です';
              break;
            default:
              summary = 'OCE にアクセスできません';
              break;
          }
          this.loginMsgs.push({
            severity: 'error',
            summary: summary
          });
        }.bind(this)
      );
    }.bind(this);

    this.executeUpload = function () {
      this.uploadMsgs.removeAll();
      const data = new FormData();
      data.append('jsonInputParameters', JSON.stringify({ parentID: this.folderId() }));
      data.append('primaryFile', this.uploadFile());
      $.ajax({
        url: this.baseUrl() + '/api/1.2/files/data',
        method: 'POST',
        mimeType: "multipart/form-data",
        contentType: false,
        processData: false,
        data: data,
        headers: {
          'Authorization': 'Basic ' + btoa(this.username() + ':' + this.password())
        }
      }).then(
        function () {
          this.uploadMsgs.push({
            severity: 'info',
            summary: 'アップロードが完了しました'
          });
        }.bind(this),
        function (jqXHR) {
          Logger.error(jqXHR.status, jqXHR.statusText);
          this.uploadMsgs.push({
            severity: 'error',
            summary: 'アップロードできませんでした',
            detail: jqXHR.status + ' - ' + jqXHR.statusText
          });
        }.bind(this)
      );
    }.bind(this);

    this.fileSelctAction = function (event) {
      this.uploadFile(event.detail.files[0]);
    }.bind(this);

    // eslint-disable-next-line no-unused-vars
    this.authorized.subscribe(function(newValue) {
      document.getElementById('loginPanel').classList.toggle('oj-helper-hidden');
      document.getElementById('docsPanel').classList.toggle('oj-helper-hidden');
    }.bind(this));
  };
  
  Bootstrap.whenDocumentReady().then(function () {
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
