"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Shoutbox_Sound_Notification = function () {
	function Shoutbox_Sound_Notification() {
		_classCallCheck(this, Shoutbox_Sound_Notification);
	}

	_createClass(Shoutbox_Sound_Notification, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_shoutbox_notification_sound";
			this.audio_string = "";

			this.setup();

			// Check we have an audio string, otherwise don't bother doing anything

			if (this.audio_string.length > 0) {

				// Setup the audio object now

				this.audio = new Audio(this.audio_string);

				// Ready event

				$(this.ready.bind(this));
			}
		}
	}, {
		key: "ready",
		value: function ready() {

			// Need to wait for DOM to be ready so we can start
			// monitoring the shoutbox.

			this.monitor_shoutbox();
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				var settings = plugin.settings;

				if (settings.base64_string.length > 0) {

					// Prepend the data info and concat the base64 string

					this.audio_string = "data:audio/mpeg;base64," + settings.base64_string;
				}
			}
		}
	}, {
		key: "monitor_shoutbox",
		value: function monitor_shoutbox() {

			// Here we setup a prefilter so we can intercept AJAX requests that make
			// a request to the shoudbox update URL.  Right now there is no official
			// shoutbox update event.

			$.ajaxPrefilter(function (opts, orig_opts) {

				// Check that the AJAX request URL matches the shoutbox update URL.

				if (orig_opts.url == proboards.data("shoutbox_update_url")) {

					// Store the original success function so we can call it later.
					// If we don't do this, then we break the shoutbox, as new shouts
					// will not appear.

					var orig_success = orig_opts.success;

					// We override the success property in the options with our own
					// so we get access to the latest shout data.

					opts.success = function (e) {

						// And here we call the original success from ProBoards.
						orig_success(e);

						// Now we check the shout data.

						Shoutbox_Sound_Notification.check_shout(e);
					};
				}
			});
		}

		// Here we check the lastest shout data to see if we can play a sound.

	}, {
		key: "check_shout",
		value: function check_shout(data) {

			// When new shouts are posted, AJAX response gets an object back.
			// One of the properties of the object is "new_ids".  We can use
			// this to see if there has been new shouts, unfortunately this
			// includes the own users shout, so we need to do more checking.
			// If we don't do this, then the sound will play for their own shouts.

			if (data && data.new_ids && data.new_ids.length > 0) {
				var user_id = parseInt(pb.data("user").id, 10);

				// Grab the last shout in the shoutbox to see if it's the users shout
				// or another users shout.

				var $last_shout = $(".shoutbox-post:last");

				if ($last_shout.length == 1) {
					var $last_user_id = $last_shout.find("a.user-link:first");

					if ($last_user_id.length == 1) {

						// User ID is store in the data attribute, so we can user that

						if (parseInt($last_user_id.attr("data-id"), 10) != user_id) {
							this.play_notification();
						}
					}
				}
			}
		}
	}, {
		key: "play_notification",
		value: function play_notification() {
			this.audio.play();
		}
	}]);

	return Shoutbox_Sound_Notification;
}();


Shoutbox_Sound_Notification.init();