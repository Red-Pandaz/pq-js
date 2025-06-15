// dilithium_wrapper.c
#include <stdint.h>
#include <stddef.h>
#include <emscripten/emscripten.h>
#include <oqs/oqs.h>

// Make functions visible for Emscripten
#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
int dilithium_keypair(uint8_t *public_key, uint8_t *secret_key) {
    return (int)OQS_SIG_dilithium_2_keypair(public_key, secret_key);
}

EMSCRIPTEN_KEEPALIVE
int dilithium_sign(uint8_t *signature, size_t *signature_len,
                   const uint8_t *message, size_t message_len,
                   const uint8_t *secret_key) {
    return (int)OQS_SIG_dilithium_2_sign(signature, signature_len, message, message_len, secret_key);
}

EMSCRIPTEN_KEEPALIVE
int dilithium_verify(const uint8_t *message, size_t message_len,
                     const uint8_t *signature, size_t signature_len,
                     const uint8_t *public_key) {
    return (int)OQS_SIG_dilithium_2_verify(message, message_len, signature, signature_len, public_key);
}

#ifdef __cplusplus
}
#endif