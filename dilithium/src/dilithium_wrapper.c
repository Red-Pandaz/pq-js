#include <oqs/oqs.h>
#include <emscripten.h>
#include <stdlib.h>

// Initialize all dilithium variants
EMSCRIPTEN_KEEPALIVE
int init_dilithium_variants() {
    return 1; // Success
}

// Free resources for all dilithium variants
EMSCRIPTEN_KEEPALIVE
void free_dilithium_variants() {
    // Nothing to free as we're using static functions
}

// Helper function to get OQS_SIG instance
static OQS_SIG* get_sig_instance(int variant) {
    switch (variant) {
        case 2:
            return OQS_SIG_dilithium_2_new();
        case 3:
            return OQS_SIG_dilithium_3_new();
        case 5:
            return OQS_SIG_dilithium_5_new();
        default:
            return NULL;
    }
}

// Keypair generation for each variant
EMSCRIPTEN_KEEPALIVE
int dilithium2_keypair(uint8_t* public_key, uint8_t* secret_key) {
    OQS_SIG* sig = get_sig_instance(2);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_2_keypair(public_key, secret_key);
    OQS_SIG_free(sig);
    return result;
}

EMSCRIPTEN_KEEPALIVE
int dilithium3_keypair(uint8_t* public_key, uint8_t* secret_key) {
    printf("[C Debug] dilithium3_keypair: public_key=%p, secret_key=%p\n", public_key, secret_key);
    OQS_SIG* sig = get_sig_instance(3);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_3_keypair(public_key, secret_key);
    OQS_SIG_free(sig);
    return result;
}

EMSCRIPTEN_KEEPALIVE
int dilithium5_keypair(uint8_t* public_key, uint8_t* secret_key) {
    printf("[C Debug] dilithium5_keypair: public_key=%p, secret_key=%p\n", public_key, secret_key);
    OQS_SIG* sig = get_sig_instance(5);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_5_keypair(public_key, secret_key);
    OQS_SIG_free(sig);
    return result;
}

// Signing for each variant
EMSCRIPTEN_KEEPALIVE
int dilithium2_sign(uint8_t* signature, size_t* signature_len, const uint8_t* message, size_t message_len, const uint8_t* secret_key) {
    OQS_SIG* sig = get_sig_instance(2);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_2_sign(signature, signature_len, message, message_len, secret_key);
    OQS_SIG_free(sig);
    return result;
}

EMSCRIPTEN_KEEPALIVE
int dilithium3_sign(uint8_t* signature, size_t* signature_len, const uint8_t* message, size_t message_len, const uint8_t* secret_key) {
    printf("[C Debug] dilithium3_sign: signature=%p, signature_len=%p, message=%p, message_len=%zu, secret_key=%p\n", signature, signature_len, message, message_len, secret_key);
    OQS_SIG* sig = get_sig_instance(3);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_3_sign(signature, signature_len, message, message_len, secret_key);
    OQS_SIG_free(sig);
    return result;
}

EMSCRIPTEN_KEEPALIVE
int dilithium5_sign(uint8_t* signature, size_t* signature_len, const uint8_t* message, size_t message_len, const uint8_t* secret_key) {
    printf("[C Debug] dilithium5_sign: signature=%p, signature_len=%p, message=%p, message_len=%zu, secret_key=%p\n", signature, signature_len, message, message_len, secret_key);
    OQS_SIG* sig = get_sig_instance(5);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_5_sign(signature, signature_len, message, message_len, secret_key);
    OQS_SIG_free(sig);
    return result;
}

// Verification for each variant
EMSCRIPTEN_KEEPALIVE
int dilithium2_verify(const uint8_t* message, size_t message_len, const uint8_t* signature, size_t signature_len, const uint8_t* public_key) {
    OQS_SIG* sig = get_sig_instance(2);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_2_verify(message, message_len, signature, signature_len, public_key);
    OQS_SIG_free(sig);
    return result;
}

EMSCRIPTEN_KEEPALIVE
int dilithium3_verify(const uint8_t* message, size_t message_len, const uint8_t* signature, size_t signature_len, const uint8_t* public_key) {
    OQS_SIG* sig = get_sig_instance(3);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_3_verify(message, message_len, signature, signature_len, public_key);
    OQS_SIG_free(sig);
    return result;
}

EMSCRIPTEN_KEEPALIVE
int dilithium5_verify(const uint8_t* message, size_t message_len, const uint8_t* signature, size_t signature_len, const uint8_t* public_key) {
    OQS_SIG* sig = get_sig_instance(5);
    if (!sig) return -1;
    int result = OQS_SIG_dilithium_5_verify(message, message_len, signature, signature_len, public_key);
    OQS_SIG_free(sig);
    return result;
}

// Length getters for each variant
EMSCRIPTEN_KEEPALIVE
size_t dilithium2_get_public_key_length() {
    return OQS_SIG_dilithium_2_length_public_key;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium2_get_secret_key_length() {
    return OQS_SIG_dilithium_2_length_secret_key;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium2_get_signature_length() {
    return OQS_SIG_dilithium_2_length_signature;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium3_get_public_key_length() {
    return OQS_SIG_dilithium_3_length_public_key;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium3_get_secret_key_length() {
    return OQS_SIG_dilithium_3_length_secret_key;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium3_get_signature_length() {
    return OQS_SIG_dilithium_3_length_signature;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium5_get_public_key_length() {
    return OQS_SIG_dilithium_5_length_public_key;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium5_get_secret_key_length() {
    return OQS_SIG_dilithium_5_length_secret_key;
}

EMSCRIPTEN_KEEPALIVE
size_t dilithium5_get_signature_length() {
    return OQS_SIG_dilithium_5_length_signature;
} 