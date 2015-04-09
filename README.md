Fritbot XMPP Connector
===================

Connector for XMPP-enabled service (Slack, Hipchat, Jabber, etc) for [Fritbot](https://github.com/Urthen/fritbot)

Configuration
----

Proper usage requires the following configuration options to be added to your config.yml (or otherwise passed to the bot).

Copy from this table for convenience:

```
connector: fb-xmpp-connector                     # Name of the connector, do not change
xmpp_host: your.host.name                        # Hostname of your XMPP/Slack/Hipchat/Jabber etc server
xmpp_conference_host: conference.your.host.name  # Hostname of the chat server, usually prepend conference. to your host name.
xmpp_user: your_username                         # Bot username
xmpp_resource: your_resource                     # Bot resource. Some services require it to match a specific value (e.g., Slack requires it to match the username).
                                                 # Check your login information to find this value.
xmpp_password: your_password                     # Bot password
xmpp_presence: The Angriest Bot                  # Presence/Status, can change this to whatever you want
xmpp_rooms: [room_to_join]                       # List of rooms to join. You should have at least one room.
                                                 # This is a list of strings - do not omit the []
```

Notes & Known Issues
-----

The XMPP Connector will attempt to respond to pings from the server to prevent from being dropped. If it does not respond to ping many XMPP servers will drop the client within 10 minutes. However, the connector seems to occasionally drop from the server overnight for no discernable reason. The bot and web UI remain running, but does not recieve messages from the server. If anyone figures out why, open an issue describing the reason or submit a pull request with the solution. Restarting the bot will fix the issue.
