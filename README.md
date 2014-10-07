fb-xmpp-connector
===================

Fritbot XMPP Connector

Config structure
----

Requires the following config structure to be given via config.yml or a similarly passed in config object:

```
connectors:
  - module: fb-xmpp-connector
    host: your.host.name
    conference_host: conference.your.host.name
    user: your_username
    resource: your_resource
    password: your_password
    presence: The Angriest Bot
    rooms: [room_to_join]
```
