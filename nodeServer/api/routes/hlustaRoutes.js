'use strict';
module.exports = function(app) {
  var hlusta = require('../controllers/hlustaController.js');

//Youtube hlusta routes

  app.route('/urls/clear_backups')
      .get(hlusta.clear_backups);

  app.route('/urls/get_file/')
      .post(hlusta.receive_url);

  app.route('/urls/get_vid/')
    .post(hlusta.receive_vid_url);

  app.route('/urls/delete_vid/')
    .post(hlusta.delete_vid);

  app.route('/urls/ready_status/')
      .get(hlusta.ready_status);
};

