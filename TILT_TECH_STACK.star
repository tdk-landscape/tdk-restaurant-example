# =============================================================================
# TILT_TECH_STACK.star - TDK Restaurant Operations Tech Stack Configuration
# =============================================================================

RUNTIME = "bun"
RUNTIME_VERSION = "1.2"

BUNDLER = "vite"
BUNDLER_VERSION = "5"

WEB_FRAMEWORK = "hono"
WEB_FRAMEWORK_VERSION = "4"

TESTING = "vitest"
TESTING_VERSION = "1"

LINTING = "biome"
LINTING_VERSION = "1.5"

CONTAINER_PLATFORM = "docker"
COMPOSE_VERSION = "3.8"

def assert_tech_stack(loaded_stack):
    required = {
        "bundler": BUNDLER,
        "runtime": RUNTIME,
    }

    for key, expected in required.items():
        actual = loaded_stack.get(key)
        if actual != expected:
            fail("Tech stack mismatch: {} should be '{}' but got '{}'".format(
                key, expected, actual
            ))

    print("Tech stack validated for TDK Restaurant Operations: {} / {} / {}".format(
        WEB_FRAMEWORK, RUNTIME, TESTING
    ))

exports = {
    "RUNTIME": RUNTIME,
    "RUNTIME_VERSION": RUNTIME_VERSION,
    "BUNDLER": BUNDLER,
    "BUNDLER_VERSION": BUNDLER_VERSION,
    "WEB_FRAMEWORK": WEB_FRAMEWORK,
    "WEB_FRAMEWORK_VERSION": WEB_FRAMEWORK_VERSION,
    "TESTING": TESTING,
    "TESTING_VERSION": TESTING_VERSION,
    "LINTING": LINTING,
    "LINTING_VERSION": LINTING_VERSION,
    "CONTAINER_PLATFORM": CONTAINER_PLATFORM,
    "COMPOSE_VERSION": COMPOSE_VERSION,
    "assert_tech_stack": assert_tech_stack,
    "TECH_STACK": exports,
}
