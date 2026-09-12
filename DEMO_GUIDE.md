# TDK Restaurant Operations Demo Guide

## Three-Minute Walkthrough

### 1. Start the landscape

```bash
tdk up
```

Show that TDK discovers six resources from `service.json` manifests across the `guest`, `kitchen`, and `operations` stacks.

### 2. Inspect guest service boundaries

Open `services/guest/reservation-api/service.json` and point out the PSR contract: `appName`, `domain`, `type`, `stack`, `port`, dependencies, and health check.

### 3. Move through the restaurant

- Guest: reservation intake, waitlist, and table hold status.
- Kitchen: active tickets and station pacing.
- Operations: menu availability and floor visibility.

### 4. Start one stack

```bash
tdk up kitchen
```

Use this to show how an individual restaurant domain can run without booting every resource.

### 5. Extend the example

```bash
tdk resource payments-api --type backend --stack operations
tdk stack operations
tdk up operations
```

The new service follows the same manifest-driven workflow as the existing restaurant resources.
