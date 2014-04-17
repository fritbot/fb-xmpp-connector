var ltx = require('ltx'),
    Client = require('node-xmpp-client');

function XMPPConnector(bot) {
    var self = this;
	self.bot = bot;
    self.config = bot.config.connector;

    self.client = new Client({
        jid: self.config.user + '@' + self.config.host + '/' + self.config.resource,
        password: self.config.password,
        host: self.config.host,
        reconnect: true
    })

    self.client.on('stanza', function(stanza) {
        console.log("got stanza", stanza.toString())
        if (stanza.is('message')) {
            if (stanza.attrs.type === 'chat') {
                self.parseChat(stanza);
            } else if (stanza.attrs.type === 'groupchat') {
                self.parseGroupChat(stanza);
            }
        }
    })

    self.client.on('online', function() {
        console.log('XMPP is online')
        self.client.send(new ltx.Element('presence', { })
          .c('show').t('chat').up()
          .c('status').t(self.config.presence)
        )

        for (i in self.config.rooms) {
            self.joinRoom(self.config.rooms[i]);
        }
    })

    self.client.on('offline', function () {
        console.log('XMPP is offline')
    })


    self.client.on('connect', function () {
        console.log('XMPP is connected')
    })

    self.client.on('reconnect', function () {
        console.log('XMPP reconnects …')
    })

    self.client.on('disconnect', function (e) {
        console.log('XMPP is disconnected', self.client.connection.reconnect, e)
    })

    self.client.on('error', function(e) {
        console.error(e)
    })

}

XMPPConnector.prototype.joinRoom = function (room) {    
    console.log("XMPP joining", room)
    var presence = new ltx.Element('presence', {
        to: room + '@' + this.config.conference_host + '/' + this.config.resource
    })
    presence.c('x', {xmlns: 'http://jabber.org/protocol/muc'})
    this.client.send(presence);
}

XMPPConnector.prototype.leaveRoom = function (room) {    
    console.log("XMPP leaving", room)
    var presence = new ltx.Element('presence', {
        to: room + '@' + this.config.conference_host + '/' + this.config.resource,
        type: 'unavailable'
    })
    this.client.send(presence);
}

XMPPConnector.prototype.parseChat = function (stanza) {
    var route = {
            user: stanza.attrs.from.split('@')[0],
            room: null
        },
        body = stanza.getChildText('body')

    if (body) {
        this.bot.sawMessage(route, stanza.getChildText('body'))
    }
}

XMPPConnector.prototype.parseGroupChat = function (stanza) {
    var route = {
            user: stanza.attrs.from.split('/')[1],
            room: stanza.attrs.from.split('@')[0]
        },
        body = stanza.getChildText('body')

    if (body && route.user != this.config.user) {
        this.bot.sawMessage(route, stanza.getChildText('body'))
    }
}

XMPPConnector.prototype.send = function (route, message) {
    if (route.room && route.user) {
        message = route.user + ": " + message;
    }
    var reply = new ltx.Element('message', {
        to: route.room ? route.room + "@" + this.config.conference_host : route.user + "@" + this.config.host,
        type: route.room ? 'groupchat' : 'chat'
    })
    reply.c('body').t(message)
    this.client.send(reply);
}

XMPPConnector.prototype.shutdown = function () {
    this.client.end();
}
	
module.exports = XMPPConnector
