# LSPlayer iFrame SDK

## Getting started

When you embed a Littlstar iframe into your website you can include the
optional Javascript SDK for interacting with the player and inspecting
its state. The consumer must implement the `OnLSPlayerFrameReady` function
in the global scope and ensure that every `iframe` on the page has a class
of `'lsplayer-frame'`. Attaching to window is preferred. The player and state
objects provide mechanisms for interacting with the iframe API and
inspecting its state. If this function is not defined then an error will
be thrown. You can inspect the error with your browser's development
toolkit console. This function is called when the iframe player is ready
to be interacted with. If there are multiple iframes on the page then
the function will be called for each providing a `player` and `state`
object unique to that player frame.

## Example

```js
function OnLSPlayerFrameReady (player, state) {
  console.log("Player %d is ready", player.id);

  player
  .seek(5)
  .projection('tiny planet')
  .rotate('y', {value: 0.002, every 100})
  .play();

  player.on('timeupdate', function () {
    console.log("current time = %d", state.currentTime);
  });
}
```

## License

MIT
