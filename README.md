# router-bot

## Installation

### Add root .env file:

(Safe to use for local dev only)

```
APP_CODE=router-bot

KRAKEND_PORT=8080

REDIS_PORT=6378

RMQ_PORT_INTERFACE=15673
RMQ_PORT_AMQP=5673

POSTGRES_PORT=5438
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=router-bot
```

### Add .env file for router-service workspace:

```
HTTP_PORT=8099
SSH_HOST="{{Your router host}}"
SSH_KEY="Your router SSH private key in Base64 format"
```
