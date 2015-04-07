fb-xmpp-connector
===================

Fritbot XMPP Connector

Config structure
----

Requires the following config structure to be given via config.yml or a similarly passed in config object:

```
connector: fb-xmpp-connector                   # Name of the connector, do not change
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
