var ltx = require('ltx'),
    Client = require('node-xmpp-client');

function XMPPConnector(bot, i, Route) {
    var self = this;

    // All connectors MUST store the bot.
    self.bot = bot;

    self.events = bot.events;
    self.config = bot.config.connectors[i];
    self.idx = self.config.module + '-' + i;
    self.Route = Route;

    // Create XMPP client
    self.client = new Client({
        jid : self.config.user + '@' + self.config.host + '/' + self.config.resource,
        password : self.config.password,
        host : self.config.host,
        reconnect : true
    });

    // Handle whenever we get a XML stanza from the server
    self.client.on('stanza', function (stanza) {

        // Handle inbound messages
        if (stanza.is('message')) {
            if (stanza.attrs.type === 'chat' || stanza.attrs.type === 'groupchat') {
                self.parseChat(stanza);
            }
        }

        // Handle pings
        if (stanza.is('iq') && stanza.attrs.type === 'get' && stanza.children[0].name === 'ping') {
            var pong = new ltx.Element('iq', {
                to : stanza.attrs.from,
                from : stanza.attrs.to,
                type : 'result',
                id : stanza.attrs.id
            });
            self.client.send(pong);
        }

        // Handle inbound room presence
        if (stanza.is('presence')) {
            var user = stanza.attrs.from.split('/')[1];
            var room = stanza.attrs.from.split('@')[0];

            if (room && user && stanza.attrs.to !== self.config.user + '@' + self.config.host) {
                var route = new self.Route(self, room, user);
                if (stanza.attrs.type === 'unavailable') {
                    bot.users.userLeavesRoom(route);
                } else {
                    bot.users.userEntersRoom(route);
                }
            }
        }

        // Don't handle other things
    });

    // We've connected to the server
    self.client.on('online', function () {
        console.log('XMPP is online');
        self.events.emit('chat_connected', self);
        self.client.send(new ltx.Element('presence', { })
          .c('show').t('chat').up()
          .c('status').t(self.config.presence)
        );

        for (i in self.config.rooms) {
            self.joinRoom(self.config.rooms[i]);
        }
    });

    // Various online/offline messages just for logging
    self.client.on('offline', function () {
        console.log('XMPP is offline');
    });


    self.client.on('connect', function () {
        console.log('XMPP is connected');
    });

    self.client.on('reconnect', function () {
        console.log('XMPP reconnects …');
    });

    self.client.on('disconnect', function (e) {
        console.log('XMPP is disconnected', self.client.connection.reconnect, e);
    });

    // Error logging
    self.client.on('error', function (e) {
        console.error(e);
    });

    // Shutdown XMPP connection when the bot shuts down
    self.events.on('shutdown', self.shutdown.bind(this));
}

XMPPConnector.prototype.joinRoom = function (room) {
    console.log('XMPP joining', room);
    var presence = new ltx.Element('presence', {
        to : room + '@' + this.config.conference_host + '/' + this.config.resource
    });
    // Don't get ancient history, but allow the server to send a few minutes, in case we experience a momentary disconnect
    presence.c('x', { xmlns : 'http ://jabber.org/protocol/muc' }).c('history', { seconds : 300 } );
    this.client.send(presence);
    this.events.emit('joinedRoom', room);
};

XMPPConnector.prototype.leaveRoom = function (room) {
    console.log('XMPP leaving', room);
    var presence = new ltx.Element('presence', {
        to : room + '@' + this.config.conference_host + '/' + this.config.resource,
        type : 'unavailable'
    });
    this.client.send(presence);
    this.events.emit('leftRoom', room);
};

XMPPConnector.prototype.parseChat = function (stanza) {
    var route, user = null, room = null,
        body = stanza.getChildText('body');

    if (!body) {
        return;
    }

    //console.log("Stanza", JSON.stringify(stanza, function (k, v) { if (k === 'parent') { return 'Circular'; } else { return v; } }, '\t'))

    if (stanza.attrs.type === 'groupchat') {
        // Extract user + room from stanza
        user = stanza.attrs.from.split('/')[1];
        room = stanza.attrs.from.split('@')[0];

        // Never pay any attention to our own messages.
        if (user === this.config.user) {
            return;
        }

    } else {
        // Some providers (slack, for instance) send recently sent direct messages in a weird way upon reconnection.
        // They appear with bodies like this: "[fritbot] Huh?" but as if they were sent by the other user in the conversation.
        if (body.indexOf('[' + this.config.user + ']') === 0) {
            return;
        }

        // Direct messages parse differently
        user = stanza.attrs.from.split('@')[0];
    }

    route = new this.Route(this, room, user);

    if (body) {
        this.events.emit('sawMessage', route, stanza.getChildText('body'));
    }
};

XMPPConnector.prototype.send = function (route, message) {
    if (route.room && route.user) {
        message = route.user.nick + ': ' + message;
    }
    var reply = new ltx.Element('message', {
        to : route.room ? route.room + '@' + this.config.conference_host : route.username + '@' + this.config.host,
        type : route.room ? 'groupchat' : 'chat'
    });
    reply.c('body').t(message);
    this.client.send(reply);
    this.events.emit('sentMessage', route, message);
};

XMPPConnector.prototype.shutdown = function () {
    this.client.end();
};

module.exports = XMPPConnector;
