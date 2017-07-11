const browserify = require('browserify')


var Js = require('js-');
var $ = require('jquery');
var path = require('path');
var Waypoints = require('./noframework.waypoints.js');
var prism = require('./prism.js');

window.js = new Js();

var links = document.querySelectorAll('[href^="#"]');

js.lib.waypoint = function () {
  var className = "is-active";
  this.wp = new Waypoint({
    element: this,
    offset: 60,
    handler: function(direction) {
      Array.prototype.forEach.call(links, function (link, index) {
        var ids = this.element.id.split('_');

        if(link.getAttribute('href') === ('#' + ids[0]) || link.getAttribute('href') === ('#' + this.element.id)) {
          $(link).parent().addClass(className);
        } else {
          $(link).parent().removeClass(className);
        }
      }.bind(this));
    }
  });
};

js.lib.header = function () {
  fixPosition(this, 60);

  window.addEventListener('scroll', function (e) {
    fixPosition(this, 60);
  }.bind(this));
};

js.lib.sidebar = function () {
  fixPosition(this, 60);

  window.addEventListener('scroll', function (e) {
    fixPosition(this, 60);
  }.bind(this));
};

function fixPosition (el, offset) {
  var offset = offset || 0;
  var el = $(el);

  if (window.scrollY + offset > window.innerHeight) {
    $(el).addClass('is-fixed');
  } else {
    $(el).removeClass('is-fixed');
  }
}
