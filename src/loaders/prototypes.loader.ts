

export default function init() {
  //without this, JSON.stringify outputs a Regex as empty object which is annoying in log output for example
  Object.defineProperty(RegExp.prototype, "toJSON", {
    value: RegExp.prototype.toString
  });
}
