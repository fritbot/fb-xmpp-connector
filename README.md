fb-xmpp-connector
===================

Fritbot XMPP Connector

Config structure
----

Requires the following config structure to be given via config.yml or a similarly passed in config object:

```
connectors:
  - module: fb-xmpp-connector                   # Name of the connector, do not change
    host: your.host.name                        # Hostname of your XMPP/Slack/Hipchat/Jabber etc server
    conference_host: conference.your.host.name  # Hostname of the chat server, usually prepend conference. to your host name.
    user: your_username                         # Bot username
    resource: your_resource                     # Bot resource: Some services (such as Slack) require it to match a specified value.
                                                # Check your login information to find this value.
    password: your_password                     # Bot password
    presence: The Angriest Bot                  # Presence/Status, can change this to whatever you want
    rooms: [room_to_join]                       # List of rooms to join. You should have at least one room.
                                                # This is a list of strings - do not omit the []
```
