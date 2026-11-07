#include <pebble.h>

int main(void) {
  Window *w = window_create();
  window_stack_push(w, true);

  /*
   * Wash is a light Poco face — smaller pools than signal-heavy faces.
   * Keep stack+slot+chunk under the 32 KB growth cliff when possible.
   */
  ModdableCreationRecord creation = {
    .recordSize = sizeof(ModdableCreationRecord),
    .stack = 5120,
    .slot = 40960,
    .chunk = 20480,
  };
  moddable_createMachine(&creation);

  window_destroy(w);
}
