!
  IE10 viewport hack for Surfacedesktop Windows 8 bug
  Copyright 2014-2015 Twitter, Inc.
  Licensed under MIT (httpsgithub.comtwbsbootstrapblobmasterLICENSE)
 

 See the Getting Started docs for more information
 httpgetbootstrap.comgetting-started#support-ie10-width

(function () {
  'use strict';

  if (navigator.userAgent.match(IEMobile10.0)) {
    var msViewportStyle = document.createElement('style')
    msViewportStyle.appendChild(
      document.createTextNode(
        '@-ms-viewport{widthauto!important}'
      )
    )
    document.querySelector('head').appendChild(msViewportStyle)
  }

})();