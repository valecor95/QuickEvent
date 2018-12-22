const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');
const amqp = require('amqplib/callback_api');

// Get insights page 
router.get('/insights', ensureAuthenticated, (req,res) => {
    //Amqp Receiver connection
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
        var ex = 'notify';

        ch.assertExchange(ex, 'fanout', {durable: false});

        ch.assertQueue(req.user.email, {exclusive: false}, function(err, q) {
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, function(msg) {
                if(msg.content) {
                    console.log(" [x] %s", msg.content.toString());
                    req.flash('notify', 'Notifica prova');
                }
            }, {noAck: true});
        });
        });
    });
    res.render('insights/insights');
});

module.exports = router;