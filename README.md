# slot-text

To install dependencies:

```bash
bun install slot-text
```



This project was created using `bun init` in bun v1.1.21. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Props

| Prop                | Type                  | Default  | Description                                                                                      |
|---------------------|-----------------------|----------|--------------------------------------------------------------------------------------------------|
| `value`             | '${number}'  | `N/A`    | The value to animate to. Can be a number or a string of numbers.                                  |
| `fontStyle`         | `Object`              | `N/A`    | The style of the text, passed as a `TextStyle` object.                                            |
| `animationDuration`  | `number`              | `200`    | The duration of the animation in milliseconds. Defaults to 200ms.                                 |
| `prefix`            | `string`              | `""`     | A prefix to the number, such as a currency symbol.                                                |
| `includeComma`      | `boolean`             | `false`  | Whether to include commas as thousand separators.                                                 |
